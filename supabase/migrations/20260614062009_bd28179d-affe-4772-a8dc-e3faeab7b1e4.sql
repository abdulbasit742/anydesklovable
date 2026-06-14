
alter table public.sessions
  add column if not exists token_hash text,
  add column if not exists expires_at timestamptz;

create or replace function public.start_remote_session(_device_id uuid)
returns table(session_id uuid, token text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  _dev public.devices%rowtype;
  _token text;
  _hash text;
  _exp timestamptz;
  _sid uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _dev from public.devices where id = _device_id;
  if not found then raise exception 'Device not found'; end if;
  if not public.is_team_member(auth.uid(), _dev.team_id) then raise exception 'Forbidden'; end if;
  if _dev.status <> 'online' then raise exception 'Device is offline'; end if;

  _token := encode(gen_random_bytes(24), 'hex');
  _hash := encode(digest(_token, 'sha256'), 'hex');
  _exp := now() + interval '5 minutes';

  insert into public.sessions(team_id, device_id, viewer_user_id, status, started_at, token_hash, expires_at)
  values (_dev.team_id, _dev.id, auth.uid(), 'connected', now(), _hash, _exp)
  returning id into _sid;

  insert into public.device_audit_events(device_id, team_id, actor_id, event_type, metadata)
  values (_dev.id, _dev.team_id, auth.uid(), 'session_started', jsonb_build_object('session_id', _sid));

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_dev.team_id, auth.uid(), 'session_started', _dev.name, 'info',
          jsonb_build_object('session_id', _sid, 'device_id', _dev.id));

  return query select _sid, _token, _exp;
end $$;

revoke execute on function public.start_remote_session(uuid) from public, anon;
grant execute on function public.start_remote_session(uuid) to authenticated;

create or replace function public.end_remote_session(_session_id uuid, _reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _s public.sessions%rowtype;
  _dev public.devices%rowtype;
  _can boolean;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _s from public.sessions where id = _session_id;
  if not found then raise exception 'Session not found'; end if;
  if _s.status <> 'connected' then return; end if;

  select * into _dev from public.devices where id = _s.device_id;

  _can := (_s.viewer_user_id = auth.uid())
       or (_s.host_user_id = auth.uid())
       or (_dev.owner_id = auth.uid())
       or public.has_role(auth.uid(), _s.team_id, 'owner')
       or public.has_role(auth.uid(), _s.team_id, 'admin')
       or public.has_role(auth.uid(), _s.team_id, 'support');
  if not _can then raise exception 'Forbidden'; end if;

  update public.sessions
     set status = 'ended', ended_at = now(), end_reason = coalesce(_reason, end_reason), token_hash = null
   where id = _session_id;

  insert into public.device_audit_events(device_id, team_id, actor_id, event_type, to_value, metadata)
  values (_s.device_id, _s.team_id, auth.uid(), 'session_ended', coalesce(_reason, 'manual'),
          jsonb_build_object('session_id', _session_id));

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_s.team_id, auth.uid(), 'session_ended', _dev.name, 'info',
          jsonb_build_object('session_id', _session_id, 'reason', _reason));
end $$;

revoke execute on function public.end_remote_session(uuid, text) from public, anon;
grant execute on function public.end_remote_session(uuid, text) to authenticated;
