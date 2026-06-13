-- ================================================================
-- RemoteDesk — Supabase schema (preview)
-- This file is documentation. Run via a Supabase migration when wiring
-- the backend. Always pair every public-schema CREATE TABLE with GRANTs.
-- ================================================================

-- Enums ----------------------------------------------------------
create type public.app_role as enum ('owner', 'admin', 'support', 'member');
create type public.device_os as enum ('windows', 'macos', 'linux');
create type public.device_status as enum ('online', 'offline');
create type public.session_status as enum ('connected', 'ended', 'rejected');
create type public.session_quality as enum ('good', 'fair', 'poor');
create type public.plan_tier as enum ('free', 'pro', 'business', 'enterprise');
create type public.audit_severity as enum ('info', 'warn', 'critical');

-- Teams ----------------------------------------------------------
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

-- Team membership ------------------------------------------------
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

-- Role check helper (security definer) ---------------------------
create or replace function public.has_role(_user_id uuid, _team_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.team_members
    where user_id = _user_id and team_id = _team_id and role = _role
  )
$$;

-- Devices --------------------------------------------------------
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

-- Sessions -------------------------------------------------------
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

-- Subscriptions --------------------------------------------------
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

-- Security policies (per team) -----------------------------------
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

create table public.file_transfer_policies (
  team_id uuid primary key references public.teams(id) on delete cascade,
  enabled boolean not null default true,
  require_approval boolean not null default true,
  direction text not null default 'both', -- both | upload | download
  max_size_mb int not null default 100,
  blocked_extensions text[] not null default array['exe','bat','ps1','sh'],
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.file_transfer_policies to authenticated;
grant all on public.file_transfer_policies to service_role;
alter table public.file_transfer_policies enable row level security;

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

create table public.remote_input_policies (
  team_id uuid primary key references public.teams(id) on delete cascade,
  default_mode text not null default 'view-only', -- view-only | ask | full
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

-- Audit logs -----------------------------------------------------
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

create index audit_logs_team_created_idx on public.audit_logs (team_id, created_at desc);
create index sessions_team_started_idx   on public.sessions   (team_id, started_at desc);
create index devices_team_idx            on public.devices    (team_id);

-- RLS policies (sketch) ------------------------------------------
create policy "team members can read team"
  on public.teams for select to authenticated
  using (id in (select team_id from public.team_members where user_id = auth.uid()));

create policy "members read team_members"
  on public.team_members for select to authenticated
  using (team_id in (select team_id from public.team_members where user_id = auth.uid()));

create policy "admins write team_members"
  on public.team_members for all to authenticated
  using (public.has_role(auth.uid(), team_id, 'owner')
      or public.has_role(auth.uid(), team_id, 'admin'))
  with check (public.has_role(auth.uid(), team_id, 'owner')
           or public.has_role(auth.uid(), team_id, 'admin'));

create policy "members read devices"
  on public.devices for select to authenticated
  using (team_id in (select team_id from public.team_members where user_id = auth.uid()));

create policy "device owner writes" on public.devices for all to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "members read sessions"
  on public.sessions for select to authenticated
  using (team_id in (select team_id from public.team_members where user_id = auth.uid()));

create policy "members read audit"
  on public.audit_logs for select to authenticated
  using (team_id in (select team_id from public.team_members where user_id = auth.uid()));

-- Repeat similar admin-only-write policies for security_policies,
-- file_transfer_policies, clipboard_policies, remote_input_policies.
