
-- Policies on storage.objects scoped to the support-attachments bucket.
-- Path convention: <ticket_id>/<filename>

create policy "support-attachments read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'support-attachments'
    and public.can_view_ticket((storage.foldername(name))[1]::uuid)
  );

create policy "support-attachments upload"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'support-attachments'
    and public.can_view_ticket((storage.foldername(name))[1]::uuid)
    and owner = auth.uid()
  );

create policy "support-attachments delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'support-attachments'
    and (
      owner = auth.uid()
      or public.can_triage_ticket((storage.foldername(name))[1]::uuid)
    )
  );

-- Realtime publication
alter publication supabase_realtime add table public.support_ticket_comments;
alter publication supabase_realtime add table public.support_ticket_attachments;
alter publication supabase_realtime add table public.support_ticket_events;
alter publication supabase_realtime add table public.support_tickets;
