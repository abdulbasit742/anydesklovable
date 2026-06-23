
-- ============ Helper ============
CREATE OR REPLACE FUNCTION public.is_identity_admin(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_user_id, _team_id, 'owner'::app_role)
      OR public.has_role(_user_id, _team_id, 'admin'::app_role);
$$;

-- ============ 1. identity_providers ============
CREATE TABLE public.identity_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  provider_key text NOT NULL,
  name text NOT NULL,
  provider_type text NOT NULL,
  status text NOT NULL DEFAULT 'draft',
  login_mode text NOT NULL DEFAULT 'optional',
  domain_hint text,
  issuer text,
  sso_url text,
  metadata_url text,
  entity_id text,
  client_id text,
  client_secret_reference text,
  certificate_fingerprint text,
  certificate_reference text,
  redirect_uri text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  activated_at timestamptz,
  last_tested_at timestamptz,
  last_error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, provider_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.identity_providers TO authenticated;
GRANT ALL ON public.identity_providers TO service_role;
ALTER TABLE public.identity_providers ENABLE ROW LEVEL SECURITY;
CREATE POLICY ip_read ON public.identity_providers FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY ip_manage ON public.identity_providers FOR ALL TO authenticated USING (public.is_identity_admin(auth.uid(), team_id)) WITH CHECK (public.is_identity_admin(auth.uid(), team_id));
CREATE INDEX idx_ip_team ON public.identity_providers(team_id, provider_key, status);
CREATE TRIGGER trg_ip_updated BEFORE UPDATE ON public.identity_providers FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 2. identity_provider_domains ============
CREATE TABLE public.identity_provider_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  identity_provider_id uuid REFERENCES public.identity_providers(id) ON DELETE SET NULL,
  domain text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  verification_method text NOT NULL DEFAULT 'dns_txt',
  verification_token_hash text,
  verified_at timestamptz,
  verified_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.identity_provider_domains TO authenticated;
GRANT ALL ON public.identity_provider_domains TO service_role;
ALTER TABLE public.identity_provider_domains ENABLE ROW LEVEL SECURITY;
CREATE POLICY ipd_read ON public.identity_provider_domains FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY ipd_manage ON public.identity_provider_domains FOR ALL TO authenticated USING (public.is_identity_admin(auth.uid(), team_id)) WITH CHECK (public.is_identity_admin(auth.uid(), team_id));
CREATE INDEX idx_ipd_team ON public.identity_provider_domains(team_id, domain, status);
CREATE TRIGGER trg_ipd_updated BEFORE UPDATE ON public.identity_provider_domains FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 3. sso_login_attempts ============
CREATE TABLE public.sso_login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES public.teams(id) ON DELETE SET NULL,
  identity_provider_id uuid REFERENCES public.identity_providers(id) ON DELETE SET NULL,
  user_id uuid,
  email text,
  domain text,
  provider_type text,
  status text NOT NULL,
  failure_code text,
  failure_message text,
  ip_address inet,
  user_agent text,
  relay_state_hash text,
  request_id text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.sso_login_attempts TO authenticated;
GRANT ALL ON public.sso_login_attempts TO service_role;
ALTER TABLE public.sso_login_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY ssla_read ON public.sso_login_attempts FOR SELECT TO authenticated USING (team_id IS NOT NULL AND public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_ssla_team_time ON public.sso_login_attempts(team_id, created_at DESC);
CREATE INDEX idx_ssla_team_status ON public.sso_login_attempts(team_id, status, created_at DESC);

-- ============ 4. identity_claim_mappings ============
CREATE TABLE public.identity_claim_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  identity_provider_id uuid NOT NULL REFERENCES public.identity_providers(id) ON DELETE CASCADE,
  claim_name text NOT NULL,
  claim_path text,
  target_field text NOT NULL,
  transform_type text NOT NULL DEFAULT 'direct',
  transform_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  required boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.identity_claim_mappings TO authenticated;
GRANT ALL ON public.identity_claim_mappings TO service_role;
ALTER TABLE public.identity_claim_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY icm_read ON public.identity_claim_mappings FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY icm_manage ON public.identity_claim_mappings FOR ALL TO authenticated USING (public.is_identity_admin(auth.uid(), team_id)) WITH CHECK (public.is_identity_admin(auth.uid(), team_id));
CREATE INDEX idx_icm_team ON public.identity_claim_mappings(team_id, identity_provider_id, active);
CREATE TRIGGER trg_icm_updated BEFORE UPDATE ON public.identity_claim_mappings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 5. identity_group_mappings ============
CREATE TABLE public.identity_group_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  identity_provider_id uuid REFERENCES public.identity_providers(id) ON DELETE SET NULL,
  external_group_id text,
  external_group_name text NOT NULL,
  remote_role_key text,
  remote_permissions text[] NOT NULL DEFAULT '{}',
  device_group_id uuid,
  customer_account_id uuid,
  mapping_type text NOT NULL DEFAULT 'role',
  priority integer NOT NULL DEFAULT 100,
  active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.identity_group_mappings TO authenticated;
GRANT ALL ON public.identity_group_mappings TO service_role;
ALTER TABLE public.identity_group_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY igm_read ON public.identity_group_mappings FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY igm_manage ON public.identity_group_mappings FOR ALL TO authenticated USING (public.is_identity_admin(auth.uid(), team_id)) WITH CHECK (public.is_identity_admin(auth.uid(), team_id));
CREATE INDEX idx_igm_team ON public.identity_group_mappings(team_id, identity_provider_id, active);
CREATE TRIGGER trg_igm_updated BEFORE UPDATE ON public.identity_group_mappings FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 6. scim_tokens ============
CREATE TABLE public.scim_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  token_prefix text NOT NULL,
  token_hash text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  scopes text[] NOT NULL DEFAULT ARRAY['scim:read','scim:write'],
  last_used_at timestamptz,
  expires_at timestamptz,
  created_by uuid,
  revoked_by uuid,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.scim_tokens TO authenticated;
GRANT ALL ON public.scim_tokens TO service_role;
ALTER TABLE public.scim_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY st_read ON public.scim_tokens FOR SELECT TO authenticated USING (public.is_identity_admin(auth.uid(), team_id));
CREATE POLICY st_manage ON public.scim_tokens FOR ALL TO authenticated USING (public.is_identity_admin(auth.uid(), team_id)) WITH CHECK (public.is_identity_admin(auth.uid(), team_id));
CREATE INDEX idx_st_team ON public.scim_tokens(team_id, token_prefix, status);
CREATE TRIGGER trg_st_updated BEFORE UPDATE ON public.scim_tokens FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 7. scim_users ============
CREATE TABLE public.scim_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  scim_id text NOT NULL,
  user_id uuid,
  external_id text,
  user_name text NOT NULL,
  email text,
  display_name text,
  given_name text,
  family_name text,
  active boolean NOT NULL DEFAULT true,
  remote_role_key text,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at timestamptz,
  deprovisioned_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, scim_id)
);
GRANT SELECT ON public.scim_users TO authenticated;
GRANT ALL ON public.scim_users TO service_role;
ALTER TABLE public.scim_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY su_read ON public.scim_users FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_su_team_scim ON public.scim_users(team_id, scim_id);
CREATE INDEX idx_su_team_user ON public.scim_users(team_id, user_name);
CREATE INDEX idx_su_team_email ON public.scim_users(team_id, email);
CREATE TRIGGER trg_su_updated BEFORE UPDATE ON public.scim_users FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 8. scim_groups ============
CREATE TABLE public.scim_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  scim_id text NOT NULL,
  external_id text,
  display_name text NOT NULL,
  raw_payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(team_id, scim_id)
);
GRANT SELECT ON public.scim_groups TO authenticated;
GRANT ALL ON public.scim_groups TO service_role;
ALTER TABLE public.scim_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY sg_read ON public.scim_groups FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_sg_team_scim ON public.scim_groups(team_id, scim_id);
CREATE TRIGGER trg_sg_updated BEFORE UPDATE ON public.scim_groups FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 9. scim_group_members ============
CREATE TABLE public.scim_group_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  scim_group_id uuid NOT NULL REFERENCES public.scim_groups(id) ON DELETE CASCADE,
  scim_user_id uuid NOT NULL REFERENCES public.scim_users(id) ON DELETE CASCADE,
  user_id uuid,
  active boolean NOT NULL DEFAULT true,
  added_at timestamptz NOT NULL DEFAULT now(),
  removed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(scim_group_id, scim_user_id)
);
GRANT SELECT ON public.scim_group_members TO authenticated;
GRANT ALL ON public.scim_group_members TO service_role;
ALTER TABLE public.scim_group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY sgm_read ON public.scim_group_members FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_sgm_team_group ON public.scim_group_members(team_id, scim_group_id);
CREATE TRIGGER trg_sgm_updated BEFORE UPDATE ON public.scim_group_members FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 10. identity_lifecycle_events ============
CREATE TABLE public.identity_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid,
  team_member_id uuid,
  identity_provider_id uuid REFERENCES public.identity_providers(id) ON DELETE SET NULL,
  scim_user_id uuid REFERENCES public.scim_users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text,
  source text NOT NULL DEFAULT 'system',
  actor_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.identity_lifecycle_events TO authenticated;
GRANT ALL ON public.identity_lifecycle_events TO service_role;
ALTER TABLE public.identity_lifecycle_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY ile_read ON public.identity_lifecycle_events FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_ile_team_time ON public.identity_lifecycle_events(team_id, created_at DESC);
CREATE INDEX idx_ile_team_type ON public.identity_lifecycle_events(team_id, event_type, created_at DESC);

-- ============ 11. identity_sync_jobs ============
CREATE TABLE public.identity_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  identity_provider_id uuid REFERENCES public.identity_providers(id) ON DELETE SET NULL,
  job_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  records_processed integer NOT NULL DEFAULT 0,
  records_created integer NOT NULL DEFAULT 0,
  records_updated integer NOT NULL DEFAULT 0,
  records_failed integer NOT NULL DEFAULT 0,
  error_message text,
  created_by uuid,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.identity_sync_jobs TO authenticated;
GRANT ALL ON public.identity_sync_jobs TO service_role;
ALTER TABLE public.identity_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY isj_read ON public.identity_sync_jobs FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY isj_insert ON public.identity_sync_jobs FOR INSERT TO authenticated WITH CHECK (public.is_identity_admin(auth.uid(), team_id));
CREATE INDEX idx_isj_team_status ON public.identity_sync_jobs(team_id, status, created_at DESC);
CREATE TRIGGER trg_isj_updated BEFORE UPDATE ON public.identity_sync_jobs FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 12. identity_conflicts ============
CREATE TABLE public.identity_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  conflict_type text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  user_id uuid,
  team_member_id uuid,
  scim_user_id uuid REFERENCES public.scim_users(id) ON DELETE SET NULL,
  identity_provider_id uuid REFERENCES public.identity_providers(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  recommended_action text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  resolved_by uuid,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, UPDATE ON public.identity_conflicts TO authenticated;
GRANT ALL ON public.identity_conflicts TO service_role;
ALTER TABLE public.identity_conflicts ENABLE ROW LEVEL SECURITY;
CREATE POLICY ic_read ON public.identity_conflicts FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY ic_update ON public.identity_conflicts FOR UPDATE TO authenticated USING (public.is_identity_admin(auth.uid(), team_id)) WITH CHECK (public.is_identity_admin(auth.uid(), team_id));
CREATE INDEX idx_ic_team_status ON public.identity_conflicts(team_id, status, created_at DESC);
CREATE TRIGGER trg_ic_updated BEFORE UPDATE ON public.identity_conflicts FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 13. identity_access_policies ============
CREATE TABLE public.identity_access_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  policy_type text NOT NULL,
  rules jsonb NOT NULL DEFAULT '{}'::jsonb,
  enforcement_mode text NOT NULL DEFAULT 'warn',
  priority integer NOT NULL DEFAULT 100,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.identity_access_policies TO authenticated;
GRANT ALL ON public.identity_access_policies TO service_role;
ALTER TABLE public.identity_access_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY iap_read ON public.identity_access_policies FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY iap_manage ON public.identity_access_policies FOR ALL TO authenticated USING (public.is_identity_admin(auth.uid(), team_id)) WITH CHECK (public.is_identity_admin(auth.uid(), team_id));
CREATE INDEX idx_iap_team ON public.identity_access_policies(team_id, status, priority);
CREATE TRIGGER trg_iap_updated BEFORE UPDATE ON public.identity_access_policies FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- ============ 14. identity_admin_reports ============
CREATE TABLE public.identity_admin_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_id uuid,
  requested_by uuid,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.identity_admin_reports TO authenticated;
GRANT ALL ON public.identity_admin_reports TO service_role;
ALTER TABLE public.identity_admin_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY iar_read ON public.identity_admin_reports FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY iar_insert ON public.identity_admin_reports FOR INSERT TO authenticated WITH CHECK (public.is_identity_admin(auth.uid(), team_id));
CREATE INDEX idx_iar_team_status ON public.identity_admin_reports(team_id, status, created_at DESC);
CREATE TRIGGER trg_iar_updated BEFORE UPDATE ON public.identity_admin_reports FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
