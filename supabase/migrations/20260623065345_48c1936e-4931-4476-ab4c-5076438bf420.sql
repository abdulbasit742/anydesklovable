
CREATE OR REPLACE FUNCTION public.is_command_admin(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id AND role IN ('owner','admin')
  );
$$;

-- 1
CREATE TABLE public.device_agent_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, device_id uuid NOT NULL,
  agent_status text NOT NULL DEFAULT 'unknown', agent_version text, platform text, architecture text,
  capabilities text[] NOT NULL DEFAULT '{}', supported_shells text[] NOT NULL DEFAULT '{}',
  execution_mode text NOT NULL DEFAULT 'worker_required', last_heartbeat_at timestamptz,
  last_capability_report_at timestamptz, trust_level text NOT NULL DEFAULT 'unknown',
  policy_status text NOT NULL DEFAULT 'unknown', metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_agent_profiles TO authenticated;
GRANT ALL ON public.device_agent_profiles TO service_role;
ALTER TABLE public.device_agent_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dap_select" ON public.device_agent_profiles FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "dap_admin" ON public.device_agent_profiles FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 2
CREATE TABLE public.command_script_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, script_key text NOT NULL,
  name text NOT NULL, description text, category text NOT NULL DEFAULT 'diagnostics',
  platform text NOT NULL DEFAULT 'any', shell_type text NOT NULL DEFAULT 'none',
  script_body text, script_hash text, command_template jsonb NOT NULL DEFAULT '{}',
  risk_level text NOT NULL DEFAULT 'medium', status text NOT NULL DEFAULT 'draft',
  requires_approval boolean DEFAULT true, requires_customer_consent boolean DEFAULT false,
  supports_dry_run boolean DEFAULT true, supports_rollback boolean DEFAULT false,
  rollback_script_id uuid, timeout_seconds integer DEFAULT 300, max_parallel_devices integer DEFAULT 10,
  approved_by uuid, approved_at timestamptz, created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.command_script_library TO authenticated;
GRANT ALL ON public.command_script_library TO service_role;
ALTER TABLE public.command_script_library ENABLE ROW LEVEL SECURITY;
CREATE POLICY "csl_select" ON public.command_script_library FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "csl_admin" ON public.command_script_library FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 3
CREATE TABLE public.command_script_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, script_id uuid NOT NULL,
  version_number integer NOT NULL, script_body text, script_hash text,
  command_template jsonb NOT NULL DEFAULT '{}', change_summary text,
  status text NOT NULL DEFAULT 'draft', created_by uuid, approved_by uuid, approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.command_script_versions TO authenticated;
GRANT ALL ON public.command_script_versions TO service_role;
ALTER TABLE public.command_script_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "csv_select" ON public.command_script_versions FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "csv_admin" ON public.command_script_versions FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 4
CREATE TABLE public.command_approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, request_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending', title text NOT NULL, description text,
  risk_level text NOT NULL DEFAULT 'medium', script_id uuid, job_id uuid,
  target_summary jsonb NOT NULL DEFAULT '{}', requested_by uuid, reviewed_by uuid,
  decision_note text, expires_at timestamptz, reviewed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.command_approval_requests TO authenticated;
GRANT ALL ON public.command_approval_requests TO service_role;
ALTER TABLE public.command_approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "car_select" ON public.command_approval_requests FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "car_admin" ON public.command_approval_requests FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 5
CREATE TABLE public.device_command_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_number text,
  title text NOT NULL, description text, job_type text NOT NULL DEFAULT 'diagnostic',
  status text NOT NULL DEFAULT 'draft', risk_level text NOT NULL DEFAULT 'medium',
  script_id uuid, script_version_id uuid, command_source text NOT NULL DEFAULT 'dashboard',
  execution_mode text NOT NULL DEFAULT 'dry_run', target_type text NOT NULL DEFAULT 'manual_devices',
  target_config jsonb NOT NULL DEFAULT '{}', scheduled_for timestamptz,
  started_at timestamptz, completed_at timestamptz, canceled_at timestamptz,
  timeout_seconds integer DEFAULT 300, max_parallel_devices integer DEFAULT 10,
  requires_approval boolean DEFAULT true, approval_request_id uuid,
  support_ticket_id uuid, incident_id uuid, customer_account_id uuid,
  created_by uuid, approved_by uuid, canceled_by uuid, rollback_job_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_command_jobs TO authenticated;
GRANT ALL ON public.device_command_jobs TO service_role;
ALTER TABLE public.device_command_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dcj_select" ON public.device_command_jobs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "dcj_admin" ON public.device_command_jobs FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 6
CREATE TABLE public.device_command_job_targets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_id uuid NOT NULL,
  device_id uuid NOT NULL, customer_account_id uuid, status text NOT NULL DEFAULT 'pending',
  agent_profile_id uuid, dispatch_token_hash text, dispatch_attempts integer DEFAULT 0,
  last_dispatched_at timestamptz, started_at timestamptz, completed_at timestamptz,
  error_code text, error_message text, result_summary text, metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_command_job_targets TO authenticated;
GRANT ALL ON public.device_command_job_targets TO service_role;
ALTER TABLE public.device_command_job_targets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dcjt_select" ON public.device_command_job_targets FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "dcjt_admin" ON public.device_command_job_targets FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 7
CREATE TABLE public.device_command_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_id uuid NOT NULL,
  target_id uuid NOT NULL, device_id uuid NOT NULL, status text NOT NULL,
  exit_code integer, stdout_preview text, stderr_preview text, output_json jsonb NOT NULL DEFAULT '{}',
  artifact_id uuid, storage_path text, checksum_sha256 text,
  reported_by text NOT NULL DEFAULT 'agent', reported_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.device_command_results TO authenticated;
GRANT ALL ON public.device_command_results TO service_role;
ALTER TABLE public.device_command_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dcr_select" ON public.device_command_results FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

-- 8
CREATE TABLE public.device_command_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_id uuid NOT NULL,
  target_id uuid, device_id uuid, log_level text NOT NULL DEFAULT 'info',
  message text NOT NULL, source text NOT NULL DEFAULT 'dashboard',
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.device_command_logs TO authenticated;
GRANT ALL ON public.device_command_logs TO service_role;
ALTER TABLE public.device_command_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dcl_select" ON public.device_command_logs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

-- 9
CREATE TABLE public.device_diagnostic_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, device_id uuid NOT NULL,
  snapshot_type text NOT NULL, status text NOT NULL DEFAULT 'collected', summary text,
  data jsonb NOT NULL DEFAULT '{}', collected_by_job_id uuid,
  collected_at timestamptz NOT NULL DEFAULT now(),
  sensitivity_level text NOT NULL DEFAULT 'internal',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_diagnostic_snapshots TO authenticated;
GRANT ALL ON public.device_diagnostic_snapshots TO service_role;
ALTER TABLE public.device_diagnostic_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dds_select" ON public.device_diagnostic_snapshots FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "dds_admin" ON public.device_diagnostic_snapshots FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 10
CREATE TABLE public.remediation_playbooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, playbook_key text NOT NULL,
  name text NOT NULL, description text, category text NOT NULL DEFAULT 'support',
  status text NOT NULL DEFAULT 'draft', risk_level text NOT NULL DEFAULT 'medium',
  steps jsonb NOT NULL DEFAULT '[]', required_permissions text[] NOT NULL DEFAULT '{}',
  requires_approval boolean DEFAULT true, created_by uuid, approved_by uuid, approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.remediation_playbooks TO authenticated;
GRANT ALL ON public.remediation_playbooks TO service_role;
ALTER TABLE public.remediation_playbooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rp_select" ON public.remediation_playbooks FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "rp_admin" ON public.remediation_playbooks FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 11
CREATE TABLE public.remediation_playbook_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, playbook_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'queued', title text NOT NULL,
  target_config jsonb NOT NULL DEFAULT '{}', support_ticket_id uuid, incident_id uuid,
  started_at timestamptz, completed_at timestamptz, created_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.remediation_playbook_runs TO authenticated;
GRANT ALL ON public.remediation_playbook_runs TO service_role;
ALTER TABLE public.remediation_playbook_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rpr_select" ON public.remediation_playbook_runs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "rpr_admin" ON public.remediation_playbook_runs FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 12
CREATE TABLE public.remediation_playbook_run_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, playbook_run_id uuid NOT NULL,
  step_order integer NOT NULL, step_type text NOT NULL, title text NOT NULL,
  status text NOT NULL DEFAULT 'pending', command_job_id uuid,
  output jsonb NOT NULL DEFAULT '{}', error_message text,
  started_at timestamptz, completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.remediation_playbook_run_steps TO authenticated;
GRANT ALL ON public.remediation_playbook_run_steps TO service_role;
ALTER TABLE public.remediation_playbook_run_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rprs_select" ON public.remediation_playbook_run_steps FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "rprs_admin" ON public.remediation_playbook_run_steps FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 13
CREATE TABLE public.command_policy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, name text NOT NULL,
  description text, rule_type text NOT NULL, status text NOT NULL DEFAULT 'active',
  pattern text, config jsonb NOT NULL DEFAULT '{}',
  enforcement_mode text NOT NULL DEFAULT 'block', severity text NOT NULL DEFAULT 'warning',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.command_policy_rules TO authenticated;
GRANT ALL ON public.command_policy_rules TO service_role;
ALTER TABLE public.command_policy_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cpr_select" ON public.command_policy_rules FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "cpr_admin" ON public.command_policy_rules FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 14
CREATE TABLE public.command_policy_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_id uuid,
  script_id uuid, rule_id uuid, decision text NOT NULL, reason text,
  matched_pattern text, risk_score integer, evaluated_by text NOT NULL DEFAULT 'system',
  metadata jsonb NOT NULL DEFAULT '{}',
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.command_policy_evaluations TO authenticated;
GRANT ALL ON public.command_policy_evaluations TO service_role;
ALTER TABLE public.command_policy_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cpe_select" ON public.command_policy_evaluations FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

-- 15
CREATE TABLE public.command_rollback_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_id uuid,
  script_id uuid, title text NOT NULL, description text,
  rollback_type text NOT NULL DEFAULT 'script', rollback_script_id uuid,
  rollback_steps jsonb NOT NULL DEFAULT '[]', status text NOT NULL DEFAULT 'draft',
  created_by uuid, approved_by uuid, approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.command_rollback_plans TO authenticated;
GRANT ALL ON public.command_rollback_plans TO service_role;
ALTER TABLE public.command_rollback_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crp_select" ON public.command_rollback_plans FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "crp_admin" ON public.command_rollback_plans FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- 16
CREATE TABLE public.device_agent_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, device_id uuid,
  job_id uuid, script_id uuid, playbook_id uuid, event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info', title text NOT NULL, description text,
  actor_id uuid, resource_type text, resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.device_agent_audit_events TO authenticated;
GRANT ALL ON public.device_agent_audit_events TO service_role;
ALTER TABLE public.device_agent_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daae_select" ON public.device_agent_audit_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

-- 17
CREATE TABLE public.device_agent_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued', title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}', output jsonb NOT NULL DEFAULT '{}',
  artifact_id uuid, requested_by uuid, error_message text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_agent_reports TO authenticated;
GRANT ALL ON public.device_agent_reports TO service_role;
ALTER TABLE public.device_agent_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dar_select" ON public.device_agent_reports FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "dar_admin" ON public.device_agent_reports FOR ALL TO authenticated USING (public.is_command_admin(auth.uid(), team_id)) WITH CHECK (public.is_command_admin(auth.uid(), team_id));

-- Triggers
CREATE TRIGGER trg_dap_u BEFORE UPDATE ON public.device_agent_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_csl_u BEFORE UPDATE ON public.command_script_library FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_car_u BEFORE UPDATE ON public.command_approval_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dcj_u BEFORE UPDATE ON public.device_command_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dcjt_u BEFORE UPDATE ON public.device_command_job_targets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rp_u BEFORE UPDATE ON public.remediation_playbooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rpr_u BEFORE UPDATE ON public.remediation_playbook_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_rprs_u BEFORE UPDATE ON public.remediation_playbook_run_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cpr_u BEFORE UPDATE ON public.command_policy_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_crp_u BEFORE UPDATE ON public.command_rollback_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dar_u BEFORE UPDATE ON public.device_agent_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_dap_team_device ON public.device_agent_profiles(team_id, device_id);
CREATE INDEX idx_dap_team_status_hb ON public.device_agent_profiles(team_id, agent_status, last_heartbeat_at DESC);
CREATE INDEX idx_csl_team_status_risk ON public.command_script_library(team_id, status, risk_level);
CREATE INDEX idx_csl_team_key ON public.command_script_library(team_id, script_key);
CREATE INDEX idx_csv_team_script_ver ON public.command_script_versions(team_id, script_id, version_number);
CREATE INDEX idx_car_team_status_created ON public.command_approval_requests(team_id, status, created_at DESC);
CREATE INDEX idx_dcj_team_status_created ON public.device_command_jobs(team_id, status, created_at DESC);
CREATE INDEX idx_dcj_team_ticket ON public.device_command_jobs(team_id, support_ticket_id);
CREATE INDEX idx_dcj_team_incident ON public.device_command_jobs(team_id, incident_id);
CREATE INDEX idx_dcjt_team_job_status ON public.device_command_job_targets(team_id, job_id, status);
CREATE INDEX idx_dcjt_team_device_created ON public.device_command_job_targets(team_id, device_id, created_at DESC);
CREATE INDEX idx_dcr_team_job_created ON public.device_command_results(team_id, job_id, created_at DESC);
CREATE INDEX idx_dcl_team_job_created ON public.device_command_logs(team_id, job_id, created_at DESC);
CREATE INDEX idx_dds_team_device_collected ON public.device_diagnostic_snapshots(team_id, device_id, collected_at DESC);
CREATE INDEX idx_rp_team_status_cat ON public.remediation_playbooks(team_id, status, category);
CREATE INDEX idx_rpr_team_status_created ON public.remediation_playbook_runs(team_id, status, created_at DESC);
CREATE INDEX idx_rprs_team_run_order ON public.remediation_playbook_run_steps(team_id, playbook_run_id, step_order);
CREATE INDEX idx_cpr_team_status_type ON public.command_policy_rules(team_id, status, rule_type);
CREATE INDEX idx_cpe_team_decision_eval ON public.command_policy_evaluations(team_id, decision, evaluated_at DESC);
CREATE INDEX idx_crp_team_status_created ON public.command_rollback_plans(team_id, status, created_at DESC);
CREATE INDEX idx_daae_team_created ON public.device_agent_audit_events(team_id, created_at DESC);
CREATE INDEX idx_dar_team_status_created ON public.device_agent_reports(team_id, status, created_at DESC);
