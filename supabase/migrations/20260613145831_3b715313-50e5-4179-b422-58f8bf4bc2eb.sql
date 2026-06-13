
create or replace function public.tg_support_tickets_updated_at()
returns trigger language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  if new.status = 'closed' and old.status is distinct from 'closed' then
    new.closed_at = now();
  end if;
  return new;
end;
$$;
