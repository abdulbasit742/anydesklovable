
CREATE OR REPLACE FUNCTION public.is_customer_success_manager(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = _user_id AND tm.team_id = _team_id
      AND tm.role IN ('owner','admin')
  );
$$;

CREATE TABLE public.product_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL, actor_user_id uuid, customer_account_id uuid, customer_user_id uuid,
  partner_id uuid, session_id uuid, event_name text NOT NULL,
  event_category text NOT NULL DEFAULT 'product', resource_type text, resource_id uuid,
  route_path text, source text NOT NULL DEFAULT 'dashboard',
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.product_events TO authenticated;
GRANT ALL ON public.product_events TO service_role;
ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view product events" ON public.product_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "insert product events" ON public.product_events FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_pe_team_name_at ON public.product_events(team_id, event_name, occurred_at DESC);
CREATE INDEX idx_pe_team_cust_at ON public.product_events(team_id, customer_account_id, occurred_at DESC);
CREATE INDEX idx_pe_team_actor_at ON public.product_events(team_id, actor_user_id, occurred_at DESC);

CREATE TABLE public.product_event_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid, event_name text NOT NULL,
  display_name text NOT NULL, description text, event_category text NOT NULL DEFAULT 'product',
  lifecycle_stage text, is_key_event boolean NOT NULL DEFAULT false,
  is_conversion_event boolean NOT NULL DEFAULT false, is_revenue_event boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_event_definitions TO authenticated;
GRANT ALL ON public.product_event_definitions TO service_role;
ALTER TABLE public.product_event_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view event defs" ON public.product_event_definitions FOR SELECT TO authenticated USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage event defs" ON public.product_event_definitions FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_customer_success_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_ped_team_name ON public.product_event_definitions(team_id, event_name);

CREATE TABLE public.growth_funnels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, funnel_key text NOT NULL,
  name text NOT NULL, description text, funnel_type text NOT NULL DEFAULT 'activation',
  status text NOT NULL DEFAULT 'active', owner_user_id uuid,
  conversion_window_days integer NOT NULL DEFAULT 30, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.growth_funnels TO authenticated;
GRANT ALL ON public.growth_funnels TO service_role;
ALTER TABLE public.growth_funnels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view funnels" ON public.growth_funnels FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage funnels" ON public.growth_funnels FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_gf_team_key_status ON public.growth_funnels(team_id, funnel_key, status);

CREATE TABLE public.growth_funnel_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  funnel_id uuid NOT NULL REFERENCES public.growth_funnels(id) ON DELETE CASCADE,
  step_order integer NOT NULL, step_key text NOT NULL, name text NOT NULL,
  event_name text NOT NULL, required boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.growth_funnel_steps TO authenticated;
GRANT ALL ON public.growth_funnel_steps TO service_role;
ALTER TABLE public.growth_funnel_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view funnel steps" ON public.growth_funnel_steps FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage funnel steps" ON public.growth_funnel_steps FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_gfs_team_funnel_order ON public.growth_funnel_steps(team_id, funnel_id, step_order);

CREATE TABLE public.growth_funnel_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  funnel_id uuid NOT NULL REFERENCES public.growth_funnels(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL, period_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'success', total_entered integer NOT NULL DEFAULT 0,
  total_converted integer NOT NULL DEFAULT 0, conversion_rate numeric,
  step_counts jsonb NOT NULL DEFAULT '{}'::jsonb, dropoff_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.growth_funnel_runs TO authenticated;
GRANT ALL ON public.growth_funnel_runs TO service_role;
ALTER TABLE public.growth_funnel_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view funnel runs" ON public.growth_funnel_runs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "insert funnel runs" ON public.growth_funnel_runs FOR INSERT TO authenticated WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_gfr_team_funnel_period ON public.growth_funnel_runs(team_id, funnel_id, period_start, period_end);

CREATE TABLE public.customer_health_models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, model_key text NOT NULL,
  name text NOT NULL, description text, status text NOT NULL DEFAULT 'active',
  scoring_rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  weight_usage integer NOT NULL DEFAULT 30, weight_support integer NOT NULL DEFAULT 20,
  weight_billing integer NOT NULL DEFAULT 20, weight_engagement integer NOT NULL DEFAULT 20,
  weight_security integer NOT NULL DEFAULT 10, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_health_models TO authenticated;
GRANT ALL ON public.customer_health_models TO service_role;
ALTER TABLE public.customer_health_models ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view health models" ON public.customer_health_models FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage health models" ON public.customer_health_models FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));

CREATE TABLE public.customer_health_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  customer_account_id uuid, partner_client_team_id uuid,
  model_id uuid REFERENCES public.customer_health_models(id) ON DELETE SET NULL,
  score integer NOT NULL DEFAULT 0, health_status text NOT NULL DEFAULT 'unknown',
  usage_score integer NOT NULL DEFAULT 0, support_score integer NOT NULL DEFAULT 0,
  billing_score integer NOT NULL DEFAULT 0, engagement_score integer NOT NULL DEFAULT 0,
  security_score integer NOT NULL DEFAULT 0,
  reasons jsonb NOT NULL DEFAULT '[]'::jsonb, recommendations jsonb NOT NULL DEFAULT '[]'::jsonb,
  calculated_from text NOT NULL DEFAULT 'available_data',
  calculated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.customer_health_scores TO authenticated;
GRANT ALL ON public.customer_health_scores TO service_role;
ALTER TABLE public.customer_health_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view health scores" ON public.customer_health_scores FOR SELECT TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id));
CREATE POLICY "insert health scores" ON public.customer_health_scores FOR INSERT TO authenticated WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_chs_team_cust_at ON public.customer_health_scores(team_id, customer_account_id, calculated_at DESC);
CREATE INDEX idx_chs_team_status_at ON public.customer_health_scores(team_id, health_status, calculated_at DESC);

CREATE TABLE public.customer_lifecycle_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, stage_key text NOT NULL,
  name text NOT NULL, description text, stage_order integer NOT NULL DEFAULT 100,
  stage_type text NOT NULL DEFAULT 'customer',
  entry_criteria jsonb NOT NULL DEFAULT '{}'::jsonb, exit_criteria jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_lifecycle_stages TO authenticated;
GRANT ALL ON public.customer_lifecycle_stages TO service_role;
ALTER TABLE public.customer_lifecycle_stages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view lifecycle stages" ON public.customer_lifecycle_stages FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage lifecycle stages" ON public.customer_lifecycle_stages FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));

CREATE TABLE public.customer_lifecycle_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  customer_account_id uuid, team_customer_id uuid,
  current_stage_id uuid REFERENCES public.customer_lifecycle_stages(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active', entered_stage_at timestamptz, previous_stage_id uuid,
  owner_user_id uuid, lifecycle_notes text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_lifecycle_records TO authenticated;
GRANT ALL ON public.customer_lifecycle_records TO service_role;
ALTER TABLE public.customer_lifecycle_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view lifecycle records" ON public.customer_lifecycle_records FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage lifecycle records" ON public.customer_lifecycle_records FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_clr_team_cust_status ON public.customer_lifecycle_records(team_id, customer_account_id, status);

CREATE TABLE public.success_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  customer_account_id uuid, partner_client_team_id uuid, title text NOT NULL, description text,
  status text NOT NULL DEFAULT 'active', plan_type text NOT NULL DEFAULT 'onboarding',
  owner_user_id uuid, executive_sponsor text, target_outcome text, target_date date,
  health_score_at_start integer, created_by uuid, completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.success_plans TO authenticated;
GRANT ALL ON public.success_plans TO service_role;
ALTER TABLE public.success_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view success plans" ON public.success_plans FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage success plans" ON public.success_plans FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_sp_team_cust_status ON public.success_plans(team_id, customer_account_id, status);

CREATE TABLE public.success_plan_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  success_plan_id uuid NOT NULL REFERENCES public.success_plans(id) ON DELETE CASCADE,
  title text NOT NULL, description text, status text NOT NULL DEFAULT 'open',
  task_type text NOT NULL DEFAULT 'task', assigned_to uuid, due_at timestamptz,
  completed_by uuid, completed_at timestamptz, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.success_plan_tasks TO authenticated;
GRANT ALL ON public.success_plan_tasks TO service_role;
ALTER TABLE public.success_plan_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view sp tasks" ON public.success_plan_tasks FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage sp tasks" ON public.success_plan_tasks FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_spt_team_plan_status_due ON public.success_plan_tasks(team_id, success_plan_id, status, due_at);

CREATE TABLE public.customer_touchpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  customer_account_id uuid, customer_user_id uuid, partner_client_team_id uuid,
  touchpoint_type text NOT NULL DEFAULT 'note', title text NOT NULL, summary text,
  sentiment text NOT NULL DEFAULT 'neutral', outcome text, next_steps text,
  occurred_at timestamptz NOT NULL DEFAULT now(), owner_user_id uuid, created_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_touchpoints TO authenticated;
GRANT ALL ON public.customer_touchpoints TO service_role;
ALTER TABLE public.customer_touchpoints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view touchpoints" ON public.customer_touchpoints FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage touchpoints" ON public.customer_touchpoints FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_tp_team_cust_at ON public.customer_touchpoints(team_id, customer_account_id, occurred_at DESC);

CREATE TABLE public.qbr_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  customer_account_id uuid, partner_client_team_id uuid, title text NOT NULL,
  status text NOT NULL DEFAULT 'planned', scheduled_at timestamptz, completed_at timestamptz,
  owner_user_id uuid, agenda jsonb NOT NULL DEFAULT '[]'::jsonb,
  metrics_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb, risks jsonb NOT NULL DEFAULT '[]'::jsonb,
  opportunities jsonb NOT NULL DEFAULT '[]'::jsonb, action_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.qbr_records TO authenticated;
GRANT ALL ON public.qbr_records TO service_role;
ALTER TABLE public.qbr_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view qbrs" ON public.qbr_records FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage qbrs" ON public.qbr_records FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_qbr_team_cust_sched ON public.qbr_records(team_id, customer_account_id, scheduled_at);

CREATE TABLE public.customer_surveys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, survey_key text NOT NULL,
  name text NOT NULL, survey_type text NOT NULL DEFAULT 'nps',
  status text NOT NULL DEFAULT 'active', questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  trigger_event_name text, target_audience text NOT NULL DEFAULT 'customer_users',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_surveys TO authenticated;
GRANT ALL ON public.customer_surveys TO service_role;
ALTER TABLE public.customer_surveys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view surveys" ON public.customer_surveys FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage surveys" ON public.customer_surveys FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_surv_team_key_status ON public.customer_surveys(team_id, survey_key, status);

CREATE TABLE public.customer_survey_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  survey_id uuid NOT NULL REFERENCES public.customer_surveys(id) ON DELETE CASCADE,
  customer_account_id uuid, customer_user_id uuid, user_id uuid, partner_member_id uuid,
  score integer, rating_label text, answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  comment text, sentiment text NOT NULL DEFAULT 'unknown',
  source text NOT NULL DEFAULT 'customer_portal',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.customer_survey_responses TO authenticated;
GRANT ALL ON public.customer_survey_responses TO service_role;
ALTER TABLE public.customer_survey_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view survey responses" ON public.customer_survey_responses FOR SELECT TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id));
CREATE POLICY "insert survey responses" ON public.customer_survey_responses FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_sr_team_surv_at ON public.customer_survey_responses(team_id, survey_id, submitted_at DESC);

CREATE TABLE public.growth_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  experiment_key text NOT NULL, name text NOT NULL, description text,
  experiment_type text NOT NULL DEFAULT 'onboarding', status text NOT NULL DEFAULT 'draft',
  hypothesis text, target_metric text, start_at timestamptz, end_at timestamptz,
  owner_user_id uuid, config jsonb NOT NULL DEFAULT '{}'::jsonb,
  result_summary jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.growth_experiments TO authenticated;
GRANT ALL ON public.growth_experiments TO service_role;
ALTER TABLE public.growth_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view experiments" ON public.growth_experiments FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage experiments" ON public.growth_experiments FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_ge_team_key_status ON public.growth_experiments(team_id, experiment_key, status);

CREATE TABLE public.growth_experiment_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  experiment_id uuid NOT NULL REFERENCES public.growth_experiments(id) ON DELETE CASCADE,
  variant_key text NOT NULL, user_id uuid, customer_account_id uuid, customer_user_id uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.growth_experiment_assignments TO authenticated;
GRANT ALL ON public.growth_experiment_assignments TO service_role;
ALTER TABLE public.growth_experiment_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view exp assignments" ON public.growth_experiment_assignments FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "insert exp assignments" ON public.growth_experiment_assignments FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.expansion_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  customer_account_id uuid, partner_client_team_id uuid,
  opportunity_type text NOT NULL DEFAULT 'usage_expansion', title text NOT NULL, description text,
  status text NOT NULL DEFAULT 'open', confidence text NOT NULL DEFAULT 'medium',
  estimated_value_cents integer, currency text NOT NULL DEFAULT 'usd',
  reason jsonb NOT NULL DEFAULT '{}'::jsonb, owner_user_id uuid, created_by uuid,
  closed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.expansion_opportunities TO authenticated;
GRANT ALL ON public.expansion_opportunities TO service_role;
ALTER TABLE public.expansion_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view expansion" ON public.expansion_opportunities FOR SELECT TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id));
CREATE POLICY "manage expansion" ON public.expansion_opportunities FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_eo_team_status_at ON public.expansion_opportunities(team_id, status, created_at DESC);

CREATE TABLE public.churn_risk_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  customer_account_id uuid, partner_client_team_id uuid, signal_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium', status text NOT NULL DEFAULT 'open',
  title text NOT NULL, description text, evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_action text, detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_by uuid, resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.churn_risk_signals TO authenticated;
GRANT ALL ON public.churn_risk_signals TO service_role;
ALTER TABLE public.churn_risk_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view churn risks" ON public.churn_risk_signals FOR SELECT TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id));
CREATE POLICY "manage churn risks" ON public.churn_risk_signals FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_crs_team_status_sev_at ON public.churn_risk_signals(team_id, status, severity, detected_at DESC);

CREATE TABLE public.customer_success_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  report_type text NOT NULL, status text NOT NULL DEFAULT 'queued', title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb, output jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_id uuid, requested_by uuid, error_message text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_success_reports TO authenticated;
GRANT ALL ON public.customer_success_reports TO service_role;
ALTER TABLE public.customer_success_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view cs reports" ON public.customer_success_reports FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "manage cs reports" ON public.customer_success_reports FOR ALL TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id)) WITH CHECK (public.is_customer_success_manager(auth.uid(), team_id));
CREATE INDEX idx_csr_team_status_at ON public.customer_success_reports(team_id, status, created_at DESC);

CREATE TABLE public.customer_success_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL,
  customer_account_id uuid, event_type text NOT NULL, severity text NOT NULL DEFAULT 'info',
  title text NOT NULL, description text, actor_id uuid, resource_type text, resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.customer_success_audit_events TO authenticated;
GRANT ALL ON public.customer_success_audit_events TO service_role;
ALTER TABLE public.customer_success_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view cs audit" ON public.customer_success_audit_events FOR SELECT TO authenticated USING (public.is_customer_success_manager(auth.uid(), team_id));
CREATE POLICY "insert cs audit" ON public.customer_success_audit_events FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_csae_team_at ON public.customer_success_audit_events(team_id, created_at DESC);

CREATE TRIGGER trg_ped_updated BEFORE UPDATE ON public.product_event_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gf_updated BEFORE UPDATE ON public.growth_funnels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_gfs_updated BEFORE UPDATE ON public.growth_funnel_steps FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_chm_updated BEFORE UPDATE ON public.customer_health_models FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cls_updated BEFORE UPDATE ON public.customer_lifecycle_stages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_clr_updated BEFORE UPDATE ON public.customer_lifecycle_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sp_updated BEFORE UPDATE ON public.success_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_spt_updated BEFORE UPDATE ON public.success_plan_tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_qbr_updated BEFORE UPDATE ON public.qbr_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cs_updated BEFORE UPDATE ON public.customer_surveys FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_ge_updated BEFORE UPDATE ON public.growth_experiments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_eo_updated BEFORE UPDATE ON public.expansion_opportunities FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_crs_updated BEFORE UPDATE ON public.churn_risk_signals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_csr_updated BEFORE UPDATE ON public.customer_success_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
