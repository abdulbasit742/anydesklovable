
-- plan_limits ---------------------------------------------------
create table public.plan_limits (
  id uuid primary key default gen_random_uuid(),
  plan_key text not null unique,
  display_name text not null,
  monthly_price numeric,
  yearly_price numeric,
  currency text not null default 'usd',
  max_devices integer,
  max_team_members integer,
  max_monthly_session_minutes integer,
  max_file_transfer_mb integer,
  max_audit_retention_days integer,
  can_use_file_transfer boolean not null default false,
  can_use_clipboard_sync boolean not null default false,
  can_use_unattended_access boolean not null default false,
  can_use_team_management boolean not null default false,
  can_use_admin_console boolean not null default false,
  can_use_priority_support boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.plan_limits to authenticated, anon;
grant all on public.plan_limits to service_role;
alter table public.plan_limits enable row level security;
create policy "plan_limits readable to all" on public.plan_limits for select to authenticated, anon using (true);
-- TODO: admin-only write policy once platform-admin role is modeled. For now, writes via service_role only.

insert into public.plan_limits (plan_key, display_name, monthly_price, yearly_price, max_devices, max_team_members, max_monthly_session_minutes, max_file_transfer_mb, max_audit_retention_days, can_use_file_transfer, can_use_clipboard_sync, can_use_unattended_access, can_use_team_management, can_use_admin_console, can_use_priority_support) values
  ('free',       'Free',       0,    0,    1,   1,   60,   50,   7,   false, false, false, false, false, false),
  ('pro',        'Pro',        19,   190,  5,   1,   null, 500,  30,  true,  true,  true,  false, false, false),
  ('business',   'Business',   49,   490,  25,  10,  null, 5000, 90,  true,  true,  true,  true,  false, true),
  ('enterprise', 'Enterprise', null, null, null,null,null, null, 365, true,  true,  true,  true,  true,  true);

-- usage_metrics -------------------------------------------------
-- NOTE: production inserts should happen via trusted server-side jobs (service_role).
-- Client RLS below intentionally omits INSERT/UPDATE/DELETE.
create table public.usage_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete cascade,
  metric_key text not null,
  metric_value numeric not null default 0 check (metric_value >= 0),
  period_start timestamptz not null,
  period_end timestamptz not null,
  source text not null default 'system',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (user_id is not null or team_id is not null)
);
grant select on public.usage_metrics to authenticated;
grant all on public.usage_metrics to service_role;
alter table public.usage_metrics enable row level security;
create index usage_metrics_user_idx on public.usage_metrics(user_id);
create index usage_metrics_team_idx on public.usage_metrics(team_id);
create index usage_metrics_metric_idx on public.usage_metrics(metric_key);
create index usage_metrics_period_start_idx on public.usage_metrics(period_start);
create index usage_metrics_period_end_idx on public.usage_metrics(period_end);
create index usage_metrics_team_metric_period_idx on public.usage_metrics(team_id, metric_key, period_start);
create index usage_metrics_user_metric_period_idx on public.usage_metrics(user_id, metric_key, period_start);

create policy "own usage metrics select" on public.usage_metrics for select to authenticated
  using (user_id = auth.uid() or (team_id is not null and public.is_team_member(auth.uid(), team_id)));

-- subscriptions enhancements -----------------------------------
alter table public.subscriptions
  add column if not exists billing_interval text,
  add column if not exists cancel_at_period_end boolean not null default false,
  add column if not exists provider text not null default 'manual';
