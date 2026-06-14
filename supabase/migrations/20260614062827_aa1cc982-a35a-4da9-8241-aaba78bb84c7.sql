
-- Billing change requests
create table if not exists public.billing_change_requests (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  requested_by uuid not null references auth.users(id) on delete cascade,
  from_plan text,
  to_plan text not null,
  from_seats integer,
  to_seats integer not null,
  billing_interval text not null default 'monthly',
  status text not null default 'pending', -- pending|approved|applied|rejected|cancelled
  note text,
  processed_at timestamptz,
  processed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select, insert, update on public.billing_change_requests to authenticated;
grant all on public.billing_change_requests to service_role;
alter table public.billing_change_requests enable row level security;

create policy "team members read change requests" on public.billing_change_requests
  for select to authenticated
  using (public.is_team_member(auth.uid(), team_id));

create policy "owners/admins create change requests" on public.billing_change_requests
  for insert to authenticated
  with check (
    requested_by = auth.uid() and (
      public.has_role(auth.uid(), team_id, 'owner') or
      public.has_role(auth.uid(), team_id, 'admin')
    )
  );

create policy "owners/admins update change requests" on public.billing_change_requests
  for update to authenticated
  using (
    public.has_role(auth.uid(), team_id, 'owner') or
    public.has_role(auth.uid(), team_id, 'admin')
  );

create trigger tg_billing_change_requests_updated_at
  before update on public.billing_change_requests
  for each row execute function public.tg_set_updated_at();

-- Request a plan change (does not charge; webhook applies the final state)
create or replace function public.request_billing_change(
  _to_plan text,
  _to_seats integer,
  _billing_interval text default 'monthly',
  _note text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  _team_id uuid;
  _sub public.subscriptions%rowtype;
  _req_id uuid;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if _to_seats is null or _to_seats < 1 then raise exception 'Invalid seat count'; end if;
  if not exists (select 1 from public.plan_limits where plan_key = lower(_to_plan)) then
    raise exception 'Unknown plan %', _to_plan;
  end if;

  select team_id into _team_id from public.team_members
    where user_id = auth.uid() and role in ('owner','admin') and status = 'active'
    order by case role when 'owner' then 0 else 1 end limit 1;
  if _team_id is null then raise exception 'Only owners or admins can change billing'; end if;

  select * into _sub from public.subscriptions where team_id = _team_id;

  insert into public.billing_change_requests(team_id, requested_by, from_plan, to_plan, from_seats, to_seats, billing_interval, note)
  values (_team_id, auth.uid(), _sub.plan::text, lower(_to_plan), _sub.seats, _to_seats, coalesce(_billing_interval,'monthly'), _note)
  returning id into _req_id;

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_team_id, auth.uid(), 'billing_change_requested', lower(_to_plan), 'info',
          jsonb_build_object('request_id', _req_id, 'seats', _to_seats, 'interval', _billing_interval));

  return _req_id;
end $$;

revoke all on function public.request_billing_change(text,integer,text,text) from public, anon;
grant execute on function public.request_billing_change(text,integer,text,text) to authenticated;

-- Owner-only direct seat update for self-serve (audited)
create or replace function public.set_subscription_seats(_seats integer)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  _team_id uuid;
  _from int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if _seats is null or _seats < 1 then raise exception 'Invalid seat count'; end if;
  select team_id into _team_id from public.team_members
    where user_id = auth.uid() and role = 'owner' and status = 'active' limit 1;
  if _team_id is null then raise exception 'Only the team owner can change seats directly'; end if;
  select seats into _from from public.subscriptions where team_id = _team_id;
  update public.subscriptions set seats = _seats, updated_at = now() where team_id = _team_id;
  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_team_id, auth.uid(), 'subscription_seats_changed', _seats::text, 'info',
          jsonb_build_object('from', _from, 'to', _seats));
end $$;

revoke all on function public.set_subscription_seats(integer) from public, anon;
grant execute on function public.set_subscription_seats(integer) to authenticated;

-- Webhook helpers (service role only)
create or replace function public.apply_subscription_from_webhook(
  _team_id uuid,
  _plan text,
  _seats integer,
  _status text,
  _interval text,
  _stripe_customer_id text,
  _stripe_subscription_id text,
  _current_period_end timestamptz,
  _cancel_at_period_end boolean
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.subscriptions
    set plan = _plan::app_plan,
        seats = coalesce(_seats, seats),
        status = coalesce(_status, status),
        billing_interval = coalesce(_interval, billing_interval),
        stripe_customer_id = coalesce(_stripe_customer_id, stripe_customer_id),
        stripe_subscription_id = coalesce(_stripe_subscription_id, stripe_subscription_id),
        current_period_end = coalesce(_current_period_end, current_period_end),
        cancel_at_period_end = coalesce(_cancel_at_period_end, cancel_at_period_end),
        provider = 'stripe',
        updated_at = now()
    where team_id = _team_id;

  update public.teams set plan = _plan::app_plan where id = _team_id;

  update public.billing_change_requests
    set status = 'applied', processed_at = now()
    where team_id = _team_id and status in ('pending','approved')
      and to_plan = _plan;

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_team_id, null, 'subscription_updated_webhook', _plan, 'info',
          jsonb_build_object('seats', _seats, 'status', _status, 'interval', _interval));
exception when others then
  raise;
end $$;

revoke all on function public.apply_subscription_from_webhook(uuid,text,integer,text,text,text,text,timestamptz,boolean) from public, anon, authenticated;
grant execute on function public.apply_subscription_from_webhook(uuid,text,integer,text,text,text,text,timestamptz,boolean) to service_role;

create or replace function public.upsert_invoice_from_webhook(
  _team_id uuid,
  _number text,
  _amount_cents integer,
  _currency text,
  _status text,
  _issued_at timestamptz,
  _pdf_url text
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare _id uuid;
begin
  select id into _id from public.invoices where team_id = _team_id and number = _number;
  if _id is null then
    insert into public.invoices(team_id, number, amount_cents, currency, status, issued_at, pdf_url)
    values (_team_id, _number, _amount_cents, coalesce(_currency,'usd'), _status, coalesce(_issued_at, now()), _pdf_url)
    returning id into _id;
  else
    update public.invoices set status = _status, amount_cents = _amount_cents, pdf_url = coalesce(_pdf_url, pdf_url) where id = _id;
  end if;
  return _id;
end $$;

revoke all on function public.upsert_invoice_from_webhook(uuid,text,integer,text,text,timestamptz,text) from public, anon, authenticated;
grant execute on function public.upsert_invoice_from_webhook(uuid,text,integer,text,text,timestamptz,text) to service_role;
