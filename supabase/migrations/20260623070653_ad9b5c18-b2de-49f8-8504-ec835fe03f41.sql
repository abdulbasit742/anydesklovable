
-- Helper: procurement admin check
CREATE OR REPLACE FUNCTION public.is_procurement_admin(_user_id uuid, _team_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = _user_id AND team_id = _team_id AND role IN ('owner','admin')
  )
$$;

-- 1. asset_vendors
CREATE TABLE public.asset_vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  vendor_key text NOT NULL,
  name text NOT NULL,
  vendor_type text NOT NULL DEFAULT 'supplier',
  status text NOT NULL DEFAULT 'active',
  website_url text, support_url text, support_email text,
  account_manager_name text, account_manager_email text,
  risk_level text NOT NULL DEFAULT 'medium',
  security_review_status text NOT NULL DEFAULT 'not_started',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, vendor_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_vendors TO authenticated;
GRANT ALL ON public.asset_vendors TO service_role;
ALTER TABLE public.asset_vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "vendors_team_select" ON public.asset_vendors FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "vendors_admin_write" ON public.asset_vendors FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 2. asset_categories
CREATE TABLE public.asset_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  category_key text NOT NULL,
  name text NOT NULL,
  description text,
  category_type text NOT NULL DEFAULT 'hardware',
  parent_category_id uuid,
  default_depreciation_months integer,
  requires_serial_number boolean NOT NULL DEFAULT false,
  requires_assignment boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, category_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_categories TO authenticated;
GRANT ALL ON public.asset_categories TO service_role;
ALTER TABLE public.asset_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_team_select" ON public.asset_categories FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "categories_admin_write" ON public.asset_categories FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 3. asset_inventory_items
CREATE TABLE public.asset_inventory_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_tag text,
  asset_name text NOT NULL,
  category_id uuid,
  asset_type text NOT NULL DEFAULT 'hardware',
  status text NOT NULL DEFAULT 'in_stock',
  lifecycle_stage text NOT NULL DEFAULT 'planning',
  vendor_id uuid,
  manufacturer text, model text, serial_number text,
  linked_device_id uuid, linked_mobile_installation_id uuid, linked_client_installation_id uuid,
  assigned_to_user_id uuid, assigned_to_customer_account_id uuid, assigned_to_team_id uuid,
  location_label text, cost_center text, department text,
  purchase_order_id uuid, purchase_date date,
  purchase_cost_cents integer, currency text NOT NULL DEFAULT 'usd',
  warranty_start date, warranty_end date, expected_retirement_date date,
  notes text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_inventory_items TO authenticated;
GRANT ALL ON public.asset_inventory_items TO service_role;
ALTER TABLE public.asset_inventory_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets_team_select" ON public.asset_inventory_items FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "assets_admin_write" ON public.asset_inventory_items FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 4. asset_assignments
CREATE TABLE public.asset_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  assigned_to_user_id uuid, assigned_to_customer_account_id uuid,
  assigned_to_device_id uuid, assigned_to_partner_id uuid,
  assignment_type text NOT NULL DEFAULT 'user',
  status text NOT NULL DEFAULT 'active',
  assigned_by uuid, returned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  returned_at timestamptz,
  condition_on_assign text, condition_on_return text,
  notes text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_assignments TO authenticated;
GRANT ALL ON public.asset_assignments TO service_role;
ALTER TABLE public.asset_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments_team_select" ON public.asset_assignments FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "assignments_admin_write" ON public.asset_assignments FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 5. purchase_requests
CREATE TABLE public.purchase_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  request_number text,
  title text NOT NULL, description text,
  request_type text NOT NULL DEFAULT 'hardware',
  status text NOT NULL DEFAULT 'draft',
  priority text NOT NULL DEFAULT 'normal',
  requested_by uuid, requested_for_user_id uuid,
  vendor_id uuid,
  estimated_cost_cents integer, currency text NOT NULL DEFAULT 'usd',
  cost_center text, business_justification text, required_by date,
  approved_by uuid, approved_at timestamptz,
  rejected_by uuid, rejected_at timestamptz, decision_note text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_requests TO authenticated;
GRANT ALL ON public.purchase_requests TO service_role;
ALTER TABLE public.purchase_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pr_team_select" ON public.purchase_requests FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "pr_member_insert" ON public.purchase_requests FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id, auth.uid()) AND requested_by = auth.uid());
CREATE POLICY "pr_owner_update" ON public.purchase_requests FOR UPDATE TO authenticated USING (requested_by = auth.uid() OR public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (requested_by = auth.uid() OR public.is_procurement_admin(auth.uid(), team_id));
CREATE POLICY "pr_admin_delete" ON public.purchase_requests FOR DELETE TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id));

-- 6. purchase_request_items
CREATE TABLE public.purchase_request_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  purchase_request_id uuid NOT NULL,
  item_name text NOT NULL, item_description text,
  category_id uuid,
  quantity integer NOT NULL DEFAULT 1,
  unit_cost_cents integer, total_cost_cents integer,
  vendor_id uuid, requested_license_id uuid,
  asset_type text NOT NULL DEFAULT 'hardware',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_request_items TO authenticated;
GRANT ALL ON public.purchase_request_items TO service_role;
ALTER TABLE public.purchase_request_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pri_team_select" ON public.purchase_request_items FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "pri_write" ON public.purchase_request_items FOR ALL TO authenticated USING (public.is_team_member(team_id, auth.uid())) WITH CHECK (public.is_team_member(team_id, auth.uid()));

-- 7. purchase_orders
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  po_number text,
  purchase_request_id uuid, vendor_id uuid,
  status text NOT NULL DEFAULT 'draft',
  order_date date, expected_delivery_date date, received_date date,
  subtotal_cents integer NOT NULL DEFAULT 0,
  tax_cents integer NOT NULL DEFAULT 0,
  shipping_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'usd',
  external_reference text, procurement_system_reference text,
  created_by uuid, approved_by uuid, notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_orders TO authenticated;
GRANT ALL ON public.purchase_orders TO service_role;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "po_team_select" ON public.purchase_orders FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "po_admin_write" ON public.purchase_orders FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 8. purchase_order_items
CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  purchase_order_id uuid NOT NULL,
  item_name text NOT NULL,
  quantity_ordered integer NOT NULL DEFAULT 1,
  quantity_received integer NOT NULL DEFAULT 0,
  unit_cost_cents integer, total_cost_cents integer,
  category_id uuid, asset_type text NOT NULL DEFAULT 'hardware',
  created_asset_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_order_items TO authenticated;
GRANT ALL ON public.purchase_order_items TO service_role;
ALTER TABLE public.purchase_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "poi_team_select" ON public.purchase_order_items FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "poi_admin_write" ON public.purchase_order_items FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 9. asset_receipts
CREATE TABLE public.asset_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  purchase_order_id uuid, purchase_order_item_id uuid,
  received_by uuid, received_at timestamptz NOT NULL DEFAULT now(),
  quantity_received integer NOT NULL DEFAULT 1,
  condition text NOT NULL DEFAULT 'new',
  receiving_notes text,
  created_asset_ids uuid[] NOT NULL DEFAULT '{}'::uuid[],
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_receipts TO authenticated;
GRANT ALL ON public.asset_receipts TO service_role;
ALTER TABLE public.asset_receipts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "receipts_team_select" ON public.asset_receipts FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "receipts_admin_write" ON public.asset_receipts FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 10. software_products
CREATE TABLE public.software_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  product_key text NOT NULL,
  name text NOT NULL, vendor_id uuid,
  product_type text NOT NULL DEFAULT 'saas',
  status text NOT NULL DEFAULT 'active',
  website_url text, admin_url text, support_url text,
  data_sensitivity text NOT NULL DEFAULT 'internal',
  security_review_status text NOT NULL DEFAULT 'not_started',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, product_key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_products TO authenticated;
GRANT ALL ON public.software_products TO service_role;
ALTER TABLE public.software_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_team_select" ON public.software_products FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "products_admin_write" ON public.software_products FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 11. software_licenses
CREATE TABLE public.software_licenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  software_product_id uuid NOT NULL,
  vendor_id uuid,
  license_key text, license_key_hash text,
  name text NOT NULL,
  license_type text NOT NULL DEFAULT 'seat',
  status text NOT NULL DEFAULT 'active',
  total_seats integer, used_seats integer NOT NULL DEFAULT 0,
  available_seats integer,
  renewal_date date, start_date date, end_date date,
  billing_interval text NOT NULL DEFAULT 'monthly',
  cost_cents integer, currency text NOT NULL DEFAULT 'usd',
  auto_renew boolean NOT NULL DEFAULT false,
  contract_id uuid, notes text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid, updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_licenses TO authenticated;
GRANT ALL ON public.software_licenses TO service_role;
ALTER TABLE public.software_licenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "licenses_team_select" ON public.software_licenses FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "licenses_admin_write" ON public.software_licenses FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 12. software_license_assignments
CREATE TABLE public.software_license_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  license_id uuid NOT NULL,
  user_id uuid, device_id uuid, customer_account_id uuid,
  assignment_status text NOT NULL DEFAULT 'active',
  assigned_by uuid, assigned_at timestamptz NOT NULL DEFAULT now(),
  revoked_by uuid, revoked_at timestamptz,
  usage_last_seen_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.software_license_assignments TO authenticated;
GRANT ALL ON public.software_license_assignments TO service_role;
ALTER TABLE public.software_license_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lic_assign_team_select" ON public.software_license_assignments FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "lic_assign_admin_write" ON public.software_license_assignments FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 13. license_usage_snapshots
CREATE TABLE public.license_usage_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  license_id uuid NOT NULL,
  software_product_id uuid NOT NULL,
  total_seats integer, assigned_seats integer,
  active_users integer, inactive_users integer,
  overage_count integer NOT NULL DEFAULT 0,
  underused_count integer NOT NULL DEFAULT 0,
  compliance_status text NOT NULL DEFAULT 'unknown',
  source text NOT NULL DEFAULT 'manual',
  captured_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.license_usage_snapshots TO authenticated;
GRANT ALL ON public.license_usage_snapshots TO service_role;
ALTER TABLE public.license_usage_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lus_team_select" ON public.license_usage_snapshots FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "lus_admin_write" ON public.license_usage_snapshots FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 14. asset_contracts
CREATE TABLE public.asset_contracts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  vendor_id uuid, contract_number text,
  title text NOT NULL,
  contract_type text NOT NULL DEFAULT 'software_subscription',
  status text NOT NULL DEFAULT 'active',
  start_date date, end_date date, renewal_date date,
  auto_renew boolean NOT NULL DEFAULT false,
  notice_period_days integer,
  contract_value_cents integer, currency text NOT NULL DEFAULT 'usd',
  owner_user_id uuid, storage_path text, external_url text,
  sensitivity_level text NOT NULL DEFAULT 'confidential',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_contracts TO authenticated;
GRANT ALL ON public.asset_contracts TO service_role;
ALTER TABLE public.asset_contracts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contracts_team_select" ON public.asset_contracts FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "contracts_admin_write" ON public.asset_contracts FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 15. contract_milestones
CREATE TABLE public.contract_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  contract_id uuid NOT NULL,
  milestone_type text NOT NULL DEFAULT 'renewal',
  title text NOT NULL,
  due_date date NOT NULL,
  status text NOT NULL DEFAULT 'open',
  assigned_to uuid, completed_by uuid, completed_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contract_milestones TO authenticated;
GRANT ALL ON public.contract_milestones TO service_role;
ALTER TABLE public.contract_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "milestones_team_select" ON public.contract_milestones FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "milestones_admin_write" ON public.contract_milestones FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 16. warranty_records
CREATE TABLE public.warranty_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  vendor_id uuid,
  warranty_type text NOT NULL DEFAULT 'standard',
  status text NOT NULL DEFAULT 'active',
  start_date date, end_date date,
  warranty_reference text, claim_url text, support_contact text,
  notes text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.warranty_records TO authenticated;
GRANT ALL ON public.warranty_records TO service_role;
ALTER TABLE public.warranty_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "warranty_team_select" ON public.warranty_records FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "warranty_admin_write" ON public.warranty_records FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 17. asset_maintenance_events
CREATE TABLE public.asset_maintenance_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid NOT NULL,
  event_type text NOT NULL DEFAULT 'maintenance',
  status text NOT NULL DEFAULT 'scheduled',
  title text NOT NULL, description text,
  performed_by uuid, vendor_id uuid,
  field_job_id uuid, support_ticket_id uuid,
  cost_cents integer, currency text NOT NULL DEFAULT 'usd',
  scheduled_at timestamptz, completed_at timestamptz,
  notes text, metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_maintenance_events TO authenticated;
GRANT ALL ON public.asset_maintenance_events TO service_role;
ALTER TABLE public.asset_maintenance_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "maint_team_select" ON public.asset_maintenance_events FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "maint_admin_write" ON public.asset_maintenance_events FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 18. asset_lifecycle_events
CREATE TABLE public.asset_lifecycle_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  asset_id uuid, software_license_id uuid,
  event_type text NOT NULL, title text NOT NULL, description text,
  actor_id uuid, old_status text, new_status text,
  resource_type text, resource_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.asset_lifecycle_events TO authenticated;
GRANT ALL ON public.asset_lifecycle_events TO service_role;
ALTER TABLE public.asset_lifecycle_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lifecycle_team_select" ON public.asset_lifecycle_events FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));

-- 19. procurement_approval_requests
CREATE TABLE public.procurement_approval_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  request_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  title text NOT NULL, description text,
  amount_cents integer, currency text NOT NULL DEFAULT 'usd',
  risk_level text NOT NULL DEFAULT 'medium',
  purchase_request_id uuid, purchase_order_id uuid,
  contract_id uuid, software_license_id uuid, asset_id uuid,
  requested_by uuid, reviewed_by uuid,
  decision_note text, reviewed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.procurement_approval_requests TO authenticated;
GRANT ALL ON public.procurement_approval_requests TO service_role;
ALTER TABLE public.procurement_approval_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approvals_team_select" ON public.procurement_approval_requests FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "approvals_member_insert" ON public.procurement_approval_requests FOR INSERT TO authenticated WITH CHECK (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "approvals_admin_update" ON public.procurement_approval_requests FOR UPDATE TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));
CREATE POLICY "approvals_admin_delete" ON public.procurement_approval_requests FOR DELETE TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id));

-- 20. procurement_import_jobs
CREATE TABLE public.procurement_import_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  source_type text NOT NULL, import_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  records_created integer NOT NULL DEFAULT 0,
  records_updated integer NOT NULL DEFAULT 0,
  records_failed integer NOT NULL DEFAULT 0,
  error_message text, created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.procurement_import_jobs TO authenticated;
GRANT ALL ON public.procurement_import_jobs TO service_role;
ALTER TABLE public.procurement_import_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "imports_team_select" ON public.procurement_import_jobs FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "imports_admin_write" ON public.procurement_import_jobs FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- 21. procurement_reports
CREATE TABLE public.procurement_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  report_type text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  title text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  artifact_id uuid, requested_by uuid, error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.procurement_reports TO authenticated;
GRANT ALL ON public.procurement_reports TO service_role;
ALTER TABLE public.procurement_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "preports_team_select" ON public.procurement_reports FOR SELECT TO authenticated USING (public.is_team_member(team_id, auth.uid()));
CREATE POLICY "preports_admin_write" ON public.procurement_reports FOR ALL TO authenticated USING (public.is_procurement_admin(auth.uid(), team_id)) WITH CHECK (public.is_procurement_admin(auth.uid(), team_id));

-- updated_at triggers
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'asset_vendors','asset_categories','asset_inventory_items','asset_assignments',
    'purchase_requests','purchase_request_items','purchase_orders','purchase_order_items',
    'software_products','software_licenses','software_license_assignments',
    'asset_contracts','contract_milestones','warranty_records','asset_maintenance_events',
    'procurement_approval_requests','procurement_import_jobs','procurement_reports'
  ]) LOOP
    EXECUTE format('CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t, t);
  END LOOP;
END $$;

-- Indexes
CREATE INDEX idx_av_team_key ON public.asset_vendors(team_id, vendor_key, status);
CREATE INDEX idx_ac_team_key ON public.asset_categories(team_id, category_key, category_type);
CREATE INDEX idx_aii_team_status ON public.asset_inventory_items(team_id, status, asset_type);
CREATE INDEX idx_aii_team_tag ON public.asset_inventory_items(team_id, asset_tag);
CREATE INDEX idx_aii_team_serial ON public.asset_inventory_items(team_id, serial_number);
CREATE INDEX idx_aii_team_device ON public.asset_inventory_items(team_id, linked_device_id);
CREATE INDEX idx_aa_team_asset ON public.asset_assignments(team_id, asset_id, status);
CREATE INDEX idx_aa_team_user ON public.asset_assignments(team_id, assigned_to_user_id, status);
CREATE INDEX idx_pr_team_status ON public.purchase_requests(team_id, status, created_at DESC);
CREATE INDEX idx_pri_team_pr ON public.purchase_request_items(team_id, purchase_request_id);
CREATE INDEX idx_po_team_status ON public.purchase_orders(team_id, status, created_at DESC);
CREATE INDEX idx_poi_team_po ON public.purchase_order_items(team_id, purchase_order_id);
CREATE INDEX idx_rcpt_team_po ON public.asset_receipts(team_id, purchase_order_id);
CREATE INDEX idx_sp_team_key ON public.software_products(team_id, product_key, status);
CREATE INDEX idx_sl_team_product ON public.software_licenses(team_id, software_product_id, status);
CREATE INDEX idx_sla_team_license ON public.software_license_assignments(team_id, license_id, assignment_status);
CREATE INDEX idx_lus_team_license ON public.license_usage_snapshots(team_id, license_id, captured_at DESC);
CREATE INDEX idx_ctr_team_renewal ON public.asset_contracts(team_id, status, renewal_date);
CREATE INDEX idx_cm_team_due ON public.contract_milestones(team_id, due_date, status);
CREATE INDEX idx_wr_team_asset ON public.warranty_records(team_id, asset_id, end_date);
CREATE INDEX idx_ame_team_asset ON public.asset_maintenance_events(team_id, asset_id, status);
CREATE INDEX idx_ale_team_asset ON public.asset_lifecycle_events(team_id, asset_id, created_at DESC);
CREATE INDEX idx_par_team_status ON public.procurement_approval_requests(team_id, status, created_at DESC);
CREATE INDEX idx_pij_team_status ON public.procurement_import_jobs(team_id, status, created_at DESC);
CREATE INDEX idx_prep_team_status ON public.procurement_reports(team_id, status, created_at DESC);
