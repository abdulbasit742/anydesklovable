
-- Task #44 Part 1/3 — Enterprise Data Catalog + Metadata Governance

CREATE TABLE public.data_catalog_workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  workspace_key text NOT NULL,
  name text NOT NULL,
  description text,
  workspace_type text NOT NULL DEFAULT 'data_catalog'
    CHECK (workspace_type IN ('data_catalog','metadata_governance','lineage','quality','privacy','bi_governance','ai_data_governance','compliance_data','custom')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','paused','archived')),
  owner_user_id uuid,
  default_sensitivity text NOT NULL DEFAULT 'internal'
    CHECK (default_sensitivity IN ('public','internal','confidential','restricted')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, workspace_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_catalog_workspaces TO authenticated;
GRANT ALL ON public.data_catalog_workspaces TO service_role;
ALTER TABLE public.data_catalog_workspaces ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read workspaces" ON public.data_catalog_workspaces
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage workspaces" ON public.data_catalog_workspaces
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_data_catalog_workspaces_updated BEFORE UPDATE ON public.data_catalog_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_dcw_team ON public.data_catalog_workspaces(team_id);

CREATE TABLE public.data_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  domain_key text NOT NULL,
  name text NOT NULL,
  description text,
  domain_type text NOT NULL DEFAULT 'business'
    CHECK (domain_type IN ('business','technical','compliance','privacy','security','financial','customer','product','operational','custom')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','archived')),
  owner_user_id uuid,
  steward_user_id uuid,
  parent_domain_id uuid REFERENCES public.data_domains(id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, domain_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_domains TO authenticated;
GRANT ALL ON public.data_domains TO service_role;
ALTER TABLE public.data_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read domains" ON public.data_domains
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage domains" ON public.data_domains
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_data_domains_updated BEFORE UPDATE ON public.data_domains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_data_domains_team ON public.data_domains(team_id);

CREATE TABLE public.data_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  workspace_id uuid REFERENCES public.data_catalog_workspaces(id) ON DELETE SET NULL,
  domain_id uuid REFERENCES public.data_domains(id) ON DELETE SET NULL,
  asset_key text NOT NULL,
  name text NOT NULL,
  description text,
  asset_type text NOT NULL DEFAULT 'table'
    CHECK (asset_type IN ('table','view','api_endpoint','report','dashboard','metric','event_stream','file_bucket','storage_object','dataset','model_input','ai_context','workflow_data','export','custom')),
  source_system text NOT NULL DEFAULT 'remotedesk'
    CHECK (source_system IN ('remotedesk','supabase','bi_studio','public_api','storage','integration_placeholder','warehouse_placeholder','external_placeholder')),
  source_module text,
  source_resource_type text,
  source_resource_id uuid,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','deprecated','archived','deleted')),
  sensitivity_level text NOT NULL DEFAULT 'internal'
    CHECK (sensitivity_level IN ('public','internal','confidential','restricted')),
  classification_status text NOT NULL DEFAULT 'not_classified'
    CHECK (classification_status IN ('not_classified','manually_classified','worker_classified','needs_review','approved')),
  owner_user_id uuid,
  steward_user_id uuid,
  technical_owner_user_id uuid,
  retention_policy_id uuid,
  legal_hold_applicable boolean NOT NULL DEFAULT false,
  data_residency_region_id uuid,
  is_system_asset boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, asset_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_assets TO authenticated;
GRANT ALL ON public.data_assets TO service_role;
ALTER TABLE public.data_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read assets" ON public.data_assets
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage assets" ON public.data_assets
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_data_assets_updated BEFORE UPDATE ON public.data_assets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_data_assets_team ON public.data_assets(team_id);
CREATE INDEX idx_data_assets_domain ON public.data_assets(domain_id);
CREATE INDEX idx_data_assets_workspace ON public.data_assets(workspace_id);
CREATE INDEX idx_data_assets_sensitivity ON public.data_assets(team_id, sensitivity_level);

CREATE TABLE public.data_asset_fields (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid NOT NULL REFERENCES public.data_assets(id) ON DELETE CASCADE,
  field_key text NOT NULL,
  name text NOT NULL,
  display_name text,
  description text,
  data_type text NOT NULL DEFAULT 'text'
    CHECK (data_type IN ('text','number','boolean','date','timestamp','uuid','json','array','enum','currency','email','url','ip_address','file_reference','custom')),
  nullable boolean NOT NULL DEFAULT true,
  sensitivity_level text NOT NULL DEFAULT 'internal'
    CHECK (sensitivity_level IN ('public','internal','confidential','restricted')),
  pii_type text NOT NULL DEFAULT 'none'
    CHECK (pii_type IN ('none','name','email','phone','address','ip_address','identifier','financial','authentication_secret','health','biometric','government_id','contract_terms','payroll','custom')),
  classification_status text NOT NULL DEFAULT 'not_classified'
    CHECK (classification_status IN ('not_classified','manually_classified','worker_classified','needs_review','approved')),
  glossary_term_id uuid,
  sample_value_redacted text,
  is_primary_key boolean NOT NULL DEFAULT false,
  is_foreign_key boolean NOT NULL DEFAULT false,
  referenced_asset_id uuid REFERENCES public.data_assets(id) ON DELETE SET NULL,
  referenced_field_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (asset_id, field_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_asset_fields TO authenticated;
GRANT ALL ON public.data_asset_fields TO service_role;
ALTER TABLE public.data_asset_fields ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read fields" ON public.data_asset_fields
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage fields" ON public.data_asset_fields
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_data_asset_fields_updated BEFORE UPDATE ON public.data_asset_fields
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_daf_asset ON public.data_asset_fields(asset_id);
CREATE INDEX idx_daf_team ON public.data_asset_fields(team_id);

CREATE TABLE public.data_classification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  rule_key text NOT NULL,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL DEFAULT 'field_name_pattern'
    CHECK (rule_type IN ('field_name_pattern','data_type','module_source','regex_placeholder','manual','worker_required','custom')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','paused','archived')),
  sensitivity_level text NOT NULL
    CHECK (sensitivity_level IN ('public','internal','confidential','restricted')),
  pii_type text NOT NULL DEFAULT 'none',
  pattern text,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  confidence text NOT NULL DEFAULT 'medium'
    CHECK (confidence IN ('low','medium','high')),
  enforcement_mode text NOT NULL DEFAULT 'suggest'
    CHECK (enforcement_mode IN ('suggest','require_review','auto_apply_manual_safe','block_exposure')),
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, rule_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_classification_rules TO authenticated;
GRANT ALL ON public.data_classification_rules TO service_role;
ALTER TABLE public.data_classification_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read rules" ON public.data_classification_rules
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage rules" ON public.data_classification_rules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_dcr_updated BEFORE UPDATE ON public.data_classification_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_dcr_team ON public.data_classification_rules(team_id);

CREATE TABLE public.data_classification_findings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid REFERENCES public.data_assets(id) ON DELETE CASCADE,
  field_id uuid REFERENCES public.data_asset_fields(id) ON DELETE CASCADE,
  rule_id uuid REFERENCES public.data_classification_rules(id) ON DELETE SET NULL,
  finding_type text NOT NULL DEFAULT 'sensitive_field'
    CHECK (finding_type IN ('sensitive_field','pii_detected','secret_risk','financial_data','contract_data','restricted_preview','unclassified_asset','stale_classification','custom')),
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open','reviewed','accepted','rejected','remediated','archived')),
  sensitivity_level text,
  pii_type text,
  confidence text NOT NULL DEFAULT 'medium'
    CHECK (confidence IN ('low','medium','high')),
  reason text,
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_classification_findings TO authenticated;
GRANT ALL ON public.data_classification_findings TO service_role;
ALTER TABLE public.data_classification_findings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read findings" ON public.data_classification_findings
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage findings" ON public.data_classification_findings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_dcf_updated BEFORE UPDATE ON public.data_classification_findings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_dcf_team_status ON public.data_classification_findings(team_id, status);
CREATE INDEX idx_dcf_asset ON public.data_classification_findings(asset_id);

CREATE TABLE public.data_lineage_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  source_asset_id uuid NOT NULL REFERENCES public.data_assets(id) ON DELETE CASCADE,
  target_asset_id uuid NOT NULL REFERENCES public.data_assets(id) ON DELETE CASCADE,
  lineage_type text NOT NULL DEFAULT 'derived_from'
    CHECK (lineage_type IN ('derived_from','feeds','transforms_to','exports_to','imports_from','powers_metric','powers_dashboard','used_by_ai','used_by_report','synced_to','references','custom')),
  source_field_id uuid REFERENCES public.data_asset_fields(id) ON DELETE SET NULL,
  target_field_id uuid REFERENCES public.data_asset_fields(id) ON DELETE SET NULL,
  confidence text NOT NULL DEFAULT 'medium'
    CHECK (confidence IN ('low','medium','high','verified')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active','stale','archived')),
  transformation_summary text,
  source_module text,
  target_module text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_lineage_edges TO authenticated;
GRANT ALL ON public.data_lineage_edges TO service_role;
ALTER TABLE public.data_lineage_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read lineage" ON public.data_lineage_edges
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage lineage" ON public.data_lineage_edges
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_dle_updated BEFORE UPDATE ON public.data_lineage_edges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_dle_team ON public.data_lineage_edges(team_id);
CREATE INDEX idx_dle_source ON public.data_lineage_edges(source_asset_id);
CREATE INDEX idx_dle_target ON public.data_lineage_edges(target_asset_id);

CREATE TABLE public.data_quality_rule_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid REFERENCES public.data_assets(id) ON DELETE CASCADE,
  field_id uuid REFERENCES public.data_asset_fields(id) ON DELETE CASCADE,
  rule_key text NOT NULL,
  name text NOT NULL,
  description text,
  rule_type text NOT NULL DEFAULT 'completeness'
    CHECK (rule_type IN ('completeness','uniqueness','validity','freshness','consistency','referential_integrity','range_check','enum_check','volume_anomaly','schema_drift','custom')),
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('draft','active','paused','archived')),
  severity text NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low','medium','high','critical')),
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  schedule_label text,
  owner_user_id uuid,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, rule_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_quality_rule_registry TO authenticated;
GRANT ALL ON public.data_quality_rule_registry TO service_role;
ALTER TABLE public.data_quality_rule_registry ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read dq rules" ON public.data_quality_rule_registry
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage dq rules" ON public.data_quality_rule_registry
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_dqrr_updated BEFORE UPDATE ON public.data_quality_rule_registry
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_dqrr_team ON public.data_quality_rule_registry(team_id);
CREATE INDEX idx_dqrr_asset ON public.data_quality_rule_registry(asset_id);

CREATE TABLE public.data_quality_check_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  rule_id uuid NOT NULL REFERENCES public.data_quality_rule_registry(id) ON DELETE CASCADE,
  asset_id uuid REFERENCES public.data_assets(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','passed','failed','warning','skipped','worker_required','canceled')),
  run_type text NOT NULL DEFAULT 'manual'
    CHECK (run_type IN ('manual','scheduled','worker','api')),
  result_summary text,
  checked_count integer,
  failed_count integer,
  quality_score integer,
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  error_message text,
  started_by uuid,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_quality_check_runs TO authenticated;
GRANT ALL ON public.data_quality_check_runs TO service_role;
ALTER TABLE public.data_quality_check_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read dq runs" ON public.data_quality_check_runs
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage dq runs" ON public.data_quality_check_runs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE INDEX idx_dqcr_team ON public.data_quality_check_runs(team_id);
CREATE INDEX idx_dqcr_rule ON public.data_quality_check_runs(rule_id);

CREATE TABLE public.metadata_scan_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  workspace_id uuid REFERENCES public.data_catalog_workspaces(id) ON DELETE SET NULL,
  asset_id uuid REFERENCES public.data_assets(id) ON DELETE SET NULL,
  scan_type text NOT NULL DEFAULT 'schema_scan'
    CHECK (scan_type IN ('schema_scan','classification_scan','lineage_scan','quality_scan','freshness_scan','external_catalog_sync','warehouse_sync','worker_required')),
  status text NOT NULL DEFAULT 'queued'
    CHECK (status IN ('queued','running','success','failed','worker_required','canceled')),
  provider text NOT NULL DEFAULT 'remotedesk_metadata'
    CHECK (provider IN ('remotedesk_metadata','supabase_placeholder','warehouse_placeholder','storage_placeholder','external_placeholder')),
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  requested_by uuid,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metadata_scan_jobs TO authenticated;
GRANT ALL ON public.metadata_scan_jobs TO service_role;
ALTER TABLE public.metadata_scan_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read scan jobs" ON public.metadata_scan_jobs
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage scan jobs" ON public.metadata_scan_jobs
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_msj_updated BEFORE UPDATE ON public.metadata_scan_jobs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_msj_team_status ON public.metadata_scan_jobs(team_id, status);

CREATE TABLE public.data_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  request_key text,
  asset_id uuid REFERENCES public.data_assets(id) ON DELETE SET NULL,
  field_id uuid REFERENCES public.data_asset_fields(id) ON DELETE SET NULL,
  request_type text NOT NULL DEFAULT 'view_access'
    CHECK (request_type IN ('view_access','export_access','bi_access','ai_context_access','api_access','restricted_preview_access','custom')),
  status text NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('draft','submitted','pending_approval','approved','rejected','expired','revoked','archived')),
  requester_user_id uuid,
  reviewer_user_id uuid,
  purpose text,
  business_justification text,
  sensitivity_level text,
  expires_at timestamptz,
  decision_note text,
  decided_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_access_requests TO authenticated;
GRANT ALL ON public.data_access_requests TO service_role;
ALTER TABLE public.data_access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read own or admin all" ON public.data_access_requests
  FOR SELECT TO authenticated
  USING (
    public.is_team_member(team_id, auth.uid())
    AND (requester_user_id = auth.uid() OR public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  );
CREATE POLICY "members create requests" ON public.data_access_requests
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()) AND requester_user_id = auth.uid());
CREATE POLICY "admins manage requests" ON public.data_access_requests
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE TRIGGER trg_dar_updated BEFORE UPDATE ON public.data_access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_dar_team_status ON public.data_access_requests(team_id, status);

CREATE TABLE public.data_asset_ownership_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid NOT NULL REFERENCES public.data_assets(id) ON DELETE CASCADE,
  previous_owner_user_id uuid,
  new_owner_user_id uuid,
  previous_steward_user_id uuid,
  new_steward_user_id uuid,
  change_reason text,
  changed_by uuid,
  changed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.data_asset_ownership_history TO authenticated;
GRANT ALL ON public.data_asset_ownership_history TO service_role;
ALTER TABLE public.data_asset_ownership_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members read ownership history" ON public.data_asset_ownership_history
  FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins insert ownership history" ON public.data_asset_ownership_history
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), team_id, 'admin'::public.app_role));
CREATE INDEX idx_daoh_asset ON public.data_asset_ownership_history(asset_id);
CREATE INDEX idx_daoh_team ON public.data_asset_ownership_history(team_id);
