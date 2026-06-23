
-- Ensure helper from Task #23 exists (idempotent)
CREATE OR REPLACE FUNCTION public.is_deployment_admin(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.team_members WHERE team_id = _team_id AND user_id = _user_id AND role IN ('owner','admin'));
$$;

-- partner_organizations
CREATE TABLE IF NOT EXISTS public.partner_organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL, legal_name text,
  partner_key text NOT NULL UNIQUE,
  partner_type text NOT NULL DEFAULT 'msp' CHECK (partner_type IN ('reseller','msp','distributor','agency','enterprise_parent','franchise','technology_partner','internal')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','onboarding','suspended','archived')),
  tier text NOT NULL DEFAULT 'registered' CHECK (tier IN ('registered','silver','gold','platinum','strategic','internal')),
  primary_contact_name text, primary_contact_email text, website_url text, country_code text,
  default_currency text NOT NULL DEFAULT 'usd', support_email text, support_phone text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_organizations TO authenticated;
GRANT ALL ON public.partner_organizations TO service_role;
ALTER TABLE public.partner_organizations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_partner_orgs_key ON public.partner_organizations(partner_key, status);

CREATE TABLE IF NOT EXISTS public.partner_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'partner_agent' CHECK (role IN ('partner_owner','partner_admin','partner_manager','partner_agent','partner_billing','partner_viewer','partner_support_lead')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('invited','active','suspended','removed')),
  invited_by uuid, joined_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_members TO authenticated;
GRANT ALL ON public.partner_members TO service_role;
ALTER TABLE public.partner_members ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_partner_members_lookup ON public.partner_members(partner_id, user_id, status);

CREATE OR REPLACE FUNCTION public.is_partner_member(p_partner_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_members WHERE partner_id = p_partner_id AND user_id = p_user_id AND status = 'active');
$$;
CREATE OR REPLACE FUNCTION public.has_partner_role(p_partner_id uuid, p_role text, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_members WHERE partner_id = p_partner_id AND user_id = p_user_id AND status = 'active' AND role = p_role);
$$;
CREATE OR REPLACE FUNCTION public.is_partner_admin(p_partner_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_members WHERE partner_id = p_partner_id AND user_id = p_user_id AND status = 'active' AND role IN ('partner_owner','partner_admin'));
$$;

DROP POLICY IF EXISTS po_select ON public.partner_organizations;
DROP POLICY IF EXISTS po_manage ON public.partner_organizations;
CREATE POLICY po_select ON public.partner_organizations FOR SELECT TO authenticated USING (public.is_partner_member(id, auth.uid()));
CREATE POLICY po_manage ON public.partner_organizations FOR ALL TO authenticated USING (public.is_partner_admin(id, auth.uid())) WITH CHECK (public.is_partner_admin(id, auth.uid()));

DROP POLICY IF EXISTS pm_select ON public.partner_members;
DROP POLICY IF EXISTS pm_manage ON public.partner_members;
CREATE POLICY pm_select ON public.partner_members FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_partner_member(partner_id, auth.uid()));
CREATE POLICY pm_manage ON public.partner_members FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));

CREATE TABLE IF NOT EXISTS public.partner_client_tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  client_team_id uuid NOT NULL,
  relationship_type text NOT NULL DEFAULT 'managed_service' CHECK (relationship_type IN ('reseller','managed_service','enterprise_child','support_only','billing_only','implementation_partner')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','suspended','terminated','archived')),
  client_display_name text, external_customer_id text, contract_reference text,
  start_date date, end_date date,
  delegated_access_enabled boolean NOT NULL DEFAULT true,
  billing_managed_by_partner boolean NOT NULL DEFAULT false,
  support_managed_by_partner boolean NOT NULL DEFAULT true,
  created_by uuid, approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, client_team_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_client_tenants TO authenticated;
GRANT ALL ON public.partner_client_tenants TO service_role;
ALTER TABLE public.partner_client_tenants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pct_select ON public.partner_client_tenants;
DROP POLICY IF EXISTS pct_manage_partner ON public.partner_client_tenants;
DROP POLICY IF EXISTS pct_client_revoke ON public.partner_client_tenants;
CREATE POLICY pct_select ON public.partner_client_tenants FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()) OR public.is_team_member(auth.uid(), client_team_id));
CREATE POLICY pct_manage_partner ON public.partner_client_tenants FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE POLICY pct_client_revoke ON public.partner_client_tenants FOR UPDATE TO authenticated USING (public.is_deployment_admin(auth.uid(), client_team_id)) WITH CHECK (public.is_deployment_admin(auth.uid(), client_team_id));
CREATE INDEX IF NOT EXISTS idx_pct_lookup ON public.partner_client_tenants(partner_id, client_team_id, status);

CREATE OR REPLACE FUNCTION public.can_access_partner_client(p_partner_id uuid, p_client_team_id uuid, p_user_id uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.is_partner_member(p_partner_id, p_user_id)
    AND EXISTS (SELECT 1 FROM public.partner_client_tenants pct
      WHERE pct.partner_id = p_partner_id AND pct.client_team_id = p_client_team_id
      AND pct.status = 'active' AND pct.delegated_access_enabled = true);
$$;

CREATE TABLE IF NOT EXISTS public.partner_delegated_access_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  client_team_id uuid NOT NULL,
  partner_member_id uuid REFERENCES public.partner_members(id) ON DELETE SET NULL,
  user_id uuid,
  access_scope text NOT NULL CHECK (access_scope IN ('full_admin','support','devices','billing','security','audit','reports','readonly','custom')),
  permissions text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','suspended','revoked','expired')),
  reason text, expires_at timestamptz, granted_by uuid, revoked_by uuid, revoked_at timestamptz, last_used_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_delegated_access_grants TO authenticated;
GRANT ALL ON public.partner_delegated_access_grants TO service_role;
ALTER TABLE public.partner_delegated_access_grants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pdag_select ON public.partner_delegated_access_grants;
DROP POLICY IF EXISTS pdag_manage ON public.partner_delegated_access_grants;
DROP POLICY IF EXISTS pdag_client_revoke ON public.partner_delegated_access_grants;
CREATE POLICY pdag_select ON public.partner_delegated_access_grants FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_partner_admin(partner_id, auth.uid()) OR public.is_team_member(auth.uid(), client_team_id));
CREATE POLICY pdag_manage ON public.partner_delegated_access_grants FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE POLICY pdag_client_revoke ON public.partner_delegated_access_grants FOR UPDATE TO authenticated USING (public.is_deployment_admin(auth.uid(), client_team_id)) WITH CHECK (public.is_deployment_admin(auth.uid(), client_team_id));
CREATE INDEX IF NOT EXISTS idx_pdag_partner_client ON public.partner_delegated_access_grants(partner_id, client_team_id, status);
CREATE INDEX IF NOT EXISTS idx_pdag_user ON public.partner_delegated_access_grants(user_id, status);

CREATE TABLE IF NOT EXISTS public.partner_brand_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','archived')),
  brand_name text NOT NULL,
  logo_url text, favicon_url text, primary_color text, accent_color text,
  support_email text, support_phone text, website_url text, privacy_url text, terms_url text,
  app_title text, portal_welcome_message text, dashboard_footer_text text,
  hide_remotedesk_branding boolean NOT NULL DEFAULT false,
  custom_css jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid, activated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_brand_profiles TO authenticated;
GRANT ALL ON public.partner_brand_profiles TO service_role;
ALTER TABLE public.partner_brand_profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pbp_select ON public.partner_brand_profiles;
DROP POLICY IF EXISTS pbp_manage ON public.partner_brand_profiles;
CREATE POLICY pbp_select ON public.partner_brand_profiles FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()));
CREATE POLICY pbp_manage ON public.partner_brand_profiles FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_pbp_partner ON public.partner_brand_profiles(partner_id, status);

CREATE TABLE IF NOT EXISTS public.partner_custom_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  brand_profile_id uuid REFERENCES public.partner_brand_profiles(id) ON DELETE SET NULL,
  domain text NOT NULL,
  domain_type text NOT NULL DEFAULT 'portal' CHECK (domain_type IN ('portal','dashboard','api','download','support','universal')),
  status text NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification','verified','active','failed','paused','archived')),
  verification_method text NOT NULL DEFAULT 'dns_txt' CHECK (verification_method IN ('dns_txt','cname','manual')),
  verification_token_hash text, cname_target text,
  certificate_status text NOT NULL DEFAULT 'not_requested' CHECK (certificate_status IN ('not_requested','pending','issued','failed','expired','worker_required')),
  ssl_provider_reference text, activated_at timestamptz, last_checked_at timestamptz, error_message text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, domain)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_custom_domains TO authenticated;
GRANT ALL ON public.partner_custom_domains TO service_role;
ALTER TABLE public.partner_custom_domains ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pcd_select ON public.partner_custom_domains;
DROP POLICY IF EXISTS pcd_manage ON public.partner_custom_domains;
CREATE POLICY pcd_select ON public.partner_custom_domains FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()));
CREATE POLICY pcd_manage ON public.partner_custom_domains FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_pcd_partner_domain ON public.partner_custom_domains(partner_id, domain, status);

CREATE TABLE IF NOT EXISTS public.partner_client_brand_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  client_team_id uuid NOT NULL,
  brand_profile_id uuid NOT NULL REFERENCES public.partner_brand_profiles(id) ON DELETE CASCADE,
  domain_id uuid REFERENCES public.partner_custom_domains(id) ON DELETE SET NULL,
  apply_to_dashboard boolean NOT NULL DEFAULT false,
  apply_to_customer_portal boolean NOT NULL DEFAULT true,
  apply_to_download_page boolean NOT NULL DEFAULT true,
  apply_to_email_templates_placeholder boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  assigned_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_client_brand_assignments TO authenticated;
GRANT ALL ON public.partner_client_brand_assignments TO service_role;
ALTER TABLE public.partner_client_brand_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pcba_select ON public.partner_client_brand_assignments;
DROP POLICY IF EXISTS pcba_manage ON public.partner_client_brand_assignments;
CREATE POLICY pcba_select ON public.partner_client_brand_assignments FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()) OR public.is_team_member(auth.uid(), client_team_id));
CREATE POLICY pcba_manage ON public.partner_client_brand_assignments FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_pcba_lookup ON public.partner_client_brand_assignments(partner_id, client_team_id, status);

CREATE TABLE IF NOT EXISTS public.partner_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  package_key text NOT NULL, name text NOT NULL, description text, base_plan_id uuid,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','draft','deprecated','archived')),
  price_cents integer, currency text NOT NULL DEFAULT 'usd',
  billing_interval text NOT NULL DEFAULT 'monthly' CHECK (billing_interval IN ('monthly','yearly','custom')),
  included_entitlements jsonb NOT NULL DEFAULT '{}'::jsonb,
  support_level text NOT NULL DEFAULT 'standard' CHECK (support_level IN ('basic','standard','premium','white_glove','custom')),
  public_visible boolean NOT NULL DEFAULT false, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_id, package_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_packages TO authenticated;
GRANT ALL ON public.partner_packages TO service_role;
ALTER TABLE public.partner_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pkg_select ON public.partner_packages;
DROP POLICY IF EXISTS pkg_manage ON public.partner_packages;
CREATE POLICY pkg_select ON public.partner_packages FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()));
CREATE POLICY pkg_manage ON public.partner_packages FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_pkg_partner_key ON public.partner_packages(partner_id, package_key, status);

CREATE TABLE IF NOT EXISTS public.partner_plan_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  client_team_id uuid NOT NULL,
  plan_id uuid, partner_package_key text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','pending','suspended','canceled')),
  billing_mode text NOT NULL DEFAULT 'client_direct' CHECK (billing_mode IN ('client_direct','partner_resold','partner_invoiced','trial','comped')),
  seat_limit integer, device_limit integer,
  custom_entitlements jsonb NOT NULL DEFAULT '{}'::jsonb,
  effective_at timestamptz, expires_at timestamptz, assigned_by uuid, approved_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_plan_assignments TO authenticated;
GRANT ALL ON public.partner_plan_assignments TO service_role;
ALTER TABLE public.partner_plan_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ppa_select ON public.partner_plan_assignments;
DROP POLICY IF EXISTS ppa_manage ON public.partner_plan_assignments;
CREATE POLICY ppa_select ON public.partner_plan_assignments FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()) OR public.is_team_member(auth.uid(), client_team_id));
CREATE POLICY ppa_manage ON public.partner_plan_assignments FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_ppa_lookup ON public.partner_plan_assignments(partner_id, client_team_id, status);

CREATE TABLE IF NOT EXISTS public.partner_usage_rollups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  client_team_id uuid,
  period_start timestamptz NOT NULL, period_end timestamptz NOT NULL,
  devices_count integer NOT NULL DEFAULT 0, members_count integer NOT NULL DEFAULT 0,
  sessions_count integer NOT NULL DEFAULT 0, session_minutes numeric NOT NULL DEFAULT 0,
  support_tickets_count integer NOT NULL DEFAULT 0, api_requests_count integer NOT NULL DEFAULT 0,
  automation_runs_count integer NOT NULL DEFAULT 0, ai_jobs_count integer NOT NULL DEFAULT 0,
  integrations_count integer NOT NULL DEFAULT 0,
  estimated_revenue_cents integer, estimated_cost_cents integer,
  currency text NOT NULL DEFAULT 'usd',
  rollup_status text NOT NULL DEFAULT 'current' CHECK (rollup_status IN ('current','finalized','failed')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_usage_rollups TO authenticated;
GRANT ALL ON public.partner_usage_rollups TO service_role;
ALTER TABLE public.partner_usage_rollups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pur_select ON public.partner_usage_rollups;
DROP POLICY IF EXISTS pur_manage ON public.partner_usage_rollups;
CREATE POLICY pur_select ON public.partner_usage_rollups FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()));
CREATE POLICY pur_manage ON public.partner_usage_rollups FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_pur_period ON public.partner_usage_rollups(partner_id, period_start, period_end);

CREATE TABLE IF NOT EXISTS public.partner_commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  rule_type text NOT NULL DEFAULT 'percentage' CHECK (rule_type IN ('percentage','fixed_amount','tiered','custom')),
  percentage numeric, fixed_amount_cents integer, currency text NOT NULL DEFAULT 'usd',
  applies_to_plan_keys text[] NOT NULL DEFAULT '{}', applies_to_package_keys text[] NOT NULL DEFAULT '{}',
  min_revenue_cents integer, max_revenue_cents integer,
  effective_at timestamptz NOT NULL DEFAULT now(), expires_at timestamptz, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_commission_rules TO authenticated;
GRANT ALL ON public.partner_commission_rules TO service_role;
ALTER TABLE public.partner_commission_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pcr_select ON public.partner_commission_rules;
DROP POLICY IF EXISTS pcr_manage ON public.partner_commission_rules;
CREATE POLICY pcr_select ON public.partner_commission_rules FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()));
CREATE POLICY pcr_manage ON public.partner_commission_rules FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));

CREATE TABLE IF NOT EXISTS public.partner_commission_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  client_team_id uuid,
  commission_rule_id uuid REFERENCES public.partner_commission_rules(id) ON DELETE SET NULL,
  period_start timestamptz NOT NULL, period_end timestamptz NOT NULL,
  revenue_cents integer NOT NULL DEFAULT 0, commission_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'estimated' CHECK (status IN ('estimated','approved','paid_placeholder','disputed','waived','canceled')),
  invoice_reference text, payout_reference text,
  calculated_at timestamptz NOT NULL DEFAULT now(), approved_by uuid, approved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_commission_records TO authenticated;
GRANT ALL ON public.partner_commission_records TO service_role;
ALTER TABLE public.partner_commission_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pcrec_select ON public.partner_commission_records;
DROP POLICY IF EXISTS pcrec_manage ON public.partner_commission_records;
CREATE POLICY pcrec_select ON public.partner_commission_records FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()));
CREATE POLICY pcrec_manage ON public.partner_commission_records FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_pcrec_status ON public.partner_commission_records(partner_id, status, period_start);

CREATE TABLE IF NOT EXISTS public.partner_support_queues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  name text NOT NULL, description text,
  queue_type text NOT NULL DEFAULT 'general' CHECK (queue_type IN ('general','onboarding','billing','technical','security','escalation','client_success')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','archived')),
  default_priority text NOT NULL DEFAULT 'normal', created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_support_queues TO authenticated;
GRANT ALL ON public.partner_support_queues TO service_role;
ALTER TABLE public.partner_support_queues ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS psq_select ON public.partner_support_queues;
DROP POLICY IF EXISTS psq_manage ON public.partner_support_queues;
CREATE POLICY psq_select ON public.partner_support_queues FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()));
CREATE POLICY psq_manage ON public.partner_support_queues FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_psq_partner ON public.partner_support_queues(partner_id, status);

CREATE TABLE IF NOT EXISTS public.partner_support_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  client_team_id uuid NOT NULL,
  support_ticket_id uuid,
  partner_queue_id uuid REFERENCES public.partner_support_queues(id) ON DELETE SET NULL,
  assigned_partner_member_id uuid REFERENCES public.partner_members(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','resolved','escalated','archived')),
  assignment_reason text, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_support_assignments TO authenticated;
GRANT ALL ON public.partner_support_assignments TO service_role;
ALTER TABLE public.partner_support_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS psa_select ON public.partner_support_assignments;
DROP POLICY IF EXISTS psa_manage ON public.partner_support_assignments;
CREATE POLICY psa_select ON public.partner_support_assignments FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()) OR public.is_team_member(auth.uid(), client_team_id));
CREATE POLICY psa_manage ON public.partner_support_assignments FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_psa_lookup ON public.partner_support_assignments(partner_id, client_team_id, status);

CREATE TABLE IF NOT EXISTS public.partner_onboarding_checklists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  client_team_id uuid NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'in_progress' CHECK (status IN ('not_started','in_progress','completed','blocked','canceled')),
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  due_at timestamptz, assigned_to uuid, created_by uuid, completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_onboarding_checklists TO authenticated;
GRANT ALL ON public.partner_onboarding_checklists TO service_role;
ALTER TABLE public.partner_onboarding_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS poc_select ON public.partner_onboarding_checklists;
DROP POLICY IF EXISTS poc_manage ON public.partner_onboarding_checklists;
CREATE POLICY poc_select ON public.partner_onboarding_checklists FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()) OR public.is_team_member(auth.uid(), client_team_id));
CREATE POLICY poc_manage ON public.partner_onboarding_checklists FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_poc_lookup ON public.partner_onboarding_checklists(partner_id, client_team_id, status);

CREATE TABLE IF NOT EXISTS public.partner_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  client_team_id uuid, event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  title text NOT NULL, description text,
  actor_id uuid, resource_type text, resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.partner_audit_events TO authenticated;
GRANT ALL ON public.partner_audit_events TO service_role;
ALTER TABLE public.partner_audit_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS pae_select ON public.partner_audit_events;
CREATE POLICY pae_select ON public.partner_audit_events FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()) OR (client_team_id IS NOT NULL AND public.is_team_member(auth.uid(), client_team_id)));
CREATE INDEX IF NOT EXISTS idx_pae_partner_time ON public.partner_audit_events(partner_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.partner_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id uuid NOT NULL REFERENCES public.partner_organizations(id) ON DELETE CASCADE,
  report_type text NOT NULL CHECK (report_type IN ('partner_overview','client_usage','fleet_health','support_performance','billing_summary','commission_summary','onboarding_status','security_posture','compliance_summary','white_label_status')),
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','success','failed')),
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb, output jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_id uuid, requested_by uuid, error_message text,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_reports TO authenticated;
GRANT ALL ON public.partner_reports TO service_role;
ALTER TABLE public.partner_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS prep_select ON public.partner_reports;
DROP POLICY IF EXISTS prep_manage ON public.partner_reports;
CREATE POLICY prep_select ON public.partner_reports FOR SELECT TO authenticated USING (public.is_partner_member(partner_id, auth.uid()));
CREATE POLICY prep_manage ON public.partner_reports FOR ALL TO authenticated USING (public.is_partner_admin(partner_id, auth.uid())) WITH CHECK (public.is_partner_admin(partner_id, auth.uid()));
CREATE INDEX IF NOT EXISTS idx_prep_status ON public.partner_reports(partner_id, status, created_at DESC);

DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'partner_organizations','partner_members','partner_client_tenants',
    'partner_delegated_access_grants','partner_brand_profiles','partner_custom_domains',
    'partner_client_brand_assignments','partner_packages','partner_plan_assignments',
    'partner_usage_rollups','partner_commission_rules','partner_commission_records',
    'partner_support_queues','partner_support_assignments','partner_onboarding_checklists',
    'partner_reports'
  ] LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_%I_updated_at ON public.%I', t, t);
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;
