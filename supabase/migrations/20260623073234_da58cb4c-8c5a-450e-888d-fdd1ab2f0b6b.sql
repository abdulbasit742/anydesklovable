
-- Helper
CREATE OR REPLACE FUNCTION public.is_marketplace_admin(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = _team_id AND tm.user_id = _user_id AND tm.role IN ('owner','admin')
  );
$$;

-- 1. publishers
CREATE TABLE public.marketplace_publishers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid,
  partner_organization_id uuid,
  publisher_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  publisher_type text NOT NULL DEFAULT 'internal',
  status text NOT NULL DEFAULT 'draft',
  verification_status text NOT NULL DEFAULT 'not_started',
  website_url text, support_email text, support_url text,
  security_contact_email text, logo_url text, billing_contact_email text,
  payout_status text NOT NULL DEFAULT 'not_configured',
  risk_level text NOT NULL DEFAULT 'medium',
  created_by uuid, reviewed_by uuid, approved_by uuid, approved_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_publishers TO authenticated;
GRANT ALL ON public.marketplace_publishers TO service_role;
GRANT SELECT ON public.marketplace_publishers TO anon;
ALTER TABLE public.marketplace_publishers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public approved publishers" ON public.marketplace_publishers FOR SELECT TO anon
  USING (status = 'approved');
CREATE POLICY "auth view publishers" ON public.marketplace_publishers FOR SELECT TO authenticated
  USING (status = 'approved' OR (team_id IS NOT NULL AND public.is_team_member(team_id, auth.uid())));
CREATE POLICY "admins manage publishers" ON public.marketplace_publishers FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));

-- 2. listings
CREATE TABLE public.marketplace_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id uuid NOT NULL REFERENCES public.marketplace_publishers(id) ON DELETE CASCADE,
  team_id uuid,
  listing_key text NOT NULL UNIQUE,
  name text NOT NULL,
  short_description text, description text,
  listing_type text NOT NULL DEFAULT 'integration',
  category text NOT NULL DEFAULT 'productivity',
  status text NOT NULL DEFAULT 'draft',
  visibility text NOT NULL DEFAULT 'public_marketplace',
  pricing_model text NOT NULL DEFAULT 'free',
  base_price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  trial_days integer,
  requires_security_review boolean NOT NULL DEFAULT false,
  requires_admin_approval boolean NOT NULL DEFAULT true,
  requires_billing_provider boolean NOT NULL DEFAULT false,
  install_mode text NOT NULL DEFAULT 'metadata_only',
  support_policy text, privacy_policy_url text, terms_url text,
  documentation_url text, icon_url text,
  screenshots jsonb NOT NULL DEFAULT '[]'::jsonb,
  tags text[] NOT NULL DEFAULT ARRAY[]::text[],
  version text NOT NULL DEFAULT '1.0.0',
  published_at timestamptz,
  created_by uuid, updated_by uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listings TO authenticated;
GRANT ALL ON public.marketplace_listings TO service_role;
GRANT SELECT ON public.marketplace_listings TO anon;
ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public published listings" ON public.marketplace_listings FOR SELECT TO anon
  USING (status = 'published' AND visibility = 'public_marketplace');
CREATE POLICY "auth view listings" ON public.marketplace_listings FOR SELECT TO authenticated
  USING (
    (status = 'published' AND visibility IN ('public_marketplace','private_marketplace','enterprise_only'))
    OR (team_id IS NOT NULL AND public.is_team_member(team_id, auth.uid()))
  );
CREATE POLICY "admins manage listings" ON public.marketplace_listings FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));

-- 3. listing versions
CREATE TABLE public.marketplace_listing_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  team_id uuid,
  version text NOT NULL,
  release_notes text,
  changelog jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'draft',
  artifact_reference jsonb NOT NULL DEFAULT '{}'::jsonb,
  compatibility jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid, approved_by uuid, approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, version)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listing_versions TO authenticated;
GRANT ALL ON public.marketplace_listing_versions TO service_role;
ALTER TABLE public.marketplace_listing_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth view versions" ON public.marketplace_listing_versions FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage versions" ON public.marketplace_listing_versions FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));

-- 4. listing assets
CREATE TABLE public.marketplace_listing_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  asset_type text NOT NULL DEFAULT 'screenshot',
  title text,
  storage_bucket text, storage_path text, external_url text,
  visibility text NOT NULL DEFAULT 'public',
  status text NOT NULL DEFAULT 'active',
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_listing_assets TO authenticated;
GRANT ALL ON public.marketplace_listing_assets TO service_role;
GRANT SELECT ON public.marketplace_listing_assets TO anon;
ALTER TABLE public.marketplace_listing_assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public assets" ON public.marketplace_listing_assets FOR SELECT TO anon
  USING (visibility = 'public' AND status = 'active');
CREATE POLICY "auth view assets" ON public.marketplace_listing_assets FOR SELECT TO authenticated
  USING (visibility IN ('public','internal') AND status = 'active');
CREATE POLICY "service manages assets" ON public.marketplace_listing_assets FOR ALL TO authenticated
  USING (auth.uid() = created_by) WITH CHECK (auth.uid() = created_by);

-- 5. review requests
CREATE TABLE public.marketplace_review_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  publisher_id uuid REFERENCES public.marketplace_publishers(id) ON DELETE CASCADE,
  review_type text NOT NULL DEFAULT 'listing',
  status text NOT NULL DEFAULT 'pending',
  reviewer_id uuid,
  checklist jsonb NOT NULL DEFAULT '[]'::jsonb,
  comments text,
  risk_findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  reviewed_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_review_requests TO authenticated;
GRANT ALL ON public.marketplace_review_requests TO service_role;
ALTER TABLE public.marketplace_review_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "auth view reviews" ON public.marketplace_review_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "creators manage reviews" ON public.marketplace_review_requests FOR ALL TO authenticated
  USING (created_by = auth.uid() OR reviewer_id = auth.uid())
  WITH CHECK (created_by = auth.uid() OR reviewer_id = auth.uid());

-- 6. installations
CREATE TABLE public.marketplace_installations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  listing_version_id uuid,
  publisher_id uuid,
  installed_by uuid,
  status text NOT NULL DEFAULT 'pending',
  install_mode text NOT NULL DEFAULT 'metadata_only',
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  external_install_reference text,
  billing_status text NOT NULL DEFAULT 'not_required',
  subscription_id uuid,
  trial_ends_at timestamptz,
  installed_at timestamptz NOT NULL DEFAULT now(),
  uninstalled_at timestamptz,
  last_used_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_installations TO authenticated;
GRANT ALL ON public.marketplace_installations TO service_role;
ALTER TABLE public.marketplace_installations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views installs" ON public.marketplace_installations FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "team creates installs" ON public.marketplace_installations FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins update installs" ON public.marketplace_installations FOR UPDATE TO authenticated
  USING (public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (public.is_marketplace_admin(auth.uid(), team_id));
CREATE POLICY "admins delete installs" ON public.marketplace_installations FOR DELETE TO authenticated
  USING (public.is_marketplace_admin(auth.uid(), team_id));

-- 7. installation events
CREATE TABLE public.marketplace_installation_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  installation_id uuid NOT NULL REFERENCES public.marketplace_installations(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL,
  event_type text NOT NULL,
  title text NOT NULL,
  description text,
  actor_id uuid,
  source text NOT NULL DEFAULT 'dashboard',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.marketplace_installation_events TO authenticated;
GRANT ALL ON public.marketplace_installation_events TO service_role;
ALTER TABLE public.marketplace_installation_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views install events" ON public.marketplace_installation_events FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));

-- 8. pricing plans
CREATE TABLE public.marketplace_pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  plan_key text NOT NULL,
  name text NOT NULL,
  description text,
  pricing_model text NOT NULL DEFAULT 'monthly',
  price_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  billing_interval text NOT NULL DEFAULT 'monthly',
  included_units integer,
  unit_name text,
  overage_price_cents integer,
  status text NOT NULL DEFAULT 'active',
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, plan_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_pricing_plans TO authenticated;
GRANT ALL ON public.marketplace_pricing_plans TO service_role;
GRANT SELECT ON public.marketplace_pricing_plans TO anon;
ALTER TABLE public.marketplace_pricing_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public view active plans" ON public.marketplace_pricing_plans FOR SELECT TO anon
  USING (status = 'active');
CREATE POLICY "auth view plans" ON public.marketplace_pricing_plans FOR SELECT TO authenticated USING (true);
CREATE POLICY "service manages plans" ON public.marketplace_pricing_plans FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 9. purchases
CREATE TABLE public.marketplace_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  pricing_plan_id uuid,
  installation_id uuid,
  purchase_number text,
  status text NOT NULL DEFAULT 'draft',
  quantity integer NOT NULL DEFAULT 1,
  amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  billing_provider text NOT NULL DEFAULT 'remote_desk_billing',
  provider_checkout_reference text,
  requested_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_purchases TO authenticated;
GRANT ALL ON public.marketplace_purchases TO service_role;
ALTER TABLE public.marketplace_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views purchases" ON public.marketplace_purchases FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "team creates purchases" ON public.marketplace_purchases FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins update purchases" ON public.marketplace_purchases FOR UPDATE TO authenticated
  USING (public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (public.is_marketplace_admin(auth.uid(), team_id));

-- 10. revenue ledger
CREATE TABLE public.marketplace_revenue_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid,
  publisher_id uuid REFERENCES public.marketplace_publishers(id) ON DELETE SET NULL,
  listing_id uuid REFERENCES public.marketplace_listings(id) ON DELETE SET NULL,
  purchase_id uuid REFERENCES public.marketplace_purchases(id) ON DELETE SET NULL,
  ledger_type text NOT NULL DEFAULT 'sale',
  status text NOT NULL DEFAULT 'estimated',
  gross_amount_cents integer NOT NULL DEFAULT 0,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  publisher_share_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  revenue_period_start date,
  revenue_period_end date,
  provider_reference text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_revenue_ledger TO authenticated;
GRANT ALL ON public.marketplace_revenue_ledger TO service_role;
ALTER TABLE public.marketplace_revenue_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins view ledger" ON public.marketplace_revenue_ledger FOR SELECT TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));
CREATE POLICY "admins manage ledger" ON public.marketplace_revenue_ledger FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));

-- 11. payout batches
CREATE TABLE public.marketplace_payout_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  publisher_id uuid NOT NULL REFERENCES public.marketplace_publishers(id) ON DELETE CASCADE,
  batch_number text,
  status text NOT NULL DEFAULT 'draft',
  period_start date NOT NULL,
  period_end date NOT NULL,
  gross_amount_cents integer NOT NULL DEFAULT 0,
  platform_fee_cents integer NOT NULL DEFAULT 0,
  payout_amount_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  payout_provider_reference text,
  reviewed_by uuid, approved_by uuid, approved_at timestamptz, paid_at timestamptz,
  notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_payout_batches TO authenticated;
GRANT ALL ON public.marketplace_payout_batches TO service_role;
ALTER TABLE public.marketplace_payout_batches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service manages payouts" ON public.marketplace_payout_batches FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "auth view payouts" ON public.marketplace_payout_batches FOR SELECT TO authenticated USING (false);

-- 12. payout items
CREATE TABLE public.marketplace_payout_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_batch_id uuid NOT NULL REFERENCES public.marketplace_payout_batches(id) ON DELETE CASCADE,
  ledger_id uuid NOT NULL REFERENCES public.marketplace_revenue_ledger(id) ON DELETE CASCADE,
  listing_id uuid,
  amount_cents integer NOT NULL,
  currency text NOT NULL DEFAULT 'usd',
  status text NOT NULL DEFAULT 'included',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_payout_items TO authenticated;
GRANT ALL ON public.marketplace_payout_items TO service_role;
ALTER TABLE public.marketplace_payout_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "service manages payout items" ON public.marketplace_payout_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);
CREATE POLICY "auth view payout items" ON public.marketplace_payout_items FOR SELECT TO authenticated USING (false);

-- 13. entitlement grants
CREATE TABLE public.marketplace_entitlement_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  installation_id uuid REFERENCES public.marketplace_installations(id) ON DELETE SET NULL,
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  entitlement_key text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  quantity integer,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_entitlement_grants TO authenticated;
GRANT ALL ON public.marketplace_entitlement_grants TO service_role;
ALTER TABLE public.marketplace_entitlement_grants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views entitlements" ON public.marketplace_entitlement_grants FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "admins manage entitlements" ON public.marketplace_entitlement_grants FOR ALL TO authenticated
  USING (public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (public.is_marketplace_admin(auth.uid(), team_id));

-- 14. usage records
CREATE TABLE public.marketplace_usage_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  installation_id uuid NOT NULL REFERENCES public.marketplace_installations(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL,
  usage_key text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit text,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  source text NOT NULL DEFAULT 'system',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.marketplace_usage_records TO authenticated;
GRANT ALL ON public.marketplace_usage_records TO service_role;
ALTER TABLE public.marketplace_usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views usage" ON public.marketplace_usage_records FOR SELECT TO authenticated
  USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "team records usage" ON public.marketplace_usage_records FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()));

-- 15. collections
CREATE TABLE public.marketplace_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid,
  collection_key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  collection_type text NOT NULL DEFAULT 'featured',
  visibility text NOT NULL DEFAULT 'public_marketplace',
  status text NOT NULL DEFAULT 'active',
  sort_order integer NOT NULL DEFAULT 100,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_collections TO authenticated;
GRANT ALL ON public.marketplace_collections TO service_role;
GRANT SELECT ON public.marketplace_collections TO anon;
ALTER TABLE public.marketplace_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public collections" ON public.marketplace_collections FOR SELECT TO anon
  USING (status = 'active' AND visibility = 'public_marketplace');
CREATE POLICY "auth view collections" ON public.marketplace_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "admins manage collections" ON public.marketplace_collections FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));

-- 16. collection items
CREATE TABLE public.marketplace_collection_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid NOT NULL REFERENCES public.marketplace_collections(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 100,
  badge text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, listing_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_collection_items TO authenticated;
GRANT ALL ON public.marketplace_collection_items TO service_role;
GRANT SELECT ON public.marketplace_collection_items TO anon;
ALTER TABLE public.marketplace_collection_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view collection items" ON public.marketplace_collection_items FOR SELECT USING (true);
CREATE POLICY "service manage collection items" ON public.marketplace_collection_items FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- 17. reviews
CREATE TABLE public.marketplace_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  listing_id uuid NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  installation_id uuid,
  user_id uuid,
  rating integer NOT NULL,
  title text, body text,
  status text NOT NULL DEFAULT 'published',
  publisher_response text,
  responded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_reviews TO authenticated;
GRANT ALL ON public.marketplace_reviews TO service_role;
GRANT SELECT ON public.marketplace_reviews TO anon;
ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public published reviews" ON public.marketplace_reviews FOR SELECT TO anon
  USING (status = 'published');
CREATE POLICY "auth view reviews" ON public.marketplace_reviews FOR SELECT TO authenticated
  USING (status = 'published' OR public.is_team_member(team_id, auth.uid()));
CREATE POLICY "team members create reviews" ON public.marketplace_reviews FOR INSERT TO authenticated
  WITH CHECK (public.is_team_member(team_id, auth.uid()) AND user_id = auth.uid());
CREATE POLICY "users update own reviews" ON public.marketplace_reviews FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (user_id = auth.uid() OR public.is_marketplace_admin(auth.uid(), team_id));

-- 18. security assessments
CREATE TABLE public.marketplace_security_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  publisher_id uuid REFERENCES public.marketplace_publishers(id) ON DELETE CASCADE,
  team_id uuid,
  assessment_type text NOT NULL DEFAULT 'security',
  status text NOT NULL DEFAULT 'not_started',
  risk_level text NOT NULL DEFAULT 'medium',
  findings jsonb NOT NULL DEFAULT '[]'::jsonb,
  permissions_requested text[] NOT NULL DEFAULT ARRAY[]::text[],
  data_access_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  reviewed_by uuid,
  reviewed_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_security_assessments TO authenticated;
GRANT ALL ON public.marketplace_security_assessments TO service_role;
ALTER TABLE public.marketplace_security_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins view assessments" ON public.marketplace_security_assessments FOR SELECT TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));
CREATE POLICY "admins manage assessments" ON public.marketplace_security_assessments FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));

-- 19. analytics snapshots
CREATE TABLE public.marketplace_analytics_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid,
  publisher_id uuid,
  listing_id uuid,
  snapshot_type text NOT NULL DEFAULT 'listing',
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  views integer NOT NULL DEFAULT 0,
  installs integer NOT NULL DEFAULT 0,
  active_installations integer NOT NULL DEFAULT 0,
  uninstalls integer NOT NULL DEFAULT 0,
  purchases integer NOT NULL DEFAULT 0,
  estimated_revenue_cents integer NOT NULL DEFAULT 0,
  average_rating numeric,
  usage_count numeric,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  calculated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_analytics_snapshots TO authenticated;
GRANT ALL ON public.marketplace_analytics_snapshots TO service_role;
ALTER TABLE public.marketplace_analytics_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins view analytics" ON public.marketplace_analytics_snapshots FOR SELECT TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));
CREATE POLICY "admins manage analytics" ON public.marketplace_analytics_snapshots FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));

-- 20. audit events
CREATE TABLE public.marketplace_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid,
  publisher_id uuid,
  listing_id uuid,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text,
  actor_id uuid,
  resource_type text,
  resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.marketplace_audit_events TO authenticated;
GRANT ALL ON public.marketplace_audit_events TO service_role;
ALTER TABLE public.marketplace_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team views mkt audit" ON public.marketplace_audit_events FOR SELECT TO authenticated
  USING (team_id IS NOT NULL AND public.is_team_member(team_id, auth.uid()));

-- 21. reports
CREATE TABLE public.marketplace_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid,
  publisher_id uuid,
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
GRANT SELECT, INSERT, UPDATE, DELETE ON public.marketplace_reports TO authenticated;
GRANT ALL ON public.marketplace_reports TO service_role;
ALTER TABLE public.marketplace_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins view mkt reports" ON public.marketplace_reports FOR SELECT TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));
CREATE POLICY "admins manage mkt reports" ON public.marketplace_reports FOR ALL TO authenticated
  USING (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id))
  WITH CHECK (team_id IS NOT NULL AND public.is_marketplace_admin(auth.uid(), team_id));

-- updated_at triggers
CREATE TRIGGER trg_mp_publishers_u BEFORE UPDATE ON public.marketplace_publishers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_listings_u BEFORE UPDATE ON public.marketplace_listings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_review_requests_u BEFORE UPDATE ON public.marketplace_review_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_installations_u BEFORE UPDATE ON public.marketplace_installations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_pricing_plans_u BEFORE UPDATE ON public.marketplace_pricing_plans FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_purchases_u BEFORE UPDATE ON public.marketplace_purchases FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_revenue_ledger_u BEFORE UPDATE ON public.marketplace_revenue_ledger FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_payout_batches_u BEFORE UPDATE ON public.marketplace_payout_batches FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_entitlement_grants_u BEFORE UPDATE ON public.marketplace_entitlement_grants FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_collections_u BEFORE UPDATE ON public.marketplace_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_reviews_u BEFORE UPDATE ON public.marketplace_reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_security_assessments_u BEFORE UPDATE ON public.marketplace_security_assessments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mp_reports_u BEFORE UPDATE ON public.marketplace_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_mp_publishers_key ON public.marketplace_publishers(publisher_key, status);
CREATE INDEX idx_mp_publishers_team ON public.marketplace_publishers(team_id, status);
CREATE INDEX idx_mp_listings_pub ON public.marketplace_listings(publisher_id, status);
CREATE INDEX idx_mp_listings_key ON public.marketplace_listings(listing_key, status);
CREATE INDEX idx_mp_listings_cat ON public.marketplace_listings(category, status, visibility);
CREATE INDEX idx_mp_versions_listing ON public.marketplace_listing_versions(listing_id, version);
CREATE INDEX idx_mp_reviews_req_listing ON public.marketplace_review_requests(listing_id, status);
CREATE INDEX idx_mp_installations_team ON public.marketplace_installations(team_id, listing_id, status);
CREATE INDEX idx_mp_install_events ON public.marketplace_installation_events(team_id, installation_id, created_at DESC);
CREATE INDEX idx_mp_pricing_plans_listing ON public.marketplace_pricing_plans(listing_id, status);
CREATE INDEX idx_mp_purchases_team ON public.marketplace_purchases(team_id, status, created_at DESC);
CREATE INDEX idx_mp_revenue_ledger_pub ON public.marketplace_revenue_ledger(publisher_id, status, created_at DESC);
CREATE INDEX idx_mp_payout_batches_pub ON public.marketplace_payout_batches(publisher_id, status, period_start, period_end);
CREATE INDEX idx_mp_entitlement_grants_team ON public.marketplace_entitlement_grants(team_id, entitlement_key, status);
CREATE INDEX idx_mp_usage_records_team ON public.marketplace_usage_records(team_id, listing_id, occurred_at DESC);
CREATE INDEX idx_mp_collections_key ON public.marketplace_collections(collection_key, status);
CREATE INDEX idx_mp_reviews_listing ON public.marketplace_reviews(listing_id, status, created_at DESC);
CREATE INDEX idx_mp_security_listing ON public.marketplace_security_assessments(listing_id, status, risk_level);
CREATE INDEX idx_mp_analytics_listing ON public.marketplace_analytics_snapshots(listing_id, period_start, period_end);
CREATE INDEX idx_mp_audit_team ON public.marketplace_audit_events(team_id, created_at DESC);
CREATE INDEX idx_mp_reports_team ON public.marketplace_reports(team_id, status, created_at DESC);
