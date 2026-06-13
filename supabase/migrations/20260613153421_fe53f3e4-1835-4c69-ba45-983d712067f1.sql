
-- trusted_devices
create table public.trusted_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_name text not null,
  device_fingerprint text not null,
  browser text,
  os text,
  ip_address text,
  trusted_at timestamptz not null default now(),
  last_seen_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.trusted_devices to authenticated;
grant all on public.trusted_devices to service_role;
alter table public.trusted_devices enable row level security;
create index trusted_devices_user_idx on public.trusted_devices(user_id);
create index trusted_devices_revoked_idx on public.trusted_devices(revoked_at);
create policy "own trusted devices select" on public.trusted_devices for select to authenticated using (user_id = auth.uid());
create policy "own trusted devices insert" on public.trusted_devices for insert to authenticated with check (user_id = auth.uid());
create policy "own trusted devices update" on public.trusted_devices for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own trusted devices delete" on public.trusted_devices for delete to authenticated using (user_id = auth.uid());

-- active_sessions
create table public.active_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_label text,
  ip_address text,
  user_agent text,
  device_name text,
  location text,
  last_active_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
grant select, insert, update, delete on public.active_sessions to authenticated;
grant all on public.active_sessions to service_role;
alter table public.active_sessions enable row level security;
create index active_sessions_user_idx on public.active_sessions(user_id);
create index active_sessions_revoked_idx on public.active_sessions(revoked_at);
create index active_sessions_last_active_idx on public.active_sessions(last_active_at desc);
create policy "own active sessions select" on public.active_sessions for select to authenticated using (user_id = auth.uid());
create policy "own active sessions insert" on public.active_sessions for insert to authenticated with check (user_id = auth.uid());
create policy "own active sessions update" on public.active_sessions for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own active sessions delete" on public.active_sessions for delete to authenticated using (user_id = auth.uid());

-- security_events
create table public.security_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info','warning','critical')),
  ip_address text,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.security_events to authenticated;
grant all on public.security_events to service_role;
alter table public.security_events enable row level security;
create index security_events_user_idx on public.security_events(user_id);
create index security_events_severity_idx on public.security_events(severity);
create index security_events_created_idx on public.security_events(created_at desc);
create policy "own security events select" on public.security_events for select to authenticated using (user_id = auth.uid());
create policy "own security events insert" on public.security_events for insert to authenticated with check (user_id = auth.uid());
