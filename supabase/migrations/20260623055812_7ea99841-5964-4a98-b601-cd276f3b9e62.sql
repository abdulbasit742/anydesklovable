
-- TASK #14 PHASE 1: Remote Support Operations Center

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS queue_id uuid,
  ADD COLUMN IF NOT EXISTS assigned_to uuid,
  ADD COLUMN IF NOT EXISTS priority text DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS source text DEFAULT 'dashboard',
  ADD COLUMN IF NOT EXISTS severity text,
  ADD COLUMN IF NOT EXISTS customer_impact text,
  ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
  ADD COLUMN IF NOT EXISTS resolved_at timestamptz,
  ADD COLUMN IF NOT EXISTS closed_at timestamptz,
  ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_support_tickets_queue ON public.support_tickets(team_id, queue_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_assigned ON public.support_tickets(team_id, assigned_to);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority ON public.support_tickets(team_id, status, priority);

-- 1. support_queues
CREATE TABLE IF NOT EXISTS public.support_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  queue_type text NOT NULL DEFAULT 'general',
  priority integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_queues TO authenticated;
GRANT ALL ON public.support_queues TO service_role;
ALTER TABLE public.support_queues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_queues_select" ON public.support_queues
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_queues_manage" ON public.support_queues
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)));
CREATE INDEX IF NOT EXISTS idx_support_queues_team ON public.support_queues(team_id, active, priority);
CREATE TRIGGER trg_support_queues_updated BEFORE UPDATE ON public.support_queues
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2. support_queue_members
CREATE TABLE IF NOT EXISTS public.support_queue_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  queue_id uuid NOT NULL REFERENCES public.support_queues(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'agent',
  active boolean NOT NULL DEFAULT true,
  joined_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_queue_members TO authenticated;
GRANT ALL ON public.support_queue_members TO service_role;
ALTER TABLE public.support_queue_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_queue_members_select" ON public.support_queue_members
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_queue_members_manage" ON public.support_queue_members
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)));
CREATE INDEX IF NOT EXISTS idx_support_queue_members_lookup ON public.support_queue_members(team_id, queue_id, user_id);

-- 3. support_ticket_assignments
CREATE TABLE IF NOT EXISTS public.support_ticket_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  assigned_to uuid,
  assigned_by uuid,
  queue_id uuid,
  assignment_type text NOT NULL DEFAULT 'manual',
  reason text,
  active boolean NOT NULL DEFAULT true,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_ticket_assignments TO authenticated;
GRANT ALL ON public.support_ticket_assignments TO service_role;
ALTER TABLE public.support_ticket_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_ticket_assignments_select" ON public.support_ticket_assignments
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_ticket_assignments_write" ON public.support_ticket_assignments
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_sta_ticket ON public.support_ticket_assignments(team_id, ticket_id, active);
CREATE INDEX IF NOT EXISTS idx_sta_assignee ON public.support_ticket_assignments(team_id, assigned_to, active);

-- 4. support_sla_policies
CREATE TABLE IF NOT EXISTS public.support_sla_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'normal',
  first_response_minutes integer NOT NULL DEFAULT 240,
  resolution_minutes integer NOT NULL DEFAULT 1440,
  escalation_minutes integer,
  business_hours_only boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_sla_policies TO authenticated;
GRANT ALL ON public.support_sla_policies TO service_role;
ALTER TABLE public.support_sla_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_sla_policies_select" ON public.support_sla_policies
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_sla_policies_manage" ON public.support_sla_policies
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)));
CREATE INDEX IF NOT EXISTS idx_sla_policies_team ON public.support_sla_policies(team_id, active, priority);
CREATE TRIGGER trg_support_sla_policies_updated BEFORE UPDATE ON public.support_sla_policies
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 5. support_ticket_sla_status
CREATE TABLE IF NOT EXISTS public.support_ticket_sla_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  ticket_id uuid NOT NULL UNIQUE REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sla_policy_id uuid REFERENCES public.support_sla_policies(id) ON DELETE SET NULL,
  first_response_due_at timestamptz,
  resolution_due_at timestamptz,
  escalation_due_at timestamptz,
  first_response_at timestamptz,
  resolved_at timestamptz,
  first_response_breached boolean NOT NULL DEFAULT false,
  resolution_breached boolean NOT NULL DEFAULT false,
  escalation_triggered boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'on_track',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_ticket_sla_status TO authenticated;
GRANT ALL ON public.support_ticket_sla_status TO service_role;
ALTER TABLE public.support_ticket_sla_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_ticket_sla_status_select" ON public.support_ticket_sla_status
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_ticket_sla_status_write" ON public.support_ticket_sla_status
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_sla_status_team_status ON public.support_ticket_sla_status(team_id, status);
CREATE INDEX IF NOT EXISTS idx_sla_status_fr_due ON public.support_ticket_sla_status(first_response_due_at);
CREATE INDEX IF NOT EXISTS idx_sla_status_res_due ON public.support_ticket_sla_status(resolution_due_at);
CREATE TRIGGER trg_support_ticket_sla_status_updated BEFORE UPDATE ON public.support_ticket_sla_status
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6. support_escalations
CREATE TABLE IF NOT EXISTS public.support_escalations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  escalation_level integer NOT NULL DEFAULT 1,
  escalated_by uuid,
  escalated_to uuid,
  queue_id uuid,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_escalations TO authenticated;
GRANT ALL ON public.support_escalations TO service_role;
ALTER TABLE public.support_escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_escalations_select" ON public.support_escalations
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_escalations_write" ON public.support_escalations
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_support_escalations_lookup ON public.support_escalations(team_id, status, created_at DESC);
CREATE TRIGGER trg_support_escalations_updated BEFORE UPDATE ON public.support_escalations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 7. support_ticket_device_links
CREATE TABLE IF NOT EXISTS public.support_ticket_device_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  device_id uuid,
  session_id uuid,
  link_type text NOT NULL DEFAULT 'related',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_ticket_device_links TO authenticated;
GRANT ALL ON public.support_ticket_device_links TO service_role;
ALTER TABLE public.support_ticket_device_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_ticket_device_links_select" ON public.support_ticket_device_links
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_ticket_device_links_write" ON public.support_ticket_device_links
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_stdl_ticket ON public.support_ticket_device_links(team_id, ticket_id);
CREATE INDEX IF NOT EXISTS idx_stdl_device ON public.support_ticket_device_links(device_id);
CREATE INDEX IF NOT EXISTS idx_stdl_session ON public.support_ticket_device_links(session_id);

-- 8. support_runbooks
CREATE TABLE IF NOT EXISTS public.support_runbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT '{}',
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_runbooks TO authenticated;
GRANT ALL ON public.support_runbooks TO service_role;
ALTER TABLE public.support_runbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_runbooks_select" ON public.support_runbooks
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_runbooks_manage" ON public.support_runbooks
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)));
CREATE INDEX IF NOT EXISTS idx_runbooks_team ON public.support_runbooks(team_id, active, category);
CREATE TRIGGER trg_support_runbooks_updated BEFORE UPDATE ON public.support_runbooks
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 9. support_ticket_runbook_usage
CREATE TABLE IF NOT EXISTS public.support_ticket_runbook_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  runbook_id uuid NOT NULL REFERENCES public.support_runbooks(id) ON DELETE CASCADE,
  used_by uuid,
  status text NOT NULL DEFAULT 'started',
  notes text,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_ticket_runbook_usage TO authenticated;
GRANT ALL ON public.support_ticket_runbook_usage TO service_role;
ALTER TABLE public.support_ticket_runbook_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_ticket_runbook_usage_select" ON public.support_ticket_runbook_usage
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_ticket_runbook_usage_write" ON public.support_ticket_runbook_usage
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_runbook_usage_ticket ON public.support_ticket_runbook_usage(team_id, ticket_id);

-- 10. support_internal_notes
CREATE TABLE IF NOT EXISTS public.support_internal_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id uuid,
  body text NOT NULL,
  visibility text NOT NULL DEFAULT 'internal',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_internal_notes TO authenticated;
GRANT ALL ON public.support_internal_notes TO service_role;
ALTER TABLE public.support_internal_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_internal_notes_select" ON public.support_internal_notes
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_internal_notes_write" ON public.support_internal_notes
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_internal_notes_ticket ON public.support_internal_notes(team_id, ticket_id, created_at DESC);
CREATE TRIGGER trg_support_internal_notes_updated BEFORE UPDATE ON public.support_internal_notes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 11. support_ticket_tags
CREATE TABLE IF NOT EXISTS public.support_ticket_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  tag text NOT NULL,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (ticket_id, tag)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_ticket_tags TO authenticated;
GRANT ALL ON public.support_ticket_tags TO service_role;
ALTER TABLE public.support_ticket_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_ticket_tags_select" ON public.support_ticket_tags
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_ticket_tags_write" ON public.support_ticket_tags
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_ticket_tags_ticket ON public.support_ticket_tags(team_id, ticket_id);

-- 12. technician_workload_snapshots
CREATE TABLE IF NOT EXISTS public.technician_workload_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  user_id uuid NOT NULL,
  open_tickets integer NOT NULL DEFAULT 0,
  urgent_tickets integer NOT NULL DEFAULT 0,
  breached_slas integer NOT NULL DEFAULT 0,
  avg_response_minutes numeric,
  avg_resolution_minutes numeric,
  active_sessions integer NOT NULL DEFAULT 0,
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technician_workload_snapshots TO authenticated;
GRANT ALL ON public.technician_workload_snapshots TO service_role;
ALTER TABLE public.technician_workload_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "technician_workload_select" ON public.technician_workload_snapshots
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "technician_workload_manage" ON public.technician_workload_snapshots
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)));
CREATE INDEX IF NOT EXISTS idx_tech_workload_lookup ON public.technician_workload_snapshots(team_id, user_id, snapshot_at DESC);

-- 13. support_operations_reports
CREATE TABLE IF NOT EXISTS public.support_operations_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_id uuid,
  requested_by uuid,
  started_at timestamptz,
  finished_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_operations_reports TO authenticated;
GRANT ALL ON public.support_operations_reports TO service_role;
ALTER TABLE public.support_operations_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "support_ops_reports_select" ON public.support_operations_reports
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "support_ops_reports_manage" ON public.support_operations_reports
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)));
CREATE INDEX IF NOT EXISTS idx_support_ops_reports_lookup ON public.support_operations_reports(team_id, status, created_at DESC);
CREATE TRIGGER trg_support_ops_reports_updated BEFORE UPDATE ON public.support_operations_reports
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
