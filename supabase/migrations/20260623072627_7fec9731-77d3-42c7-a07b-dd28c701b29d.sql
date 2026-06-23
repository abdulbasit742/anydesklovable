
CREATE OR REPLACE FUNCTION public.is_ai_governance_admin(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role IN ('owner','admin')
  );
$$;

-- 1. ai_provider_configs
CREATE TABLE public.ai_provider_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  provider_key text NOT NULL,
  name text NOT NULL,
  provider_type text NOT NULL,
  status text NOT NULL DEFAULT 'not_configured',
  credential_reference text,
  credential_status text NOT NULL DEFAULT 'not_set',
  data_processing_region_id uuid,
  supports_streaming boolean NOT NULL DEFAULT false,
  supports_tools boolean NOT NULL DEFAULT false,
  supports_embeddings boolean NOT NULL DEFAULT false,
  supports_json_mode boolean NOT NULL DEFAULT false,
  supports_safety_metadata boolean NOT NULL DEFAULT false,
  max_context_tokens integer,
  default_timeout_seconds integer NOT NULL DEFAULT 60,
  last_tested_at timestamptz,
  last_error_message text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, provider_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_provider_configs TO authenticated;
GRANT ALL ON public.ai_provider_configs TO service_role;
ALTER TABLE public.ai_provider_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aipc_select" ON public.ai_provider_configs FOR SELECT TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id));
CREATE POLICY "aipc_manage" ON public.ai_provider_configs FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 2. ai_model_registry
CREATE TABLE public.ai_model_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  provider_config_id uuid REFERENCES public.ai_provider_configs(id) ON DELETE SET NULL,
  model_key text NOT NULL,
  display_name text NOT NULL,
  model_family text,
  model_type text NOT NULL DEFAULT 'chat',
  status text NOT NULL DEFAULT 'active',
  risk_tier text NOT NULL DEFAULT 'medium',
  approved_for_production boolean NOT NULL DEFAULT false,
  approved_for_sensitive_data boolean NOT NULL DEFAULT false,
  approved_for_customer_facing boolean NOT NULL DEFAULT false,
  approved_for_tool_calls boolean NOT NULL DEFAULT false,
  approved_for_autonomous_actions boolean NOT NULL DEFAULT false,
  max_input_tokens integer,
  max_output_tokens integer,
  cost_input_per_1k numeric,
  cost_output_per_1k numeric,
  currency text NOT NULL DEFAULT 'usd',
  data_retention_policy text,
  data_processing_notes text,
  owner_user_id uuid,
  approved_by uuid,
  approved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, model_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_model_registry TO authenticated;
GRANT ALL ON public.ai_model_registry TO service_role;
ALTER TABLE public.ai_model_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aimr_select" ON public.ai_model_registry FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aimr_manage" ON public.ai_model_registry FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 3. ai_prompt_registry
CREATE TABLE public.ai_prompt_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  prompt_key text NOT NULL,
  name text NOT NULL,
  description text,
  prompt_type text NOT NULL DEFAULT 'copilot',
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'team',
  sensitivity_level text NOT NULL DEFAULT 'internal',
  system_prompt text,
  user_prompt_template text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  allowed_model_ids uuid[] NOT NULL DEFAULT '{}',
  allowed_context_types text[] NOT NULL DEFAULT '{}',
  requires_review boolean NOT NULL DEFAULT true,
  requires_redaction boolean NOT NULL DEFAULT true,
  allows_tool_calls boolean NOT NULL DEFAULT false,
  allows_customer_facing_output boolean NOT NULL DEFAULT false,
  risk_level text NOT NULL DEFAULT 'medium',
  owner_user_id uuid,
  reviewed_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, prompt_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompt_registry TO authenticated;
GRANT ALL ON public.ai_prompt_registry TO service_role;
ALTER TABLE public.ai_prompt_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aipr_select" ON public.ai_prompt_registry FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (sensitivity_level NOT IN ('confidential','restricted') OR public.is_ai_governance_admin(auth.uid(), team_id)));
CREATE POLICY "aipr_manage" ON public.ai_prompt_registry FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 4. ai_prompt_versions
CREATE TABLE public.ai_prompt_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  prompt_id uuid NOT NULL REFERENCES public.ai_prompt_registry(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  system_prompt text,
  user_prompt_template text NOT NULL,
  variables jsonb NOT NULL DEFAULT '[]'::jsonb,
  change_summary text,
  status text NOT NULL DEFAULT 'draft',
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (prompt_id, version_number)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompt_versions TO authenticated;
GRANT ALL ON public.ai_prompt_versions TO service_role;
ALTER TABLE public.ai_prompt_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aipv_select" ON public.ai_prompt_versions FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aipv_manage" ON public.ai_prompt_versions FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 5. ai_prompt_reviews
CREATE TABLE public.ai_prompt_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  prompt_id uuid NOT NULL REFERENCES public.ai_prompt_registry(id) ON DELETE CASCADE,
  reviewer_id uuid,
  review_type text NOT NULL DEFAULT 'content',
  status text NOT NULL DEFAULT 'pending',
  comments text,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  reviewed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_prompt_reviews TO authenticated;
GRANT ALL ON public.ai_prompt_reviews TO service_role;
ALTER TABLE public.ai_prompt_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aiprr_select" ON public.ai_prompt_reviews FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aiprr_manage" ON public.ai_prompt_reviews FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 6. ai_policy_rules
CREATE TABLE public.ai_policy_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  rule_key text NOT NULL,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  enforcement_mode text NOT NULL DEFAULT 'block',
  severity text NOT NULL DEFAULT 'medium',
  pattern text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  applies_to_prompt_types text[] NOT NULL DEFAULT '{}',
  applies_to_context_types text[] NOT NULL DEFAULT '{}',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, rule_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_policy_rules TO authenticated;
GRANT ALL ON public.ai_policy_rules TO service_role;
ALTER TABLE public.ai_policy_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aipol_select" ON public.ai_policy_rules FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aipol_manage" ON public.ai_policy_rules FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 7. ai_policy_evaluations
CREATE TABLE public.ai_policy_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  ai_job_id uuid,
  conversation_id uuid,
  message_id uuid,
  prompt_id uuid,
  model_id uuid,
  rule_id uuid,
  decision text NOT NULL,
  reason text,
  matched_pattern text,
  risk_score integer,
  evaluated_context_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_policy_evaluations TO authenticated;
GRANT ALL ON public.ai_policy_evaluations TO service_role;
ALTER TABLE public.ai_policy_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aipoleval_select" ON public.ai_policy_evaluations FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

-- 8. ai_context_policies
CREATE TABLE public.ai_context_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  context_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  allowed boolean NOT NULL DEFAULT true,
  requires_redaction boolean NOT NULL DEFAULT true,
  requires_permission text,
  sensitivity_level text NOT NULL DEFAULT 'internal',
  allowed_model_risk_tiers text[] NOT NULL DEFAULT '{low,medium}',
  max_context_items integer NOT NULL DEFAULT 20,
  retention_days integer,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, context_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_context_policies TO authenticated;
GRANT ALL ON public.ai_context_policies TO service_role;
ALTER TABLE public.ai_context_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aictx_select" ON public.ai_context_policies FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aictx_manage" ON public.ai_context_policies FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 9. ai_safety_findings
CREATE TABLE public.ai_safety_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  ai_job_id uuid,
  conversation_id uuid,
  message_id uuid,
  finding_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  title text NOT NULL,
  description text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_action text,
  detected_by text NOT NULL DEFAULT 'system',
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_safety_findings TO authenticated;
GRANT ALL ON public.ai_safety_findings TO service_role;
ALTER TABLE public.ai_safety_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aisf_select" ON public.ai_safety_findings FOR SELECT TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id));
CREATE POLICY "aisf_manage" ON public.ai_safety_findings FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 10. ai_eval_suites
CREATE TABLE public.ai_eval_suites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  suite_key text NOT NULL,
  name text NOT NULL,
  description text,
  eval_type text NOT NULL DEFAULT 'prompt_quality',
  status text NOT NULL DEFAULT 'active',
  target_prompt_id uuid,
  target_model_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, suite_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_eval_suites TO authenticated;
GRANT ALL ON public.ai_eval_suites TO service_role;
ALTER TABLE public.ai_eval_suites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aies_select" ON public.ai_eval_suites FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aies_manage" ON public.ai_eval_suites FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 11. ai_eval_cases
CREATE TABLE public.ai_eval_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  suite_id uuid NOT NULL REFERENCES public.ai_eval_suites(id) ON DELETE CASCADE,
  case_key text NOT NULL,
  name text NOT NULL,
  input_context jsonb NOT NULL DEFAULT '{}'::jsonb,
  expected_behavior text,
  forbidden_behavior text,
  grading_rubric jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_tags text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (suite_id, case_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_eval_cases TO authenticated;
GRANT ALL ON public.ai_eval_cases TO service_role;
ALTER TABLE public.ai_eval_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aiec_select" ON public.ai_eval_cases FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aiec_manage" ON public.ai_eval_cases FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 12. ai_eval_runs
CREATE TABLE public.ai_eval_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  suite_id uuid NOT NULL REFERENCES public.ai_eval_suites(id) ON DELETE CASCADE,
  run_name text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  prompt_id uuid,
  model_id uuid,
  started_by uuid,
  started_at timestamptz,
  finished_at timestamptz,
  summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_eval_runs TO authenticated;
GRANT ALL ON public.ai_eval_runs TO service_role;
ALTER TABLE public.ai_eval_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aier_select" ON public.ai_eval_runs FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aier_manage" ON public.ai_eval_runs FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 13. ai_eval_results
CREATE TABLE public.ai_eval_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  eval_run_id uuid NOT NULL REFERENCES public.ai_eval_runs(id) ON DELETE CASCADE,
  eval_case_id uuid NOT NULL REFERENCES public.ai_eval_cases(id) ON DELETE CASCADE,
  status text NOT NULL,
  score integer,
  output_preview text,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  grader text NOT NULL DEFAULT 'manual',
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_eval_results TO authenticated;
GRANT ALL ON public.ai_eval_results TO service_role;
ALTER TABLE public.ai_eval_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aierr_select" ON public.ai_eval_results FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aierr_manage" ON public.ai_eval_results FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 14. ai_usage_records
CREATE TABLE public.ai_usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  provider_config_id uuid,
  model_id uuid,
  ai_job_id uuid,
  conversation_id uuid,
  prompt_id uuid,
  context_type text,
  input_tokens integer,
  output_tokens integer,
  total_tokens integer,
  estimated_cost_cents numeric,
  currency text NOT NULL DEFAULT 'usd',
  latency_ms integer,
  status text NOT NULL DEFAULT 'success',
  source text NOT NULL DEFAULT 'copilot',
  recorded_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ai_usage_records TO authenticated;
GRANT ALL ON public.ai_usage_records TO service_role;
ALTER TABLE public.ai_usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aiur_select" ON public.ai_usage_records FOR SELECT TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id));

-- 15. ai_cost_budgets
CREATE TABLE public.ai_cost_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  budget_key text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  scope_type text NOT NULL DEFAULT 'team',
  scope_id uuid,
  period text NOT NULL DEFAULT 'monthly',
  limit_cents integer NOT NULL DEFAULT 0,
  warning_threshold_percent integer NOT NULL DEFAULT 80,
  hard_limit_enabled boolean NOT NULL DEFAULT false,
  current_estimated_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, budget_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_cost_budgets TO authenticated;
GRANT ALL ON public.ai_cost_budgets TO service_role;
ALTER TABLE public.ai_cost_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aicb_select" ON public.ai_cost_budgets FOR SELECT TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id));
CREATE POLICY "aicb_manage" ON public.ai_cost_budgets FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 16. ai_action_guardrails
CREATE TABLE public.ai_action_guardrails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  action_type text NOT NULL,
  action_category text NOT NULL DEFAULT 'workflow',
  status text NOT NULL DEFAULT 'active',
  allowed boolean NOT NULL DEFAULT false,
  requires_human_approval boolean NOT NULL DEFAULT true,
  max_risk_level text NOT NULL DEFAULT 'low',
  allowed_roles text[] NOT NULL DEFAULT '{}',
  blocked_resource_types text[] NOT NULL DEFAULT '{}',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, action_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_action_guardrails TO authenticated;
GRANT ALL ON public.ai_action_guardrails TO service_role;
ALTER TABLE public.ai_action_guardrails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aiag_select" ON public.ai_action_guardrails FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aiag_manage" ON public.ai_action_guardrails FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- 17. ai_governance_audit_events
CREATE TABLE public.ai_governance_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
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
GRANT SELECT, INSERT ON public.ai_governance_audit_events TO authenticated;
GRANT ALL ON public.ai_governance_audit_events TO service_role;
ALTER TABLE public.ai_governance_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aigae_select" ON public.ai_governance_audit_events FOR SELECT TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id));

-- 18. ai_governance_reports
CREATE TABLE public.ai_governance_reports (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_governance_reports TO authenticated;
GRANT ALL ON public.ai_governance_reports TO service_role;
ALTER TABLE public.ai_governance_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aigr_select" ON public.ai_governance_reports FOR SELECT TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id));
CREATE POLICY "aigr_manage" ON public.ai_governance_reports FOR ALL TO authenticated
  USING (public.is_ai_governance_admin(auth.uid(), team_id)) WITH CHECK (public.is_ai_governance_admin(auth.uid(), team_id));

-- updated_at triggers
CREATE TRIGGER trg_aipc_uat BEFORE UPDATE ON public.ai_provider_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aimr_uat BEFORE UPDATE ON public.ai_model_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aipr_uat BEFORE UPDATE ON public.ai_prompt_registry FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aiprr_uat BEFORE UPDATE ON public.ai_prompt_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aipol_uat BEFORE UPDATE ON public.ai_policy_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aictx_uat BEFORE UPDATE ON public.ai_context_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aisf_uat BEFORE UPDATE ON public.ai_safety_findings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aies_uat BEFORE UPDATE ON public.ai_eval_suites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aier_uat BEFORE UPDATE ON public.ai_eval_runs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aicb_uat BEFORE UPDATE ON public.ai_cost_budgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aiag_uat BEFORE UPDATE ON public.ai_action_guardrails FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_aigr_uat BEFORE UPDATE ON public.ai_governance_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_aipc_team ON public.ai_provider_configs(team_id, status);
CREATE INDEX idx_aimr_team ON public.ai_model_registry(team_id, status);
CREATE INDEX idx_aimr_risk ON public.ai_model_registry(team_id, risk_tier, approved_for_production);
CREATE INDEX idx_aipr_team ON public.ai_prompt_registry(team_id, status);
CREATE INDEX idx_aipr_type ON public.ai_prompt_registry(team_id, prompt_type, risk_level);
CREATE INDEX idx_aipv_prompt ON public.ai_prompt_versions(team_id, prompt_id, version_number);
CREATE INDEX idx_aiprr_prompt ON public.ai_prompt_reviews(team_id, prompt_id, status);
CREATE INDEX idx_aipol_team ON public.ai_policy_rules(team_id, status);
CREATE INDEX idx_aipoleval_team ON public.ai_policy_evaluations(team_id, decision, evaluated_at DESC);
CREATE INDEX idx_aictx_team ON public.ai_context_policies(team_id, context_type, status);
CREATE INDEX idx_aisf_team ON public.ai_safety_findings(team_id, status, severity, created_at DESC);
CREATE INDEX idx_aies_team ON public.ai_eval_suites(team_id, status);
CREATE INDEX idx_aiec_suite ON public.ai_eval_cases(team_id, suite_id, status);
CREATE INDEX idx_aier_team ON public.ai_eval_runs(team_id, status, created_at DESC);
CREATE INDEX idx_aierr_run ON public.ai_eval_results(team_id, eval_run_id, status);
CREATE INDEX idx_aiur_team ON public.ai_usage_records(team_id, recorded_at DESC);
CREATE INDEX idx_aiur_model ON public.ai_usage_records(team_id, model_id, recorded_at DESC);
CREATE INDEX idx_aicb_team ON public.ai_cost_budgets(team_id, status, scope_type);
CREATE INDEX idx_aiag_team ON public.ai_action_guardrails(team_id, action_type, status);
CREATE INDEX idx_aigae_team ON public.ai_governance_audit_events(team_id, created_at DESC);
CREATE INDEX idx_aigr_team ON public.ai_governance_reports(team_id, status, created_at DESC);
