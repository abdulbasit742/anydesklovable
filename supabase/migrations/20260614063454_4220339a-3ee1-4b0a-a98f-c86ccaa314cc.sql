
create or replace function public.apply_billing_change_request(_request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare _r public.billing_change_requests%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _r from public.billing_change_requests where id = _request_id;
  if not found then raise exception 'Request not found'; end if;
  if _r.status <> 'pending' then raise exception 'Request is %', _r.status; end if;
  if not (public.has_role(auth.uid(), _r.team_id, 'owner') or public.has_role(auth.uid(), _r.team_id, 'admin')) then
    raise exception 'Forbidden';
  end if;

  update public.subscriptions
    set plan = _r.to_plan::app_plan,
        seats = _r.to_seats,
        billing_interval = _r.billing_interval,
        updated_at = now()
    where team_id = _r.team_id;

  update public.teams set plan = _r.to_plan::app_plan where id = _r.team_id;

  update public.billing_change_requests
    set status = 'applied', processed_at = now(), processed_by = auth.uid()
    where id = _request_id;

  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_r.team_id, auth.uid(), 'billing_change_applied', _r.to_plan, 'info',
          jsonb_build_object('request_id', _request_id, 'seats', _r.to_seats, 'interval', _r.billing_interval));
end $$;

revoke all on function public.apply_billing_change_request(uuid) from public, anon;
grant execute on function public.apply_billing_change_request(uuid) to authenticated;

create or replace function public.reject_billing_change_request(_request_id uuid, _reason text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare _r public.billing_change_requests%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _r from public.billing_change_requests where id = _request_id;
  if not found then raise exception 'Request not found'; end if;
  if _r.status <> 'pending' then raise exception 'Request is %', _r.status; end if;
  if not (public.has_role(auth.uid(), _r.team_id, 'owner') or public.has_role(auth.uid(), _r.team_id, 'admin')) then
    raise exception 'Forbidden';
  end if;
  update public.billing_change_requests
    set status = 'rejected', processed_at = now(), processed_by = auth.uid(),
        note = coalesce(_reason, note)
    where id = _request_id;
  insert into public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  values (_r.team_id, auth.uid(), 'billing_change_rejected', _r.to_plan, 'info',
          jsonb_build_object('request_id', _request_id, 'reason', _reason));
end $$;

revoke all on function public.reject_billing_change_request(uuid, text) from public, anon;
grant execute on function public.reject_billing_change_request(uuid, text) to authenticated;
