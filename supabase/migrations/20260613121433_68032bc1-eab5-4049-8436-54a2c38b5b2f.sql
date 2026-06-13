
-- Enums
create type public.app_role as enum ('owner', 'admin', 'support', 'member');
create type public.device_os as enum ('windows', 'macos', 'linux');
create type public.device_status as enum ('online', 'offline');
create type public.session_status as enum ('connected', 'ended', 'rejected');
create type public.session_quality as enum ('good', 'fair', 'poor');
create type public.plan_tier as enum ('free', 'pro', 'business', 'enterprise');
create type public.audit_severity as enum ('info', 'warn', 'critical');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles self read" on public.profiles for select to authenticated using (true);
create policy "profiles self write" on public.profiles for update to authenticated using (id = auth.uid());
create policy "profiles self insert" on public.profiles for insert to authenticated with check (id = auth.uid());

-- Teams
create table public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null references auth.users(id) on delete restrict,
  plan plan_tier not null default 'free',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.teams to authenticated;
grant all on public.teams to service_role;
alter table public.teams enable row level security;

-- Team members
create table public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (team_id, user_id)
);
grant select, insert, update, delete on public.team_members to authenticated;
grant all on public.team_members to service_role;
alter table public.team_members enable row level security;

-- has_role helper
create or replace function public.has_role(_user_id uuid, _team_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members where user_id = _user_id and team_id = _team_id and role = _role)
$$;

create or replace function public.is_team_member(_user_id uuid, _team_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.team_members where user_id = _user_id and team_id = _team_id)
$$;

create or replace function public.my_team_ids(_user_id uuid)
returns setof uuid language sql stable security definer set search_path = public as $$
  select team_id from public.team_members where user_id = _user_id
$$;

-- Policies for teams/team_members (avoid recursion via security definer fns)
create policy "team members read team" on public.teams for select to authenticated
  using (public.is_team_member(auth.uid(), id));
create policy "owner manages team" on public.teams for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "members read team_members" on public.team_members for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));
create policy "admins write team_members" on public.team_members for all to authenticated
  using (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'))
  with check (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'));
create policy "self insert as member" on public.team_members for insert to authenticated
  with check (user_id = auth.uid());

-- Devices
create table public.devices (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete restrict,
  name text not null,
  os device_os not null,
  os_version text,
  remote_desk_id char(9) not null unique,
  device_password_hash text,
  status device_status not null default 'offline',
  last_seen timestamptz,
  ip inet,
  cpu text,
  ram text,
  client_version text,
  tags text[] not null default '{}',
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.devices to authenticated;
grant all on public.devices to service_role;
alter table public.devices enable row level security;
create policy "members read devices" on public.devices for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));
create policy "owner writes devices" on public.devices for all to authenticated
  using (owner_id = auth.uid() or public.has_role(auth.uid(), team_id, 'admin') or public.has_role(auth.uid(), team_id, 'owner'))
  with check (public.is_team_member(auth.uid(), team_id));

-- Sessions
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  device_id uuid not null references public.devices(id) on delete cascade,
  host_user_id uuid references auth.users(id) on delete set null,
  viewer_user_id uuid references auth.users(id) on delete set null,
  status session_status not null default 'connected',
  quality session_quality,
  latency_ms int,
  bitrate_kbps int,
  packet_loss_pct numeric(5,2),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  end_reason text
);
grant select, insert, update, delete on public.sessions to authenticated;
grant all on public.sessions to service_role;
alter table public.sessions enable row level security;
create policy "members read sessions" on public.sessions for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));
create policy "members write sessions" on public.sessions for insert to authenticated
  with check (public.is_team_member(auth.uid(), team_id));

-- Subscriptions
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null unique references public.teams(id) on delete cascade,
  plan plan_tier not null default 'free',
  seats int not null default 1,
  status text not null default 'active',
  current_period_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text
);
grant select on public.subscriptions to authenticated;
grant all on public.subscriptions to service_role;
alter table public.subscriptions enable row level security;
create policy "members read subscription" on public.subscriptions for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));

-- Invoices
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  number text not null,
  amount_cents int not null,
  currency text not null default 'USD',
  status text not null default 'paid',
  issued_at timestamptz not null default now(),
  pdf_url text
);
grant select on public.invoices to authenticated;
grant all on public.invoices to service_role;
alter table public.invoices enable row level security;
create policy "members read invoices" on public.invoices for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));

-- Policy tables
create table public.security_policies (
  team_id uuid primary key references public.teams(id) on delete cascade,
  require_device_password boolean not null default true,
  require_host_approval boolean not null default true,
  require_2fa boolean not null default false,
  emergency_stop_shortcut text not null default 'Ctrl+Shift+.',
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.security_policies to authenticated;
grant all on public.security_policies to service_role;
alter table public.security_policies enable row level security;
create policy "members read sec policy" on public.security_policies for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));
create policy "admins write sec policy" on public.security_policies for all to authenticated
  using (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'))
  with check (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'));

create table public.file_transfer_policies (
  team_id uuid primary key references public.teams(id) on delete cascade,
  enabled boolean not null default true,
  require_approval boolean not null default true,
  direction text not null default 'both',
  max_size_mb int not null default 100,
  blocked_extensions text[] not null default array['exe','bat','ps1','sh'],
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.file_transfer_policies to authenticated;
grant all on public.file_transfer_policies to service_role;
alter table public.file_transfer_policies enable row level security;
create policy "members read ft policy" on public.file_transfer_policies for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));
create policy "admins write ft policy" on public.file_transfer_policies for all to authenticated
  using (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'))
  with check (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'));

create table public.clipboard_policies (
  team_id uuid primary key references public.teams(id) on delete cascade,
  enabled boolean not null default false,
  direction text not null default 'both',
  allow_images boolean not null default false,
  max_chars int not null default 100000,
  redact_secrets boolean not null default true,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.clipboard_policies to authenticated;
grant all on public.clipboard_policies to service_role;
alter table public.clipboard_policies enable row level security;
create policy "members read cb policy" on public.clipboard_policies for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));
create policy "admins write cb policy" on public.clipboard_policies for all to authenticated
  using (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'))
  with check (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'));

create table public.remote_input_policies (
  team_id uuid primary key references public.teams(id) on delete cascade,
  default_mode text not null default 'view-only',
  allow_keyboard boolean not null default true,
  allow_mouse boolean not null default true,
  block_elevation boolean not null default true,
  idle_lock_enabled boolean not null default true,
  idle_lock_minutes int not null default 5,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.remote_input_policies to authenticated;
grant all on public.remote_input_policies to service_role;
alter table public.remote_input_policies enable row level security;
create policy "members read ri policy" on public.remote_input_policies for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));
create policy "admins write ri policy" on public.remote_input_policies for all to authenticated
  using (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'))
  with check (public.has_role(auth.uid(), team_id, 'owner') or public.has_role(auth.uid(), team_id, 'admin'));

-- Audit logs
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  actor_label text,
  action text not null,
  target text,
  severity audit_severity not null default 'info',
  ip inet,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select, insert on public.audit_logs to authenticated;
grant all on public.audit_logs to service_role;
alter table public.audit_logs enable row level security;
create policy "members read audit" on public.audit_logs for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));
create policy "members insert audit" on public.audit_logs for insert to authenticated
  with check (public.is_team_member(auth.uid(), team_id));

create index audit_logs_team_created_idx on public.audit_logs (team_id, created_at desc);
create index sessions_team_started_idx on public.sessions (team_id, started_at desc);
create index devices_team_idx on public.devices (team_id);

-- Auto-create profile + personal team on new signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  new_team_id uuid;
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;

  insert into public.teams (name, owner_id, plan)
  values (coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)) || '''s Workspace', new.id, 'free')
  returning id into new_team_id;

  insert into public.team_members (team_id, user_id, role)
  values (new_team_id, new.id, 'owner');

  insert into public.subscriptions (team_id, plan, seats) values (new_team_id, 'free', 1);
  insert into public.security_policies (team_id) values (new_team_id);
  insert into public.file_transfer_policies (team_id) values (new_team_id);
  insert into public.clipboard_policies (team_id) values (new_team_id);
  insert into public.remote_input_policies (team_id) values (new_team_id);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
