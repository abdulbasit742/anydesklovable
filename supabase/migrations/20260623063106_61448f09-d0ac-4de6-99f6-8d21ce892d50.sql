CREATE OR REPLACE FUNCTION public.is_data_governance_manager(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.user_id = _user_id AND tm.team_id = _team_id
      AND tm.role IN ('owner','admin')
  );
$$;

CREATE TABLE public.data_retention_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  data_category text NOT NULL,
  resource_type text,
  retention_days integer NOT NULL,
  action_after_retention text NOT NULL DEFAULT 'archive',
  enforcement_mode text NOT NULL DEFAULT 'review',
  legal_hold_exempt boolean NOT NULL DEFAULT true,
  enabled boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_retention_policies TO authenticated;
GRANT ALL ON public.data_retention_policies TO service_role;
ALTER TABLE public.data_retention_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "drp_team_read" ON public.data_retention_policies FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "drp_admin_write" ON public.data_retention_policies FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.data_retention_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  policy_id uuid REFERENCES public.data_retention_policies(id) ON DELETE SET NULL,
  data_category text NOT NULL,
  resource_type text,
  resource_id uuid,
  resource_created_at timestamptz,
  eligible_at timestamptz,
  decision text NOT NULL,
  reason text,
  legal_hold_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  evaluated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.data_retention_evaluations TO authenticated;
GRANT ALL ON public.data_retention_evaluations TO service_role;
ALTER TABLE public.data_retention_evaluations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dre_team_read" ON public.data_retention_evaluations FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "dre_service_write" ON public.data_retention_evaluations FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.legal_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  case_number text,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'active',
  hold_type text NOT NULL DEFAULT 'general',
  scope jsonb NOT NULL DEFAULT '{}',
  reason text,
  custodian_user_ids uuid[] NOT NULL DEFAULT '{}',
  customer_account_ids uuid[] NOT NULL DEFAULT '{}',
  device_ids uuid[] NOT NULL DEFAULT '{}',
  session_ids uuid[] NOT NULL DEFAULT '{}',
  support_ticket_ids uuid[] NOT NULL DEFAULT '{}',
  incident_ids uuid[] NOT NULL DEFAULT '{}',
  start_at timestamptz NOT NULL DEFAULT now(),
  release_at timestamptz,
  created_by uuid,
  released_by uuid,
  release_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_holds TO authenticated;
GRANT ALL ON public.legal_holds TO service_role;
ALTER TABLE public.legal_holds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lh_team_read" ON public.legal_holds FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "lh_admin_write" ON public.legal_holds FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.legal_hold_resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  legal_hold_id uuid NOT NULL REFERENCES public.legal_holds(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  resource_title text,
  matched_by text NOT NULL DEFAULT 'manual',
  hold_status text NOT NULL DEFAULT 'held',
  added_by uuid,
  released_by uuid,
  added_at timestamptz NOT NULL DEFAULT now(),
  released_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.legal_hold_resources TO authenticated;
GRANT ALL ON public.legal_hold_resources TO service_role;
ALTER TABLE public.legal_hold_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lhr_team_read" ON public.legal_hold_resources FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "lhr_admin_write" ON public.legal_hold_resources FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.audit_export_vaults (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  vault_type text NOT NULL DEFAULT 'internal',
  retention_days integer,
  encryption_status text NOT NULL DEFAULT 'unknown',
  storage_bucket text,
  storage_prefix text,
  external_archive_reference text,
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_export_vaults TO authenticated;
GRANT ALL ON public.audit_export_vaults TO service_role;
ALTER TABLE public.audit_export_vaults ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aev_team_read" ON public.audit_export_vaults FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aev_admin_write" ON public.audit_export_vaults FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.audit_export_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  vault_id uuid REFERENCES public.audit_export_vaults(id) ON DELETE SET NULL,
  export_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  description text,
  filters jsonb NOT NULL DEFAULT '{}',
  format text NOT NULL DEFAULT 'json',
  requested_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  output jsonb NOT NULL DEFAULT '{}',
  storage_path text,
  size_bytes bigint,
  checksum_sha256 text,
  error_message text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_export_jobs TO authenticated;
GRANT ALL ON public.audit_export_jobs TO service_role;
ALTER TABLE public.audit_export_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "aej_team_read" ON public.audit_export_jobs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "aej_admin_write" ON public.audit_export_jobs FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.evidence_bundles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  vault_id uuid REFERENCES public.audit_export_vaults(id) ON DELETE SET NULL,
  legal_hold_id uuid REFERENCES public.legal_holds(id) ON DELETE SET NULL,
  incident_id uuid,
  support_ticket_id uuid,
  session_id uuid,
  title text NOT NULL,
  description text,
  bundle_type text NOT NULL DEFAULT 'custom',
  status text NOT NULL DEFAULT 'draft',
  sensitivity_level text NOT NULL DEFAULT 'confidential',
  manifest jsonb NOT NULL DEFAULT '{}',
  created_by uuid,
  finalized_by uuid,
  finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_bundles TO authenticated;
GRANT ALL ON public.evidence_bundles TO service_role;
ALTER TABLE public.evidence_bundles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eb_team_read" ON public.evidence_bundles FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "eb_admin_write" ON public.evidence_bundles FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.evidence_bundle_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  bundle_id uuid NOT NULL REFERENCES public.evidence_bundles(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_id uuid,
  item_title text NOT NULL,
  item_description text,
  item_category text,
  source_table text,
  source_reference jsonb NOT NULL DEFAULT '{}',
  storage_path text,
  checksum_sha256 text,
  included boolean NOT NULL DEFAULT true,
  added_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_bundle_items TO authenticated;
GRANT ALL ON public.evidence_bundle_items TO service_role;
ALTER TABLE public.evidence_bundle_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ebi_team_read" ON public.evidence_bundle_items FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "ebi_admin_write" ON public.evidence_bundle_items FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.chain_of_custody_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  bundle_id uuid REFERENCES public.evidence_bundles(id) ON DELETE SET NULL,
  export_job_id uuid REFERENCES public.audit_export_jobs(id) ON DELETE SET NULL,
  legal_hold_id uuid REFERENCES public.legal_holds(id) ON DELETE SET NULL,
  resource_type text,
  resource_id uuid,
  event_type text NOT NULL,
  actor_id uuid,
  title text NOT NULL,
  description text,
  ip_address inet,
  user_agent text,
  checksum_sha256 text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.chain_of_custody_events TO authenticated;
GRANT ALL ON public.chain_of_custody_events TO service_role;
ALTER TABLE public.chain_of_custody_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coc_team_read" ON public.chain_of_custody_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "coc_service_write" ON public.chain_of_custody_events FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE TABLE public.data_subject_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  request_number text,
  request_type text NOT NULL,
  subject_type text NOT NULL DEFAULT 'user',
  subject_user_id uuid,
  customer_account_id uuid,
  customer_user_id uuid,
  subject_email text,
  status text NOT NULL DEFAULT 'open',
  due_at timestamptz,
  verified_at timestamptz,
  completed_at timestamptz,
  requested_by uuid,
  assigned_to uuid,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_subject_requests TO authenticated;
GRANT ALL ON public.data_subject_requests TO service_role;
ALTER TABLE public.data_subject_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsr_admin_read" ON public.data_subject_requests FOR SELECT TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id));
CREATE POLICY "dsr_admin_write" ON public.data_subject_requests FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.data_subject_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  request_id uuid NOT NULL REFERENCES public.data_subject_requests(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_id uuid,
  action text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  reason text,
  reviewed_by uuid,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_subject_request_items TO authenticated;
GRANT ALL ON public.data_subject_request_items TO service_role;
ALTER TABLE public.data_subject_request_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dsri_admin_read" ON public.data_subject_request_items FOR SELECT TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id));
CREATE POLICY "dsri_admin_write" ON public.data_subject_request_items FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.data_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  request_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending_review',
  resource_type text NOT NULL,
  resource_id uuid,
  data_category text,
  requested_by uuid,
  approved_by uuid,
  rejection_reason text,
  legal_hold_id uuid REFERENCES public.legal_holds(id) ON DELETE SET NULL,
  action text NOT NULL DEFAULT 'soft_delete',
  dry_run_result jsonb NOT NULL DEFAULT '{}',
  execution_result jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.data_deletion_requests TO authenticated;
GRANT ALL ON public.data_deletion_requests TO service_role;
ALTER TABLE public.data_deletion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ddr_admin_read" ON public.data_deletion_requests FOR SELECT TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id));
CREATE POLICY "ddr_admin_write" ON public.data_deletion_requests FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.archive_references (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  data_category text,
  archive_status text NOT NULL DEFAULT 'pending',
  archive_location text,
  archive_provider text NOT NULL DEFAULT 'internal',
  storage_path text,
  checksum_sha256 text,
  size_bytes bigint,
  archived_by uuid,
  archived_at timestamptz,
  restore_requested_at timestamptz,
  restored_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.archive_references TO authenticated;
GRANT ALL ON public.archive_references TO service_role;
ALTER TABLE public.archive_references ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ar_team_read" ON public.archive_references FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "ar_admin_write" ON public.archive_references FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TABLE public.compliance_evidence_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  output jsonb NOT NULL DEFAULT '{}',
  artifact_id uuid,
  requested_by uuid,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_evidence_reports TO authenticated;
GRANT ALL ON public.compliance_evidence_reports TO service_role;
ALTER TABLE public.compliance_evidence_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cer_team_read" ON public.compliance_evidence_reports FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "cer_admin_write" ON public.compliance_evidence_reports FOR ALL TO authenticated USING (public.is_data_governance_manager(auth.uid(), team_id)) WITH CHECK (public.is_data_governance_manager(auth.uid(), team_id));

CREATE TRIGGER trg_drp_updated BEFORE UPDATE ON public.data_retention_policies FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_lh_updated BEFORE UPDATE ON public.legal_holds FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_lhr_updated BEFORE UPDATE ON public.legal_hold_resources FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_aev_updated BEFORE UPDATE ON public.audit_export_vaults FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_aej_updated BEFORE UPDATE ON public.audit_export_jobs FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_eb_updated BEFORE UPDATE ON public.evidence_bundles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_dsr_updated BEFORE UPDATE ON public.data_subject_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_dsri_updated BEFORE UPDATE ON public.data_subject_request_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ddr_updated BEFORE UPDATE ON public.data_deletion_requests FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_ar_updated BEFORE UPDATE ON public.archive_references FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_cer_updated BEFORE UPDATE ON public.compliance_evidence_reports FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_drp_team_cat ON public.data_retention_policies(team_id, data_category, enabled);
CREATE INDEX idx_dre_team_policy ON public.data_retention_evaluations(team_id, policy_id, evaluated_at DESC);
CREATE INDEX idx_dre_team_decision ON public.data_retention_evaluations(team_id, decision, evaluated_at DESC);
CREATE INDEX idx_lh_team_status ON public.legal_holds(team_id, status, created_at DESC);
CREATE INDEX idx_lhr_team_hold ON public.legal_hold_resources(team_id, legal_hold_id, resource_type);
CREATE INDEX idx_lhr_team_resource ON public.legal_hold_resources(team_id, resource_type, resource_id);
CREATE INDEX idx_aev_team_status ON public.audit_export_vaults(team_id, status);
CREATE INDEX idx_aej_team_status ON public.audit_export_jobs(team_id, status, created_at DESC);
CREATE INDEX idx_eb_team_status ON public.evidence_bundles(team_id, status, created_at DESC);
CREATE INDEX idx_ebi_team_bundle ON public.evidence_bundle_items(team_id, bundle_id);
CREATE INDEX idx_coc_team_created ON public.chain_of_custody_events(team_id, created_at DESC);
CREATE INDEX idx_coc_team_bundle ON public.chain_of_custody_events(team_id, bundle_id, created_at DESC);
CREATE INDEX idx_dsr_team_status ON public.data_subject_requests(team_id, status, due_at);
CREATE INDEX idx_dsri_team_request ON public.data_subject_request_items(team_id, request_id);
CREATE INDEX idx_ddr_team_status ON public.data_deletion_requests(team_id, status, created_at DESC);
CREATE INDEX idx_ar_team_resource ON public.archive_references(team_id, resource_type, resource_id);
CREATE INDEX idx_cer_team_status ON public.compliance_evidence_reports(team_id, status, created_at DESC);