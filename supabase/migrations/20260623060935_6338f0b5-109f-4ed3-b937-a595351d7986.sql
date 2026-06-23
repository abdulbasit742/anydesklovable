
-- =====================================================
-- TASK #19 — MARKETPLACE + INTEGRATIONS HUB
-- =====================================================

-- Helper: integration manager role check (owner/admin)
CREATE OR REPLACE FUNCTION public.is_integration_manager(_user_id uuid, _team_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    public.has_role(_user_id, _team_id, 'owner'::app_role)
    OR public.has_role(_user_id, _team_id, 'admin'::app_role);
$$;

-- 1. integration_catalog (global)
CREATE TABLE public.integration_catalog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'productivity',
  provider text NOT NULL,
  logo_url text,
  website_url text,
  docs_url text,
  auth_type text NOT NULL DEFAULT 'oauth2',
  integration_type text NOT NULL DEFAULT 'outbound',
  status text NOT NULL DEFAULT 'available',
  supported_events text[] NOT NULL DEFAULT '{}',
  supported_actions text[] NOT NULL DEFAULT '{}',
  required_scopes text[] NOT NULL DEFAULT '{}',
  config_schema jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_catalog TO authenticated;
GRANT ALL ON public.integration_catalog TO service_role;
ALTER TABLE public.integration_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog_select_all" ON public.integration_catalog FOR SELECT TO authenticated USING (true);
CREATE INDEX idx_catalog_key_status ON public.integration_catalog(key, status);
CREATE TRIGGER trg_catalog_updated BEFORE UPDATE ON public.integration_catalog
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 2. team_integrations
CREATE TABLE public.team_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  catalog_id uuid NOT NULL REFERENCES public.integration_catalog(id) ON DELETE RESTRICT,
  integration_key text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'not_connected',
  auth_status text NOT NULL DEFAULT 'not_configured',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  connected_by uuid,
  connected_at timestamptz,
  last_sync_at timestamptz,
  last_error_at timestamptz,
  last_error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team_integrations TO authenticated;
GRANT ALL ON public.team_integrations TO service_role;
ALTER TABLE public.team_integrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_integrations_select" ON public.team_integrations FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "team_integrations_manage" ON public.team_integrations FOR ALL TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id))
  WITH CHECK (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_team_integrations_team_key ON public.team_integrations(team_id, integration_key, status);
CREATE TRIGGER trg_team_integrations_updated BEFORE UPDATE ON public.team_integrations
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 3. integration_connections
CREATE TABLE public.integration_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  team_integration_id uuid NOT NULL REFERENCES public.team_integrations(id) ON DELETE CASCADE,
  connection_name text NOT NULL,
  auth_type text NOT NULL,
  credential_reference text,
  external_account_id text,
  external_account_name text,
  external_workspace_id text,
  external_workspace_name text,
  scopes text[] NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  token_expires_at timestamptz,
  last_validated_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_connections TO authenticated;
GRANT ALL ON public.integration_connections TO service_role;
ALTER TABLE public.integration_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "integration_connections_select" ON public.integration_connections FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "integration_connections_manage" ON public.integration_connections FOR ALL TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id))
  WITH CHECK (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_int_connections_team_int ON public.integration_connections(team_id, team_integration_id, status);
CREATE TRIGGER trg_int_connections_updated BEFORE UPDATE ON public.integration_connections
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 4. integration_oauth_states
CREATE TABLE public.integration_oauth_states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  catalog_id uuid NOT NULL REFERENCES public.integration_catalog(id) ON DELETE CASCADE,
  requested_by uuid,
  state_hash text NOT NULL,
  redirect_uri text,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz NOT NULL,
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_oauth_states TO authenticated;
GRANT ALL ON public.integration_oauth_states TO service_role;
ALTER TABLE public.integration_oauth_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "oauth_states_select" ON public.integration_oauth_states FOR SELECT TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_oauth_states_team_hash ON public.integration_oauth_states(team_id, state_hash);

-- 5. integration_event_mappings
CREATE TABLE public.integration_event_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  team_integration_id uuid NOT NULL REFERENCES public.team_integrations(id) ON DELETE CASCADE,
  name text NOT NULL,
  source_event text NOT NULL,
  target_action text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  transform_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  destination_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_event_mappings TO authenticated;
GRANT ALL ON public.integration_event_mappings TO service_role;
ALTER TABLE public.integration_event_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "event_mappings_select" ON public.integration_event_mappings FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "event_mappings_manage" ON public.integration_event_mappings FOR ALL TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id))
  WITH CHECK (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_event_mappings_team_int ON public.integration_event_mappings(team_id, team_integration_id, enabled);
CREATE TRIGGER trg_event_mappings_updated BEFORE UPDATE ON public.integration_event_mappings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 6. integration_action_runs
CREATE TABLE public.integration_action_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  team_integration_id uuid NOT NULL REFERENCES public.team_integrations(id) ON DELETE CASCADE,
  mapping_id uuid REFERENCES public.integration_event_mappings(id) ON DELETE SET NULL,
  action_key text NOT NULL,
  status text NOT NULL DEFAULT 'queued',
  input jsonb NOT NULL DEFAULT '{}'::jsonb,
  output jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 3,
  scheduled_for timestamptz,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_action_runs TO authenticated;
GRANT ALL ON public.integration_action_runs TO service_role;
ALTER TABLE public.integration_action_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "action_runs_select" ON public.integration_action_runs FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "action_runs_manage" ON public.integration_action_runs FOR ALL TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id))
  WITH CHECK (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_action_runs_team_status ON public.integration_action_runs(team_id, status, created_at DESC);
CREATE INDEX idx_action_runs_int_created ON public.integration_action_runs(team_integration_id, created_at DESC);
CREATE TRIGGER trg_action_runs_updated BEFORE UPDATE ON public.integration_action_runs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 7. integration_sync_jobs
CREATE TABLE public.integration_sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  team_integration_id uuid NOT NULL REFERENCES public.team_integrations(id) ON DELETE CASCADE,
  sync_type text NOT NULL,
  resource_type text,
  status text NOT NULL DEFAULT 'queued',
  cursor text,
  records_processed integer NOT NULL DEFAULT 0,
  records_created integer NOT NULL DEFAULT 0,
  records_updated integer NOT NULL DEFAULT 0,
  records_failed integer NOT NULL DEFAULT 0,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_sync_jobs TO authenticated;
GRANT ALL ON public.integration_sync_jobs TO service_role;
ALTER TABLE public.integration_sync_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sync_jobs_select" ON public.integration_sync_jobs FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "sync_jobs_manage" ON public.integration_sync_jobs FOR ALL TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id))
  WITH CHECK (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_sync_jobs_team_status ON public.integration_sync_jobs(team_id, status, created_at DESC);
CREATE TRIGGER trg_sync_jobs_updated BEFORE UPDATE ON public.integration_sync_jobs
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 8. integration_webhook_inboxes
CREATE TABLE public.integration_webhook_inboxes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  team_integration_id uuid NOT NULL REFERENCES public.team_integrations(id) ON DELETE CASCADE,
  endpoint_key text NOT NULL,
  secret_hash text,
  status text NOT NULL DEFAULT 'active',
  allowed_events text[] NOT NULL DEFAULT '{}',
  last_received_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (endpoint_key)
);
GRANT SELECT ON public.integration_webhook_inboxes TO authenticated;
GRANT ALL ON public.integration_webhook_inboxes TO service_role;
ALTER TABLE public.integration_webhook_inboxes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_inboxes_select" ON public.integration_webhook_inboxes FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "webhook_inboxes_manage" ON public.integration_webhook_inboxes FOR ALL TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id))
  WITH CHECK (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_webhook_inboxes_team_key ON public.integration_webhook_inboxes(team_id, endpoint_key);
CREATE TRIGGER trg_webhook_inboxes_updated BEFORE UPDATE ON public.integration_webhook_inboxes
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 9. integration_webhook_events
CREATE TABLE public.integration_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  team_integration_id uuid REFERENCES public.team_integrations(id) ON DELETE SET NULL,
  inbox_id uuid REFERENCES public.integration_webhook_inboxes(id) ON DELETE SET NULL,
  provider text,
  event_type text NOT NULL,
  signature_valid boolean,
  status text NOT NULL DEFAULT 'received',
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_webhook_events TO authenticated;
GRANT ALL ON public.integration_webhook_events TO service_role;
ALTER TABLE public.integration_webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "webhook_events_select" ON public.integration_webhook_events FOR SELECT TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_webhook_events_team_status ON public.integration_webhook_events(team_id, status, received_at DESC);

-- 10. integration_field_mappings
CREATE TABLE public.integration_field_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  team_integration_id uuid NOT NULL REFERENCES public.team_integrations(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  remote_field text NOT NULL,
  external_field text NOT NULL,
  transform_type text NOT NULL DEFAULT 'direct',
  transform_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  enabled boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.integration_field_mappings TO authenticated;
GRANT ALL ON public.integration_field_mappings TO service_role;
ALTER TABLE public.integration_field_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "field_mappings_select" ON public.integration_field_mappings FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "field_mappings_manage" ON public.integration_field_mappings FOR ALL TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id))
  WITH CHECK (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_field_mappings_team_int_res ON public.integration_field_mappings(team_id, team_integration_id, resource_type);
CREATE TRIGGER trg_field_mappings_updated BEFORE UPDATE ON public.integration_field_mappings
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- 11. integration_templates (global)
CREATE TABLE public.integration_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  integration_keys text[] NOT NULL DEFAULT '{}',
  source_event text,
  target_action text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_templates TO authenticated;
GRANT ALL ON public.integration_templates TO service_role;
ALTER TABLE public.integration_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "templates_select_all" ON public.integration_templates FOR SELECT TO authenticated USING (true);

-- 12. integration_audit_events
CREATE TABLE public.integration_audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  team_integration_id uuid REFERENCES public.team_integrations(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  title text NOT NULL,
  description text,
  actor_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.integration_audit_events TO authenticated;
GRANT ALL ON public.integration_audit_events TO service_role;
ALTER TABLE public.integration_audit_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "int_audit_select" ON public.integration_audit_events FOR SELECT TO authenticated
  USING (public.is_integration_manager(auth.uid(), team_id));
CREATE INDEX idx_int_audit_team_created ON public.integration_audit_events(team_id, created_at DESC);

-- 13. external_resource_links
CREATE TABLE public.external_resource_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  provider text NOT NULL,
  external_type text,
  external_id text,
  external_url text,
  title text,
  status text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.external_resource_links TO authenticated;
GRANT ALL ON public.external_resource_links TO service_role;
ALTER TABLE public.external_resource_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ext_links_select" ON public.external_resource_links FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "ext_links_manage" ON public.external_resource_links FOR ALL TO authenticated
  USING (public.is_team_member(auth.uid(), team_id))
  WITH CHECK (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_ext_links_team_resource ON public.external_resource_links(team_id, resource_type, resource_id);

-- =====================================================
-- Seed catalog
-- =====================================================
INSERT INTO public.integration_catalog (key, name, category, provider, auth_type, integration_type, status, is_featured, supported_actions) VALUES
  ('slack', 'Slack', 'communication', 'slack', 'oauth2', 'bidirectional', 'available', true, ARRAY['send_channel_message','post_incident_update','post_support_summary']),
  ('msteams', 'Microsoft Teams', 'communication', 'microsoft', 'oauth2', 'outbound', 'beta', true, ARRAY['send_channel_message','post_incident_update']),
  ('discord', 'Discord', 'communication', 'discord', 'webhook', 'outbound', 'available', false, ARRAY['send_channel_message']),
  ('email_smtp', 'Email (SMTP)', 'communication', 'smtp', 'manual', 'outbound', 'coming_soon', false, ARRAY[]::text[]),
  ('jira', 'Jira', 'issue_tracking', 'atlassian', 'oauth2', 'bidirectional', 'available', true, ARRAY['create_issue','update_issue','add_issue_comment']),
  ('linear', 'Linear', 'issue_tracking', 'linear', 'oauth2', 'bidirectional', 'available', true, ARRAY['create_issue','update_issue','add_issue_comment']),
  ('github_issues', 'GitHub Issues', 'issue_tracking', 'github', 'oauth2', 'bidirectional', 'available', true, ARRAY['create_github_issue','add_issue_comment']),
  ('gitlab_issues', 'GitLab Issues', 'issue_tracking', 'gitlab', 'oauth2', 'bidirectional', 'available', false, ARRAY['create_gitlab_issue','add_issue_comment']),
  ('zendesk', 'Zendesk', 'support', 'zendesk', 'oauth2', 'bidirectional', 'beta', false, ARRAY['create_ticket','update_ticket_status']),
  ('freshdesk', 'Freshdesk', 'support', 'freshdesk', 'api_key', 'bidirectional', 'beta', false, ARRAY['create_ticket','update_ticket_status']),
  ('servicenow', 'ServiceNow', 'support', 'servicenow', 'oauth2', 'bidirectional', 'coming_soon', false, ARRAY['create_ticket']),
  ('github', 'GitHub', 'devops', 'github', 'oauth2', 'bidirectional', 'available', true, ARRAY['create_github_issue','post_deployment_note']),
  ('gitlab', 'GitLab', 'devops', 'gitlab', 'oauth2', 'bidirectional', 'available', false, ARRAY['create_gitlab_issue']),
  ('bitbucket', 'Bitbucket', 'devops', 'atlassian', 'oauth2', 'outbound', 'coming_soon', false, ARRAY[]::text[]),
  ('vercel', 'Vercel', 'devops', 'vercel', 'oauth2', 'inbound', 'beta', false, ARRAY['post_deployment_note']),
  ('netlify', 'Netlify', 'devops', 'netlify', 'oauth2', 'inbound', 'coming_soon', false, ARRAY[]::text[]),
  ('datadog', 'Datadog', 'observability', 'datadog', 'api_key', 'outbound', 'available', true, ARRAY['trigger_alert']),
  ('sentry', 'Sentry', 'observability', 'sentry', 'oauth2', 'inbound', 'available', true, ARRAY['create_incident']),
  ('pagerduty', 'PagerDuty', 'observability', 'pagerduty', 'oauth2', 'outbound', 'available', true, ARRAY['trigger_alert','resolve_alert','create_incident']),
  ('opsgenie', 'Opsgenie', 'observability', 'atlassian', 'api_key', 'outbound', 'available', false, ARRAY['trigger_alert','resolve_alert']),
  ('better_stack', 'Better Stack', 'observability', 'better_stack', 'api_key', 'outbound', 'beta', false, ARRAY['trigger_alert']),
  ('statuspage', 'Statuspage', 'observability', 'atlassian', 'api_key', 'outbound', 'beta', false, ARRAY['post_status_update']),
  ('notion', 'Notion', 'productivity', 'notion', 'oauth2', 'outbound', 'available', true, ARRAY['create_page','append_to_page','create_report_page']),
  ('google_workspace', 'Google Workspace', 'productivity', 'google', 'oauth2', 'outbound', 'beta', false, ARRAY['create_page']),
  ('microsoft_365', 'Microsoft 365', 'productivity', 'microsoft', 'oauth2', 'outbound', 'beta', false, ARRAY['create_page']),
  ('confluence', 'Confluence', 'productivity', 'atlassian', 'oauth2', 'outbound', 'beta', false, ARRAY['create_page','append_to_page']),
  ('hubspot', 'HubSpot', 'crm', 'hubspot', 'oauth2', 'bidirectional', 'beta', false, ARRAY['create_activity']),
  ('salesforce', 'Salesforce', 'crm', 'salesforce', 'oauth2', 'bidirectional', 'coming_soon', false, ARRAY['create_activity']),
  ('stripe', 'Stripe', 'billing', 'stripe', 'api_key', 'inbound', 'available', false, ARRAY[]::text[]),
  ('zapier', 'Zapier', 'automation', 'zapier', 'webhook', 'outbound', 'available', true, ARRAY['trigger_zapier_webhook']),
  ('make', 'Make', 'automation', 'make', 'webhook', 'outbound', 'available', false, ARRAY['trigger_make_webhook']),
  ('n8n', 'n8n', 'automation', 'n8n', 'webhook', 'outbound', 'available', false, ARRAY['trigger_n8n_webhook']),
  ('generic_webhook', 'Generic Webhook', 'automation', 'generic', 'webhook', 'outbound', 'available', true, ARRAY['call_webhook']);

-- Seed templates
INSERT INTO public.integration_templates (key, name, description, category, integration_keys, source_event, target_action, is_featured) VALUES
  ('slack_critical_alert', 'Post Critical Alert to Slack', 'Send observability critical alerts to a Slack channel.', 'observability', ARRAY['slack'], 'observability.alert_fired', 'send_channel_message', true),
  ('jira_sla_breach', 'Create Jira Issue for SLA Breach', 'Open a Jira issue when a support ticket breaches SLA.', 'support', ARRAY['jira'], 'support.sla_breached', 'create_issue', true),
  ('github_client_update_failure', 'Create GitHub Issue for Client Update Failure', 'File a GitHub issue when client update failures occur.', 'devops', ARRAY['github_issues','github'], 'client.update_failed', 'create_github_issue', false),
  ('teams_incident_created', 'Send Teams Message for Incident Created', 'Notify a Teams channel when an incident is created.', 'communication', ARRAY['msteams'], 'incident.created', 'send_channel_message', false),
  ('zendesk_ticket_sync', 'Sync Support Ticket to Zendesk', 'Mirror RemoteDesk support tickets into Zendesk.', 'support', ARRAY['zendesk'], 'support.ticket_created', 'create_ticket', false),
  ('zapier_customer_onboarding', 'Trigger Zapier Webhook for Customer Onboarding', 'Hand off customer onboarding events to a Zapier workflow.', 'automation', ARRAY['zapier'], 'customer.device_onboarded', 'trigger_zapier_webhook', false),
  ('notion_weekly_compliance', 'Create Notion Page for Weekly Compliance Report', 'Publish weekly compliance reports to a Notion workspace.', 'productivity', ARRAY['notion'], NULL, 'create_report_page', false);
