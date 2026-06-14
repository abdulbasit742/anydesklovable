
-- Address Book contacts
create table public.device_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  display_name text not null,
  remote_desk_id text,
  device_id uuid references public.devices(id) on delete set null,
  email text,
  phone text,
  notes text,
  tags text[] not null default '{}',
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.device_contacts to authenticated;
grant all on public.device_contacts to service_role;
alter table public.device_contacts enable row level security;

create policy "owner reads contacts" on public.device_contacts
  for select to authenticated using (owner_id = auth.uid()
    or (team_id is not null and public.is_team_member(auth.uid(), team_id)));
create policy "owner writes contacts" on public.device_contacts
  for insert to authenticated with check (owner_id = auth.uid());
create policy "owner updates contacts" on public.device_contacts
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "owner deletes contacts" on public.device_contacts
  for delete to authenticated using (owner_id = auth.uid());

create trigger device_contacts_set_updated_at before update on public.device_contacts
  for each row execute function public.tg_set_updated_at();

create index device_contacts_owner_idx on public.device_contacts(owner_id);
create index device_contacts_team_idx on public.device_contacts(team_id);

-- Mobile devices (paired phones/tablets that access the account)
create table public.mobile_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  device_label text not null,
  platform text not null check (platform in ('ios','android','ipados','other')),
  app_version text,
  push_token text,
  last_ip text,
  last_seen_at timestamptz,
  trusted boolean not null default false,
  trusted_at timestamptz,
  revoked_at timestamptz,
  pairing_code text,
  pairing_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.mobile_devices to authenticated;
grant all on public.mobile_devices to service_role;
alter table public.mobile_devices enable row level security;

create policy "user reads mobile devices" on public.mobile_devices
  for select to authenticated using (user_id = auth.uid());
create policy "user inserts mobile devices" on public.mobile_devices
  for insert to authenticated with check (user_id = auth.uid());
create policy "user updates mobile devices" on public.mobile_devices
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "user deletes mobile devices" on public.mobile_devices
  for delete to authenticated using (user_id = auth.uid());

create trigger mobile_devices_set_updated_at before update on public.mobile_devices
  for each row execute function public.tg_set_updated_at();

create index mobile_devices_user_idx on public.mobile_devices(user_id);
