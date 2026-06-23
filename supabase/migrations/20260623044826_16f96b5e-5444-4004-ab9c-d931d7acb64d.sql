
-- =========================================================
-- TASK #9: Automation runtime engine — additive columns + RPCs
-- =========================================================

-- ---------- pipelines ----------
alter table public.automation_pipelines
  add column if not exists trigger_type text not null default 'manual',
  add column if not exists config jsonb not null default '{}'::jsonb,
  add column if not exists last_run_at timestamptz,
  add column if not exists next_run_at timestamptz,
  add column if not exists steps jsonb;

-- mirror stages -> steps (steps preferred going forward; stages kept for legacy UI)
update public.automation_pipelines set steps = coalesce(steps, stages, '[]'::jsonb) where steps is null;

create index if not exists idx_automation_pipelines_team_status on public.automation_pipelines(team_id, status);
create index if not exists idx_automation_pipelines_team_trigger on public.automation_pipelines(team_id, trigger_type);

-- ---------- pipeline_runs ----------
alter table public.automation_pipeline_runs
  add column if not exists triggered_by uuid,
  add column if not exists trigger_source text not null default 'manual',
  add column if not exists input jsonb not null default '{}'::jsonb,
  add column if not exists output jsonb not null default '{}'::jsonb,
  add column if not exists error_message text,
  add column if not exists metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_automation_runs_team_status on public.automation_pipeline_runs(team_id, status, created_at desc);
create index if not exists idx_automation_runs_pipeline on public.automation_pipeline_runs(pipeline_id, created_at desc);

-- ---------- tasks ----------
alter table public.automation_tasks
  add column if not exists run_id uuid,
  add column if not exists name text,
  add column if not exists type text,
  add column if not exists attempts int not null default 0,
  add column if not exists max_attempts int not null default 3;

create index if not exists idx_automation_tasks_team_status on public.automation_tasks(team_id, status, scheduled_for);
create index if not exists idx_automation_tasks_run on public.automation_tasks(run_id, created_at);

-- ---------- logs ----------
alter table public.automation_logs
  add column if not exists pipeline_id uuid,
  add column if not exists run_id uuid;

create index if not exists idx_automation_logs_team_created on public.automation_logs(team_id, created_at desc);
create index if not exists idx_automation_logs_run on public.automation_logs(run_id, created_at);

-- ---------- artifacts ----------
alter table public.automation_artifacts
  add column if not exists pipeline_id uuid,
  add column if not exists content jsonb,
  add column if not exists created_by uuid;
-- pipeline_run_id already exists; expose as run_id alias via RPCs.
create index if not exists idx_automation_artifacts_team_created on public.automation_artifacts(team_id, created_at desc);

-- ---------- rate limit events ----------
alter table public.automation_rate_limit_events
  add column if not exists pipeline_id uuid,
  add column if not exists run_id uuid,
  add column if not exists scope text,
  add column if not exists limit_key text,
  add column if not exists allowed boolean,
  add column if not exists reason text,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists created_at timestamptz not null default now();

create index if not exists idx_automation_rate_limit_team_created on public.automation_rate_limit_events(team_id, created_at desc);

-- ---------- scheduler rules ----------
alter table public.automation_scheduler_rules
  add column if not exists next_run_at timestamptz,
  add column if not exists last_run_at timestamptz;

create index if not exists idx_automation_scheduler_due
  on public.automation_scheduler_rules(team_id, enabled, next_run_at);

-- =========================================================
-- Helper: compute next_run_at from a rule
-- =========================================================
create or replace function public._automation_compute_next_run(
  _schedule_type text, _interval_minutes int, _cron text, _from timestamptz default now()
) returns timestamptz language plpgsql immutable as $$
begin
  if _schedule_type = 'interval' and _interval_minutes is not null and _interval_minutes > 0 then
    return _from + (_interval_minutes || ' minutes')::interval;
  elsif _schedule_type = 'daily' then
    return _from + interval '1 day';
  elsif _schedule_type = 'weekly' then
    return _from + interval '7 days';
  elsif _schedule_type = 'monthly' then
    return _from + interval '30 days';
  else
    -- cron / unknown: default to 1 hour, real cron parsing happens in worker
    return _from + interval '1 hour';
  end if;
end $$;

-- =========================================================
-- create_automation_pipeline
-- =========================================================
create or replace function public.create_automation_pipeline(
  p_team_id uuid,
  p_name text,
  p_description text default null,
  p_trigger_type text default 'manual',
  p_steps jsonb default '[]'::jsonb,
  p_config jsonb default '{}'::jsonb
) returns public.automation_pipelines
language plpgsql security definer set search_path = public as $$
declare _row public.automation_pipelines%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not (public.has_role(auth.uid(), p_team_id, 'owner') or public.has_role(auth.uid(), p_team_id, 'admin')) then
    raise exception 'Insufficient permissions';
  end if;
  if p_trigger_type not in ('manual','schedule','webhook','device_event','security_event','billing_event','support_event') then
    raise exception 'Invalid trigger_type';
  end if;

  insert into public.automation_pipelines(team_id, name, description, status, trigger_type, steps, stages, config, created_by)
  values (p_team_id, p_name, p_description, 'draft', p_trigger_type, coalesce(p_steps,'[]'::jsonb), coalesce(p_steps,'[]'::jsonb), coalesce(p_config,'{}'::jsonb), auth.uid())
  returning * into _row;

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (p_team_id, auth.uid(), 'automation_pipeline_created', _row.name, 'info',
          jsonb_build_object('pipeline_id', _row.id, 'trigger_type', p_trigger_type));
  return _row;
end $$;

grant execute on function public.create_automation_pipeline(uuid, text, text, text, jsonb, jsonb) to authenticated;

-- =========================================================
-- update_automation_pipeline
-- =========================================================
create or replace function public.update_automation_pipeline(
  p_pipeline_id uuid,
  p_name text default null,
  p_description text default null,
  p_status text default null,
  p_trigger_type text default null,
  p_steps jsonb default null,
  p_config jsonb default null
) returns public.automation_pipelines
language plpgsql security definer set search_path = public as $$
declare _row public.automation_pipelines%rowtype; _team uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select team_id into _team from public.automation_pipelines where id = p_pipeline_id;
  if _team is null then raise exception 'Pipeline not found'; end if;
  if not (public.has_role(auth.uid(), _team, 'owner') or public.has_role(auth.uid(), _team, 'admin')) then
    raise exception 'Insufficient permissions';
  end if;
  if p_status is not null and p_status not in ('draft','active','paused','archived') then
    raise exception 'Invalid status';
  end if;

  update public.automation_pipelines set
    name = coalesce(p_name, name),
    description = coalesce(p_description, description),
    status = coalesce(p_status, status),
    trigger_type = coalesce(p_trigger_type, trigger_type),
    steps = coalesce(p_steps, steps),
    stages = coalesce(p_steps, stages),
    config = coalesce(p_config, config),
    updated_at = now()
  where id = p_pipeline_id
  returning * into _row;

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_team, auth.uid(), 'automation_pipeline_updated', _row.name, 'info', jsonb_build_object('pipeline_id', _row.id));
  return _row;
end $$;

grant execute on function public.update_automation_pipeline(uuid, text, text, text, text, jsonb, jsonb) to authenticated;

-- =========================================================
-- archive_automation_pipeline
-- =========================================================
create or replace function public.archive_automation_pipeline(p_pipeline_id uuid)
returns public.automation_pipelines
language plpgsql security definer set search_path = public as $$
declare _row public.automation_pipelines%rowtype; _team uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select team_id into _team from public.automation_pipelines where id = p_pipeline_id;
  if _team is null then raise exception 'Pipeline not found'; end if;
  if not (public.has_role(auth.uid(), _team, 'owner') or public.has_role(auth.uid(), _team, 'admin')) then
    raise exception 'Insufficient permissions';
  end if;
  update public.automation_pipelines set status = 'archived', updated_at = now()
    where id = p_pipeline_id returning * into _row;
  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_team, auth.uid(), 'automation_pipeline_archived', _row.name, 'info', jsonb_build_object('pipeline_id', _row.id));
  return _row;
end $$;

grant execute on function public.archive_automation_pipeline(uuid) to authenticated;

-- =========================================================
-- record_automation_log
-- =========================================================
create or replace function public.record_automation_log(
  p_message text,
  p_run_id uuid default null,
  p_task_id uuid default null,
  p_pipeline_id uuid default null,
  p_level text default 'info',
  p_context jsonb default '{}'::jsonb
) returns public.automation_logs
language plpgsql security definer set search_path = public as $$
declare _row public.automation_logs%rowtype; _team uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if p_level not in ('debug','info','warning','error') then raise exception 'Invalid level'; end if;

  if p_run_id is not null then
    select team_id into _team from public.automation_pipeline_runs where id = p_run_id;
  elsif p_pipeline_id is not null then
    select team_id into _team from public.automation_pipelines where id = p_pipeline_id;
  elsif p_task_id is not null then
    select team_id into _team from public.automation_tasks where id = p_task_id;
  end if;
  if _team is null then raise exception 'Could not resolve team'; end if;
  if not public.is_team_member(auth.uid(), _team) then raise exception 'Forbidden'; end if;

  insert into public.automation_logs(team_id, pipeline_id, run_id, task_id, level, message, metadata, category)
  values (_team, p_pipeline_id, p_run_id, p_task_id, p_level, p_message, coalesce(p_context,'{}'::jsonb), 'runtime')
  returning * into _row;
  return _row;
end $$;

grant execute on function public.record_automation_log(text, uuid, uuid, uuid, text, jsonb) to authenticated;

-- =========================================================
-- _check_automation_rate_limit (internal)
-- Tracks: max 10 manual runs / 10 min / team; max 3 / 5 min / pipeline
-- =========================================================
create or replace function public._check_automation_rate_limit(
  _team_id uuid, _pipeline_id uuid, _scope text
) returns boolean
language plpgsql security definer set search_path = public as $$
declare _team_count int; _pipe_count int; _allowed boolean := true; _reason text;
begin
  select count(*) into _team_count from public.automation_pipeline_runs
    where team_id = _team_id and trigger_source = 'manual' and created_at > now() - interval '10 minutes';
  if _team_count >= 10 then _allowed := false; _reason := 'team manual run limit (10/10min)'; end if;

  if _allowed and _scope = 'manual' then
    select count(*) into _pipe_count from public.automation_pipeline_runs
      where pipeline_id = _pipeline_id and trigger_source = 'manual' and created_at > now() - interval '5 minutes';
    if _pipe_count >= 3 then _allowed := false; _reason := 'pipeline manual run limit (3/5min)'; end if;
  end if;

  insert into public.automation_rate_limit_events(team_id, pipeline_id, scope, limit_key, allowed, reason, provider, signal, severity)
  values (_team_id, _pipeline_id, _scope, coalesce(_scope,'manual')||':'||coalesce(_pipeline_id::text,'team'),
          _allowed, _reason, 'internal', 'rate_limit_check', case when _allowed then 'info' else 'warning' end);
  return _allowed;
end $$;

-- =========================================================
-- run_automation_pipeline
-- =========================================================
create or replace function public.run_automation_pipeline(
  p_pipeline_id uuid,
  p_input jsonb default '{}'::jsonb,
  p_trigger_source text default 'manual'
) returns public.automation_pipeline_runs
language plpgsql security definer set search_path = public as $$
declare
  _p public.automation_pipelines%rowtype;
  _run public.automation_pipeline_runs%rowtype;
  _step jsonb; _i int := 0;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _p from public.automation_pipelines where id = p_pipeline_id;
  if _p.id is null then raise exception 'Pipeline not found'; end if;
  if not public.is_team_member(auth.uid(), _p.team_id) then raise exception 'Forbidden'; end if;
  if _p.status = 'archived' then raise exception 'Archived pipeline cannot run'; end if;

  if p_trigger_source = 'manual' and not public._check_automation_rate_limit(_p.team_id, _p.id, 'manual') then
    raise exception 'Rate limit exceeded for manual runs';
  end if;

  insert into public.automation_pipeline_runs(team_id, pipeline_id, status, triggered_by, trigger_source, input)
  values (_p.team_id, _p.id, 'queued', auth.uid(), coalesce(p_trigger_source,'manual'), coalesce(p_input,'{}'::jsonb))
  returning * into _run;

  -- Create one task per step
  for _step in select * from jsonb_array_elements(coalesce(_p.steps, _p.stages, '[]'::jsonb))
  loop
    _i := _i + 1;
    insert into public.automation_tasks(team_id, pipeline_id, run_id, title, name, type, status, priority, current_stage, input_payload)
    values (_p.team_id, _p.id, _run.id,
            coalesce(_step->>'name', 'Step '||_i),
            coalesce(_step->>'name', 'step_'||_i),
            coalesce(_step->>'type','noop'),
            'queued', 'normal', _i, coalesce(_step->'config','{}'::jsonb));
  end loop;

  insert into public.automation_logs(team_id, pipeline_id, run_id, level, message, metadata, category)
  values (_p.team_id, _p.id, _run.id, 'info', 'Run queued',
          jsonb_build_object('trigger_source', p_trigger_source, 'steps', _i), 'runtime');

  update public.automation_pipelines set last_run_at = now() where id = _p.id;

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_p.team_id, auth.uid(), 'automation_run_triggered', _p.name, 'info',
          jsonb_build_object('run_id', _run.id, 'pipeline_id', _p.id, 'source', p_trigger_source));

  return _run;
end $$;

grant execute on function public.run_automation_pipeline(uuid, jsonb, text) to authenticated;

-- =========================================================
-- start / complete / fail run
-- =========================================================
create or replace function public.start_automation_run(p_run_id uuid)
returns public.automation_pipeline_runs
language plpgsql security definer set search_path = public as $$
declare _r public.automation_pipeline_runs%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _r from public.automation_pipeline_runs where id = p_run_id;
  if _r.id is null then raise exception 'Run not found'; end if;
  if not public.is_team_member(auth.uid(), _r.team_id) then raise exception 'Forbidden'; end if;
  if _r.status <> 'queued' then raise exception 'Run already started'; end if;
  update public.automation_pipeline_runs
    set status = 'running', started_at = now()
    where id = p_run_id returning * into _r;
  insert into public.automation_logs(team_id, pipeline_id, run_id, level, message, category)
  values (_r.team_id, _r.pipeline_id, _r.id, 'info', 'Run started', 'runtime');
  return _r;
end $$;

grant execute on function public.start_automation_run(uuid) to authenticated;

create or replace function public.complete_automation_run(
  p_run_id uuid, p_output jsonb default '{}'::jsonb
) returns public.automation_pipeline_runs
language plpgsql security definer set search_path = public as $$
declare _r public.automation_pipeline_runs%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _r from public.automation_pipeline_runs where id = p_run_id;
  if _r.id is null then raise exception 'Run not found'; end if;
  if not public.is_team_member(auth.uid(), _r.team_id) then raise exception 'Forbidden'; end if;
  update public.automation_pipeline_runs
    set status='success', finished_at=now(), output=coalesce(p_output,'{}'::jsonb),
        duration_ms = extract(epoch from (now() - coalesce(started_at, created_at)))::int * 1000
    where id = p_run_id returning * into _r;
  update public.automation_pipelines set last_run_at = now() where id = _r.pipeline_id;
  insert into public.automation_logs(team_id, pipeline_id, run_id, level, message, category)
  values (_r.team_id, _r.pipeline_id, _r.id, 'info', 'Run completed', 'runtime');
  return _r;
end $$;

grant execute on function public.complete_automation_run(uuid, jsonb) to authenticated;

create or replace function public.fail_automation_run(
  p_run_id uuid, p_error_message text, p_output jsonb default '{}'::jsonb
) returns public.automation_pipeline_runs
language plpgsql security definer set search_path = public as $$
declare _r public.automation_pipeline_runs%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _r from public.automation_pipeline_runs where id = p_run_id;
  if _r.id is null then raise exception 'Run not found'; end if;
  if not public.is_team_member(auth.uid(), _r.team_id) then raise exception 'Forbidden'; end if;
  update public.automation_pipeline_runs
    set status='failed', finished_at=now(), output=coalesce(p_output,'{}'::jsonb),
        error_message=p_error_message,
        duration_ms=extract(epoch from (now() - coalesce(started_at, created_at)))::int * 1000
    where id = p_run_id returning * into _r;
  insert into public.automation_logs(team_id, pipeline_id, run_id, level, message, metadata, category)
  values (_r.team_id, _r.pipeline_id, _r.id, 'error', 'Run failed', jsonb_build_object('error', p_error_message), 'runtime');
  -- best-effort notification
  begin
    perform public.create_notification(_r.team_id, null, null, null,
      'automation.failed', 'Automation run failed', coalesce(p_error_message,'Run failed'),
      'warning', '/dashboard/automation', jsonb_build_object('run_id', _r.id, 'pipeline_id', _r.pipeline_id));
  exception when others then null; end;
  return _r;
end $$;

grant execute on function public.fail_automation_run(uuid, text, jsonb) to authenticated;

-- =========================================================
-- claim / complete / fail task
-- =========================================================
create or replace function public.claim_next_automation_task(p_team_id uuid default null)
returns public.automation_tasks
language plpgsql security definer set search_path = public as $$
declare _t public.automation_tasks%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  update public.automation_tasks
    set status='running', started_at=now(), attempts=attempts+1, updated_at=now()
    where id = (
      select id from public.automation_tasks
        where status='queued'
          and (p_team_id is null or team_id = p_team_id)
          and team_id in (select public.my_team_ids(auth.uid()))
        order by coalesce(scheduled_for, created_at) asc
        for update skip locked
        limit 1
    )
    returning * into _t;
  return _t;
end $$;

grant execute on function public.claim_next_automation_task(uuid) to authenticated;

create or replace function public.complete_automation_task(
  p_task_id uuid, p_output jsonb default '{}'::jsonb
) returns public.automation_tasks
language plpgsql security definer set search_path = public as $$
declare _t public.automation_tasks%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _t from public.automation_tasks where id = p_task_id;
  if _t.id is null then raise exception 'Task not found'; end if;
  if not public.is_team_member(auth.uid(), _t.team_id) then raise exception 'Forbidden'; end if;
  update public.automation_tasks
    set status='success', finished_at=now(), output_payload=coalesce(p_output,'{}'::jsonb), progress=100, updated_at=now()
    where id = p_task_id returning * into _t;
  insert into public.automation_logs(team_id, pipeline_id, run_id, task_id, level, message, category)
  values (_t.team_id, _t.pipeline_id, _t.run_id, _t.id, 'info', 'Task completed', 'runtime');
  return _t;
end $$;

grant execute on function public.complete_automation_task(uuid, jsonb) to authenticated;

create or replace function public.fail_automation_task(
  p_task_id uuid, p_error_message text, p_retry boolean default true
) returns public.automation_tasks
language plpgsql security definer set search_path = public as $$
declare _t public.automation_tasks%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _t from public.automation_tasks where id = p_task_id;
  if _t.id is null then raise exception 'Task not found'; end if;
  if not public.is_team_member(auth.uid(), _t.team_id) then raise exception 'Forbidden'; end if;

  if p_retry and _t.attempts < _t.max_attempts then
    update public.automation_tasks
      set status='queued', error_message=p_error_message,
          scheduled_for = now() + (least(_t.attempts,5) * interval '30 seconds'),
          updated_at=now()
      where id = p_task_id returning * into _t;
    insert into public.automation_logs(team_id, pipeline_id, run_id, task_id, level, message, metadata, category)
    values (_t.team_id, _t.pipeline_id, _t.run_id, _t.id, 'warning', 'Task will retry',
            jsonb_build_object('attempt', _t.attempts, 'max', _t.max_attempts, 'error', p_error_message), 'runtime');
  else
    update public.automation_tasks
      set status='failed', finished_at=now(), error_message=p_error_message, updated_at=now()
      where id = p_task_id returning * into _t;
    insert into public.automation_logs(team_id, pipeline_id, run_id, task_id, level, message, metadata, category)
    values (_t.team_id, _t.pipeline_id, _t.run_id, _t.id, 'error', 'Task failed', jsonb_build_object('error', p_error_message), 'runtime');
  end if;
  return _t;
end $$;

grant execute on function public.fail_automation_task(uuid, text, boolean) to authenticated;

-- =========================================================
-- scheduler rules
-- =========================================================
create or replace function public.create_scheduler_rule(
  p_pipeline_id uuid,
  p_name text,
  p_schedule_type text,
  p_cron_expression text default null,
  p_interval_minutes int default null,
  p_timezone text default 'UTC'
) returns public.automation_scheduler_rules
language plpgsql security definer set search_path = public as $$
declare _row public.automation_scheduler_rules%rowtype; _team uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select team_id into _team from public.automation_pipelines where id = p_pipeline_id;
  if _team is null then raise exception 'Pipeline not found'; end if;
  if not (public.has_role(auth.uid(), _team, 'owner') or public.has_role(auth.uid(), _team, 'admin')) then
    raise exception 'Insufficient permissions';
  end if;
  if p_schedule_type not in ('interval','cron','daily','weekly','monthly') then
    raise exception 'Invalid schedule_type';
  end if;
  if p_schedule_type = 'interval' and (p_interval_minutes is null or p_interval_minutes <= 0) then
    raise exception 'interval_minutes required for interval schedule';
  end if;
  if p_schedule_type = 'cron' and (p_cron_expression is null or length(trim(p_cron_expression)) = 0) then
    raise exception 'cron_expression required';
  end if;

  insert into public.automation_scheduler_rules(team_id, pipeline_id, name, schedule_type, cron_expression, interval_minutes, timezone, next_run_at, created_by)
  values (_team, p_pipeline_id, p_name, p_schedule_type, p_cron_expression, p_interval_minutes, coalesce(p_timezone,'UTC'),
          public._automation_compute_next_run(p_schedule_type, p_interval_minutes, p_cron_expression, now()), auth.uid())
  returning * into _row;

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_team, auth.uid(), 'automation_scheduler_created', p_name, 'info',
          jsonb_build_object('rule_id', _row.id, 'pipeline_id', p_pipeline_id, 'type', p_schedule_type));
  return _row;
end $$;

grant execute on function public.create_scheduler_rule(uuid, text, text, text, int, text) to authenticated;

create or replace function public.update_scheduler_rule(
  p_rule_id uuid,
  p_enabled boolean default null,
  p_schedule_type text default null,
  p_cron_expression text default null,
  p_interval_minutes int default null,
  p_timezone text default null
) returns public.automation_scheduler_rules
language plpgsql security definer set search_path = public as $$
declare _row public.automation_scheduler_rules%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _row from public.automation_scheduler_rules where id = p_rule_id;
  if _row.id is null then raise exception 'Rule not found'; end if;
  if not (public.has_role(auth.uid(), _row.team_id, 'owner') or public.has_role(auth.uid(), _row.team_id, 'admin')) then
    raise exception 'Insufficient permissions';
  end if;

  update public.automation_scheduler_rules set
    enabled = coalesce(p_enabled, enabled),
    schedule_type = coalesce(p_schedule_type, schedule_type),
    cron_expression = coalesce(p_cron_expression, cron_expression),
    interval_minutes = coalesce(p_interval_minutes, interval_minutes),
    timezone = coalesce(p_timezone, timezone),
    next_run_at = public._automation_compute_next_run(
      coalesce(p_schedule_type, schedule_type),
      coalesce(p_interval_minutes, interval_minutes),
      coalesce(p_cron_expression, cron_expression), now()),
    updated_at = now()
  where id = p_rule_id returning * into _row;

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_row.team_id, auth.uid(), 'automation_scheduler_updated', _row.name, 'info', jsonb_build_object('rule_id', _row.id));
  return _row;
end $$;

grant execute on function public.update_scheduler_rule(uuid, boolean, text, text, int, text) to authenticated;

-- =========================================================
-- enqueue_due_scheduled_runs
-- =========================================================
create or replace function public.enqueue_due_scheduled_runs()
returns int
language plpgsql security definer set search_path = public as $$
declare _r record; _n int := 0; _pipe public.automation_pipelines%rowtype;
begin
  for _r in
    select * from public.automation_scheduler_rules
      where enabled and (next_run_at is null or next_run_at <= now())
  loop
    select * into _pipe from public.automation_pipelines where id = _r.pipeline_id;
    if _pipe.id is null or _pipe.status not in ('active') then
      continue;
    end if;

    insert into public.automation_pipeline_runs(team_id, pipeline_id, status, trigger_source, input)
    values (_r.team_id, _r.pipeline_id, 'queued', 'schedule', '{}'::jsonb);
    _n := _n + 1;

    update public.automation_scheduler_rules set
      last_run_at = now(),
      next_run_at = public._automation_compute_next_run(schedule_type, interval_minutes, cron_expression, now()),
      updated_at = now()
    where id = _r.id;

    insert into public.automation_logs(team_id, pipeline_id, level, message, category, metadata)
    values (_r.team_id, _r.pipeline_id, 'info', 'Scheduled run enqueued', 'scheduler',
            jsonb_build_object('rule_id', _r.id));
  end loop;
  return _n;
end $$;

grant execute on function public.enqueue_due_scheduled_runs() to authenticated;

-- =========================================================
-- get_automation_dashboard_summary
-- =========================================================
create or replace function public.get_automation_dashboard_summary()
returns table(
  active_pipelines int,
  paused_pipelines int,
  queued_runs int,
  running_runs int,
  failed_runs_24h int,
  successful_runs_24h int,
  queued_tasks int,
  failed_tasks_24h int,
  next_scheduled_run_at timestamptz,
  latest_run_at timestamptz
) language sql stable security definer set search_path = public as $$
  with teams as (select public.my_team_ids(auth.uid()) as t)
  select
    (select count(*)::int from public.automation_pipelines where team_id in (select t from teams) and status='active'),
    (select count(*)::int from public.automation_pipelines where team_id in (select t from teams) and status='paused'),
    (select count(*)::int from public.automation_pipeline_runs where team_id in (select t from teams) and status='queued'),
    (select count(*)::int from public.automation_pipeline_runs where team_id in (select t from teams) and status='running'),
    (select count(*)::int from public.automation_pipeline_runs where team_id in (select t from teams) and status='failed' and created_at > now() - interval '24 hours'),
    (select count(*)::int from public.automation_pipeline_runs where team_id in (select t from teams) and status='success' and created_at > now() - interval '24 hours'),
    (select count(*)::int from public.automation_tasks where team_id in (select t from teams) and status='queued'),
    (select count(*)::int from public.automation_tasks where team_id in (select t from teams) and status='failed' and updated_at > now() - interval '24 hours'),
    (select min(next_run_at) from public.automation_scheduler_rules where team_id in (select t from teams) and enabled),
    (select max(created_at) from public.automation_pipeline_runs where team_id in (select t from teams));
$$;

grant execute on function public.get_automation_dashboard_summary() to authenticated;

-- =========================================================
-- generate_device_health_report — built-in artifact generator
-- =========================================================
create or replace function public.generate_device_health_report(p_team_id uuid, p_run_id uuid default null)
returns public.automation_artifacts
language plpgsql security definer set search_path = public as $$
declare _a public.automation_artifacts%rowtype; _content jsonb;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not public.is_team_member(auth.uid(), p_team_id) then raise exception 'Forbidden'; end if;

  select jsonb_build_object(
    'generated_at', now(),
    'total_devices', count(*),
    'online_devices', count(*) filter (where status='online'),
    'offline_devices', count(*) filter (where status='offline'),
    'poor_quality_devices', count(*) filter (where connection_quality='poor'),
    'active_sessions', count(*) filter (where active_session_id is not null),
    'recommendations',
      case when count(*) filter (where connection_quality='poor') > 0
           then jsonb_build_array('Investigate poor connection quality devices')
           else jsonb_build_array('All devices look healthy') end
  ) into _content
  from public.device_presence where team_id = p_team_id;

  insert into public.automation_artifacts(team_id, pipeline_run_id, name, type, content, created_by, size_bytes, preview)
  values (p_team_id, p_run_id, 'Device Health Report', 'report', _content, auth.uid(),
          octet_length(_content::text), left(_content::text, 240))
  returning * into _a;

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (p_team_id, auth.uid(), 'automation_artifact_generated', _a.name, 'info', jsonb_build_object('artifact_id', _a.id));
  return _a;
end $$;

grant execute on function public.generate_device_health_report(uuid, uuid) to authenticated;
