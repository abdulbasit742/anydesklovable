
-- =====================================================
-- TASK #17 — OBSERVABILITY CENTER + INCIDENT RESPONSE
-- =====================================================

-- Helper: privileged role check for observability management
CREATE OR REPLACE FUNCTION public.is_observability_manager(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, _team_id, 'owner'::app_role)
    OR public.has_role(_user_id, _team_id, 'admin'::app_role);
$$;

-- 1. observability_services
CREATE TABLE public.observability_services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  service_key text NOT NULL,
  name text NOT NULL,
  description text,
  service_type text NOT NULL DEFAULT 'internal',
  status text NOT NULL DEFAULT 'unknown',
  owner_user_id uuid,
  owner_team text,
  docs_url text,
  runbook_id uuid,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, service_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.observability_services TO authenticated;
GRANT ALL ON public.observability_services TO service_role;
ALTER TABLE public.observability_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obs_services_select" ON public.observability_services FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "obs_services_manage" ON public.observability_services FOR ALL TO authenticated
  USING (public.is_observability_manager(auth.uid(), team_id))
  WITH CHECK (public.is_observability_manager(auth.uid(), team_id));
CREATE INDEX idx_obs_services_team_key ON public.observability_services(team_id, service_key);
CREATE INDEX idx_obs_services_team_status ON public.observability_services(team_id, status, active);
CREATE TRIGGER trg_obs_services_updated BEFORE UPDATE ON public.observability_services
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2. health_checks
CREATE TABLE public.health_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  service_id uuid NOT NULL REFERENCES public.observability_services(id) ON DELETE CASCADE,
  name text NOT NULL,
  check_type text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  severity text NOT NULL DEFAULT 'warning',
  threshold_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_status text NOT NULL DEFAULT 'unknown',
  last_checked_at timestamptz,
  next_check_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_checks TO authenticated;
GRANT ALL ON public.health_checks TO service_role;
ALTER TABLE public.health_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health_checks_select" ON public.health_checks FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "health_checks_manage" ON public.health_checks FOR ALL TO authenticated
  USING (public.is_observability_manager(auth.uid(), team_id))
  WITH CHECK (public.is_observability_manager(auth.uid(), team_id));
CREATE INDEX idx_health_checks_team_svc ON public.health_checks(team_id, service_id, enabled);
CREATE INDEX idx_health_checks_due ON public.health_checks(team_id, next_check_at) WHERE enabled = true;
CREATE TRIGGER trg_health_checks_updated BEFORE UPDATE ON public.health_checks
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3. health_check_results
CREATE TABLE public.health_check_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  check_id uuid NOT NULL REFERENCES public.health_checks(id) ON DELETE CASCADE,
  service_id uuid,
  status text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  measured_value numeric,
  threshold_value numeric,
  message text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.health_check_results TO authenticated;
GRANT ALL ON public.health_check_results TO service_role;
ALTER TABLE public.health_check_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "health_check_results_select" ON public.health_check_results FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_hcr_team_check_time ON public.health_check_results(team_id, check_id, checked_at DESC);

-- 4. observability_metrics
CREATE TABLE public.observability_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  service_id uuid,
  metric_key text NOT NULL,
  metric_name text NOT NULL,
  metric_type text NOT NULL DEFAULT 'gauge',
  value numeric NOT NULL DEFAULT 0,
  unit text,
  dimensions jsonb NOT NULL DEFAULT '{}'::jsonb,
  captured_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'system',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.observability_metrics TO authenticated;
GRANT ALL ON public.observability_metrics TO service_role;
ALTER TABLE public.observability_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obs_metrics_select" ON public.observability_metrics FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_obs_metrics_team_key_time ON public.observability_metrics(team_id, metric_key, captured_at DESC);
CREATE INDEX idx_obs_metrics_team_svc_time ON public.observability_metrics(team_id, service_id, captured_at DESC);

-- 5. alert_rules
CREATE TABLE public.alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  service_id uuid REFERENCES public.observability_services(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL,
  severity text NOT NULL DEFAULT 'warning',
  enabled boolean NOT NULL DEFAULT true,
  condition_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  dedupe_key text,
  cooldown_minutes integer NOT NULL DEFAULT 30,
  notification_channels jsonb NOT NULL DEFAULT '{}'::jsonb,
  auto_create_incident boolean NOT NULL DEFAULT false,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alert_rules TO authenticated;
GRANT ALL ON public.alert_rules TO service_role;
ALTER TABLE public.alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alert_rules_select" ON public.alert_rules FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "alert_rules_manage" ON public.alert_rules FOR ALL TO authenticated
  USING (public.is_observability_manager(auth.uid(), team_id))
  WITH CHECK (public.is_observability_manager(auth.uid(), team_id));
CREATE INDEX idx_alert_rules_team_enabled ON public.alert_rules(team_id, enabled, rule_type);
CREATE TRIGGER trg_alert_rules_updated BEFORE UPDATE ON public.alert_rules
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6. alert_events
CREATE TABLE public.alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  alert_rule_id uuid REFERENCES public.alert_rules(id) ON DELETE SET NULL,
  service_id uuid,
  incident_id uuid,
  severity text NOT NULL DEFAULT 'warning',
  status text NOT NULL DEFAULT 'open',
  title text NOT NULL,
  message text,
  dedupe_key text,
  source text NOT NULL DEFAULT 'system',
  resource_type text,
  resource_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  fired_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.alert_events TO authenticated;
GRANT ALL ON public.alert_events TO service_role;
ALTER TABLE public.alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "alert_events_select" ON public.alert_events FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "alert_events_manage" ON public.alert_events FOR ALL TO authenticated
  USING (public.is_observability_manager(auth.uid(), team_id))
  WITH CHECK (public.is_observability_manager(auth.uid(), team_id));
CREATE INDEX idx_alert_events_team_status ON public.alert_events(team_id, status, severity, fired_at DESC);
CREATE INDEX idx_alert_events_team_dedupe ON public.alert_events(team_id, dedupe_key, fired_at DESC);
CREATE TRIGGER trg_alert_events_updated BEFORE UPDATE ON public.alert_events
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 7. incidents
CREATE TABLE public.incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  incident_number text,
  title text NOT NULL,
  description text,
  severity text NOT NULL DEFAULT 'warning',
  status text NOT NULL DEFAULT 'open',
  impact text NOT NULL DEFAULT 'unknown',
  affected_services uuid[] NOT NULL DEFAULT '{}',
  started_at timestamptz NOT NULL DEFAULT now(),
  detected_at timestamptz,
  acknowledged_at timestamptz,
  resolved_at timestamptz,
  closed_at timestamptz,
  commander_id uuid,
  created_by uuid,
  root_cause text,
  resolution_summary text,
  customer_visible boolean NOT NULL DEFAULT false,
  status_page_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.incidents TO authenticated;
GRANT ALL ON public.incidents TO service_role;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incidents_select" ON public.incidents FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "incidents_manage" ON public.incidents FOR ALL TO authenticated
  USING (public.is_observability_manager(auth.uid(), team_id))
  WITH CHECK (public.is_observability_manager(auth.uid(), team_id));
CREATE INDEX idx_incidents_team_status ON public.incidents(team_id, status, severity, created_at DESC);
CREATE INDEX idx_incidents_team_started ON public.incidents(team_id, started_at DESC);
CREATE TRIGGER trg_incidents_updated BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- Link alert_events -> incidents (FK after both tables exist)
ALTER TABLE public.alert_events
  ADD CONSTRAINT alert_events_incident_fk
  FOREIGN KEY (incident_id) REFERENCES public.incidents(id) ON DELETE SET NULL;

-- 8. incident_timeline_events
CREATE TABLE public.incident_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  actor_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.incident_timeline_events TO authenticated;
GRANT ALL ON public.incident_timeline_events TO service_role;
ALTER TABLE public.incident_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incident_timeline_select" ON public.incident_timeline_events FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "incident_timeline_insert" ON public.incident_timeline_events FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_incident_timeline_team_inc ON public.incident_timeline_events(team_id, incident_id, created_at DESC);

-- 9. incident_action_items
CREATE TABLE public.incident_action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'open',
  priority text NOT NULL DEFAULT 'normal',
  assigned_to uuid,
  due_at timestamptz,
  completed_by uuid,
  completed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incident_action_items TO authenticated;
GRANT ALL ON public.incident_action_items TO service_role;
ALTER TABLE public.incident_action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incident_action_items_select" ON public.incident_action_items FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "incident_action_items_manage" ON public.incident_action_items FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_incident_actions_team_inc ON public.incident_action_items(team_id, incident_id, status);
CREATE TRIGGER trg_incident_actions_updated BEFORE UPDATE ON public.incident_action_items
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 10. incident_service_impacts
CREATE TABLE public.incident_service_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  incident_id uuid NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.observability_services(id) ON DELETE CASCADE,
  impact_status text NOT NULL DEFAULT 'degraded',
  started_at timestamptz NOT NULL DEFAULT now(),
  ended_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.incident_service_impacts TO authenticated;
GRANT ALL ON public.incident_service_impacts TO service_role;
ALTER TABLE public.incident_service_impacts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incident_impacts_select" ON public.incident_service_impacts FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "incident_impacts_manage" ON public.incident_service_impacts FOR ALL TO authenticated
  USING (public.is_observability_manager(auth.uid(), team_id))
  WITH CHECK (public.is_observability_manager(auth.uid(), team_id));
CREATE INDEX idx_incident_impacts_team_inc ON public.incident_service_impacts(team_id, incident_id);
CREATE TRIGGER trg_incident_impacts_updated BEFORE UPDATE ON public.incident_service_impacts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 11. incident_postmortems
CREATE TABLE public.incident_postmortems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  incident_id uuid NOT NULL UNIQUE REFERENCES public.incidents(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft',
  summary text,
  root_cause text,
  impact_summary text,
  detection_summary text,
  resolution_summary text,
  what_went_well text,
  what_went_wrong text,
  prevention_actions jsonb NOT NULL DEFAULT '[]'::jsonb,
  published_at timestamptz,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.incident_postmortems TO authenticated;
GRANT ALL ON public.incident_postmortems TO service_role;
ALTER TABLE public.incident_postmortems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "incident_postmortems_select" ON public.incident_postmortems FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "incident_postmortems_manage" ON public.incident_postmortems FOR ALL TO authenticated
  USING (public.is_observability_manager(auth.uid(), team_id))
  WITH CHECK (public.is_observability_manager(auth.uid(), team_id));
CREATE INDEX idx_incident_postmortems_team_inc ON public.incident_postmortems(team_id, incident_id);
CREATE TRIGGER trg_incident_postmortems_updated BEFORE UPDATE ON public.incident_postmortems
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 12. status_page_updates
CREATE TABLE public.status_page_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  incident_id uuid REFERENCES public.incidents(id) ON DELETE SET NULL,
  service_id uuid REFERENCES public.observability_services(id) ON DELETE SET NULL,
  visibility text NOT NULL DEFAULT 'internal',
  title text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  published_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.status_page_updates TO authenticated;
GRANT ALL ON public.status_page_updates TO service_role;
ALTER TABLE public.status_page_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "status_updates_select" ON public.status_page_updates FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "status_updates_manage" ON public.status_page_updates FOR ALL TO authenticated
  USING (public.is_observability_manager(auth.uid(), team_id))
  WITH CHECK (public.is_observability_manager(auth.uid(), team_id));
CREATE INDEX idx_status_updates_team ON public.status_page_updates(team_id, status, visibility, created_at DESC);
CREATE TRIGGER trg_status_updates_updated BEFORE UPDATE ON public.status_page_updates
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 13. observability_dashboards
CREATE TABLE public.observability_dashboards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  layout jsonb NOT NULL DEFAULT '{}'::jsonb,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility text NOT NULL DEFAULT 'team',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.observability_dashboards TO authenticated;
GRANT ALL ON public.observability_dashboards TO service_role;
ALTER TABLE public.observability_dashboards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obs_dashboards_select" ON public.observability_dashboards FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "obs_dashboards_manage" ON public.observability_dashboards FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_obs_dashboards_team ON public.observability_dashboards(team_id);
CREATE TRIGGER trg_obs_dashboards_updated BEFORE UPDATE ON public.observability_dashboards
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 14. observability_reports
CREATE TABLE public.observability_reports (
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
GRANT SELECT, INSERT, UPDATE ON public.observability_reports TO authenticated;
GRANT ALL ON public.observability_reports TO service_role;
ALTER TABLE public.observability_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "obs_reports_select" ON public.observability_reports FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "obs_reports_manage" ON public.observability_reports FOR ALL TO authenticated
  USING (public.is_observability_manager(auth.uid(), team_id))
  WITH CHECK (public.is_observability_manager(auth.uid(), team_id));
CREATE INDEX idx_obs_reports_team ON public.observability_reports(team_id, status, created_at DESC);
CREATE TRIGGER trg_obs_reports_updated BEFORE UPDATE ON public.observability_reports
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
