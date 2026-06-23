
-- Helper: BI admin check
CREATE OR REPLACE FUNCTION public.is_bi_admin(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role IN ('owner','admin')
  );
$$;

-- 1. bi_data_sources
CREATE TABLE public.bi_data_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  source_key text NOT NULL,
  name text NOT NULL,
  description text,
  source_type text NOT NULL DEFAULT 'internal',
  status text NOT NULL DEFAULT 'active',
  connection_status text NOT NULL DEFAULT 'not_configured',
  sensitivity_level text NOT NULL DEFAULT 'internal',
  owner_user_id uuid,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, source_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_data_sources TO authenticated;
GRANT ALL ON public.bi_data_sources TO service_role;
ALTER TABLE public.bi_data_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_data_sources_select" ON public.bi_data_sources FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "bi_data_sources_manage" ON public.bi_data_sources FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 2. bi_dataset_definitions
CREATE TABLE public.bi_dataset_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  data_source_id uuid REFERENCES public.bi_data_sources(id) ON DELETE SET NULL,
  dataset_key text NOT NULL,
  name text NOT NULL,
  description text,
  dataset_type text NOT NULL DEFAULT 'table',
  domain text NOT NULL DEFAULT 'general',
  visibility text NOT NULL DEFAULT 'team',
  status text NOT NULL DEFAULT 'active',
  source_tables text[] NOT NULL DEFAULT '{}',
  fields jsonb NOT NULL DEFAULT '[]'::jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  refresh_mode text NOT NULL DEFAULT 'manual',
  sensitivity_level text NOT NULL DEFAULT 'internal',
  owner_user_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, dataset_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_dataset_definitions TO authenticated;
GRANT ALL ON public.bi_dataset_definitions TO service_role;
ALTER TABLE public.bi_dataset_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_datasets_select" ON public.bi_dataset_definitions FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (visibility <> 'restricted' OR public.is_bi_admin(auth.uid(), team_id)));
CREATE POLICY "bi_datasets_manage" ON public.bi_dataset_definitions FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 3. bi_metric_definitions
CREATE TABLE public.bi_metric_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  dataset_id uuid REFERENCES public.bi_dataset_definitions(id) ON DELETE SET NULL,
  metric_key text NOT NULL,
  name text NOT NULL,
  description text,
  metric_type text NOT NULL DEFAULT 'count',
  domain text NOT NULL DEFAULT 'general',
  formula text,
  aggregation_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  unit text,
  currency text,
  desired_direction text NOT NULL DEFAULT 'up',
  status text NOT NULL DEFAULT 'active',
  sensitivity_level text NOT NULL DEFAULT 'internal',
  owner_user_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, metric_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_metric_definitions TO authenticated;
GRANT ALL ON public.bi_metric_definitions TO service_role;
ALTER TABLE public.bi_metric_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_metrics_select" ON public.bi_metric_definitions FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (sensitivity_level NOT IN ('confidential','restricted') OR public.is_bi_admin(auth.uid(), team_id)));
CREATE POLICY "bi_metrics_manage" ON public.bi_metric_definitions FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 4. bi_metric_snapshots
CREATE TABLE public.bi_metric_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  metric_id uuid NOT NULL REFERENCES public.bi_metric_definitions(id) ON DELETE CASCADE,
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  period_start timestamptz,
  period_end timestamptz,
  value_numeric numeric,
  value_text text,
  value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'current',
  calculation_source text NOT NULL DEFAULT 'system',
  confidence text NOT NULL DEFAULT 'medium',
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_metric_snapshots TO authenticated;
GRANT ALL ON public.bi_metric_snapshots TO service_role;
ALTER TABLE public.bi_metric_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_snapshots_select" ON public.bi_metric_snapshots FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "bi_snapshots_manage" ON public.bi_metric_snapshots FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 5. bi_dashboards
CREATE TABLE public.bi_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  dashboard_key text NOT NULL,
  name text NOT NULL,
  description text,
  dashboard_type text NOT NULL DEFAULT 'executive',
  visibility text NOT NULL DEFAULT 'team',
  status text NOT NULL DEFAULT 'active',
  layout jsonb NOT NULL DEFAULT '[]'::jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  owner_user_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, dashboard_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_dashboards TO authenticated;
GRANT ALL ON public.bi_dashboards TO service_role;
ALTER TABLE public.bi_dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_dashboards_select" ON public.bi_dashboards FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (visibility <> 'restricted' OR public.is_bi_admin(auth.uid(), team_id)));
CREATE POLICY "bi_dashboards_manage" ON public.bi_dashboards FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 6. bi_dashboard_widgets
CREATE TABLE public.bi_dashboard_widgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  dashboard_id uuid NOT NULL REFERENCES public.bi_dashboards(id) ON DELETE CASCADE,
  widget_key text NOT NULL,
  title text NOT NULL,
  description text,
  widget_type text NOT NULL DEFAULT 'metric_card',
  metric_id uuid REFERENCES public.bi_metric_definitions(id) ON DELETE SET NULL,
  dataset_id uuid REFERENCES public.bi_dataset_definitions(id) ON DELETE SET NULL,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  sort_order integer NOT NULL DEFAULT 100,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dashboard_id, widget_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_dashboard_widgets TO authenticated;
GRANT ALL ON public.bi_dashboard_widgets TO service_role;
ALTER TABLE public.bi_dashboard_widgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_widgets_select" ON public.bi_dashboard_widgets FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "bi_widgets_manage" ON public.bi_dashboard_widgets FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 7. bi_warehouse_connections
CREATE TABLE public.bi_warehouse_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  connection_key text NOT NULL,
  name text NOT NULL,
  warehouse_type text NOT NULL,
  status text NOT NULL DEFAULT 'not_configured',
  credential_reference text,
  credential_status text NOT NULL DEFAULT 'not_set',
  destination_schema text,
  region text,
  last_tested_at timestamptz,
  last_error_message text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, connection_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_warehouse_connections TO authenticated;
GRANT ALL ON public.bi_warehouse_connections TO service_role;
ALTER TABLE public.bi_warehouse_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_conn_select" ON public.bi_warehouse_connections FOR SELECT TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id));
CREATE POLICY "bi_conn_manage" ON public.bi_warehouse_connections FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 8. bi_sync_jobs
CREATE TABLE public.bi_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  connection_id uuid REFERENCES public.bi_warehouse_connections(id) ON DELETE SET NULL,
  dataset_id uuid REFERENCES public.bi_dataset_definitions(id) ON DELETE SET NULL,
  job_type text NOT NULL DEFAULT 'dataset_export',
  status text NOT NULL DEFAULT 'queued',
  sync_mode text NOT NULL DEFAULT 'manual',
  destination_table text,
  period_start timestamptz,
  period_end timestamptz,
  records_processed integer NOT NULL DEFAULT 0,
  records_exported integer NOT NULL DEFAULT 0,
  records_failed integer NOT NULL DEFAULT 0,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_sync_jobs TO authenticated;
GRANT ALL ON public.bi_sync_jobs TO service_role;
ALTER TABLE public.bi_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_sync_jobs_select" ON public.bi_sync_jobs FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "bi_sync_jobs_manage" ON public.bi_sync_jobs FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 9. bi_sync_schedules
CREATE TABLE public.bi_sync_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  connection_id uuid REFERENCES public.bi_warehouse_connections(id) ON DELETE SET NULL,
  dataset_id uuid REFERENCES public.bi_dataset_definitions(id) ON DELETE SET NULL,
  dashboard_id uuid REFERENCES public.bi_dashboards(id) ON DELETE SET NULL,
  schedule_key text NOT NULL,
  name text NOT NULL,
  schedule_type text NOT NULL DEFAULT 'dataset_sync',
  status text NOT NULL DEFAULT 'active',
  cron_expression text,
  frequency text NOT NULL DEFAULT 'daily',
  next_run_at timestamptz,
  last_run_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, schedule_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_sync_schedules TO authenticated;
GRANT ALL ON public.bi_sync_schedules TO service_role;
ALTER TABLE public.bi_sync_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_sched_select" ON public.bi_sync_schedules FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "bi_sched_manage" ON public.bi_sync_schedules FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 10. bi_data_quality_rules
CREATE TABLE public.bi_data_quality_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  dataset_id uuid REFERENCES public.bi_dataset_definitions(id) ON DELETE SET NULL,
  metric_id uuid REFERENCES public.bi_metric_definitions(id) ON DELETE SET NULL,
  rule_key text NOT NULL,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL,
  severity text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'active',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  expected_result text,
  owner_user_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, rule_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_data_quality_rules TO authenticated;
GRANT ALL ON public.bi_data_quality_rules TO service_role;
ALTER TABLE public.bi_data_quality_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_dq_rules_select" ON public.bi_data_quality_rules FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "bi_dq_rules_manage" ON public.bi_data_quality_rules FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 11. bi_data_quality_results
CREATE TABLE public.bi_data_quality_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  rule_id uuid NOT NULL REFERENCES public.bi_data_quality_rules(id) ON DELETE CASCADE,
  dataset_id uuid,
  metric_id uuid,
  status text NOT NULL,
  score integer,
  actual_result text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_data_quality_results TO authenticated;
GRANT ALL ON public.bi_data_quality_results TO service_role;
ALTER TABLE public.bi_data_quality_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_dq_results_select" ON public.bi_data_quality_results FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "bi_dq_results_manage" ON public.bi_data_quality_results FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 12. bi_business_glossary_terms
CREATE TABLE public.bi_business_glossary_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  term_key text NOT NULL,
  term text NOT NULL,
  definition text NOT NULL,
  domain text NOT NULL DEFAULT 'general',
  owner_user_id uuid,
  related_metric_ids uuid[] NOT NULL DEFAULT '{}',
  related_dataset_ids uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, term_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_business_glossary_terms TO authenticated;
GRANT ALL ON public.bi_business_glossary_terms TO service_role;
ALTER TABLE public.bi_business_glossary_terms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_glossary_select" ON public.bi_business_glossary_terms FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "bi_glossary_manage" ON public.bi_business_glossary_terms FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 13. executive_scorecards
CREATE TABLE public.executive_scorecards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  scorecard_key text NOT NULL,
  name text NOT NULL,
  description text,
  scorecard_type text NOT NULL DEFAULT 'executive',
  status text NOT NULL DEFAULT 'active',
  period_start timestamptz,
  period_end timestamptz,
  owner_user_id uuid,
  summary text,
  metric_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  risk_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommendation_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, scorecard_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.executive_scorecards TO authenticated;
GRANT ALL ON public.executive_scorecards TO service_role;
ALTER TABLE public.executive_scorecards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exec_sc_select" ON public.executive_scorecards FOR SELECT TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id));
CREATE POLICY "exec_sc_manage" ON public.executive_scorecards FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 14. executive_scorecard_items
CREATE TABLE public.executive_scorecard_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  scorecard_id uuid NOT NULL REFERENCES public.executive_scorecards(id) ON DELETE CASCADE,
  metric_id uuid REFERENCES public.bi_metric_definitions(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  target_value numeric,
  actual_value numeric,
  status text NOT NULL DEFAULT 'neutral',
  narrative text,
  sort_order integer NOT NULL DEFAULT 100,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.executive_scorecard_items TO authenticated;
GRANT ALL ON public.executive_scorecard_items TO service_role;
ALTER TABLE public.executive_scorecard_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exec_sc_items_select" ON public.executive_scorecard_items FOR SELECT TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id));
CREATE POLICY "exec_sc_items_manage" ON public.executive_scorecard_items FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 15. board_report_packets
CREATE TABLE public.board_report_packets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  packet_key text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft',
  period_start timestamptz,
  period_end timestamptz,
  audience text NOT NULL DEFAULT 'executive',
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  included_dashboard_ids uuid[] NOT NULL DEFAULT '{}',
  included_report_ids uuid[] NOT NULL DEFAULT '{}',
  artifact_id uuid,
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, packet_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.board_report_packets TO authenticated;
GRANT ALL ON public.board_report_packets TO service_role;
ALTER TABLE public.board_report_packets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "board_packets_select" ON public.board_report_packets FOR SELECT TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id));
CREATE POLICY "board_packets_manage" ON public.board_report_packets FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- 16. bi_access_audit_events
CREATE TABLE public.bi_access_audit_events (
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
GRANT SELECT, INSERT ON public.bi_access_audit_events TO authenticated;
GRANT ALL ON public.bi_access_audit_events TO service_role;
ALTER TABLE public.bi_access_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_audit_select" ON public.bi_access_audit_events FOR SELECT TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id));

-- 17. bi_reports
CREATE TABLE public.bi_reports (
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bi_reports TO authenticated;
GRANT ALL ON public.bi_reports TO service_role;
ALTER TABLE public.bi_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bi_reports_select" ON public.bi_reports FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "bi_reports_manage" ON public.bi_reports FOR ALL TO authenticated
  USING (public.is_bi_admin(auth.uid(), team_id)) WITH CHECK (public.is_bi_admin(auth.uid(), team_id));

-- updated_at triggers
CREATE TRIGGER trg_bi_data_sources_uat BEFORE UPDATE ON public.bi_data_sources FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_dataset_definitions_uat BEFORE UPDATE ON public.bi_dataset_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_metric_definitions_uat BEFORE UPDATE ON public.bi_metric_definitions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_dashboards_uat BEFORE UPDATE ON public.bi_dashboards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_dashboard_widgets_uat BEFORE UPDATE ON public.bi_dashboard_widgets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_warehouse_connections_uat BEFORE UPDATE ON public.bi_warehouse_connections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_sync_jobs_uat BEFORE UPDATE ON public.bi_sync_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_sync_schedules_uat BEFORE UPDATE ON public.bi_sync_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_data_quality_rules_uat BEFORE UPDATE ON public.bi_data_quality_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_glossary_uat BEFORE UPDATE ON public.bi_business_glossary_terms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_exec_scorecards_uat BEFORE UPDATE ON public.executive_scorecards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_exec_scorecard_items_uat BEFORE UPDATE ON public.executive_scorecard_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_board_packets_uat BEFORE UPDATE ON public.board_report_packets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_bi_reports_uat BEFORE UPDATE ON public.bi_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_bi_data_sources_team ON public.bi_data_sources(team_id, status);
CREATE INDEX idx_bi_datasets_team ON public.bi_dataset_definitions(team_id, domain, visibility);
CREATE INDEX idx_bi_metrics_team ON public.bi_metric_definitions(team_id, domain, sensitivity_level);
CREATE INDEX idx_bi_snapshots_metric ON public.bi_metric_snapshots(team_id, metric_id, snapshot_at DESC);
CREATE INDEX idx_bi_dashboards_team ON public.bi_dashboards(team_id, status);
CREATE INDEX idx_bi_widgets_dash ON public.bi_dashboard_widgets(team_id, dashboard_id, sort_order);
CREATE INDEX idx_bi_conn_team ON public.bi_warehouse_connections(team_id, status);
CREATE INDEX idx_bi_sync_jobs_team ON public.bi_sync_jobs(team_id, status, created_at DESC);
CREATE INDEX idx_bi_sync_sched_team ON public.bi_sync_schedules(team_id, status, next_run_at);
CREATE INDEX idx_bi_dq_rules_team ON public.bi_data_quality_rules(team_id, status, severity);
CREATE INDEX idx_bi_dq_results_rule ON public.bi_data_quality_results(team_id, rule_id, checked_at DESC);
CREATE INDEX idx_bi_glossary_team ON public.bi_business_glossary_terms(team_id, term_key);
CREATE INDEX idx_exec_sc_team ON public.executive_scorecards(team_id, status, created_at DESC);
CREATE INDEX idx_exec_sc_items ON public.executive_scorecard_items(team_id, scorecard_id, sort_order);
CREATE INDEX idx_board_packets_team ON public.board_report_packets(team_id, status, created_at DESC);
CREATE INDEX idx_bi_audit_team ON public.bi_access_audit_events(team_id, created_at DESC);
CREATE INDEX idx_bi_reports_team ON public.bi_reports(team_id, status, created_at DESC);
