
-- Automation Center schema
create or replace function public.tg_set_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- 1. systems
create table public.automation_systems (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  name text not null,
  slug text not null unique,
  description text,
  status text not null default 'idle' check (status in ('idle','running','paused','degraded','failed')),
  health_score integer not null default 100,
  last_heartbeat_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.automation_systems to authenticated;
grant all on public.automation_systems to service_role;
alter table public.automation_systems enable row level security;
create policy "team read systems" on public.automation_systems for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team write systems" on public.automation_systems for all to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id))
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));
create trigger trg_automation_systems_updated before update on public.automation_systems for each row execute function public.tg_set_updated_at();

-- 2. pipelines
create table public.automation_pipelines (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  system_id uuid references public.automation_systems(id) on delete set null,
  name text not null,
  description text,
  mode text not null default 'sequential' check (mode in ('sequential','parallel','review','verification','formatting')),
  status text not null default 'draft' check (status in ('draft','active','paused','archived')),
  stages jsonb not null default '[]'::jsonb,
  input_schema jsonb,
  output_schema jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.automation_pipelines to authenticated;
grant all on public.automation_pipelines to service_role;
alter table public.automation_pipelines enable row level security;
create policy "team read pipelines" on public.automation_pipelines for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team write pipelines" on public.automation_pipelines for all to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id))
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));
create trigger trg_automation_pipelines_updated before update on public.automation_pipelines for each row execute function public.tg_set_updated_at();

-- 3. tasks
create table public.automation_tasks (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  pipeline_id uuid references public.automation_pipelines(id) on delete set null,
  title text not null,
  prompt text not null,
  status text not null default 'queued' check (status in ('queued','running','waiting','completed','failed','cancelled')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  current_stage integer not null default 0,
  progress integer not null default 0,
  input_payload jsonb,
  output_payload jsonb,
  error_message text,
  assigned_account_id uuid,
  scheduled_for timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.automation_tasks to authenticated;
grant all on public.automation_tasks to service_role;
alter table public.automation_tasks enable row level security;
create policy "team read tasks" on public.automation_tasks for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team write tasks" on public.automation_tasks for all to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id))
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));
create trigger trg_automation_tasks_updated before update on public.automation_tasks for each row execute function public.tg_set_updated_at();
create index automation_tasks_team_status_idx on public.automation_tasks(team_id, status);

-- 4. pipeline runs
create table public.automation_pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  task_id uuid references public.automation_tasks(id) on delete cascade,
  pipeline_id uuid references public.automation_pipelines(id) on delete set null,
  status text not null default 'running' check (status in ('running','completed','failed','cancelled')),
  started_at timestamptz,
  finished_at timestamptz,
  duration_ms integer,
  stage_results jsonb not null default '[]'::jsonb,
  checkpoint jsonb,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.automation_pipeline_runs to authenticated;
grant all on public.automation_pipeline_runs to service_role;
alter table public.automation_pipeline_runs enable row level security;
create policy "team read runs" on public.automation_pipeline_runs for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team write runs" on public.automation_pipeline_runs for all to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id))
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));

-- 5. accounts (NO plaintext secrets — metadata only)
create table public.automation_accounts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  label text not null,
  provider text not null check (provider in ('manus','openai','claude','kimi','lovable','custom')),
  status text not null default 'available' check (status in ('available','active','cooldown','limited','banned','disabled')),
  daily_task_count integer not null default 0,
  success_rate numeric not null default 0,
  last_used_at timestamptz,
  cooldown_until timestamptz,
  health_score integer not null default 100,
  notes text,
  secret_ref text,
  masked_label text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.automation_accounts to authenticated;
grant all on public.automation_accounts to service_role;
alter table public.automation_accounts enable row level security;
create policy "team read accounts" on public.automation_accounts for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team write accounts" on public.automation_accounts for all to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id))
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));
create trigger trg_automation_accounts_updated before update on public.automation_accounts for each row execute function public.tg_set_updated_at();

-- 6. rate limit events
create table public.automation_rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  account_id uuid references public.automation_accounts(id) on delete cascade,
  provider text,
  signal text,
  severity text not null default 'low' check (severity in ('low','medium','high','critical')),
  message text,
  cooldown_seconds integer,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz
);
grant select, insert, update, delete on public.automation_rate_limit_events to authenticated;
grant all on public.automation_rate_limit_events to service_role;
alter table public.automation_rate_limit_events enable row level security;
create policy "team read rate limits" on public.automation_rate_limit_events for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team write rate limits" on public.automation_rate_limit_events for all to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id))
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));

-- 7. scheduler rules
create table public.automation_scheduler_rules (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  pipeline_id uuid references public.automation_pipelines(id) on delete set null,
  name text not null,
  enabled boolean not null default true,
  schedule_type text not null default 'manual' check (schedule_type in ('cron','interval','manual')),
  cron_expression text,
  interval_minutes integer,
  timezone text not null default 'UTC',
  heavy_task_window jsonb,
  light_task_window jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.automation_scheduler_rules to authenticated;
grant all on public.automation_scheduler_rules to service_role;
alter table public.automation_scheduler_rules enable row level security;
create policy "team read scheduler" on public.automation_scheduler_rules for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team write scheduler" on public.automation_scheduler_rules for all to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id))
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));
create trigger trg_automation_scheduler_updated before update on public.automation_scheduler_rules for each row execute function public.tg_set_updated_at();

-- 8. alert routes
create table public.automation_alert_routes (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  name text not null,
  channel text not null check (channel in ('email','telegram','webhook','in_app')),
  enabled boolean not null default true,
  config jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.automation_alert_routes to authenticated;
grant all on public.automation_alert_routes to service_role;
alter table public.automation_alert_routes enable row level security;
create policy "team read alert routes" on public.automation_alert_routes for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team write alert routes" on public.automation_alert_routes for all to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id))
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));

-- 9. logs
create table public.automation_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  system_id uuid references public.automation_systems(id) on delete set null,
  task_id uuid references public.automation_tasks(id) on delete set null,
  level text not null default 'info' check (level in ('debug','info','warning','error','critical')),
  category text,
  message text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.automation_logs to authenticated;
grant all on public.automation_logs to service_role;
alter table public.automation_logs enable row level security;
create policy "team read logs" on public.automation_logs for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team insert logs" on public.automation_logs for insert to authenticated
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));
create index automation_logs_team_created_idx on public.automation_logs(team_id, created_at desc);

-- 10. artifacts
create table public.automation_artifacts (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  task_id uuid references public.automation_tasks(id) on delete cascade,
  pipeline_run_id uuid references public.automation_pipeline_runs(id) on delete set null,
  name text not null,
  type text not null default 'other' check (type in ('text','json','markdown','zip','image','report','other')),
  storage_path text,
  preview text,
  size_bytes integer,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.automation_artifacts to authenticated;
grant all on public.automation_artifacts to service_role;
alter table public.automation_artifacts enable row level security;
create policy "team read artifacts" on public.automation_artifacts for select to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id));
create policy "team write artifacts" on public.automation_artifacts for all to authenticated
  using (team_id is null or public.is_team_member(auth.uid(), team_id))
  with check (team_id is null or public.is_team_member(auth.uid(), team_id));
