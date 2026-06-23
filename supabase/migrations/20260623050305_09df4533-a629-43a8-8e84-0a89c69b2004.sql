
-- ============================================================
-- TASK #11 — Phase 1: Enterprise Governance Data Model
-- (current_role -> current_role_key to avoid reserved keyword)
-- ============================================================

-- 1. role_definitions
CREATE TABLE IF NOT EXISTS public.role_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE CASCADE,
  key text NOT NULL,
  name text NOT NULL,
  description text,
  role_type text NOT NULL DEFAULT 'custom' CHECK (role_type IN ('system','custom')),
  permissions text[] NOT NULL DEFAULT '{}',
  is_assignable boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, key)
);
CREATE INDEX IF NOT EXISTS idx_role_definitions_team_key ON public.role_definitions(team_id, key);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_definitions TO authenticated;
GRANT ALL ON public.role_definitions TO service_role;
ALTER TABLE public.role_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_defs_select" ON public.role_definitions FOR SELECT TO authenticated
USING (team_id IS NULL OR public.is_team_member(auth.uid(), team_id));
CREATE POLICY "role_defs_modify" ON public.role_definitions FOR ALL TO authenticated
USING (team_id IS NOT NULL AND (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin')))
WITH CHECK (team_id IS NOT NULL AND (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin')));

CREATE TRIGGER trg_role_defs_updated_at BEFORE UPDATE ON public.role_definitions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_simple();

-- 2. member_permission_overrides
CREATE TABLE IF NOT EXISTS public.member_permission_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  user_id uuid NOT NULL,
  granted_permissions text[] NOT NULL DEFAULT '{}',
  denied_permissions text[] NOT NULL DEFAULT '{}',
  reason text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_mpo_team_member ON public.member_permission_overrides(team_id, member_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_permission_overrides TO authenticated;
GRANT ALL ON public.member_permission_overrides TO service_role;
ALTER TABLE public.member_permission_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mpo_select" ON public.member_permission_overrides FOR SELECT TO authenticated
USING (public.is_team_member(auth.uid(), team_id) AND (user_id = auth.uid() OR public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin')));
CREATE POLICY "mpo_modify" ON public.member_permission_overrides FOR ALL TO authenticated
USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TRIGGER trg_mpo_updated_at BEFORE UPDATE ON public.member_permission_overrides
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_simple();

-- 3. access_review_campaigns
CREATE TABLE IF NOT EXISTS public.access_review_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','completed','canceled')),
  scope text NOT NULL DEFAULT 'all_members' CHECK (scope IN ('all_members','admins_only','risky_members','custom')),
  due_at timestamptz,
  created_by uuid,
  completed_by uuid,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_arc_team_status ON public.access_review_campaigns(team_id, status, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_review_campaigns TO authenticated;
GRANT ALL ON public.access_review_campaigns TO service_role;
ALTER TABLE public.access_review_campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "arc_select" ON public.access_review_campaigns FOR SELECT TO authenticated
USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "arc_modify" ON public.access_review_campaigns FOR ALL TO authenticated
USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TRIGGER trg_arc_updated_at BEFORE UPDATE ON public.access_review_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_simple();

-- 4. access_review_items
CREATE TABLE IF NOT EXISTS public.access_review_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.access_review_campaigns(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  user_id uuid NOT NULL,
  current_role_key text,
  current_permissions text[] NOT NULL DEFAULT '{}',
  reviewer_id uuid,
  decision text CHECK (decision IN ('keep','change_role','remove_access','needs_followup')),
  recommended_role text,
  note text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ari_team_campaign ON public.access_review_items(team_id, campaign_id);
CREATE INDEX IF NOT EXISTS idx_ari_reviewer ON public.access_review_items(reviewer_id, reviewed_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_review_items TO authenticated;
GRANT ALL ON public.access_review_items TO service_role;
ALTER TABLE public.access_review_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ari_select" ON public.access_review_items FOR SELECT TO authenticated
USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "ari_modify" ON public.access_review_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin') OR reviewer_id = auth.uid())
WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin') OR reviewer_id = auth.uid());

-- 5. governance_approval_requests
CREATE TABLE IF NOT EXISTS public.governance_approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  request_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','canceled','expired')),
  requested_by uuid,
  target_user_id uuid,
  target_member_id uuid,
  resource_type text,
  resource_id uuid,
  title text NOT NULL,
  description text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  approved_by uuid,
  rejected_by uuid,
  decision_note text,
  decided_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_gar_team_status ON public.governance_approval_requests(team_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gar_requested_by ON public.governance_approval_requests(requested_by, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.governance_approval_requests TO authenticated;
GRANT ALL ON public.governance_approval_requests TO service_role;
ALTER TABLE public.governance_approval_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gar_select" ON public.governance_approval_requests FOR SELECT TO authenticated
USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "gar_insert" ON public.governance_approval_requests FOR INSERT TO authenticated
WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "gar_modify" ON public.governance_approval_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin') OR requested_by = auth.uid())
WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin') OR requested_by = auth.uid());

CREATE TRIGGER trg_gar_updated_at BEFORE UPDATE ON public.governance_approval_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_simple();

-- 6. team_governance_settings
CREATE TABLE IF NOT EXISTS public.team_governance_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL UNIQUE REFERENCES public.teams(id) ON DELETE CASCADE,
  require_mfa_for_admins boolean NOT NULL DEFAULT true,
  require_mfa_for_all_members boolean NOT NULL DEFAULT false,
  require_approval_for_owner_transfer boolean NOT NULL DEFAULT true,
  require_approval_for_billing_changes boolean NOT NULL DEFAULT true,
  require_approval_for_broad_api_keys boolean NOT NULL DEFAULT true,
  require_approval_for_policy_changes boolean NOT NULL DEFAULT false,
  session_timeout_minutes integer NOT NULL DEFAULT 720 CHECK (session_timeout_minutes > 0),
  max_trusted_device_days integer NOT NULL DEFAULT 30 CHECK (max_trusted_device_days > 0),
  allowed_email_domains text[] NOT NULL DEFAULT '{}',
  invite_expiry_days integer NOT NULL DEFAULT 7 CHECK (invite_expiry_days > 0),
  access_review_frequency text NOT NULL DEFAULT 'quarterly' CHECK (access_review_frequency IN ('monthly','quarterly','semiannual','annual','manual')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_tgs_team ON public.team_governance_settings(team_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_governance_settings TO authenticated;
GRANT ALL ON public.team_governance_settings TO service_role;
ALTER TABLE public.team_governance_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tgs_select" ON public.team_governance_settings FOR SELECT TO authenticated
USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "tgs_modify" ON public.team_governance_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TRIGGER trg_tgs_updated_at BEFORE UPDATE ON public.team_governance_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_simple();

-- 7. member_risk_scores
CREATE TABLE IF NOT EXISTS public.member_risk_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  member_id uuid NOT NULL,
  user_id uuid NOT NULL,
  risk_score integer NOT NULL DEFAULT 0,
  risk_level text NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low','medium','high','critical')),
  reasons text[] NOT NULL DEFAULT '{}',
  last_login_at timestamptz,
  mfa_enabled boolean NOT NULL DEFAULT false,
  stale_session_count integer NOT NULL DEFAULT 0,
  broad_api_key_count integer NOT NULL DEFAULT 0,
  failed_security_events_30d integer NOT NULL DEFAULT 0,
  last_calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, member_id)
);
CREATE INDEX IF NOT EXISTS idx_mrs_team_level ON public.member_risk_scores(team_id, risk_level, risk_score DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.member_risk_scores TO authenticated;
GRANT ALL ON public.member_risk_scores TO service_role;
ALTER TABLE public.member_risk_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mrs_select" ON public.member_risk_scores FOR SELECT TO authenticated
USING (public.is_team_member(auth.uid(), team_id) AND (user_id = auth.uid() OR public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin')));
CREATE POLICY "mrs_modify" ON public.member_risk_scores FOR ALL TO authenticated
USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TRIGGER trg_mrs_updated_at BEFORE UPDATE ON public.member_risk_scores
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_simple();

-- 8. team_domains
CREATE TABLE IF NOT EXISTS public.team_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','verified','rejected')),
  verification_token text,
  verified_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, domain)
);
CREATE INDEX IF NOT EXISTS idx_td_team_domain ON public.team_domains(team_id, domain);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_domains TO authenticated;
GRANT ALL ON public.team_domains TO service_role;
ALTER TABLE public.team_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "td_select" ON public.team_domains FOR SELECT TO authenticated
USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "td_modify" ON public.team_domains FOR ALL TO authenticated
USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

CREATE TRIGGER trg_td_updated_at BEFORE UPDATE ON public.team_domains
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_simple();

-- 9. seat_change_requests
CREATE TABLE IF NOT EXISTS public.seat_change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  requested_by uuid,
  current_seats integer,
  requested_seats integer NOT NULL CHECK (requested_seats > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','applied')),
  reason text,
  approved_by uuid,
  rejected_by uuid,
  decided_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_scr_team_status ON public.seat_change_requests(team_id, status, created_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.seat_change_requests TO authenticated;
GRANT ALL ON public.seat_change_requests TO service_role;
ALTER TABLE public.seat_change_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "scr_select" ON public.seat_change_requests FOR SELECT TO authenticated
USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "scr_insert" ON public.seat_change_requests FOR INSERT TO authenticated
WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "scr_update" ON public.seat_change_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));

-- Seed system role definitions (team_id IS NULL = global)
INSERT INTO public.role_definitions (team_id, key, name, description, role_type, permissions, is_assignable) VALUES
  (NULL, 'owner', 'Owner', 'Full access to everything in the team.', 'system', ARRAY['*'], true),
  (NULL, 'admin', 'Admin', 'Operational administrator with most permissions.', 'system',
    ARRAY['team.read','team.update','team.invite_members','team.remove_members','team.manage_roles','team.manage_domains','team.view_governance',
          'devices.read','devices.write','devices.delete','devices.manage_policies','devices.remote_start','devices.remote_end',
          'sessions.read','sessions.start','sessions.end','sessions.view_history',
          'billing.read','billing.view_invoices',
          'support.read','support.write','support.triage','support.admin',
          'security.read','security.view_events',
          'automation.read','automation.write','automation.run',
          'developer.read','developer.view_api_logs',
          'audit.read','admin.read','admin.triage'], true),
  (NULL, 'security_admin', 'Security Admin', 'Manages MFA, trusted devices, and security governance.', 'system',
    ARRAY['team.read','team.view_governance','security.read','security.manage_mfa','security.manage_trusted_devices','security.view_events','security.manage_governance','audit.read'], true),
  (NULL, 'billing_admin', 'Billing Admin', 'Manages subscription, invoices and seats.', 'system',
    ARRAY['team.read','billing.read','billing.manage','billing.approve_changes','billing.view_invoices'], true),
  (NULL, 'support_agent', 'Support Agent', 'Handles support tickets.', 'system',
    ARRAY['team.read','support.read','support.write','support.triage','devices.read','sessions.read'], true),
  (NULL, 'developer', 'Developer', 'Manages API keys, webhooks, and integrations.', 'system',
    ARRAY['team.read','developer.read','developer.manage_api_keys','developer.manage_webhooks','developer.view_api_logs'], true),
  (NULL, 'automation_manager', 'Automation Manager', 'Builds and manages automation pipelines.', 'system',
    ARRAY['team.read','automation.read','automation.write','automation.run','automation.manage_scheduler','automation.manage_settings'], true),
  (NULL, 'device_manager', 'Device Manager', 'Manages devices and device policies.', 'system',
    ARRAY['team.read','devices.read','devices.write','devices.delete','devices.manage_policies','sessions.read','sessions.start','sessions.end'], true),
  (NULL, 'auditor', 'Auditor', 'Read-only access for audit and security visibility.', 'system',
    ARRAY['team.read','team.view_governance','audit.read','audit.export','security.read','security.view_events','billing.read','developer.read','automation.read','support.read','devices.read','sessions.read','sessions.view_history'], true),
  (NULL, 'member', 'Member', 'Standard team member.', 'system',
    ARRAY['team.read','devices.read','sessions.read','sessions.start','sessions.end','support.read','support.write','automation.read','developer.read'], true),
  (NULL, 'read_only', 'Read Only', 'Read-only access to team resources.', 'system',
    ARRAY['team.read','devices.read','sessions.read','sessions.view_history','support.read','automation.read','developer.read','billing.read'], true)
ON CONFLICT DO NOTHING;
