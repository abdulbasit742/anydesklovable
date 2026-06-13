
-- Helper: can the current user view a ticket?
create or replace function public.can_view_ticket(_ticket_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.support_tickets t
    where t.id = _ticket_id
      and (
        t.user_id = auth.uid()
        or (t.team_id is not null and (
          public.has_role(auth.uid(), t.team_id, 'owner') or
          public.has_role(auth.uid(), t.team_id, 'admin') or
          public.has_role(auth.uid(), t.team_id, 'support')
        ))
      )
  )
$$;

-- Helper: can the current user triage (admin) a ticket?
create or replace function public.can_triage_ticket(_ticket_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.support_tickets t
    where t.id = _ticket_id and t.team_id is not null and (
      public.has_role(auth.uid(), t.team_id, 'owner') or
      public.has_role(auth.uid(), t.team_id, 'admin') or
      public.has_role(auth.uid(), t.team_id, 'support')
    )
  )
$$;

-- =========================================================
-- support_ticket_comments
-- =========================================================
create table public.support_ticket_comments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  author_id uuid not null references auth.users(id) on delete cascade,
  body text not null,
  is_internal boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint support_ticket_comments_body_nonempty check (length(btrim(body)) > 0)
);
grant select, insert, update on public.support_ticket_comments to authenticated;
grant all on public.support_ticket_comments to service_role;
alter table public.support_ticket_comments enable row level security;

create index support_ticket_comments_ticket_idx   on public.support_ticket_comments(ticket_id);
create index support_ticket_comments_author_idx   on public.support_ticket_comments(author_id);
create index support_ticket_comments_created_idx  on public.support_ticket_comments(created_at desc);
create index support_ticket_comments_internal_idx on public.support_ticket_comments(is_internal);

-- Read: ticket owners (non-internal only) or triage (all)
create policy "read ticket comments" on public.support_ticket_comments
  for select to authenticated using (
    deleted_at is null and (
      (not is_internal and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()))
      or public.can_triage_ticket(ticket_id)
    )
  );

-- Insert: ticket owner posts public comment; triage posts any
create policy "insert ticket comments" on public.support_ticket_comments
  for insert to authenticated with check (
    author_id = auth.uid() and (
      (not is_internal and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()))
      or public.can_triage_ticket(ticket_id)
    )
  );

-- Update: author may edit body (soft delete) within their own; triage may always
create policy "update ticket comments" on public.support_ticket_comments
  for update to authenticated using (
    author_id = auth.uid() or public.can_triage_ticket(ticket_id)
  ) with check (
    author_id = auth.uid() or public.can_triage_ticket(ticket_id)
  );

-- =========================================================
-- support_ticket_attachments
-- =========================================================
create table public.support_ticket_attachments (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  comment_id uuid references public.support_ticket_comments(id) on delete set null,
  uploaded_by uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_size bigint not null check (file_size >= 0),
  mime_type text,
  storage_bucket text not null default 'support-attachments',
  storage_path text not null,
  checksum_sha256 text,
  scan_status text not null default 'pending' check (scan_status in ('pending','clean','blocked','failed')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
grant select, insert, update on public.support_ticket_attachments to authenticated;
grant all on public.support_ticket_attachments to service_role;
alter table public.support_ticket_attachments enable row level security;

create index support_ticket_attachments_ticket_idx   on public.support_ticket_attachments(ticket_id);
create index support_ticket_attachments_comment_idx  on public.support_ticket_attachments(comment_id);
create index support_ticket_attachments_uploader_idx on public.support_ticket_attachments(uploaded_by);
create index support_ticket_attachments_scan_idx     on public.support_ticket_attachments(scan_status);
create index support_ticket_attachments_created_idx  on public.support_ticket_attachments(created_at desc);

create policy "read ticket attachments" on public.support_ticket_attachments
  for select to authenticated using (
    deleted_at is null and public.can_view_ticket(ticket_id)
  );

create policy "insert ticket attachments" on public.support_ticket_attachments
  for insert to authenticated with check (
    uploaded_by = auth.uid() and public.can_view_ticket(ticket_id)
  );

create policy "soft delete ticket attachments" on public.support_ticket_attachments
  for update to authenticated using (
    uploaded_by = auth.uid() or public.can_triage_ticket(ticket_id)
  ) with check (
    uploaded_by = auth.uid() or public.can_triage_ticket(ticket_id)
  );

-- =========================================================
-- support_ticket_events
-- =========================================================
create table public.support_ticket_events (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.support_tickets(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in (
    'ticket_created','comment_added','internal_note_added','attachment_added',
    'status_changed','priority_changed','assigned','unassigned',
    'ticket_closed','ticket_reopened'
  )),
  from_value text,
  to_value text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
grant select on public.support_ticket_events to authenticated;
grant all on public.support_ticket_events to service_role;
alter table public.support_ticket_events enable row level security;

create index support_ticket_events_ticket_idx  on public.support_ticket_events(ticket_id);
create index support_ticket_events_actor_idx   on public.support_ticket_events(actor_id);
create index support_ticket_events_type_idx    on public.support_ticket_events(event_type);
create index support_ticket_events_created_idx on public.support_ticket_events(created_at desc);

-- Public events visible to ticket owner; all events to triage.
create policy "read ticket events" on public.support_ticket_events
  for select to authenticated using (
    (event_type in ('ticket_created','comment_added','attachment_added','status_changed','ticket_closed','ticket_reopened')
      and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = auth.uid()))
    or public.can_triage_ticket(ticket_id)
  );

-- Inserts happen only via triggers / security-definer functions (no client policy).

-- =========================================================
-- Triggers to auto-log ticket lifecycle events
-- =========================================================
create or replace function public.tg_support_ticket_created()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.support_ticket_events(ticket_id, actor_id, event_type, to_value)
  values (new.id, new.user_id, 'ticket_created', new.status);
  return new;
end $$;

drop trigger if exists support_tickets_created_evt on public.support_tickets;
create trigger support_tickets_created_evt
  after insert on public.support_tickets
  for each row execute function public.tg_support_ticket_created();

create or replace function public.tg_support_ticket_changed()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status is distinct from old.status then
    insert into public.support_ticket_events(ticket_id, actor_id, event_type, from_value, to_value)
    values (new.id, auth.uid(),
            case when new.status = 'closed' then 'ticket_closed'
                 when old.status = 'closed' and new.status <> 'closed' then 'ticket_reopened'
                 else 'status_changed' end,
            old.status, new.status);
  end if;
  if new.priority is distinct from old.priority then
    insert into public.support_ticket_events(ticket_id, actor_id, event_type, from_value, to_value)
    values (new.id, auth.uid(), 'priority_changed', old.priority, new.priority);
  end if;
  if new.assigned_to is distinct from old.assigned_to then
    insert into public.support_ticket_events(ticket_id, actor_id, event_type, from_value, to_value)
    values (new.id, auth.uid(),
            case when new.assigned_to is null then 'unassigned' else 'assigned' end,
            old.assigned_to::text, new.assigned_to::text);
  end if;
  return new;
end $$;

drop trigger if exists support_tickets_changed_evt on public.support_tickets;
create trigger support_tickets_changed_evt
  after update on public.support_tickets
  for each row execute function public.tg_support_ticket_changed();

create or replace function public.tg_support_ticket_comment_added()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.support_ticket_events(ticket_id, actor_id, event_type, metadata)
  values (new.ticket_id, new.author_id,
          case when new.is_internal then 'internal_note_added' else 'comment_added' end,
          jsonb_build_object('comment_id', new.id));
  -- bump ticket updated_at so list views resort
  update public.support_tickets set updated_at = now() where id = new.ticket_id;
  return new;
end $$;

drop trigger if exists support_ticket_comments_added_evt on public.support_ticket_comments;
create trigger support_ticket_comments_added_evt
  after insert on public.support_ticket_comments
  for each row execute function public.tg_support_ticket_comment_added();

create or replace function public.tg_support_ticket_attachment_added()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.support_ticket_events(ticket_id, actor_id, event_type, to_value, metadata)
  values (new.ticket_id, new.uploaded_by, 'attachment_added', new.file_name,
          jsonb_build_object('attachment_id', new.id, 'size', new.file_size, 'mime', new.mime_type));
  return new;
end $$;

drop trigger if exists support_ticket_attachments_added_evt on public.support_ticket_attachments;
create trigger support_ticket_attachments_added_evt
  after insert on public.support_ticket_attachments
  for each row execute function public.tg_support_ticket_attachment_added();

-- updated_at on comments
create or replace function public.tg_support_ticket_comments_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists support_ticket_comments_updated_at on public.support_ticket_comments;
create trigger support_ticket_comments_updated_at
  before update on public.support_ticket_comments
  for each row execute function public.tg_support_ticket_comments_updated_at();
