
-- ============ Helper ============
CREATE OR REPLACE FUNCTION public.is_billing_manager(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, _team_id, 'owner'::app_role)
      OR public.has_role(_user_id, _team_id, 'admin'::app_role);
$$;

-- ============ 1. billing_plan_catalog ============
CREATE TABLE public.billing_plan_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  tier text NOT NULL DEFAULT 'starter',
  status text NOT NULL DEFAULT 'active',
  billing_interval text NOT NULL DEFAULT 'monthly',
  base_price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  stripe_price_id text,
  stripe_product_id text,
  trial_days integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 100,
  public_visible boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_plan_catalog TO authenticated, anon;
GRANT ALL ON public.billing_plan_catalog TO service_role;
ALTER TABLE public.billing_plan_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY bpc_read ON public.billing_plan_catalog FOR SELECT USING (true);
CREATE INDEX idx_bpc_key_status ON public.billing_plan_catalog(plan_key, status);
CREATE TRIGGER trg_bpc_updated BEFORE UPDATE ON public.billing_plan_catalog FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 2. billing_entitlements ============
CREATE TABLE public.billing_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.billing_plan_catalog(id) ON DELETE CASCADE,
  entitlement_key text NOT NULL,
  entitlement_name text NOT NULL,
  entitlement_type text NOT NULL DEFAULT 'limit',
  value_boolean boolean,
  value_integer bigint,
  value_numeric numeric,
  value_text text,
  value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  enforcement_mode text NOT NULL DEFAULT 'warn',
  reset_interval text NOT NULL DEFAULT 'monthly',
  overage_allowed boolean NOT NULL DEFAULT false,
  overage_price_cents integer,
  stripe_meter_id text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(plan_id, entitlement_key)
);
GRANT SELECT ON public.billing_entitlements TO authenticated;
GRANT ALL ON public.billing_entitlements TO service_role;
ALTER TABLE public.billing_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY be_read ON public.billing_entitlements FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_be_plan_key ON public.billing_entitlements(plan_id, entitlement_key);
CREATE TRIGGER trg_be_updated BEFORE UPDATE ON public.billing_entitlements FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 3. billing_meter_definitions ============
CREATE TABLE public.billing_meter_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meter_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  unit text NOT NULL DEFAULT 'count',
  aggregation_method text NOT NULL DEFAULT 'sum',
  source_table text,
  source_event text,
  billable boolean NOT NULL DEFAULT false,
  stripe_meter_id text,
  active boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_meter_definitions TO authenticated;
GRANT ALL ON public.billing_meter_definitions TO service_role;
ALTER TABLE public.billing_meter_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY bmd_read ON public.billing_meter_definitions FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_bmd_key_active ON public.billing_meter_definitions(meter_key, active);
CREATE TRIGGER trg_bmd_updated BEFORE UPDATE ON public.billing_meter_definitions FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 4. billing_usage_events ============
CREATE TABLE public.billing_usage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  meter_key text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text,
  source text NOT NULL DEFAULT 'system',
  source_resource_type text,
  source_resource_id uuid,
  idempotency_key text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  billing_period_start timestamptz,
  billing_period_end timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_usage_events TO authenticated;
GRANT ALL ON public.billing_usage_events TO service_role;
ALTER TABLE public.billing_usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY bue_read ON public.billing_usage_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_bue_team_meter_time ON public.billing_usage_events(team_id, meter_key, occurred_at DESC);
CREATE UNIQUE INDEX idx_bue_idem ON public.billing_usage_events(team_id, idempotency_key) WHERE idempotency_key IS NOT NULL;

-- ============ 5. billing_usage_aggregates ============
CREATE TABLE public.billing_usage_aggregates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  meter_key text NOT NULL,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  included_quantity numeric,
  billable_quantity numeric,
  overage_quantity numeric,
  estimated_cost_cents integer,
  currency text NOT NULL DEFAULT 'usd',
  aggregation_status text NOT NULL DEFAULT 'current',
  last_event_at timestamptz,
  finalized_at timestamptz,
  synced_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, meter_key, period_start, period_end)
);
GRANT SELECT ON public.billing_usage_aggregates TO authenticated;
GRANT ALL ON public.billing_usage_aggregates TO service_role;
ALTER TABLE public.billing_usage_aggregates ENABLE ROW LEVEL SECURITY;
CREATE POLICY bua_read ON public.billing_usage_aggregates FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_bua_team_meter_period ON public.billing_usage_aggregates(team_id, meter_key, period_start, period_end);
CREATE TRIGGER trg_bua_updated BEFORE UPDATE ON public.billing_usage_aggregates FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 6. billing_quota_status ============
CREATE TABLE public.billing_quota_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  entitlement_key text NOT NULL,
  meter_key text,
  current_usage numeric NOT NULL DEFAULT 0,
  limit_value numeric,
  usage_percent numeric,
  status text NOT NULL DEFAULT 'ok',
  enforcement_mode text NOT NULL DEFAULT 'warn',
  period_start timestamptz,
  period_end timestamptz,
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, entitlement_key)
);
GRANT SELECT ON public.billing_quota_status TO authenticated;
GRANT ALL ON public.billing_quota_status TO service_role;
ALTER TABLE public.billing_quota_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY bqs_read ON public.billing_quota_status FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_bqs_team_ent ON public.billing_quota_status(team_id, entitlement_key);
CREATE TRIGGER trg_bqs_updated BEFORE UPDATE ON public.billing_quota_status FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 7. billing_enforcement_events ============
CREATE TABLE public.billing_enforcement_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  entitlement_key text NOT NULL,
  meter_key text,
  action_type text NOT NULL,
  decision text NOT NULL,
  resource_type text,
  resource_id uuid,
  requested_by uuid,
  current_usage numeric,
  limit_value numeric,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_enforcement_events TO authenticated;
GRANT ALL ON public.billing_enforcement_events TO service_role;
ALTER TABLE public.billing_enforcement_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY bee_read ON public.billing_enforcement_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_bee_team_time ON public.billing_enforcement_events(team_id, created_at DESC);
CREATE INDEX idx_bee_team_decision ON public.billing_enforcement_events(team_id, decision, created_at DESC);

-- ============ 8. billing_overage_events ============
CREATE TABLE public.billing_overage_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  meter_key text NOT NULL,
  quantity numeric NOT NULL,
  included_quantity numeric,
  overage_quantity numeric NOT NULL DEFAULT 0,
  unit_price_cents integer,
  estimated_amount_cents integer,
  currency text NOT NULL DEFAULT 'usd',
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  invoice_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.billing_overage_events TO authenticated;
GRANT ALL ON public.billing_overage_events TO service_role;
ALTER TABLE public.billing_overage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY boe_read ON public.billing_overage_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_boe_team_status ON public.billing_overage_events(team_id, status, created_at DESC);
CREATE TRIGGER trg_boe_updated BEFORE UPDATE ON public.billing_overage_events FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 9. billing_usage_exports ============
CREATE TABLE public.billing_usage_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  export_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  storage_path text,
  artifact_id uuid,
  requested_by uuid,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.billing_usage_exports TO authenticated;
GRANT ALL ON public.billing_usage_exports TO service_role;
ALTER TABLE public.billing_usage_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY bux_read ON public.billing_usage_exports FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY bux_insert ON public.billing_usage_exports FOR INSERT TO authenticated WITH CHECK (public.is_billing_manager(auth.uid(), team_id));
CREATE INDEX idx_bux_team_status ON public.billing_usage_exports(team_id, status, created_at DESC);
CREATE TRIGGER trg_bux_updated BEFORE UPDATE ON public.billing_usage_exports FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 10. billing_alert_rules ============
CREATE TABLE public.billing_alert_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  entitlement_key text,
  meter_key text,
  threshold_percent numeric NOT NULL DEFAULT 80,
  threshold_quantity numeric,
  severity text NOT NULL DEFAULT 'warning',
  enabled boolean NOT NULL DEFAULT true,
  notify_admins boolean NOT NULL DEFAULT true,
  notify_billing_admins boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_alert_rules TO authenticated;
GRANT ALL ON public.billing_alert_rules TO service_role;
ALTER TABLE public.billing_alert_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY bar_read ON public.billing_alert_rules FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY bar_manage ON public.billing_alert_rules FOR ALL TO authenticated USING (public.is_billing_manager(auth.uid(), team_id)) WITH CHECK (public.is_billing_manager(auth.uid(), team_id));
CREATE INDEX idx_bar_team_enabled ON public.billing_alert_rules(team_id, enabled);
CREATE TRIGGER trg_bar_updated BEFORE UPDATE ON public.billing_alert_rules FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 11. billing_alert_events ============
CREATE TABLE public.billing_alert_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  alert_rule_id uuid REFERENCES public.billing_alert_rules(id) ON DELETE SET NULL,
  entitlement_key text,
  meter_key text,
  severity text NOT NULL DEFAULT 'warning',
  status text NOT NULL DEFAULT 'open',
  title text NOT NULL,
  message text,
  current_usage numeric,
  limit_value numeric,
  usage_percent numeric,
  acknowledged_by uuid,
  acknowledged_at timestamptz,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.billing_alert_events TO authenticated;
GRANT ALL ON public.billing_alert_events TO service_role;
ALTER TABLE public.billing_alert_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY bae_read ON public.billing_alert_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY bae_update ON public.billing_alert_events FOR UPDATE TO authenticated USING (public.is_billing_manager(auth.uid(), team_id)) WITH CHECK (public.is_billing_manager(auth.uid(), team_id));
CREATE INDEX idx_bae_team_status ON public.billing_alert_events(team_id, status, created_at DESC);
CREATE TRIGGER trg_bae_updated BEFORE UPDATE ON public.billing_alert_events FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 12. billing_plan_overrides ============
CREATE TABLE public.billing_plan_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  entitlement_key text NOT NULL,
  override_type text NOT NULL DEFAULT 'limit',
  value_boolean boolean,
  value_numeric numeric,
  value_integer bigint,
  value_text text,
  value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text,
  expires_at timestamptz,
  approved_by uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.billing_plan_overrides TO authenticated;
GRANT ALL ON public.billing_plan_overrides TO service_role;
ALTER TABLE public.billing_plan_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY bpo_read ON public.billing_plan_overrides FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY bpo_manage ON public.billing_plan_overrides FOR ALL TO authenticated USING (public.is_billing_manager(auth.uid(), team_id)) WITH CHECK (public.is_billing_manager(auth.uid(), team_id));
CREATE INDEX idx_bpo_team_ent ON public.billing_plan_overrides(team_id, entitlement_key);
CREATE TRIGGER trg_bpo_updated BEFORE UPDATE ON public.billing_plan_overrides FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 13. billing_provider_sync_jobs ============
CREATE TABLE public.billing_provider_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'stripe',
  sync_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  period_start timestamptz,
  period_end timestamptz,
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  started_at timestamptz,
  finished_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.billing_provider_sync_jobs TO authenticated;
GRANT ALL ON public.billing_provider_sync_jobs TO service_role;
ALTER TABLE public.billing_provider_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY bpsj_read ON public.billing_provider_sync_jobs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY bpsj_insert ON public.billing_provider_sync_jobs FOR INSERT TO authenticated WITH CHECK (public.is_billing_manager(auth.uid(), team_id));
CREATE INDEX idx_bpsj_team_status ON public.billing_provider_sync_jobs(team_id, status, created_at DESC);
CREATE TRIGGER trg_bpsj_updated BEFORE UPDATE ON public.billing_provider_sync_jobs FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 14. billing_credit_grants ============
CREATE TABLE public.billing_credit_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  credit_type text NOT NULL DEFAULT 'manual',
  amount_cents integer,
  quantity_credit numeric,
  meter_key text,
  currency text NOT NULL DEFAULT 'usd',
  reason text,
  status text NOT NULL DEFAULT 'active',
  expires_at timestamptz,
  granted_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.billing_credit_grants TO authenticated;
GRANT ALL ON public.billing_credit_grants TO service_role;
ALTER TABLE public.billing_credit_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY bcg_read ON public.billing_credit_grants FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY bcg_manage ON public.billing_credit_grants FOR ALL TO authenticated USING (public.is_billing_manager(auth.uid(), team_id)) WITH CHECK (public.is_billing_manager(auth.uid(), team_id));
CREATE INDEX idx_bcg_team_status ON public.billing_credit_grants(team_id, status, created_at DESC);
CREATE TRIGGER trg_bcg_updated BEFORE UPDATE ON public.billing_credit_grants FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ Seed plan catalog ============
INSERT INTO public.billing_plan_catalog (plan_key, name, tier, billing_interval, base_price_cents, sort_order, description) VALUES
  ('free',       'Free',       'free',       'monthly',     0, 10, 'Get started with RemoteDesk'),
  ('starter',    'Starter',    'starter',    'monthly',  1900, 20, 'For small teams'),
  ('pro',        'Pro',        'pro',        'monthly',  4900, 30, 'For growing teams'),
  ('business',   'Business',   'business',   'monthly', 19900, 40, 'For larger organizations'),
  ('enterprise', 'Enterprise', 'enterprise', 'custom',      0, 50, 'Custom contracts and pricing')
ON CONFLICT (plan_key) DO NOTHING;

-- ============ Seed entitlements ============
DO $$
DECLARE _free uuid; _start uuid; _pro uuid; _biz uuid; _ent uuid;
BEGIN
  SELECT id INTO _free  FROM public.billing_plan_catalog WHERE plan_key='free';
  SELECT id INTO _start FROM public.billing_plan_catalog WHERE plan_key='starter';
  SELECT id INTO _pro   FROM public.billing_plan_catalog WHERE plan_key='pro';
  SELECT id INTO _biz   FROM public.billing_plan_catalog WHERE plan_key='business';
  SELECT id INTO _ent   FROM public.billing_plan_catalog WHERE plan_key='enterprise';

  INSERT INTO public.billing_entitlements (plan_id, entitlement_key, entitlement_name, entitlement_type, value_integer, enforcement_mode) VALUES
    (_free,'max_team_members','Team Members','limit',2,'block'),
    (_free,'max_devices','Devices','limit',3,'block'),
    (_free,'max_monthly_sessions','Monthly Sessions','limit',20,'warn'),
    (_free,'max_session_minutes','Session Minutes','limit',300,'warn'),
    (_start,'max_team_members','Team Members','limit',5,'block'),
    (_start,'max_devices','Devices','limit',25,'block'),
    (_start,'max_monthly_sessions','Monthly Sessions','limit',300,'warn'),
    (_start,'max_session_minutes','Session Minutes','limit',3000,'warn'),
    (_pro,'max_team_members','Team Members','limit',15,'warn'),
    (_pro,'max_devices','Devices','limit',150,'warn'),
    (_pro,'max_monthly_sessions','Monthly Sessions','limit',2000,'warn'),
    (_pro,'max_session_minutes','Session Minutes','limit',25000,'warn'),
    (_biz,'max_team_members','Team Members','limit',50,'warn'),
    (_biz,'max_devices','Devices','limit',1000,'warn'),
    (_biz,'max_monthly_sessions','Monthly Sessions','limit',10000,'warn'),
    (_biz,'max_session_minutes','Session Minutes','limit',200000,'warn');

  INSERT INTO public.billing_entitlements (plan_id, entitlement_key, entitlement_name, entitlement_type, value_boolean, enforcement_mode) VALUES
    (_free,'feature_api_access','API Access','feature',false,'block'),
    (_free,'feature_webhooks','Webhooks','feature',false,'block'),
    (_free,'feature_automation','Automation','feature',false,'block'),
    (_free,'feature_ai_copilot','AI Copilot','feature',false,'block'),
    (_start,'feature_api_access','API Access','feature',true,'allow'),
    (_start,'feature_webhooks','Webhooks','feature',false,'block'),
    (_start,'feature_automation','Automation','feature',false,'block'),
    (_pro,'feature_api_access','API Access','feature',true,'allow'),
    (_pro,'feature_webhooks','Webhooks','feature',true,'allow'),
    (_pro,'feature_automation','Automation','feature',true,'allow'),
    (_pro,'feature_policy_engine','Policy Engine','feature',true,'allow'),
    (_biz,'feature_api_access','API Access','feature',true,'allow'),
    (_biz,'feature_webhooks','Webhooks','feature',true,'allow'),
    (_biz,'feature_automation','Automation','feature',true,'allow'),
    (_biz,'feature_compliance_reports','Compliance Reports','feature',true,'allow'),
    (_biz,'feature_observability','Observability','feature',true,'allow'),
    (_biz,'feature_integrations','Integrations','feature',true,'allow'),
    (_ent,'feature_enterprise_governance','Enterprise Governance','feature',true,'allow'),
    (_ent,'feature_sso_placeholder','SSO','feature',true,'allow');
END $$;

-- ============ Seed meter definitions ============
INSERT INTO public.billing_meter_definitions (meter_key, name, unit, aggregation_method, source_table, billable) VALUES
  ('devices_total','Devices','count','max','devices',false),
  ('team_members_total','Team Members','count','max','team_members',false),
  ('active_sessions_total','Active Sessions','count','max','sessions',false),
  ('sessions_started','Sessions Started','count','sum','sessions',true),
  ('session_minutes','Session Minutes','minute','sum','sessions',true),
  ('api_requests','API Requests','count','sum','api_requests',true),
  ('webhook_deliveries','Webhook Deliveries','count','sum','webhook_deliveries',true),
  ('automation_runs','Automation Runs','count','sum','automation_pipeline_runs',true),
  ('automation_tasks','Automation Tasks','count','sum','automation_tasks',true),
  ('support_tickets_created','Support Tickets','count','sum','support_tickets',false),
  ('ai_jobs','AI Jobs','count','sum',NULL,true),
  ('integration_action_runs','Integration Actions','count','sum','integration_action_runs',true),
  ('observability_events','Observability Events','count','sum','observability_metrics',false),
  ('compliance_reports','Compliance Reports','count','sum','compliance_report_runs',false),
  ('customer_accounts','Customer Accounts','count','max','customer_accounts',false),
  ('storage_gb_month','Storage','gigabyte','max',NULL,true)
ON CONFLICT (meter_key) DO NOTHING;
