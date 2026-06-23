
-- TASK #15 PHASE 1: Customer Portal + Device Onboarding data model

-- 1. customer_accounts
CREATE TABLE IF NOT EXISTS public.customer_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  account_type text NOT NULL DEFAULT 'organization',
  primary_contact_name text,
  primary_contact_email text,
  phone text,
  status text NOT NULL DEFAULT 'active',
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_accounts TO authenticated;
GRANT ALL ON public.customer_accounts TO service_role;
ALTER TABLE public.customer_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_accounts_select" ON public.customer_accounts
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "customer_accounts_manage" ON public.customer_accounts
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)));
CREATE INDEX IF NOT EXISTS idx_customer_accounts_team ON public.customer_accounts(team_id, status);
CREATE TRIGGER trg_customer_accounts_updated BEFORE UPDATE ON public.customer_accounts
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2. customer_users
CREATE TABLE IF NOT EXISTS public.customer_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  customer_account_id uuid NOT NULL REFERENCES public.customer_accounts(id) ON DELETE CASCADE,
  user_id uuid,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user',
  status text NOT NULL DEFAULT 'invited',
  last_login_at timestamptz,
  invited_by uuid,
  activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_users TO authenticated;
GRANT ALL ON public.customer_users TO service_role;
ALTER TABLE public.customer_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customer_users_select" ON public.customer_users
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) OR user_id = auth.uid());
CREATE POLICY "customer_users_manage" ON public.customer_users
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)));
CREATE INDEX IF NOT EXISTS idx_customer_users_account ON public.customer_users(team_id, customer_account_id);
CREATE INDEX IF NOT EXISTS idx_customer_users_email ON public.customer_users(team_id, lower(email));
CREATE INDEX IF NOT EXISTS idx_customer_users_user_id ON public.customer_users(user_id);
CREATE TRIGGER trg_customer_users_updated BEFORE UPDATE ON public.customer_users
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3. customer_portal_invitations
CREATE TABLE IF NOT EXISTS public.customer_portal_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  customer_account_id uuid REFERENCES public.customer_accounts(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'user',
  token_hash text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  accepted_by uuid,
  invited_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_portal_invitations TO authenticated;
GRANT ALL ON public.customer_portal_invitations TO service_role;
ALTER TABLE public.customer_portal_invitations ENABLE ROW LEVEL SECURITY;
-- Token hash never exposed to clients; team members may view metadata rows
CREATE POLICY "cpi_select_team" ON public.customer_portal_invitations
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "cpi_manage" ON public.customer_portal_invitations
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)));
CREATE INDEX IF NOT EXISTS idx_cpi_lookup ON public.customer_portal_invitations(team_id, lower(email), status);
CREATE INDEX IF NOT EXISTS idx_cpi_token ON public.customer_portal_invitations(token_hash);
CREATE TRIGGER trg_cpi_updated BEFORE UPDATE ON public.customer_portal_invitations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. device_onboarding_invites
CREATE TABLE IF NOT EXISTS public.device_onboarding_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  customer_account_id uuid REFERENCES public.customer_accounts(id) ON DELETE SET NULL,
  customer_user_id uuid REFERENCES public.customer_users(id) ON DELETE SET NULL,
  device_id uuid,
  invite_code_hash text NOT NULL,
  display_code text,
  status text NOT NULL DEFAULT 'pending',
  device_name_hint text,
  platform_hint text,
  expires_at timestamptz NOT NULL,
  claimed_at timestamptz,
  claimed_by uuid,
  completed_at timestamptz,
  created_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_onboarding_invites TO authenticated;
GRANT ALL ON public.device_onboarding_invites TO service_role;
ALTER TABLE public.device_onboarding_invites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "doi_select_team" ON public.device_onboarding_invites
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "doi_manage" ON public.device_onboarding_invites
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)));
CREATE INDEX IF NOT EXISTS idx_doi_status ON public.device_onboarding_invites(team_id, status, expires_at);
CREATE INDEX IF NOT EXISTS idx_doi_hash ON public.device_onboarding_invites(invite_code_hash);
CREATE TRIGGER trg_doi_updated BEFORE UPDATE ON public.device_onboarding_invites
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 5. customer_device_links
CREATE TABLE IF NOT EXISTS public.customer_device_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  customer_account_id uuid REFERENCES public.customer_accounts(id) ON DELETE CASCADE,
  customer_user_id uuid REFERENCES public.customer_users(id) ON DELETE SET NULL,
  device_id uuid NOT NULL,
  relationship text NOT NULL DEFAULT 'owned',
  display_name text,
  access_status text NOT NULL DEFAULT 'active',
  added_by uuid,
  added_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_device_links TO authenticated;
GRANT ALL ON public.customer_device_links TO service_role;
ALTER TABLE public.customer_device_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cdl_select" ON public.customer_device_links
  FOR SELECT TO authenticated
  USING (
    public.is_team_member(auth.uid(), team_id)
    OR EXISTS (SELECT 1 FROM public.customer_users cu WHERE cu.id = customer_device_links.customer_user_id AND cu.user_id = auth.uid())
  );
CREATE POLICY "cdl_manage" ON public.customer_device_links
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role) OR public.has_role(auth.uid(), team_id, 'support'::app_role)));
CREATE INDEX IF NOT EXISTS idx_cdl_account ON public.customer_device_links(team_id, customer_account_id);
CREATE INDEX IF NOT EXISTS idx_cdl_device ON public.customer_device_links(device_id);
CREATE TRIGGER trg_cdl_updated BEFORE UPDATE ON public.customer_device_links
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6. portal_session_requests
CREATE TABLE IF NOT EXISTS public.portal_session_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  customer_account_id uuid REFERENCES public.customer_accounts(id) ON DELETE SET NULL,
  customer_user_id uuid REFERENCES public.customer_users(id) ON DELETE SET NULL,
  device_id uuid,
  support_ticket_id uuid,
  requested_by uuid,
  technician_id uuid,
  session_id uuid,
  request_type text NOT NULL DEFAULT 'support',
  status text NOT NULL DEFAULT 'pending',
  reason text,
  customer_message text,
  technician_message text,
  expires_at timestamptz,
  approved_at timestamptz,
  denied_at timestamptz,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_session_requests TO authenticated;
GRANT ALL ON public.portal_session_requests TO service_role;
ALTER TABLE public.portal_session_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "psr_select" ON public.portal_session_requests
  FOR SELECT TO authenticated
  USING (
    public.is_team_member(auth.uid(), team_id)
    OR EXISTS (SELECT 1 FROM public.customer_users cu WHERE cu.id = portal_session_requests.customer_user_id AND cu.user_id = auth.uid())
  );
CREATE POLICY "psr_write_team" ON public.portal_session_requests
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_psr_status ON public.portal_session_requests(team_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_psr_device ON public.portal_session_requests(device_id, created_at DESC);
CREATE TRIGGER trg_psr_updated BEFORE UPDATE ON public.portal_session_requests
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 7. portal_consent_records
CREATE TABLE IF NOT EXISTS public.portal_consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  customer_account_id uuid REFERENCES public.customer_accounts(id) ON DELETE SET NULL,
  customer_user_id uuid REFERENCES public.customer_users(id) ON DELETE SET NULL,
  device_id uuid,
  session_id uuid,
  support_ticket_id uuid,
  consent_type text NOT NULL,
  status text NOT NULL,
  consent_text text,
  response_note text,
  ip_address inet,
  user_agent text,
  granted_at timestamptz,
  denied_at timestamptz,
  withdrawn_at timestamptz,
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_consent_records TO authenticated;
GRANT ALL ON public.portal_consent_records TO service_role;
ALTER TABLE public.portal_consent_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pcr_select" ON public.portal_consent_records
  FOR SELECT TO authenticated
  USING (
    public.is_team_member(auth.uid(), team_id)
    OR EXISTS (SELECT 1 FROM public.customer_users cu WHERE cu.id = portal_consent_records.customer_user_id AND cu.user_id = auth.uid())
  );
CREATE POLICY "pcr_write_team" ON public.portal_consent_records
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_pcr_account ON public.portal_consent_records(team_id, customer_account_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pcr_session ON public.portal_consent_records(session_id);

-- 8. customer_portal_events
CREATE TABLE IF NOT EXISTS public.customer_portal_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  customer_account_id uuid REFERENCES public.customer_accounts(id) ON DELETE SET NULL,
  customer_user_id uuid REFERENCES public.customer_users(id) ON DELETE SET NULL,
  device_id uuid,
  session_id uuid,
  support_ticket_id uuid,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text,
  actor_user_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_portal_events TO authenticated;
GRANT ALL ON public.customer_portal_events TO service_role;
ALTER TABLE public.customer_portal_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cpe_select" ON public.customer_portal_events
  FOR SELECT TO authenticated
  USING (
    public.is_team_member(auth.uid(), team_id)
    OR EXISTS (SELECT 1 FROM public.customer_users cu WHERE cu.id = customer_portal_events.customer_user_id AND cu.user_id = auth.uid())
  );
CREATE POLICY "cpe_write_team" ON public.customer_portal_events
  FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_cpe_account ON public.customer_portal_events(team_id, customer_account_id, created_at DESC);

-- 9. customer_portal_settings
CREATE TABLE IF NOT EXISTS public.customer_portal_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL UNIQUE,
  portal_enabled boolean NOT NULL DEFAULT true,
  portal_slug text,
  support_email text,
  support_phone text,
  brand_name text,
  welcome_message text,
  privacy_notice text,
  terms_url text,
  require_customer_mfa boolean NOT NULL DEFAULT false,
  allow_customer_ticket_creation boolean NOT NULL DEFAULT true,
  allow_customer_device_onboarding boolean NOT NULL DEFAULT true,
  allow_customer_session_requests boolean NOT NULL DEFAULT true,
  require_consent_for_each_session boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customer_portal_settings TO authenticated;
GRANT ALL ON public.customer_portal_settings TO service_role;
ALTER TABLE public.customer_portal_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cps_select" ON public.customer_portal_settings
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "cps_manage" ON public.customer_portal_settings
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)));
CREATE INDEX IF NOT EXISTS idx_cps_team ON public.customer_portal_settings(team_id);
CREATE TRIGGER trg_cps_updated BEFORE UPDATE ON public.customer_portal_settings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 10. portal_download_links
CREATE TABLE IF NOT EXISTS public.portal_download_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  platform text NOT NULL,
  label text NOT NULL,
  url text,
  version text,
  checksum text,
  active boolean NOT NULL DEFAULT true,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.portal_download_links TO authenticated;
GRANT ALL ON public.portal_download_links TO service_role;
ALTER TABLE public.portal_download_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pdl_select" ON public.portal_download_links
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "pdl_manage" ON public.portal_download_links
  FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)))
  WITH CHECK (public.is_team_member(auth.uid(), team_id) AND (public.has_role(auth.uid(), team_id, 'owner'::app_role) OR public.has_role(auth.uid(), team_id, 'admin'::app_role)));
CREATE INDEX IF NOT EXISTS idx_pdl_lookup ON public.portal_download_links(team_id, platform, active);
CREATE TRIGGER trg_pdl_updated BEFORE UPDATE ON public.portal_download_links
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
