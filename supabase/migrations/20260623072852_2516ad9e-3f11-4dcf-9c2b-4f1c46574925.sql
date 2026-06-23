
-- ============================================================
-- Task #34: Workflow Studio / No-Code App Builder
-- ============================================================

-- Helper: workflow admin (owner/admin of team)
CREATE OR REPLACE FUNCTION public.is_workflow_admin(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = _team_id
      AND tm.user_id = _user_id
      AND tm.role IN ('owner','admin')
  );
$$;

-- 1. workflow_apps
CREATE TABLE public.workflow_apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_key text NOT NULL,
  name text NOT NULL,
  description text,
  app_type text NOT NULL DEFAULT 'internal_tool',
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'team',
  icon text,
  theme jsonb NOT NULL DEFAULT '{}'::jsonb,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  home_page_id uuid,
  owner_user_id uuid,
  published_by uuid,
  published_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, app_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_apps TO authenticated;
GRANT ALL ON public.workflow_apps TO service_role;
ALTER TABLE public.workflow_apps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team can view workflow apps" ON public.workflow_apps FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage workflow apps" ON public.workflow_apps FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 2. workflow_app_pages
CREATE TABLE public.workflow_app_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid NOT NULL REFERENCES public.workflow_apps(id) ON DELETE CASCADE,
  page_key text NOT NULL,
  name text NOT NULL,
  description text,
  page_type text NOT NULL DEFAULT 'form',
  route_slug text,
  sort_order integer NOT NULL DEFAULT 100,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (app_id, page_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_app_pages TO authenticated;
GRANT ALL ON public.workflow_app_pages TO service_role;
ALTER TABLE public.workflow_app_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views pages" ON public.workflow_app_pages FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage pages" ON public.workflow_app_pages FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 3. workflow_components
CREATE TABLE public.workflow_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid NOT NULL REFERENCES public.workflow_apps(id) ON DELETE CASCADE,
  page_id uuid NOT NULL REFERENCES public.workflow_app_pages(id) ON DELETE CASCADE,
  component_key text NOT NULL,
  component_type text NOT NULL,
  title text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  data_binding_id uuid,
  action_id uuid,
  sort_order integer NOT NULL DEFAULT 100,
  visibility_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (page_id, component_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_components TO authenticated;
GRANT ALL ON public.workflow_components TO service_role;
ALTER TABLE public.workflow_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views components" ON public.workflow_components FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage components" ON public.workflow_components FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 4. workflow_data_bindings
CREATE TABLE public.workflow_data_bindings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid REFERENCES public.workflow_apps(id) ON DELETE CASCADE,
  binding_key text NOT NULL,
  name text NOT NULL,
  description text,
  source_type text NOT NULL DEFAULT 'remote_desk_resource',
  resource_type text,
  allowed_operations text[] NOT NULL DEFAULT ARRAY['read']::text[],
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  sensitivity_level text NOT NULL DEFAULT 'internal',
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_data_bindings TO authenticated;
GRANT ALL ON public.workflow_data_bindings TO service_role;
ALTER TABLE public.workflow_data_bindings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views bindings" ON public.workflow_data_bindings FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()) AND (sensitivity_level <> 'restricted' OR public.is_workflow_admin(auth.uid(), team_id)));
CREATE POLICY "admins manage bindings" ON public.workflow_data_bindings FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 5. workflow_form_definitions
CREATE TABLE public.workflow_form_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid REFERENCES public.workflow_apps(id) ON DELETE CASCADE,
  page_id uuid REFERENCES public.workflow_app_pages(id) ON DELETE SET NULL,
  form_key text NOT NULL,
  name text NOT NULL,
  description text,
  form_type text NOT NULL DEFAULT 'request',
  status text NOT NULL DEFAULT 'draft',
  schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  validation_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  submission_target_type text NOT NULL DEFAULT 'workflow_run',
  submission_target_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  requires_auth boolean NOT NULL DEFAULT true,
  allow_customer_submit boolean NOT NULL DEFAULT false,
  allow_partner_submit boolean NOT NULL DEFAULT false,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_form_definitions TO authenticated;
GRANT ALL ON public.workflow_form_definitions TO service_role;
ALTER TABLE public.workflow_form_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views forms" ON public.workflow_form_definitions FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage forms" ON public.workflow_form_definitions FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 6. workflow_form_submissions
CREATE TABLE public.workflow_form_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  form_id uuid NOT NULL REFERENCES public.workflow_form_definitions(id) ON DELETE CASCADE,
  app_id uuid,
  page_id uuid,
  submitter_user_id uuid,
  submitter_customer_user_id uuid,
  submitter_partner_member_id uuid,
  status text NOT NULL DEFAULT 'submitted',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  validation_result jsonb NOT NULL DEFAULT '{}'::jsonb,
  linked_resource_type text,
  linked_resource_id uuid,
  workflow_run_id uuid,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_form_submissions TO authenticated;
GRANT ALL ON public.workflow_form_submissions TO service_role;
ALTER TABLE public.workflow_form_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team or submitter views submissions" ON public.workflow_form_submissions FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()) OR submitter_user_id = auth.uid());
CREATE POLICY "team members submit forms" ON public.workflow_form_submissions FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins update submissions" ON public.workflow_form_submissions FOR UPDATE TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 7. workflow_state_machines
CREATE TABLE public.workflow_state_machines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid REFERENCES public.workflow_apps(id) ON DELETE CASCADE,
  machine_key text NOT NULL,
  name text NOT NULL,
  description text,
  resource_type text,
  states jsonb NOT NULL DEFAULT '[]'::jsonb,
  transitions jsonb NOT NULL DEFAULT '[]'::jsonb,
  initial_state text,
  terminal_states text[] NOT NULL DEFAULT ARRAY[]::text[],
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_state_machines TO authenticated;
GRANT ALL ON public.workflow_state_machines TO service_role;
ALTER TABLE public.workflow_state_machines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views machines" ON public.workflow_state_machines FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage machines" ON public.workflow_state_machines FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 8. workflow_actions
CREATE TABLE public.workflow_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid REFERENCES public.workflow_apps(id) ON DELETE CASCADE,
  action_key text NOT NULL,
  name text NOT NULL,
  description text,
  action_type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  risk_level text NOT NULL DEFAULT 'medium',
  requires_approval boolean NOT NULL DEFAULT false,
  approval_type text,
  input_schema jsonb NOT NULL DEFAULT '[]'::jsonb,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  allowed_roles text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_actions TO authenticated;
GRANT ALL ON public.workflow_actions TO service_role;
ALTER TABLE public.workflow_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views actions" ON public.workflow_actions FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage actions" ON public.workflow_actions FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 9. workflow_action_runs
CREATE TABLE public.workflow_action_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  action_id uuid NOT NULL REFERENCES public.workflow_actions(id) ON DELETE CASCADE,
  app_id uuid,
  page_id uuid,
  form_submission_id uuid,
  workflow_run_id uuid,
  status text NOT NULL DEFAULT 'queued',
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  triggered_by uuid,
  triggered_source text NOT NULL DEFAULT 'dashboard',
  approval_request_id uuid,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_action_runs TO authenticated;
GRANT ALL ON public.workflow_action_runs TO service_role;
ALTER TABLE public.workflow_action_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views action runs" ON public.workflow_action_runs FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage action runs" ON public.workflow_action_runs FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 10. workflow_runs
CREATE TABLE public.workflow_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid REFERENCES public.workflow_apps(id) ON DELETE SET NULL,
  machine_id uuid REFERENCES public.workflow_state_machines(id) ON DELETE SET NULL,
  run_key text,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'running',
  current_state text,
  resource_type text,
  resource_id uuid,
  initiated_by uuid,
  customer_account_id uuid,
  partner_client_team_id uuid,
  priority text NOT NULL DEFAULT 'normal',
  due_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_runs TO authenticated;
GRANT ALL ON public.workflow_runs TO service_role;
ALTER TABLE public.workflow_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views runs" ON public.workflow_runs FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "team members create runs" ON public.workflow_runs FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins update runs" ON public.workflow_runs FOR UPDATE TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 11. workflow_run_steps
CREATE TABLE public.workflow_run_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  workflow_run_id uuid NOT NULL REFERENCES public.workflow_runs(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  title text NOT NULL,
  step_type text NOT NULL DEFAULT 'task',
  status text NOT NULL DEFAULT 'pending',
  assigned_to uuid,
  action_run_id uuid,
  due_at timestamptz,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_run_steps TO authenticated;
GRANT ALL ON public.workflow_run_steps TO service_role;
ALTER TABLE public.workflow_run_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views run steps" ON public.workflow_run_steps FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage run steps" ON public.workflow_run_steps FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 12. workflow_app_permissions
CREATE TABLE public.workflow_app_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid NOT NULL REFERENCES public.workflow_apps(id) ON DELETE CASCADE,
  principal_type text NOT NULL DEFAULT 'role',
  principal_id uuid,
  role_name text,
  permission text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_app_permissions TO authenticated;
GRANT ALL ON public.workflow_app_permissions TO service_role;
ALTER TABLE public.workflow_app_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views app perms" ON public.workflow_app_permissions FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage app perms" ON public.workflow_app_permissions FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 13. workflow_templates
CREATE TABLE public.workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid,
  template_key text NOT NULL,
  name text NOT NULL,
  description text,
  template_type text NOT NULL DEFAULT 'app',
  category text NOT NULL DEFAULT 'operations',
  status text NOT NULL DEFAULT 'active',
  template_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_templates TO authenticated;
GRANT ALL ON public.workflow_templates TO service_role;
ALTER TABLE public.workflow_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view templates" ON public.workflow_templates FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage templates" ON public.workflow_templates FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_workflow_admin(auth.uid(), team_id));

-- 14. workflow_published_routes
CREATE TABLE public.workflow_published_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid NOT NULL REFERENCES public.workflow_apps(id) ON DELETE CASCADE,
  route_slug text NOT NULL,
  route_type text NOT NULL DEFAULT 'dashboard_internal',
  status text NOT NULL DEFAULT 'active',
  requires_auth boolean NOT NULL DEFAULT true,
  allowed_visibility text NOT NULL DEFAULT 'team',
  published_by uuid,
  published_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, route_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_published_routes TO authenticated;
GRANT ALL ON public.workflow_published_routes TO service_role;
ALTER TABLE public.workflow_published_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views routes" ON public.workflow_published_routes FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage routes" ON public.workflow_published_routes FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- 15. workflow_audit_events
CREATE TABLE public.workflow_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  app_id uuid,
  workflow_run_id uuid,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text,
  actor_id uuid,
  resource_type text,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.workflow_audit_events TO authenticated;
GRANT ALL ON public.workflow_audit_events TO service_role;
ALTER TABLE public.workflow_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views audit" ON public.workflow_audit_events FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

-- 16. workflow_reports
CREATE TABLE public.workflow_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_id uuid,
  requested_by uuid,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workflow_reports TO authenticated;
GRANT ALL ON public.workflow_reports TO service_role;
ALTER TABLE public.workflow_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views reports" ON public.workflow_reports FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage reports" ON public.workflow_reports FOR ALL TO authenticated
  USING (public.is_workflow_admin(auth.uid(), team_id))
  WITH CHECK (public.is_workflow_admin(auth.uid(), team_id));

-- updated_at triggers
CREATE TRIGGER trg_workflow_apps_updated BEFORE UPDATE ON public.workflow_apps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_app_pages_updated BEFORE UPDATE ON public.workflow_app_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_components_updated BEFORE UPDATE ON public.workflow_components FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_data_bindings_updated BEFORE UPDATE ON public.workflow_data_bindings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_form_definitions_updated BEFORE UPDATE ON public.workflow_form_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_form_submissions_updated BEFORE UPDATE ON public.workflow_form_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_state_machines_updated BEFORE UPDATE ON public.workflow_state_machines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_actions_updated BEFORE UPDATE ON public.workflow_actions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_action_runs_updated BEFORE UPDATE ON public.workflow_action_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_runs_updated BEFORE UPDATE ON public.workflow_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_run_steps_updated BEFORE UPDATE ON public.workflow_run_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_app_permissions_updated BEFORE UPDATE ON public.workflow_app_permissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_templates_updated BEFORE UPDATE ON public.workflow_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_published_routes_updated BEFORE UPDATE ON public.workflow_published_routes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_workflow_reports_updated BEFORE UPDATE ON public.workflow_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_workflow_apps_team_status ON public.workflow_apps(team_id, status);
CREATE INDEX idx_workflow_apps_team_type_vis ON public.workflow_apps(team_id, app_type, visibility);
CREATE INDEX idx_workflow_app_pages_app_sort ON public.workflow_app_pages(team_id, app_id, sort_order);
CREATE INDEX idx_workflow_components_page_sort ON public.workflow_components(team_id, page_id, sort_order);
CREATE INDEX idx_workflow_data_bindings_app ON public.workflow_data_bindings(team_id, app_id, status);
CREATE INDEX idx_workflow_form_definitions_app ON public.workflow_form_definitions(team_id, app_id, status);
CREATE INDEX idx_workflow_form_submissions_form ON public.workflow_form_submissions(team_id, form_id, status, submitted_at DESC);
CREATE INDEX idx_workflow_state_machines_app ON public.workflow_state_machines(team_id, app_id, status);
CREATE INDEX idx_workflow_actions_app ON public.workflow_actions(team_id, app_id, status, risk_level);
CREATE INDEX idx_workflow_action_runs_action ON public.workflow_action_runs(team_id, action_id, status, created_at DESC);
CREATE INDEX idx_workflow_runs_app ON public.workflow_runs(team_id, app_id, status, created_at DESC);
CREATE INDEX idx_workflow_run_steps_run ON public.workflow_run_steps(team_id, workflow_run_id, status);
CREATE INDEX idx_workflow_app_permissions_app ON public.workflow_app_permissions(team_id, app_id, principal_type, status);
CREATE INDEX idx_workflow_templates_key ON public.workflow_templates(template_key, status);
CREATE INDEX idx_workflow_published_routes_slug ON public.workflow_published_routes(team_id, route_slug, status);
CREATE INDEX idx_workflow_audit_events_team ON public.workflow_audit_events(team_id, created_at DESC);
CREATE INDEX idx_workflow_reports_team ON public.workflow_reports(team_id, status, created_at DESC);
