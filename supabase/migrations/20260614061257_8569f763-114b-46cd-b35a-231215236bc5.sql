
alter table public.devices
  add column if not exists is_trusted boolean not null default false,
  add column if not exists unattended_access boolean not null default false,
  add column if not exists password_updated_at timestamptz,
  add column if not exists notes text,
  add column if not exists group_label text;

create table if not exists public.device_audit_events (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references public.devices(id) on delete cascade,
  team_id uuid not null references public.teams(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  from_value text,
  to_value text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists device_audit_events_device_idx on public.device_audit_events(device_id, created_at desc);
create index if not exists device_audit_events_team_idx on public.device_audit_events(team_id, created_at desc);

grant select, insert on public.device_audit_events to authenticated;
grant all on public.device_audit_events to service_role;

alter table public.device_audit_events enable row level security;

create policy "Team members can view device audit events"
  on public.device_audit_events for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));

create policy "Team members can record device audit events"
  on public.device_audit_events for insert to authenticated
  with check (public.is_team_member(auth.uid(), team_id) and (actor_id is null or actor_id = auth.uid()));
