
CREATE TABLE public.session_recording_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  started_by uuid,
  recording_status text NOT NULL DEFAULT 'not_recorded' CHECK (recording_status IN ('not_recorded','pending','recording','processing','available','failed','expired','deleted')),
  recording_mode text NOT NULL DEFAULT 'metadata_only' CHECK (recording_mode IN ('metadata_only','full_video','screenshots','event_timeline','client_side')),
  storage_bucket text,
  storage_path text,
  file_name text,
  file_size_bytes bigint,
  duration_seconds integer,
  checksum text,
  encryption_status text NOT NULL DEFAULT 'unknown' CHECK (encryption_status IN ('unknown','encrypted','unencrypted','not_applicable')),
  retention_until timestamptz,
  available_at timestamptz,
  deleted_at timestamptz,
  failure_reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.session_recording_metadata TO authenticated;
GRANT ALL ON public.session_recording_metadata TO service_role;
ALTER TABLE public.session_recording_metadata ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srm_select" ON public.session_recording_metadata FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "srm_manage" ON public.session_recording_metadata FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TABLE public.session_timeline_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  user_id uuid,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('debug','info','warning','critical')),
  title text NOT NULL,
  description text,
  timestamp_at timestamptz NOT NULL DEFAULT now(),
  offset_seconds integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.session_timeline_events TO authenticated;
GRANT ALL ON public.session_timeline_events TO service_role;
ALTER TABLE public.session_timeline_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ste_select" ON public.session_timeline_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.session_quality_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  latency_ms integer,
  packet_loss numeric,
  jitter_ms integer,
  fps numeric,
  bandwidth_kbps integer,
  cpu_load numeric,
  memory_load numeric,
  connection_quality text NOT NULL DEFAULT 'unknown' CHECK (connection_quality IN ('excellent','good','fair','poor','unknown')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.session_quality_metrics TO authenticated;
GRANT ALL ON public.session_quality_metrics TO service_role;
ALTER TABLE public.session_quality_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sqm_select" ON public.session_quality_metrics FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.session_consent_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  requested_by uuid,
  responded_by uuid,
  consent_type text NOT NULL CHECK (consent_type IN ('remote_access','recording','file_transfer','clipboard','elevation','unattended_access')),
  status text NOT NULL CHECK (status IN ('requested','granted','denied','expired','not_required')),
  request_message text,
  response_message text,
  requested_at timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.session_consent_events TO authenticated;
GRANT ALL ON public.session_consent_events TO service_role;
ALTER TABLE public.session_consent_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sce_select" ON public.session_consent_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.session_file_transfer_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  user_id uuid,
  direction text NOT NULL CHECK (direction IN ('upload','download')),
  file_name text,
  file_extension text,
  file_size_bytes bigint,
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','allowed','blocked','completed','failed','canceled')),
  policy_decision text,
  reason text,
  checksum text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.session_file_transfer_events TO authenticated;
GRANT ALL ON public.session_file_transfer_events TO service_role;
ALTER TABLE public.session_file_transfer_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sfte_select" ON public.session_file_transfer_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

-- clipboard events: METADATA ONLY (no content column)
CREATE TABLE public.session_clipboard_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  user_id uuid,
  direction text NOT NULL CHECK (direction IN ('local_to_remote','remote_to_local')),
  content_type text NOT NULL DEFAULT 'text',
  content_length integer,
  status text NOT NULL DEFAULT 'allowed' CHECK (status IN ('allowed','blocked','warned')),
  policy_decision text,
  sensitive_pattern_detected boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.session_clipboard_events TO authenticated;
GRANT ALL ON public.session_clipboard_events TO service_role;
ALTER TABLE public.session_clipboard_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sclip_select" ON public.session_clipboard_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.session_compliance_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_id uuid NOT NULL REFERENCES public.sessions(id) ON DELETE CASCADE,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  check_key text NOT NULL,
  check_name text NOT NULL,
  status text NOT NULL CHECK (status IN ('passed','failed','warning','skipped','not_applicable')),
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  evidence jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommendation text,
  checked_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.session_compliance_checks TO authenticated;
GRANT ALL ON public.session_compliance_checks TO service_role;
ALTER TABLE public.session_compliance_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scc_select" ON public.session_compliance_checks FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.compliance_report_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('session_summary','compliance_audit','device_activity','operator_activity','policy_violations','security_review','monthly_compliance')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','success','failed')),
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
GRANT SELECT, INSERT ON public.compliance_report_runs TO authenticated;
GRANT ALL ON public.compliance_report_runs TO service_role;
ALTER TABLE public.compliance_report_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "crr_select" ON public.compliance_report_runs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "crr_insert" ON public.compliance_report_runs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TABLE public.session_report_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  report_run_id uuid REFERENCES public.compliance_report_runs(id) ON DELETE SET NULL,
  session_id uuid REFERENCES public.sessions(id) ON DELETE SET NULL,
  export_type text NOT NULL CHECK (export_type IN ('json','csv','pdf_placeholder','audit_bundle')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','ready','failed','expired')),
  storage_path text,
  content jsonb,
  size_bytes bigint,
  expires_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.session_report_exports TO authenticated;
GRANT ALL ON public.session_report_exports TO service_role;
ALTER TABLE public.session_report_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sre_select" ON public.session_report_exports FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "sre_insert" ON public.session_report_exports FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

-- Indexes
CREATE INDEX idx_srm_team_session ON public.session_recording_metadata(team_id, session_id);
CREATE INDEX idx_srm_team_status_created ON public.session_recording_metadata(team_id, recording_status, created_at DESC);
CREATE INDEX idx_ste_team_session_ts ON public.session_timeline_events(team_id, session_id, timestamp_at DESC);
CREATE INDEX idx_ste_team_type_ts ON public.session_timeline_events(team_id, event_type, timestamp_at DESC);
CREATE INDEX idx_sqm_team_session_captured ON public.session_quality_metrics(team_id, session_id, captured_at DESC);
CREATE INDEX idx_sce_team_session_created ON public.session_consent_events(team_id, session_id, created_at DESC);
CREATE INDEX idx_sfte_team_session_created ON public.session_file_transfer_events(team_id, session_id, created_at DESC);
CREATE INDEX idx_sclip_team_session_created ON public.session_clipboard_events(team_id, session_id, created_at DESC);
CREATE INDEX idx_scc_team_session ON public.session_compliance_checks(team_id, session_id);
CREATE INDEX idx_scc_team_status_severity ON public.session_compliance_checks(team_id, status, severity, checked_at DESC);
CREATE INDEX idx_crr_team_status_created ON public.compliance_report_runs(team_id, status, created_at DESC);
CREATE INDEX idx_sre_team_created ON public.session_report_exports(team_id, created_at DESC);
CREATE INDEX idx_sre_session_created ON public.session_report_exports(session_id, created_at DESC);

-- updated_at triggers
CREATE TRIGGER trg_srm_updated BEFORE UPDATE ON public.session_recording_metadata FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_crr_updated BEFORE UPDATE ON public.compliance_report_runs FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_sre_updated BEFORE UPDATE ON public.session_report_exports FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
