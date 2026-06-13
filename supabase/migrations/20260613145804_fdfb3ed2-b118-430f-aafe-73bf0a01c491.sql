
create table public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid references public.teams(id) on delete set null,
  subject text not null,
  description text not null,
  category text not null check (category in ('connection','billing','account','desktop_app','security','feature_request','other')),
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  status text not null default 'open' check (status in ('open','pending','resolved','closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

grant select, insert, update, delete on public.support_tickets to authenticated;
grant all on public.support_tickets to service_role;

alter table public.support_tickets enable row level security;

create index support_tickets_user_idx on public.support_tickets(user_id);
create index support_tickets_team_idx on public.support_tickets(team_id);
create index support_tickets_status_idx on public.support_tickets(status);
create index support_tickets_priority_idx on public.support_tickets(priority);
create index support_tickets_created_idx on public.support_tickets(created_at desc);

create policy "users read own tickets" on public.support_tickets
  for select to authenticated
  using (user_id = auth.uid());

create policy "team admins read team tickets" on public.support_tickets
  for select to authenticated
  using (
    team_id is not null and (
      public.has_role(auth.uid(), team_id, 'owner')
      or public.has_role(auth.uid(), team_id, 'admin')
      or public.has_role(auth.uid(), team_id, 'support')
    )
  );

create policy "users create own tickets" on public.support_tickets
  for insert to authenticated
  with check (user_id = auth.uid());

create policy "users update own open tickets" on public.support_tickets
  for update to authenticated
  using (user_id = auth.uid() and status in ('open','pending'))
  with check (user_id = auth.uid());

create policy "team admins update team tickets" on public.support_tickets
  for update to authenticated
  using (
    team_id is not null and (
      public.has_role(auth.uid(), team_id, 'owner')
      or public.has_role(auth.uid(), team_id, 'admin')
      or public.has_role(auth.uid(), team_id, 'support')
    )
  )
  with check (
    team_id is not null and (
      public.has_role(auth.uid(), team_id, 'owner')
      or public.has_role(auth.uid(), team_id, 'admin')
      or public.has_role(auth.uid(), team_id, 'support')
    )
  );

create or replace function public.tg_support_tickets_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  if new.status = 'closed' and old.status is distinct from 'closed' then
    new.closed_at = now();
  end if;
  return new;
end;
$$;

create trigger support_tickets_updated_at
  before update on public.support_tickets
  for each row execute function public.tg_support_tickets_updated_at();
