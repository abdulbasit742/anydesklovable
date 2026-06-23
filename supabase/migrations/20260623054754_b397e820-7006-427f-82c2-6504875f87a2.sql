
CREATE TABLE public.policy_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','archived')),
  priority integer NOT NULL DEFAULT 100,
  policy_type text NOT NULL DEFAULT 'remote_access' CHECK (policy_type IN ('remote_access','security','compliance','device','session','custom')),
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  enforcement_mode text NOT NULL DEFAULT 'monitor' CHECK (enforcement_mode IN ('monitor','warn','block','require_approval')),
  created_by uuid, updated_by uuid,
  activated_at timestamptz, archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.policy_profiles TO authenticated;
GRANT ALL ON public.policy_profiles TO service_role;
ALTER TABLE public.policy_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pp_select" ON public.policy_profiles FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "pp_manage" ON public.policy_profiles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TABLE public.device_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL, description text,
  group_type text NOT NULL DEFAULT 'manual' CHECK (group_type IN ('manual','dynamic')),
  dynamic_query jsonb NOT NULL DEFAULT '{}'::jsonb,
  color text, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, name)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_groups TO authenticated;
GRANT ALL ON public.device_groups TO service_role;
ALTER TABLE public.device_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dg_select" ON public.device_groups FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "dg_manage" ON public.device_groups FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TABLE public.device_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  group_id uuid NOT NULL REFERENCES public.device_groups(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  membership_type text NOT NULL DEFAULT 'manual' CHECK (membership_type IN ('manual','dynamic')),
  added_by uuid, added_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (group_id, device_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_group_members TO authenticated;
GRANT ALL ON public.device_group_members TO service_role;
ALTER TABLE public.device_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dgm_select" ON public.device_group_members FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "dgm_manage" ON public.device_group_members FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TABLE public.policy_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  policy_id uuid NOT NULL REFERENCES public.policy_profiles(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('team','device_group','device','role','user')),
  target_id uuid, target_key text,
  priority integer NOT NULL DEFAULT 100,
  enabled boolean NOT NULL DEFAULT true,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.policy_assignments TO authenticated;
GRANT ALL ON public.policy_assignments TO service_role;
ALTER TABLE public.policy_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pa_select" ON public.policy_assignments FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "pa_manage" ON public.policy_assignments FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TABLE public.policy_evaluation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  policy_id uuid REFERENCES public.policy_profiles(id) ON DELETE SET NULL,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  user_id uuid, session_id uuid,
  evaluation_type text NOT NULL CHECK (evaluation_type IN ('device_access','session_start','clipboard','file_transfer','remote_input','security','compliance')),
  decision text NOT NULL CHECK (decision IN ('allow','warn','block','require_approval','monitor')),
  matched_rules jsonb NOT NULL DEFAULT '[]'::jsonb,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.policy_evaluation_results TO authenticated;
GRANT ALL ON public.policy_evaluation_results TO service_role;
ALTER TABLE public.policy_evaluation_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "per_select" ON public.policy_evaluation_results FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

CREATE TABLE public.policy_violations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  policy_id uuid REFERENCES public.policy_profiles(id) ON DELETE SET NULL,
  device_id uuid REFERENCES public.devices(id) ON DELETE SET NULL,
  user_id uuid, session_id uuid,
  severity text NOT NULL DEFAULT 'warning' CHECK (severity IN ('info','warning','critical')),
  violation_type text NOT NULL,
  title text NOT NULL, description text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','acknowledged','resolved','dismissed')),
  detected_at timestamptz NOT NULL DEFAULT now(),
  acknowledged_by uuid, acknowledged_at timestamptz,
  resolved_by uuid, resolved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.policy_violations TO authenticated;
GRANT ALL ON public.policy_violations TO service_role;
ALTER TABLE public.policy_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pv_select" ON public.policy_violations FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "pv_update" ON public.policy_violations FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TABLE public.policy_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  policy_id uuid REFERENCES public.policy_profiles(id) ON DELETE SET NULL,
  request_type text NOT NULL CHECK (request_type IN ('create_policy','update_policy','activate_policy','archive_policy','assign_policy','remove_assignment')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','canceled')),
  requested_by uuid, reviewed_by uuid,
  title text NOT NULL, description text,
  before_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  after_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  decision_note text, decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.policy_change_requests TO authenticated;
GRANT ALL ON public.policy_change_requests TO service_role;
ALTER TABLE public.policy_change_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pcr_select" ON public.policy_change_requests FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "pcr_insert" ON public.policy_change_requests FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (requested_by IS NULL OR requested_by = auth.uid()));
CREATE POLICY "pcr_update" ON public.policy_change_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TABLE public.policy_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL, description text,
  category text NOT NULL,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  recommended_enforcement_mode text NOT NULL DEFAULT 'monitor',
  is_enterprise boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.policy_templates TO authenticated, anon;
GRANT ALL ON public.policy_templates TO service_role;
ALTER TABLE public.policy_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pt_select_all" ON public.policy_templates FOR SELECT TO authenticated, anon USING (true);

CREATE TABLE public.device_policy_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  effective_policy jsonb NOT NULL DEFAULT '{}'::jsonb,
  policy_hash text,
  generated_at timestamptz NOT NULL DEFAULT now(),
  generated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.device_policy_snapshots TO authenticated;
GRANT ALL ON public.device_policy_snapshots TO service_role;
ALTER TABLE public.device_policy_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dps_select" ON public.device_policy_snapshots FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));

CREATE INDEX idx_policy_profiles_team_status ON public.policy_profiles(team_id, status);
CREATE INDEX idx_policy_profiles_team_type ON public.policy_profiles(team_id, policy_type);
CREATE INDEX idx_policy_profiles_team_priority ON public.policy_profiles(team_id, priority);
CREATE INDEX idx_device_groups_team_type ON public.device_groups(team_id, group_type);
CREATE INDEX idx_dgm_team_group ON public.device_group_members(team_id, group_id);
CREATE INDEX idx_dgm_device ON public.device_group_members(device_id);
CREATE INDEX idx_pa_team_target ON public.policy_assignments(team_id, target_type, target_id);
CREATE INDEX idx_pa_policy ON public.policy_assignments(policy_id);
CREATE INDEX idx_per_team_created ON public.policy_evaluation_results(team_id, created_at DESC);
CREATE INDEX idx_per_device_created ON public.policy_evaluation_results(device_id, created_at DESC);
CREATE INDEX idx_per_session_created ON public.policy_evaluation_results(session_id, created_at DESC);
CREATE INDEX idx_pv_team_status ON public.policy_violations(team_id, status, severity, created_at DESC);
CREATE INDEX idx_pv_device_created ON public.policy_violations(device_id, created_at DESC);
CREATE INDEX idx_pcr_team_status ON public.policy_change_requests(team_id, status, created_at DESC);
CREATE INDEX idx_dps_device_generated ON public.device_policy_snapshots(device_id, generated_at DESC);

CREATE TRIGGER trg_pp_updated BEFORE UPDATE ON public.policy_profiles FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_dg_updated BEFORE UPDATE ON public.device_groups FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_pa_updated BEFORE UPDATE ON public.policy_assignments FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_pv_updated BEFORE UPDATE ON public.policy_violations FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER trg_pcr_updated BEFORE UPDATE ON public.policy_change_requests FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.policy_templates (key, name, description, category, rules, recommended_enforcement_mode, is_enterprise) VALUES
('strict_enterprise_remote_access','Strict Enterprise Remote Access','Maximum security: require MFA, trusted devices, local confirmation, and audit everything.','remote_access',
  jsonb_build_object('remote_access', jsonb_build_object('allow_remote_access',true,'require_admin_approval',true,'require_user_confirmation',true,'allow_unattended_access',false,'require_mfa_for_remote_start',true),'clipboard', jsonb_build_object('clipboard_enabled',true,'enforcement_mode','monitor','block_sensitive_patterns',true),'file_transfer', jsonb_build_object('file_transfer_enabled',false,'audit_all_transfers',true),'security', jsonb_build_object('require_mfa',true,'require_trusted_device',true),'compliance', jsonb_build_object('audit_every_session',true,'create_event_on_violation',true,'notify_admin_on_violation',true)),'block',true),
('support_agent_safe_access','Support Agent Safe Access','For support teams: ticket-referenced view-only sessions with user confirmation.','remote_access',
  jsonb_build_object('remote_access', jsonb_build_object('allow_remote_access',true,'allowed_roles',jsonb_build_array('support','admin'),'require_user_confirmation',true),'remote_input', jsonb_build_object('view_only_mode',true,'keyboard_enabled',false,'mouse_enabled',false),'file_transfer', jsonb_build_object('file_transfer_enabled',false),'compliance', jsonb_build_object('require_ticket_reference',true,'audit_every_session',true)),'warn',false),
('developer_workstation','Developer Workstation Policy','Balanced policy for developer machines with MFA and limited file transfers.','device',
  jsonb_build_object('remote_access', jsonb_build_object('allow_remote_access',true),'clipboard', jsonb_build_object('clipboard_enabled',true,'enforcement_mode','warn'),'file_transfer', jsonb_build_object('file_transfer_enabled',true,'allowed_extensions',jsonb_build_array('txt','log','json','zip','tar','gz','md'),'max_file_size_mb',200),'security', jsonb_build_object('require_mfa',true)),'warn',false),
('high_security_server','High-Security Server Policy','Lock down production servers: approval required, no clipboard, no file transfer.','security',
  jsonb_build_object('remote_access', jsonb_build_object('allow_remote_access',true,'require_admin_approval',true,'allow_unattended_access',false),'clipboard', jsonb_build_object('clipboard_enabled',false,'enforcement_mode','block'),'file_transfer', jsonb_build_object('file_transfer_enabled',false),'remote_input', jsonb_build_object('block_ctrl_alt_del',true,'block_system_shortcuts',true),'compliance', jsonb_build_object('audit_every_session',true,'require_reason_for_session',true)),'block',true),
('byod_personal_device','BYOD / Personal Device Policy','For personal devices: require trusted device, block downloads, limit session length.','device',
  jsonb_build_object('remote_access', jsonb_build_object('allow_remote_access',true,'require_user_confirmation',true,'max_session_duration_minutes',60),'file_transfer', jsonb_build_object('file_transfer_enabled',true,'upload_enabled',true,'download_enabled',false),'security', jsonb_build_object('require_trusted_device',true)),'warn',false),
('monitoring_only','Monitoring Only Policy','Observe and log: allow all actions, notify on violations, never block.','compliance',
  jsonb_build_object('remote_access', jsonb_build_object('allow_remote_access',true),'clipboard', jsonb_build_object('clipboard_enabled',true,'enforcement_mode','monitor'),'file_transfer', jsonb_build_object('file_transfer_enabled',true,'audit_all_transfers',true),'compliance', jsonb_build_object('audit_every_session',true,'create_event_on_violation',true,'notify_admin_on_violation',true)),'monitor',false);
