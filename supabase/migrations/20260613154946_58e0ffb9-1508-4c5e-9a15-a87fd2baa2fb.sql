
-- 1. Extend team_members
alter table public.team_members
  add column if not exists status text not null default 'active',
  add column if not exists invited_by uuid references auth.users(id) on delete set null,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'team_members_status_check') then
    alter table public.team_members
      add constraint team_members_status_check check (status in ('active','suspended','removed'));
  end if;
end $$;

create index if not exists team_members_team_idx on public.team_members(team_id);
create index if not exists team_members_user_idx on public.team_members(user_id);
create index if not exists team_members_role_idx on public.team_members(role);
create index if not exists team_members_status_idx on public.team_members(status);

-- 2. team_invitations
create table if not exists public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  team_id uuid not null references public.teams(id) on delete cascade,
  email text not null,
  role text not null default 'viewer',
  token text not null unique default encode(gen_random_bytes(24), 'hex'),
  invited_by uuid references auth.users(id) on delete set null,
  status text not null default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_by uuid references auth.users(id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz,
  message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint team_invitations_role_check check (role in ('admin','technician','billing','viewer','support','member')),
  constraint team_invitations_status_check check (status in ('pending','accepted','expired','revoked')),
  constraint team_invitations_expiry_check check (expires_at > created_at)
);

grant select, insert, update, delete on public.team_invitations to authenticated;
grant all on public.team_invitations to service_role;
alter table public.team_invitations enable row level security;

create index if not exists team_invitations_team_idx on public.team_invitations(team_id);
create index if not exists team_invitations_email_idx on public.team_invitations(lower(email));
create index if not exists team_invitations_token_idx on public.team_invitations(token);
create index if not exists team_invitations_status_idx on public.team_invitations(status);
create unique index if not exists team_invitations_pending_unique
  on public.team_invitations(team_id, lower(email)) where status = 'pending';

create or replace function public.tg_team_invitations_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists team_invitations_updated_at on public.team_invitations;
create trigger team_invitations_updated_at
  before update on public.team_invitations
  for each row execute function public.tg_team_invitations_updated_at();

-- RLS for team_invitations
drop policy if exists "team admins read invites" on public.team_invitations;
create policy "team admins read invites" on public.team_invitations
  for select to authenticated using (
    public.has_role(auth.uid(), team_id, 'owner')
    or public.has_role(auth.uid(), team_id, 'admin')
  );

drop policy if exists "invitee reads own invite by token" on public.team_invitations;
create policy "invitee reads own invite by token" on public.team_invitations
  for select to authenticated using (
    lower(email) = lower(coalesce((auth.jwt() ->> 'email')::text, ''))
  );

drop policy if exists "team admins insert invites" on public.team_invitations;
create policy "team admins insert invites" on public.team_invitations
  for insert to authenticated with check (
    public.has_role(auth.uid(), team_id, 'owner')
    or public.has_role(auth.uid(), team_id, 'admin')
  );

drop policy if exists "team admins update invites" on public.team_invitations;
create policy "team admins update invites" on public.team_invitations
  for update to authenticated using (
    public.has_role(auth.uid(), team_id, 'owner')
    or public.has_role(auth.uid(), team_id, 'admin')
  );

-- 3. Role mapping helper: external role label -> existing app_role enum
create or replace function public.map_invite_role(_role text)
returns public.app_role language sql immutable as $$
  select case lower(_role)
    when 'owner' then 'owner'::public.app_role
    when 'admin' then 'admin'::public.app_role
    when 'technician' then 'support'::public.app_role
    when 'billing' then 'member'::public.app_role
    when 'viewer' then 'member'::public.app_role
    when 'support' then 'support'::public.app_role
    else 'member'::public.app_role
  end
$$;

-- 4. RPC: accept invitation
create or replace function public.accept_team_invitation(invite_token text)
returns table(team_id uuid, role public.app_role)
language plpgsql security definer set search_path = public as $$
declare
  _invite public.team_invitations%rowtype;
  _email text;
  _mapped public.app_role;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _invite from public.team_invitations where token = invite_token;
  if not found then raise exception 'Invitation not found'; end if;
  if _invite.status <> 'pending' then raise exception 'Invitation is %', _invite.status; end if;
  if _invite.expires_at < now() then
    update public.team_invitations set status = 'expired' where id = _invite.id;
    raise exception 'Invitation expired';
  end if;
  _email := coalesce((auth.jwt() ->> 'email')::text, '');
  if lower(_email) <> lower(_invite.email) then
    raise exception 'Invitation email mismatch';
  end if;

  _mapped := public.map_invite_role(_invite.role);

  insert into public.team_members (team_id, user_id, role, status, invited_by)
  values (_invite.team_id, auth.uid(), _mapped, 'active', _invite.invited_by)
  on conflict (team_id, user_id) do update set status = 'active', role = excluded.role, updated_at = now();

  update public.team_invitations
    set status = 'accepted', accepted_by = auth.uid(), accepted_at = now()
    where id = _invite.id;

  insert into public.audit_logs (team_id, actor_id, action, target, severity, metadata)
  values (_invite.team_id, auth.uid(), 'team_invite_accepted', _invite.email, 'info',
          jsonb_build_object('invitation_id', _invite.id, 'role', _invite.role));

  return query select _invite.team_id, _mapped;
end $$;

grant execute on function public.accept_team_invitation(text) to authenticated;

-- 5. RPC: revoke invitation
create or replace function public.revoke_team_invitation(invitation_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare _inv public.team_invitations%rowtype;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _inv from public.team_invitations where id = invitation_id;
  if not found then raise exception 'Invitation not found'; end if;
  if not (public.has_role(auth.uid(), _inv.team_id, 'owner') or public.has_role(auth.uid(), _inv.team_id, 'admin')) then
    raise exception 'Forbidden';
  end if;
  if _inv.status <> 'pending' then raise exception 'Cannot revoke a % invitation', _inv.status; end if;
  update public.team_invitations set status = 'revoked', revoked_at = now() where id = invitation_id;
  insert into public.audit_logs (team_id, actor_id, action, target, severity, metadata)
  values (_inv.team_id, auth.uid(), 'team_invite_revoked', _inv.email, 'info',
          jsonb_build_object('invitation_id', _inv.id));
end $$;

grant execute on function public.revoke_team_invitation(uuid) to authenticated;

-- 6. RPC: update member role
create or replace function public.update_team_member_role(member_id uuid, new_role text)
returns void language plpgsql security definer set search_path = public as $$
declare
  _m public.team_members%rowtype;
  _mapped public.app_role;
  _owner_count int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  select * into _m from public.team_members where id = member_id;
  if not found then raise exception 'Member not found'; end if;
  if not (public.has_role(auth.uid(), _m.team_id, 'owner') or public.has_role(auth.uid(), _m.team_id, 'admin')) then
    raise exception 'Forbidden';
  end if;
  _mapped := public.map_invite_role(new_role);
  -- Only owners can assign or remove owner role
  if (_mapped = 'owner' or _m.role = 'owner') and not public.has_role(auth.uid(), _m.team_id, 'owner') then
    raise exception 'Only owners can change owner role';
  end if;
  -- Prevent demoting the last owner
  if _m.role = 'owner' and _mapped <> 'owner' then
    select count(*) into _owner_count from public.team_members where team_id = _m.team_id and role = 'owner' and status = 'active';
    if _owner_count <= 1 then raise exception 'Cannot demote the last owner'; end if;
  end if;
  update public.team_members set role = _mapped, updated_at = now() where id = member_id;
  insert into public.audit_logs (team_id, actor_id, action, target, severity, metadata)
  values (_m.team_id, auth.uid(), 'team_member_role_changed', _m.user_id::text, 'info',
          jsonb_build_object('member_id', member_id, 'from', _m.role, 'to', _mapped));
end $$;

grant execute on function public.update_team_member_role(uuid, text) to authenticated;

-- 7. RPC: set member status (suspend/reactivate/remove)
create or replace function public.set_team_member_status(member_id uuid, new_status text)
returns void language plpgsql security definer set search_path = public as $$
declare _m public.team_members%rowtype; _owner_count int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if new_status not in ('active','suspended','removed') then raise exception 'Invalid status'; end if;
  select * into _m from public.team_members where id = member_id;
  if not found then raise exception 'Member not found'; end if;
  if not (public.has_role(auth.uid(), _m.team_id, 'owner') or public.has_role(auth.uid(), _m.team_id, 'admin')) then
    raise exception 'Forbidden';
  end if;
  if _m.role = 'owner' and new_status <> 'active' then
    select count(*) into _owner_count from public.team_members where team_id = _m.team_id and role = 'owner' and status = 'active';
    if _owner_count <= 1 then raise exception 'Cannot deactivate the last owner'; end if;
    if not public.has_role(auth.uid(), _m.team_id, 'owner') then
      raise exception 'Only owners can change owner status';
    end if;
  end if;
  update public.team_members set status = new_status, updated_at = now() where id = member_id;
  insert into public.audit_logs (team_id, actor_id, action, target, severity, metadata)
  values (_m.team_id, auth.uid(),
          case new_status when 'suspended' then 'team_member_suspended'
                          when 'removed' then 'team_member_removed'
                          else 'team_member_reactivated' end,
          _m.user_id::text, 'info',
          jsonb_build_object('member_id', member_id, 'status', new_status));
end $$;

grant execute on function public.set_team_member_status(uuid, text) to authenticated;
