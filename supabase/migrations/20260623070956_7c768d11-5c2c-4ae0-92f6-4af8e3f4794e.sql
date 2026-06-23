
CREATE OR REPLACE FUNCTION public.is_launch_admin(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role IN ('owner','admin')
  )
$$;

-- 1. launch_projects
CREATE TABLE public.launch_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_key text NOT NULL,
  name text NOT NULL, description text,
  launch_type text NOT NULL DEFAULT 'production_go_live',
  status text NOT NULL DEFAULT 'planning',
  target_launch_at timestamptz, launched_at timestamptz,
  owner_user_id uuid,
  risk_level text NOT NULL DEFAULT 'medium',
  readiness_score integer NOT NULL DEFAULT 0,
  go_live_approved_by uuid, go_live_approved_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, launch_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.launch_projects TO authenticated;
GRANT ALL ON public.launch_projects TO service_role;
ALTER TABLE public.launch_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lp_team_select" ON public.launch_projects FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "lp_admin_write" ON public.launch_projects FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 2. readiness_domains
CREATE TABLE public.readiness_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid,
  domain_key text NOT NULL,
  name text NOT NULL, description text,
  domain_type text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'not_started',
  weight integer NOT NULL DEFAULT 100,
  owner_user_id uuid,
  sort_order integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.readiness_domains TO authenticated;
GRANT ALL ON public.readiness_domains TO service_role;
ALTER TABLE public.readiness_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rd_team_select" ON public.readiness_domains FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "rd_admin_write" ON public.readiness_domains FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 3. readiness_checks
CREATE TABLE public.readiness_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid, domain_id uuid,
  check_key text NOT NULL,
  title text NOT NULL, description text,
  check_type text NOT NULL DEFAULT 'manual',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'not_run',
  required boolean NOT NULL DEFAULT true,
  weight integer NOT NULL DEFAULT 100,
  instructions text, expected_result text, actual_result text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_run_at timestamptz, last_passed_at timestamptz,
  assigned_to uuid, created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.readiness_checks TO authenticated;
GRANT ALL ON public.readiness_checks TO service_role;
ALTER TABLE public.readiness_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rc_team_select" ON public.readiness_checks FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "rc_admin_write" ON public.readiness_checks FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 4. readiness_check_runs
CREATE TABLE public.readiness_check_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  check_id uuid NOT NULL,
  launch_project_id uuid,
  status text NOT NULL,
  run_type text NOT NULL DEFAULT 'manual',
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text, evidence_summary text,
  executed_by uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.readiness_check_runs TO authenticated;
GRANT ALL ON public.readiness_check_runs TO service_role;
ALTER TABLE public.readiness_check_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rcr_team_select" ON public.readiness_check_runs FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "rcr_member_insert" ON public.readiness_check_runs FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id, auth.uid()));

-- 5. launch_blockers
CREATE TABLE public.launch_blockers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid NOT NULL,
  readiness_check_id uuid,
  title text NOT NULL, description text,
  blocker_type text NOT NULL DEFAULT 'bug',
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  owner_user_id uuid, due_at timestamptz,
  resolution_summary text, resolved_by uuid, resolved_at timestamptz,
  accepted_risk_by uuid, accepted_risk_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.launch_blockers TO authenticated;
GRANT ALL ON public.launch_blockers TO service_role;
ALTER TABLE public.launch_blockers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lb_team_select" ON public.launch_blockers FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "lb_admin_write" ON public.launch_blockers FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 6. qa_test_suites
CREATE TABLE public.qa_test_suites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid,
  suite_key text NOT NULL,
  name text NOT NULL, description text,
  suite_type text NOT NULL DEFAULT 'functional',
  status text NOT NULL DEFAULT 'active',
  owner_user_id uuid, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qa_test_suites TO authenticated;
GRANT ALL ON public.qa_test_suites TO service_role;
ALTER TABLE public.qa_test_suites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qts_team_select" ON public.qa_test_suites FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "qts_admin_write" ON public.qa_test_suites FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 7. qa_test_cases
CREATE TABLE public.qa_test_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  suite_id uuid NOT NULL,
  test_key text NOT NULL,
  title text NOT NULL, description text, preconditions text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  expected_result text,
  priority text NOT NULL DEFAULT 'medium',
  automation_status text NOT NULL DEFAULT 'manual',
  status text NOT NULL DEFAULT 'active',
  linked_route text, linked_feature text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qa_test_cases TO authenticated;
GRANT ALL ON public.qa_test_cases TO service_role;
ALTER TABLE public.qa_test_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qtc_team_select" ON public.qa_test_cases FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "qtc_admin_write" ON public.qa_test_cases FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 8. qa_test_runs
CREATE TABLE public.qa_test_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid, suite_id uuid,
  run_name text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  run_type text NOT NULL DEFAULT 'manual',
  started_by uuid, started_at timestamptz, finished_at timestamptz,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qa_test_runs TO authenticated;
GRANT ALL ON public.qa_test_runs TO service_role;
ALTER TABLE public.qa_test_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qtr_team_select" ON public.qa_test_runs FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "qtr_member_write" ON public.qa_test_runs FOR ALL TO authenticated USING (public.is_team_member(team_id, auth.uid())) WITH CHECK (public.is_team_member(team_id, auth.uid()));

-- 9. qa_test_results
CREATE TABLE public.qa_test_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  test_run_id uuid NOT NULL,
  test_case_id uuid NOT NULL,
  status text NOT NULL,
  actual_result text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  failure_reason text,
  executed_by uuid, executed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.qa_test_results TO authenticated;
GRANT ALL ON public.qa_test_results TO service_role;
ALTER TABLE public.qa_test_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "qtres_team_select" ON public.qa_test_results FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "qtres_member_insert" ON public.qa_test_results FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "qtres_member_update" ON public.qa_test_results FOR UPDATE TO authenticated USING (public.is_team_member(team_id, auth.uid())) WITH CHECK (public.is_team_member(team_id, auth.uid()));

-- 10. feature_readiness_map
CREATE TABLE public.feature_readiness_map (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid,
  feature_key text NOT NULL,
  feature_name text NOT NULL,
  module_name text NOT NULL,
  route_path text,
  data_tables text[] NOT NULL DEFAULT '{}'::text[],
  rpc_functions text[] NOT NULL DEFAULT '{}'::text[],
  api_endpoints text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'unknown',
  qa_status text NOT NULL DEFAULT 'not_tested',
  security_status text NOT NULL DEFAULT 'not_reviewed',
  docs_status text NOT NULL DEFAULT 'missing',
  owner_user_id uuid, notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_readiness_map TO authenticated;
GRANT ALL ON public.feature_readiness_map TO service_role;
ALTER TABLE public.feature_readiness_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "frm_team_select" ON public.feature_readiness_map FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "frm_admin_write" ON public.feature_readiness_map FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 11. production_config_checks
CREATE TABLE public.production_config_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid,
  config_key text NOT NULL,
  name text NOT NULL,
  category text NOT NULL DEFAULT 'environment',
  status text NOT NULL DEFAULT 'unknown',
  required boolean NOT NULL DEFAULT true,
  public_safe_value text,
  secret_present boolean NOT NULL DEFAULT false,
  last_checked_at timestamptz,
  remediation text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.production_config_checks TO authenticated;
GRANT ALL ON public.production_config_checks TO service_role;
ALTER TABLE public.production_config_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pcc_team_select" ON public.production_config_checks FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "pcc_admin_write" ON public.production_config_checks FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 12. migration_verification_records
CREATE TABLE public.migration_verification_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid,
  migration_name text,
  verification_type text NOT NULL DEFAULT 'schema',
  status text NOT NULL DEFAULT 'not_checked',
  table_name text, rpc_name text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  checked_by uuid,
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.migration_verification_records TO authenticated;
GRANT ALL ON public.migration_verification_records TO service_role;
ALTER TABLE public.migration_verification_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mvr_team_select" ON public.migration_verification_records FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "mvr_admin_write" ON public.migration_verification_records FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 13. release_notes
CREATE TABLE public.release_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid,
  title text NOT NULL, version text,
  status text NOT NULL DEFAULT 'draft',
  audience text NOT NULL DEFAULT 'internal',
  summary text,
  highlights jsonb NOT NULL DEFAULT '[]'::jsonb,
  breaking_changes jsonb NOT NULL DEFAULT '[]'::jsonb,
  migration_notes jsonb NOT NULL DEFAULT '[]'::jsonb,
  known_issues jsonb NOT NULL DEFAULT '[]'::jsonb,
  upgrade_notes text,
  published_at timestamptz,
  approved_by uuid, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.release_notes TO authenticated;
GRANT ALL ON public.release_notes TO service_role;
ALTER TABLE public.release_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rn_team_select" ON public.release_notes FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "rn_admin_write" ON public.release_notes FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 14. launch_approval_records
CREATE TABLE public.launch_approval_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid NOT NULL,
  approval_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  approver_user_id uuid,
  decision_note text, risk_acceptance text,
  approved_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.launch_approval_records TO authenticated;
GRANT ALL ON public.launch_approval_records TO service_role;
ALTER TABLE public.launch_approval_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lar_team_select" ON public.launch_approval_records FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "lar_admin_write" ON public.launch_approval_records FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- 15. launch_activity_events
CREATE TABLE public.launch_activity_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL, description text,
  actor_id uuid,
  resource_type text, resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.launch_activity_events TO authenticated;
GRANT ALL ON public.launch_activity_events TO service_role;
ALTER TABLE public.launch_activity_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lae_team_select" ON public.launch_activity_events FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "lae_member_insert" ON public.launch_activity_events FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id, auth.uid()));

-- 16. launch_reports
CREATE TABLE public.launch_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  launch_project_id uuid,
  report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_id uuid, requested_by uuid, error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.launch_reports TO authenticated;
GRANT ALL ON public.launch_reports TO service_role;
ALTER TABLE public.launch_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lr_team_select" ON public.launch_reports FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "lr_admin_write" ON public.launch_reports FOR ALL TO authenticated USING (public.is_launch_admin(auth.uid(), team_id)) WITH CHECK (public.is_launch_admin(auth.uid(), team_id));

-- triggers
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'launch_projects','readiness_domains','readiness_checks','launch_blockers',
    'qa_test_suites','qa_test_cases','qa_test_runs','feature_readiness_map',
    'production_config_checks','release_notes','launch_approval_records','launch_reports'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- indexes
CREATE INDEX idx_lp_team_status ON public.launch_projects(team_id, status, target_launch_at);
CREATE INDEX idx_lp_team_key ON public.launch_projects(team_id, launch_key);
CREATE INDEX idx_rd_team_project ON public.readiness_domains(team_id, launch_project_id, sort_order);
CREATE INDEX idx_rc_team_project ON public.readiness_checks(team_id, launch_project_id, status, severity);
CREATE INDEX idx_rcr_team_check ON public.readiness_check_runs(team_id, check_id, created_at DESC);
CREATE INDEX idx_lb_team_project ON public.launch_blockers(team_id, launch_project_id, status, severity);
CREATE INDEX idx_qts_team_project ON public.qa_test_suites(team_id, launch_project_id, status);
CREATE INDEX idx_qtc_team_suite ON public.qa_test_cases(team_id, suite_id, priority);
CREATE INDEX idx_qtr_team_project ON public.qa_test_runs(team_id, launch_project_id, status, created_at DESC);
CREATE INDEX idx_qtres_team_run ON public.qa_test_results(team_id, test_run_id, status);
CREATE INDEX idx_frm_team_module ON public.feature_readiness_map(team_id, launch_project_id, module_name, status);
CREATE INDEX idx_pcc_team_cat ON public.production_config_checks(team_id, launch_project_id, category, status);
CREATE INDEX idx_mvr_team_type ON public.migration_verification_records(team_id, launch_project_id, verification_type, status);
CREATE INDEX idx_rn_team_project ON public.release_notes(team_id, launch_project_id, status);
CREATE INDEX idx_lar_team_project ON public.launch_approval_records(team_id, launch_project_id, approval_type, status);
CREATE INDEX idx_lae_team_project ON public.launch_activity_events(team_id, launch_project_id, created_at DESC);
CREATE INDEX idx_lr_team_project ON public.launch_reports(team_id, launch_project_id, status, created_at DESC);
