
-- =========================================================
-- TASK #8: MFA / TOTP enrollment + Security Center backend
-- =========================================================

create extension if not exists pgcrypto;

-- ---------- user_mfa_settings ----------
create table if not exists public.user_mfa_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  mfa_enabled boolean not null default false,
  totp_enrolled boolean not null default false,
  recovery_codes_generated_at timestamptz,
  recovery_codes_remaining int not null default 0,
  last_verified_at timestamptz,
  last_disabled_at timestamptz,
  disabled_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.user_mfa_settings to authenticated;
grant all on public.user_mfa_settings to service_role;

alter table public.user_mfa_settings enable row level security;

drop policy if exists "mfa_settings_select_own" on public.user_mfa_settings;
create policy "mfa_settings_select_own" on public.user_mfa_settings
  for select to authenticated using (user_id = auth.uid());

drop policy if exists "mfa_settings_insert_own" on public.user_mfa_settings;
create policy "mfa_settings_insert_own" on public.user_mfa_settings
  for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "mfa_settings_update_own" on public.user_mfa_settings;
create policy "mfa_settings_update_own" on public.user_mfa_settings
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create index if not exists idx_user_mfa_settings_user on public.user_mfa_settings(user_id);

drop trigger if exists tg_user_mfa_settings_updated_at on public.user_mfa_settings;
create trigger tg_user_mfa_settings_updated_at
  before update on public.user_mfa_settings
  for each row execute function public.set_updated_at();

-- ---------- user_recovery_codes (hashes only) ----------
create table if not exists public.user_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  code_hash text not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- IMPORTANT: no SELECT grant to authenticated — codes are only ever
-- compared via security-definer RPC. Service role for maintenance.
grant all on public.user_recovery_codes to service_role;

alter table public.user_recovery_codes enable row level security;
-- Intentionally NO policies for authenticated; everything goes through RPCs.

create index if not exists idx_user_recovery_codes_user
  on public.user_recovery_codes(user_id, used_at);

-- ---------- Helper: count active trusted devices, sessions ----------

-- ---------- RPC: overview ----------
create or replace function public.get_my_security_overview()
returns table (
  mfa_enabled boolean,
  totp_enrolled boolean,
  recovery_codes_remaining int,
  trusted_devices_count int,
  active_sessions_count int,
  last_security_event_at timestamptz,
  last_mfa_verified_at timestamptz,
  security_score int
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  _uid uuid := auth.uid();
  _mfa public.user_mfa_settings%rowtype;
  _td int; _as int; _last_ev timestamptz; _score int := 0;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  select * into _mfa from public.user_mfa_settings where user_id = _uid;
  select count(*) into _td from public.trusted_devices where user_id = _uid and revoked_at is null;
  select count(*) into _as from public.active_sessions where user_id = _uid and revoked_at is null;
  select max(created_at) into _last_ev from public.security_events where user_id = _uid;

  if coalesce(_mfa.mfa_enabled, false) then _score := _score + 40; end if;
  if coalesce(_mfa.recovery_codes_remaining, 0) > 0 then _score := _score + 20; end if;
  if _td < 5 then _score := _score + 15; end if;
  if not exists (
    select 1 from public.security_events
    where user_id = _uid and severity in ('warning','critical')
      and created_at > now() - interval '30 days'
  ) then _score := _score + 15; end if;
  if _as <= 3 then _score := _score + 10; end if;

  return query select
    coalesce(_mfa.mfa_enabled, false),
    coalesce(_mfa.totp_enrolled, false),
    coalesce(_mfa.recovery_codes_remaining, 0),
    _td, _as, _last_ev, _mfa.last_verified_at, _score;
end $$;

grant execute on function public.get_my_security_overview() to authenticated;

-- ---------- RPC: enrollment started ----------
create or replace function public.record_mfa_enrollment_started()
returns void language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid();
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  insert into public.user_mfa_settings(user_id) values (_uid)
    on conflict (user_id) do nothing;
  insert into public.security_events(user_id, event_type, severity, metadata)
    values (_uid, 'mfa_enrollment_started', 'info', '{}'::jsonb);
end $$;

grant execute on function public.record_mfa_enrollment_started() to authenticated;

-- ---------- RPC: enable after verification ----------
create or replace function public.enable_mfa_after_verification()
returns public.user_mfa_settings
language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _row public.user_mfa_settings%rowtype;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  insert into public.user_mfa_settings(user_id, mfa_enabled, totp_enrolled, last_verified_at)
    values (_uid, true, true, now())
  on conflict (user_id) do update
    set mfa_enabled = true, totp_enrolled = true, last_verified_at = now(),
        last_disabled_at = null, disabled_reason = null, updated_at = now()
  returning * into _row;

  insert into public.security_events(user_id, event_type, severity, metadata)
    values (_uid, 'mfa_enabled', 'info', '{}'::jsonb);
  return _row;
end $$;

grant execute on function public.enable_mfa_after_verification() to authenticated;

-- ---------- RPC: disable ----------
create or replace function public.disable_mfa(p_reason text default null)
returns public.user_mfa_settings
language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _row public.user_mfa_settings%rowtype;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  update public.user_mfa_settings
    set mfa_enabled = false, totp_enrolled = false,
        last_disabled_at = now(), disabled_reason = p_reason,
        recovery_codes_remaining = 0, updated_at = now()
    where user_id = _uid
    returning * into _row;

  update public.user_recovery_codes set used_at = coalesce(used_at, now())
    where user_id = _uid and used_at is null;

  insert into public.security_events(user_id, event_type, severity, metadata)
    values (_uid, 'mfa_disabled', 'warning', jsonb_build_object('reason', p_reason));
  return _row;
end $$;

grant execute on function public.disable_mfa(text) to authenticated;

-- ---------- RPC: generate recovery codes (server hashes plaintext from client) ----------
create or replace function public.generate_recovery_codes(p_code_hashes text[])
returns int
language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _n int;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  if p_code_hashes is null or array_length(p_code_hashes, 1) is null then
    raise exception 'No codes provided';
  end if;
  _n := array_length(p_code_hashes, 1);
  if _n < 6 or _n > 12 then raise exception 'Invalid code count'; end if;

  -- invalidate old unused codes
  update public.user_recovery_codes set used_at = now()
    where user_id = _uid and used_at is null;

  insert into public.user_recovery_codes(user_id, code_hash)
    select _uid, unnest(p_code_hashes);

  insert into public.user_mfa_settings(user_id, recovery_codes_generated_at, recovery_codes_remaining)
    values (_uid, now(), _n)
  on conflict (user_id) do update
    set recovery_codes_generated_at = now(), recovery_codes_remaining = _n, updated_at = now();

  insert into public.security_events(user_id, event_type, severity, metadata)
    values (_uid, 'recovery_codes_generated', 'info', jsonb_build_object('count', _n));
  return _n;
end $$;

grant execute on function public.generate_recovery_codes(text[]) to authenticated;

-- ---------- RPC: verify recovery code ----------
create or replace function public.verify_recovery_code(p_code_hash text)
returns boolean
language plpgsql security definer set search_path = public as $$
declare _uid uuid := auth.uid(); _id uuid;
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  select id into _id from public.user_recovery_codes
    where user_id = _uid and code_hash = p_code_hash and used_at is null
    limit 1;
  if _id is null then
    insert into public.security_events(user_id, event_type, severity, metadata)
      values (_uid, 'mfa_failed_verification', 'warning', jsonb_build_object('via','recovery_code'));
    return false;
  end if;
  update public.user_recovery_codes set used_at = now() where id = _id;
  update public.user_mfa_settings
    set recovery_codes_remaining = greatest(recovery_codes_remaining - 1, 0),
        last_verified_at = now(), updated_at = now()
    where user_id = _uid;
  insert into public.security_events(user_id, event_type, severity, metadata)
    values (_uid, 'recovery_code_used', 'warning', '{}'::jsonb);
  return true;
end $$;

grant execute on function public.verify_recovery_code(text) to authenticated;

-- ---------- RPC: team security posture (admin/owner) ----------
create or replace function public.get_team_security_posture(p_team_id uuid)
returns table (
  total_members int,
  members_with_mfa int,
  members_without_mfa int,
  stale_trusted_devices int,
  recent_security_events int,
  risky_sessions int
)
language plpgsql stable security definer set search_path = public as $$
declare _uid uuid := auth.uid();
begin
  if _uid is null then raise exception 'Not authenticated'; end if;
  if not (public.has_role(_uid, p_team_id, 'owner') or public.has_role(_uid, p_team_id, 'admin')) then
    raise exception 'Forbidden';
  end if;
  return query
  with members as (
    select user_id from public.team_members
      where team_id = p_team_id and status = 'active'
  )
  select
    (select count(*) from members)::int,
    (select count(*) from members m
      join public.user_mfa_settings s on s.user_id = m.user_id and s.mfa_enabled)::int,
    (select count(*) from members m
      left join public.user_mfa_settings s on s.user_id = m.user_id
      where coalesce(s.mfa_enabled, false) = false)::int,
    (select count(*) from public.trusted_devices td
      where td.user_id in (select user_id from members)
        and td.revoked_at is null
        and coalesce(td.last_seen_at, td.trusted_at) < now() - interval '60 days')::int,
    (select count(*) from public.security_events e
      where e.user_id in (select user_id from members)
        and e.severity in ('warning','critical')
        and e.created_at > now() - interval '7 days')::int,
    (select count(*) from public.active_sessions s
      where s.user_id in (select user_id from members)
        and s.revoked_at is null
        and s.last_active_at < now() - interval '30 days')::int;
end $$;

grant execute on function public.get_team_security_posture(uuid) to authenticated;
