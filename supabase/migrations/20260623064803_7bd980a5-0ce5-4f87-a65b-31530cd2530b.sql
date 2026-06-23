
CREATE OR REPLACE FUNCTION public.is_trust_center_manager(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id AND role IN ('owner','admin')
  );
$$;

CREATE TABLE public.trust_centers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  partner_id uuid, brand_profile_id uuid,
  trust_center_key text NOT NULL UNIQUE,
  name text NOT NULL, description text,
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'public',
  brand_name text, logo_url text, primary_color text,
  support_email text, security_email text, privacy_email text,
  trust_url text, custom_domain_id uuid, public_summary text,
  created_by uuid, activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trust_centers TO authenticated;
GRANT SELECT ON public.trust_centers TO anon;
GRANT ALL ON public.trust_centers TO service_role;
ALTER TABLE public.trust_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tc_select_member" ON public.trust_centers FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "tc_select_public" ON public.trust_centers FOR SELECT TO anon
  USING (status='active' AND visibility='public');
CREATE POLICY "tc_manage" ON public.trust_centers FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.status_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  partner_id uuid,
  trust_center_id uuid REFERENCES public.trust_centers(id) ON DELETE SET NULL,
  status_page_key text NOT NULL UNIQUE,
  name text NOT NULL, description text,
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'public',
  custom_domain_id uuid, brand_profile_id uuid,
  show_uptime_metrics boolean NOT NULL DEFAULT true,
  show_incident_history boolean NOT NULL DEFAULT true,
  show_component_history boolean NOT NULL DEFAULT true,
  show_maintenance boolean NOT NULL DEFAULT true,
  public_subscribe_enabled boolean NOT NULL DEFAULT false,
  created_by uuid, activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.status_pages TO authenticated;
GRANT SELECT ON public.status_pages TO anon;
GRANT ALL ON public.status_pages TO service_role;
ALTER TABLE public.status_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sp_select_member" ON public.status_pages FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "sp_select_public" ON public.status_pages FOR SELECT TO anon
  USING (status='active' AND visibility='public');
CREATE POLICY "sp_manage" ON public.status_pages FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.status_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  status_page_id uuid NOT NULL REFERENCES public.status_pages(id) ON DELETE CASCADE,
  observability_service_id uuid,
  component_key text NOT NULL,
  name text NOT NULL, description text,
  category text NOT NULL DEFAULT 'platform',
  status text NOT NULL DEFAULT 'operational',
  region_id uuid, sort_order integer NOT NULL DEFAULT 100,
  public_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (status_page_id, component_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.status_components TO authenticated;
GRANT SELECT ON public.status_components TO anon;
GRANT ALL ON public.status_components TO service_role;
ALTER TABLE public.status_components ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sc_select_member" ON public.status_components FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "sc_select_public" ON public.status_components FOR SELECT TO anon
  USING (public_visible AND EXISTS (SELECT 1 FROM public.status_pages sp WHERE sp.id=status_page_id AND sp.status='active' AND sp.visibility='public'));
CREATE POLICY "sc_manage" ON public.status_components FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.public_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  status_page_id uuid NOT NULL REFERENCES public.status_pages(id) ON DELETE CASCADE,
  source_incident_id uuid,
  title text NOT NULL, public_summary text,
  status text NOT NULL DEFAULT 'investigating',
  severity text NOT NULL DEFAULT 'minor',
  impact text NOT NULL DEFAULT 'minor',
  affected_component_ids uuid[] NOT NULL DEFAULT '{}',
  customer_visible boolean NOT NULL DEFAULT true,
  started_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz, postmortem_url text,
  created_by uuid, approved_by uuid, published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_incidents TO authenticated;
GRANT SELECT ON public.public_incidents TO anon;
GRANT ALL ON public.public_incidents TO service_role;
ALTER TABLE public.public_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pi_select_member" ON public.public_incidents FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "pi_select_public" ON public.public_incidents FOR SELECT TO anon
  USING (published_at IS NOT NULL AND customer_visible);
CREATE POLICY "pi_manage" ON public.public_incidents FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.public_incident_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  public_incident_id uuid NOT NULL REFERENCES public.public_incidents(id) ON DELETE CASCADE,
  update_status text NOT NULL, title text, message text NOT NULL,
  visibility text NOT NULL DEFAULT 'public',
  created_by uuid, approved_by uuid, published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_incident_updates TO authenticated;
GRANT SELECT ON public.public_incident_updates TO anon;
GRANT ALL ON public.public_incident_updates TO service_role;
ALTER TABLE public.public_incident_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "piu_select_member" ON public.public_incident_updates FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "piu_select_public" ON public.public_incident_updates FOR SELECT TO anon
  USING (published_at IS NOT NULL AND visibility='public');
CREATE POLICY "piu_manage" ON public.public_incident_updates FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.scheduled_maintenance_windows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  status_page_id uuid NOT NULL REFERENCES public.status_pages(id) ON DELETE CASCADE,
  title text NOT NULL, description text,
  status text NOT NULL DEFAULT 'scheduled',
  affected_component_ids uuid[] NOT NULL DEFAULT '{}',
  scheduled_start timestamptz NOT NULL,
  scheduled_end timestamptz NOT NULL,
  actual_start timestamptz, actual_end timestamptz,
  customer_impact text NOT NULL DEFAULT 'none',
  created_by uuid, approved_by uuid, published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.scheduled_maintenance_windows TO authenticated;
GRANT SELECT ON public.scheduled_maintenance_windows TO anon;
GRANT ALL ON public.scheduled_maintenance_windows TO service_role;
ALTER TABLE public.scheduled_maintenance_windows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "smw_select_member" ON public.scheduled_maintenance_windows FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "smw_select_public" ON public.scheduled_maintenance_windows FOR SELECT TO anon
  USING (published_at IS NOT NULL);
CREATE POLICY "smw_manage" ON public.scheduled_maintenance_windows FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.uptime_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  status_page_id uuid NOT NULL REFERENCES public.status_pages(id) ON DELETE CASCADE,
  component_id uuid REFERENCES public.status_components(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL, period_end timestamptz NOT NULL,
  uptime_percent numeric,
  degraded_minutes integer NOT NULL DEFAULT 0,
  outage_minutes integer NOT NULL DEFAULT 0,
  maintenance_minutes integer NOT NULL DEFAULT 0,
  incident_count integer NOT NULL DEFAULT 0,
  calculation_source text NOT NULL DEFAULT 'observability',
  status text NOT NULL DEFAULT 'current',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.uptime_summaries TO authenticated;
GRANT SELECT ON public.uptime_summaries TO anon;
GRANT ALL ON public.uptime_summaries TO service_role;
ALTER TABLE public.uptime_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "us_select_member" ON public.uptime_summaries FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "us_select_public" ON public.uptime_summaries FOR SELECT TO anon
  USING (EXISTS (SELECT 1 FROM public.status_pages sp WHERE sp.id=status_page_id AND sp.status='active' AND sp.visibility='public' AND sp.show_uptime_metrics));
CREATE POLICY "us_manage" ON public.uptime_summaries FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.compliance_frameworks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_key text NOT NULL UNIQUE,
  name text NOT NULL, description text,
  category text NOT NULL DEFAULT 'security',
  status text NOT NULL DEFAULT 'available',
  official_url text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.compliance_frameworks TO authenticated, anon;
GRANT ALL ON public.compliance_frameworks TO service_role;
ALTER TABLE public.compliance_frameworks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cf_read_all" ON public.compliance_frameworks FOR SELECT TO authenticated, anon USING (true);

INSERT INTO public.compliance_frameworks (framework_key, name, description, category) VALUES
  ('soc2_type2','SOC 2 Type II (placeholder)','SOC 2 Type II readiness placeholder. Real reports must be uploaded and approved.','security'),
  ('iso_27001','ISO 27001 (placeholder)','ISO 27001 readiness placeholder. Certification not implied.','security'),
  ('gdpr','GDPR readiness','General Data Protection Regulation readiness controls and mappings.','privacy'),
  ('ccpa','CCPA/CPRA readiness','California consumer privacy readiness controls and mappings.','privacy'),
  ('hipaa','HIPAA (placeholder)','HIPAA readiness placeholder. No certification implied.','industry'),
  ('pci_dss','PCI DSS (placeholder)','PCI DSS readiness placeholder.','industry'),
  ('csa_star','CSA STAR (placeholder)','Cloud Security Alliance STAR readiness placeholder.','security'),
  ('iso_27701','ISO 27701 (placeholder)','Privacy information management readiness placeholder.','privacy'),
  ('nist_csf','NIST CSF mapping','NIST Cybersecurity Framework control mapping.','security'),
  ('cis_controls','CIS Controls mapping','Center for Internet Security controls mapping.','security');

CREATE TABLE public.compliance_controls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  framework_id uuid REFERENCES public.compliance_frameworks(id) ON DELETE SET NULL,
  control_key text NOT NULL, title text NOT NULL, description text,
  control_domain text, status text NOT NULL DEFAULT 'not_started',
  owner_user_id uuid, evidence_summary text,
  public_visible boolean NOT NULL DEFAULT false,
  last_reviewed_at timestamptz, next_review_due_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}', created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.compliance_controls TO authenticated;
GRANT SELECT ON public.compliance_controls TO anon;
GRANT ALL ON public.compliance_controls TO service_role;
ALTER TABLE public.compliance_controls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cc_select_member" ON public.compliance_controls FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "cc_select_public" ON public.compliance_controls FOR SELECT TO anon
  USING (public_visible);
CREATE POLICY "cc_manage" ON public.compliance_controls FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.trust_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  trust_center_id uuid REFERENCES public.trust_centers(id) ON DELETE CASCADE,
  title text NOT NULL, description text,
  document_type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'gated',
  file_name text, storage_bucket text, storage_path text, external_url text,
  version text, effective_date date, expiry_date date,
  checksum_sha256 text,
  sensitivity_level text NOT NULL DEFAULT 'confidential',
  approved_by uuid, approved_at timestamptz, published_at timestamptz,
  created_by uuid, metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trust_documents TO authenticated;
GRANT SELECT ON public.trust_documents TO anon;
GRANT ALL ON public.trust_documents TO service_role;
ALTER TABLE public.trust_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "td_select_member" ON public.trust_documents FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "td_select_public" ON public.trust_documents FOR SELECT TO anon
  USING (visibility='public' AND status='published' AND published_at IS NOT NULL);
CREATE POLICY "td_manage" ON public.trust_documents FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.trust_document_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  trust_center_id uuid REFERENCES public.trust_centers(id) ON DELETE CASCADE,
  document_id uuid REFERENCES public.trust_documents(id) ON DELETE SET NULL,
  requester_name text NOT NULL, requester_email text NOT NULL,
  requester_company text, requester_title text, purpose text,
  status text NOT NULL DEFAULT 'pending',
  access_token_hash text, expires_at timestamptz,
  reviewed_by uuid, reviewed_at timestamptz, decision_note text,
  ip_address inet, user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.trust_document_access_requests TO authenticated;
GRANT ALL ON public.trust_document_access_requests TO service_role;
ALTER TABLE public.trust_document_access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdar_select_manager" ON public.trust_document_access_requests FOR SELECT TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));
CREATE POLICY "tdar_manage" ON public.trust_document_access_requests FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.trust_document_access_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  request_id uuid REFERENCES public.trust_document_access_requests(id) ON DELETE SET NULL,
  document_id uuid REFERENCES public.trust_documents(id) ON DELETE SET NULL,
  requester_email text, event_type text NOT NULL,
  ip_address inet, user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trust_document_access_events TO authenticated;
GRANT ALL ON public.trust_document_access_events TO service_role;
ALTER TABLE public.trust_document_access_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tdae_select_manager" ON public.trust_document_access_events FOR SELECT TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.subprocessor_register (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  trust_center_id uuid REFERENCES public.trust_centers(id) ON DELETE CASCADE,
  vendor_name text NOT NULL, description text,
  service_category text NOT NULL,
  data_processed text[] NOT NULL DEFAULT '{}',
  countries text[] NOT NULL DEFAULT '{}',
  region_ids uuid[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  dpa_status text NOT NULL DEFAULT 'unknown',
  website_url text, privacy_url text, security_url text,
  added_at date, removed_at date,
  public_visible boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subprocessor_register TO authenticated;
GRANT SELECT ON public.subprocessor_register TO anon;
GRANT ALL ON public.subprocessor_register TO service_role;
ALTER TABLE public.subprocessor_register ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sub_select_member" ON public.subprocessor_register FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "sub_select_public" ON public.subprocessor_register FOR SELECT TO anon
  USING (public_visible AND status='active');
CREATE POLICY "sub_manage" ON public.subprocessor_register FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.security_questionnaire_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  template_key text NOT NULL, name text NOT NULL, description text,
  category text NOT NULL DEFAULT 'security',
  questions jsonb NOT NULL DEFAULT '[]',
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_questionnaire_templates TO authenticated;
GRANT ALL ON public.security_questionnaire_templates TO service_role;
ALTER TABLE public.security_questionnaire_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sqt_select_member" ON public.security_questionnaire_templates FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "sqt_manage" ON public.security_questionnaire_templates FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.security_questionnaire_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  trust_center_id uuid REFERENCES public.trust_centers(id) ON DELETE CASCADE,
  question_key text NOT NULL, question text NOT NULL, answer text NOT NULL,
  category text NOT NULL DEFAULT 'security',
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'gated',
  approved_by uuid, approved_at timestamptz, last_reviewed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.security_questionnaire_responses TO authenticated;
GRANT SELECT ON public.security_questionnaire_responses TO anon;
GRANT ALL ON public.security_questionnaire_responses TO service_role;
ALTER TABLE public.security_questionnaire_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sqr_select_member" ON public.security_questionnaire_responses FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "sqr_select_public" ON public.security_questionnaire_responses FOR SELECT TO anon
  USING (visibility='public' AND status='published');
CREATE POLICY "sqr_manage" ON public.security_questionnaire_responses FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.trust_access_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  trust_center_id uuid NOT NULL REFERENCES public.trust_centers(id) ON DELETE CASCADE,
  name text NOT NULL, policy_type text NOT NULL,
  rules jsonb NOT NULL DEFAULT '{}',
  enabled boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 100,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trust_access_policies TO authenticated;
GRANT ALL ON public.trust_access_policies TO service_role;
ALTER TABLE public.trust_access_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tap_select_member" ON public.trust_access_policies FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "tap_manage" ON public.trust_access_policies FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE TABLE public.trust_center_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  trust_center_id uuid REFERENCES public.trust_centers(id) ON DELETE SET NULL,
  status_page_id uuid REFERENCES public.status_pages(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL, description text,
  actor_id uuid, resource_type text, resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.trust_center_audit_events TO authenticated;
GRANT ALL ON public.trust_center_audit_events TO service_role;
ALTER TABLE public.trust_center_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tcae_select_member" ON public.trust_center_audit_events FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.trust_center_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  trust_center_id uuid REFERENCES public.trust_centers(id) ON DELETE SET NULL,
  report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}',
  output jsonb NOT NULL DEFAULT '{}',
  artifact_id uuid, requested_by uuid, error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.trust_center_reports TO authenticated;
GRANT ALL ON public.trust_center_reports TO service_role;
ALTER TABLE public.trust_center_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tcr_select_member" ON public.trust_center_reports FOR SELECT TO authenticated
  USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "tcr_manage" ON public.trust_center_reports FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_trust_center_manager(auth.uid(), team_id));

CREATE INDEX idx_trust_centers_team_status ON public.trust_centers(team_id, status);
CREATE INDEX idx_trust_centers_key ON public.trust_centers(trust_center_key);
CREATE INDEX idx_status_pages_team_status ON public.status_pages(team_id, status);
CREATE INDEX idx_status_pages_key ON public.status_pages(status_page_key);
CREATE INDEX idx_status_components_page ON public.status_components(status_page_id, public_visible, sort_order);
CREATE INDEX idx_public_incidents_page ON public.public_incidents(status_page_id, status, started_at DESC);
CREATE INDEX idx_public_incident_updates_incident ON public.public_incident_updates(public_incident_id, published_at DESC);
CREATE INDEX idx_smw_page ON public.scheduled_maintenance_windows(status_page_id, scheduled_start, status);
CREATE INDEX idx_uptime_summaries_page ON public.uptime_summaries(status_page_id, period_start, period_end);
CREATE INDEX idx_compliance_controls_team ON public.compliance_controls(team_id, status, public_visible);
CREATE INDEX idx_trust_documents_team ON public.trust_documents(team_id, trust_center_id, status, visibility);
CREATE INDEX idx_trust_documents_type ON public.trust_documents(document_type, status);
CREATE INDEX idx_tdar_team ON public.trust_document_access_requests(team_id, status, created_at DESC);
CREATE INDEX idx_tdae_doc ON public.trust_document_access_events(document_id, created_at DESC);
CREATE INDEX idx_subprocessors_team ON public.subprocessor_register(team_id, trust_center_id, status, public_visible);
CREATE INDEX idx_sqr_team ON public.security_questionnaire_responses(team_id, trust_center_id, status, visibility);
CREATE INDEX idx_tap_tc ON public.trust_access_policies(trust_center_id, enabled, priority);
CREATE INDEX idx_tcae_team ON public.trust_center_audit_events(team_id, created_at DESC);
CREATE INDEX idx_tcr_team ON public.trust_center_reports(team_id, status, created_at DESC);

CREATE TRIGGER trg_tc_updated BEFORE UPDATE ON public.trust_centers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sp_updated BEFORE UPDATE ON public.status_pages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sc_updated BEFORE UPDATE ON public.status_components FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_pi_updated BEFORE UPDATE ON public.public_incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_piu_updated BEFORE UPDATE ON public.public_incident_updates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_smw_updated BEFORE UPDATE ON public.scheduled_maintenance_windows FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_us_updated BEFORE UPDATE ON public.uptime_summaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cf_updated BEFORE UPDATE ON public.compliance_frameworks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_cc_updated BEFORE UPDATE ON public.compliance_controls FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_td_updated BEFORE UPDATE ON public.trust_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tdar_updated BEFORE UPDATE ON public.trust_document_access_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sub_updated BEFORE UPDATE ON public.subprocessor_register FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sqt_updated BEFORE UPDATE ON public.security_questionnaire_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_sqr_updated BEFORE UPDATE ON public.security_questionnaire_responses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tap_updated BEFORE UPDATE ON public.trust_access_policies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tcr_updated BEFORE UPDATE ON public.trust_center_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
