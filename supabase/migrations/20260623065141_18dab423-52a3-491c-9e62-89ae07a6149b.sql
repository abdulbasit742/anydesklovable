
CREATE OR REPLACE FUNCTION public.is_mobile_admin(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = _team_id AND user_id = _user_id AND role IN ('owner','admin')
  );
$$;

CREATE TABLE public.mobile_app_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, user_id uuid,
  mobile_device_id uuid, installation_key text, platform text NOT NULL DEFAULT 'unknown',
  app_version text, build_number text, device_model text, os_version text,
  push_provider text, push_token_reference text, push_enabled boolean DEFAULT false,
  status text NOT NULL DEFAULT 'pending', last_seen_at timestamptz, last_sync_at timestamptz,
  enrolled_by uuid, metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_app_installations TO authenticated;
GRANT ALL ON public.mobile_app_installations TO service_role;
ALTER TABLE public.mobile_app_installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mai_select" ON public.mobile_app_installations FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "mai_admin" ON public.mobile_app_installations FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));

CREATE TABLE public.mobile_enrollment_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, user_id uuid, email text,
  token_hash text NOT NULL, display_code text, purpose text NOT NULL DEFAULT 'technician_app',
  status text NOT NULL DEFAULT 'pending', expires_at timestamptz NOT NULL,
  claimed_at timestamptz, claimed_by uuid, created_by uuid, metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_enrollment_tokens TO authenticated;
GRANT ALL ON public.mobile_enrollment_tokens TO service_role;
ALTER TABLE public.mobile_enrollment_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "met_admin" ON public.mobile_enrollment_tokens FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));

CREATE TABLE public.mobile_access_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, name text NOT NULL,
  description text, profile_type text NOT NULL DEFAULT 'technician', status text NOT NULL DEFAULT 'active',
  allowed_actions text[] NOT NULL DEFAULT '{}', restricted_actions text[] NOT NULL DEFAULT '{}',
  require_mfa boolean DEFAULT true, require_trusted_device boolean DEFAULT true,
  allow_offline_mode boolean DEFAULT false, allow_push_notifications boolean DEFAULT true,
  allow_location_checkins boolean DEFAULT false, allow_mobile_session_approval boolean DEFAULT true,
  allow_file_attachment_upload boolean DEFAULT true, allow_customer_contact_access boolean DEFAULT false,
  max_offline_items integer DEFAULT 50, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_access_profiles TO authenticated;
GRANT ALL ON public.mobile_access_profiles TO service_role;
ALTER TABLE public.mobile_access_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "map_select" ON public.mobile_access_profiles FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "map_admin" ON public.mobile_access_profiles FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));

CREATE TABLE public.mobile_access_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, access_profile_id uuid NOT NULL,
  user_id uuid, team_member_id uuid, partner_member_id uuid,
  assignment_type text NOT NULL DEFAULT 'user', status text NOT NULL DEFAULT 'active',
  assigned_by uuid, expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_access_assignments TO authenticated;
GRANT ALL ON public.mobile_access_assignments TO service_role;
ALTER TABLE public.mobile_access_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maa_select" ON public.mobile_access_assignments FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "maa_admin" ON public.mobile_access_assignments FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));

CREATE TABLE public.field_service_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_number text,
  title text NOT NULL, description text, job_type text NOT NULL DEFAULT 'support_visit',
  status text NOT NULL DEFAULT 'draft', priority text NOT NULL DEFAULT 'normal',
  customer_account_id uuid, customer_user_id uuid, device_id uuid, support_ticket_id uuid,
  session_id uuid, assigned_to uuid, partner_id uuid, client_team_id uuid,
  scheduled_start timestamptz, scheduled_end timestamptz, actual_start timestamptz, actual_end timestamptz,
  location_label text, location_metadata jsonb NOT NULL DEFAULT '{}',
  instructions text, completion_summary text, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_service_jobs TO authenticated;
GRANT ALL ON public.field_service_jobs TO service_role;
ALTER TABLE public.field_service_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fsj_select" ON public.field_service_jobs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "fsj_admin" ON public.field_service_jobs FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));
CREATE POLICY "fsj_tech_update" ON public.field_service_jobs FOR UPDATE TO authenticated USING (assigned_to = auth.uid()) WITH CHECK (assigned_to = auth.uid());

CREATE TABLE public.field_job_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_id uuid,
  template_key text, title text NOT NULL, checklist_type text NOT NULL DEFAULT 'job',
  items jsonb NOT NULL DEFAULT '[]', status text NOT NULL DEFAULT 'active',
  created_by uuid, completed_by uuid, completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_job_checklists TO authenticated;
GRANT ALL ON public.field_job_checklists TO service_role;
ALTER TABLE public.field_job_checklists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fjc_select" ON public.field_job_checklists FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "fjc_manage" ON public.field_job_checklists FOR ALL TO authenticated USING (public.is_team_member(auth.uid(), team_id)) WITH CHECK (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.field_job_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_id uuid NOT NULL,
  update_type text NOT NULL, title text, message text, old_status text, new_status text,
  actor_id uuid, mobile_installation_id uuid, source text NOT NULL DEFAULT 'dashboard',
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_job_updates TO authenticated;
GRANT ALL ON public.field_job_updates TO service_role;
ALTER TABLE public.field_job_updates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fju_select" ON public.field_job_updates FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "fju_insert" ON public.field_job_updates FOR INSERT TO authenticated WITH CHECK (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.field_job_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_id uuid NOT NULL,
  uploaded_by uuid, file_name text NOT NULL, mime_type text, size_bytes bigint,
  storage_bucket text, storage_path text, attachment_type text NOT NULL DEFAULT 'photo',
  visibility text NOT NULL DEFAULT 'internal', status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_job_attachments TO authenticated;
GRANT ALL ON public.field_job_attachments TO service_role;
ALTER TABLE public.field_job_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fja_select" ON public.field_job_attachments FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "fja_manage" ON public.field_job_attachments FOR ALL TO authenticated USING (public.is_team_member(auth.uid(), team_id)) WITH CHECK (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.field_visit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, job_id uuid, user_id uuid,
  customer_account_id uuid, device_id uuid, visit_type text NOT NULL DEFAULT 'field_visit',
  status text NOT NULL DEFAULT 'started', checkin_at timestamptz NOT NULL DEFAULT now(),
  checkout_at timestamptz, location_label text, location_accuracy_meters integer,
  location_source text NOT NULL DEFAULT 'manual', latitude_rounded numeric, longitude_rounded numeric,
  notes text, metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.field_visit_logs TO authenticated;
GRANT ALL ON public.field_visit_logs TO service_role;
ALTER TABLE public.field_visit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fvl_select" ON public.field_visit_logs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "fvl_manage" ON public.field_visit_logs FOR ALL TO authenticated USING (public.is_team_member(auth.uid(), team_id)) WITH CHECK (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.mobile_push_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, installation_id uuid NOT NULL,
  user_id uuid, channel_type text NOT NULL DEFAULT 'push', provider text NOT NULL DEFAULT 'unknown',
  status text NOT NULL DEFAULT 'active', token_reference text, preferences jsonb NOT NULL DEFAULT '{}',
  last_test_at timestamptz, last_error_message text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_push_channels TO authenticated;
GRANT ALL ON public.mobile_push_channels TO service_role;
ALTER TABLE public.mobile_push_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mpc_select" ON public.mobile_push_channels FOR SELECT TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id) OR user_id = auth.uid());
CREATE POLICY "mpc_admin" ON public.mobile_push_channels FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));

CREATE TABLE public.mobile_push_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, user_id uuid,
  installation_id uuid, channel_id uuid, notification_id uuid, message_type text NOT NULL,
  title text NOT NULL, body text NOT NULL, deep_link text, payload jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'queued', provider_message_id text, error_message text,
  scheduled_for timestamptz, sent_at timestamptz, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_push_messages TO authenticated;
GRANT ALL ON public.mobile_push_messages TO service_role;
ALTER TABLE public.mobile_push_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mpm_select" ON public.mobile_push_messages FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "mpm_admin" ON public.mobile_push_messages FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));

CREATE TABLE public.mobile_offline_queue_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, user_id uuid,
  installation_id uuid, queue_key text NOT NULL, item_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending', local_created_at timestamptz, server_synced_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}', conflict_reason text, resolution jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_offline_queue_items TO authenticated;
GRANT ALL ON public.mobile_offline_queue_items TO service_role;
ALTER TABLE public.mobile_offline_queue_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "moqi_select" ON public.mobile_offline_queue_items FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_mobile_admin(auth.uid(), team_id));
CREATE POLICY "moqi_manage" ON public.mobile_offline_queue_items FOR ALL TO authenticated USING (user_id = auth.uid() OR public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (user_id = auth.uid() OR public.is_mobile_admin(auth.uid(), team_id));

CREATE TABLE public.mobile_deep_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, link_type text NOT NULL,
  resource_type text, resource_id uuid, deep_link_url text, web_fallback_url text,
  status text NOT NULL DEFAULT 'active', expires_at timestamptz, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_deep_links TO authenticated;
GRANT ALL ON public.mobile_deep_links TO service_role;
ALTER TABLE public.mobile_deep_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mdl_select" ON public.mobile_deep_links FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "mdl_manage" ON public.mobile_deep_links FOR ALL TO authenticated USING (public.is_team_member(auth.uid(), team_id)) WITH CHECK (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.technician_shift_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, user_id uuid NOT NULL,
  schedule_date date NOT NULL, shift_start timestamptz, shift_end timestamptz,
  status text NOT NULL DEFAULT 'available', region_id uuid, service_area text,
  max_jobs integer, notes text, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technician_shift_schedules TO authenticated;
GRANT ALL ON public.technician_shift_schedules TO service_role;
ALTER TABLE public.technician_shift_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tss_select" ON public.technician_shift_schedules FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "tss_admin" ON public.technician_shift_schedules FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));
CREATE POLICY "tss_self_update" ON public.technician_shift_schedules FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.technician_work_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, work_order_number text,
  title text NOT NULL, description text, customer_account_id uuid, support_ticket_id uuid,
  status text NOT NULL DEFAULT 'open', priority text NOT NULL DEFAULT 'normal',
  assigned_to uuid, created_by uuid, due_at timestamptz, completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.technician_work_orders TO authenticated;
GRANT ALL ON public.technician_work_orders TO service_role;
ALTER TABLE public.technician_work_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "two_select" ON public.technician_work_orders FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "two_admin" ON public.technician_work_orders FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));

CREATE TABLE public.mobile_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, user_id uuid,
  installation_id uuid, event_type text NOT NULL, severity text NOT NULL DEFAULT 'info',
  title text NOT NULL, description text, resource_type text, resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.mobile_audit_events TO authenticated;
GRANT ALL ON public.mobile_audit_events TO service_role;
ALTER TABLE public.mobile_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mae_select" ON public.mobile_audit_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.mobile_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), team_id uuid NOT NULL, report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued', title text NOT NULL, filters jsonb NOT NULL DEFAULT '{}',
  output jsonb NOT NULL DEFAULT '{}', artifact_id uuid, requested_by uuid, error_message text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mobile_reports TO authenticated;
GRANT ALL ON public.mobile_reports TO service_role;
ALTER TABLE public.mobile_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mr_select" ON public.mobile_reports FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "mr_admin" ON public.mobile_reports FOR ALL TO authenticated USING (public.is_mobile_admin(auth.uid(), team_id)) WITH CHECK (public.is_mobile_admin(auth.uid(), team_id));

CREATE TRIGGER trg_mai_u BEFORE UPDATE ON public.mobile_app_installations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_met_u BEFORE UPDATE ON public.mobile_enrollment_tokens FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_map_u BEFORE UPDATE ON public.mobile_access_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_maa_u BEFORE UPDATE ON public.mobile_access_assignments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fsj_u BEFORE UPDATE ON public.field_service_jobs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fjc_u BEFORE UPDATE ON public.field_job_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fja_u BEFORE UPDATE ON public.field_job_attachments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_fvl_u BEFORE UPDATE ON public.field_visit_logs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mpc_u BEFORE UPDATE ON public.mobile_push_channels FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mpm_u BEFORE UPDATE ON public.mobile_push_messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_moqi_u BEFORE UPDATE ON public.mobile_offline_queue_items FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_tss_u BEFORE UPDATE ON public.technician_shift_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_two_u BEFORE UPDATE ON public.technician_work_orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mr_u BEFORE UPDATE ON public.mobile_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_mai_team_user_status ON public.mobile_app_installations(team_id, user_id, status);
CREATE INDEX idx_mai_team_lastseen ON public.mobile_app_installations(team_id, last_seen_at DESC);
CREATE INDEX idx_met_team_status_exp ON public.mobile_enrollment_tokens(team_id, status, expires_at);
CREATE INDEX idx_met_token_hash ON public.mobile_enrollment_tokens(token_hash);
CREATE INDEX idx_map_team_status ON public.mobile_access_profiles(team_id, status);
CREATE INDEX idx_maa_team_user_status ON public.mobile_access_assignments(team_id, user_id, status);
CREATE INDEX idx_fsj_team_status_sched ON public.field_service_jobs(team_id, status, scheduled_start);
CREATE INDEX idx_fsj_team_assigned_status ON public.field_service_jobs(team_id, assigned_to, status);
CREATE INDEX idx_fsj_team_ticket ON public.field_service_jobs(team_id, support_ticket_id);
CREATE INDEX idx_fjc_team_job ON public.field_job_checklists(team_id, job_id);
CREATE INDEX idx_fju_team_job_created ON public.field_job_updates(team_id, job_id, created_at DESC);
CREATE INDEX idx_fja_team_job ON public.field_job_attachments(team_id, job_id);
CREATE INDEX idx_fvl_team_job_checkin ON public.field_visit_logs(team_id, job_id, checkin_at DESC);
CREATE INDEX idx_mpc_team_install_status ON public.mobile_push_channels(team_id, installation_id, status);
CREATE INDEX idx_mpm_team_status_created ON public.mobile_push_messages(team_id, status, created_at DESC);
CREATE INDEX idx_moqi_team_status_created ON public.mobile_offline_queue_items(team_id, status, created_at DESC);
CREATE INDEX idx_mdl_team_resource ON public.mobile_deep_links(team_id, resource_type, resource_id);
CREATE INDEX idx_tss_team_user_date ON public.technician_shift_schedules(team_id, user_id, schedule_date);
CREATE INDEX idx_two_team_status_due ON public.technician_work_orders(team_id, status, due_at);
CREATE INDEX idx_mae_team_created ON public.mobile_audit_events(team_id, created_at DESC);
CREATE INDEX idx_mr_team_status_created ON public.mobile_reports(team_id, status, created_at DESC);
