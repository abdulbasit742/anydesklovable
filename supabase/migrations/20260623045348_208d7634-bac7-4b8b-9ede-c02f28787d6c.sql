
-- =========================================================
-- Task #10 Phase 1: Public API + Webhook Developer Platform
-- =========================================================

-- 1. Extend api_keys safely
ALTER TABLE public.api_keys
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS revoked_by uuid;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'api_keys_status_check'
  ) THEN
    ALTER TABLE public.api_keys
      ADD CONSTRAINT api_keys_status_check CHECK (status IN ('active','revoked','expired'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_api_keys_team_status ON public.api_keys(team_id, status);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON public.api_keys(key_prefix);

-- 2. api_requests
CREATE TABLE IF NOT EXISTS public.api_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  api_key_id uuid,
  method text NOT NULL,
  path text NOT NULL,
  status_code integer NOT NULL,
  request_id text NOT NULL,
  ip_address inet,
  user_agent text,
  latency_ms integer,
  error_code text,
  error_message text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.api_requests TO authenticated;
GRANT ALL ON public.api_requests TO service_role;
ALTER TABLE public.api_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "api_requests_team_select" ON public.api_requests;
CREATE POLICY "api_requests_team_select" ON public.api_requests
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));

CREATE INDEX IF NOT EXISTS idx_api_requests_team_created ON public.api_requests(team_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_requests_key_created ON public.api_requests(api_key_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_requests_team_status ON public.api_requests(team_id, status_code, created_at DESC);

-- 3. api_rate_limit_events
CREATE TABLE IF NOT EXISTS public.api_rate_limit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  api_key_id uuid,
  scope text NOT NULL,
  limit_key text NOT NULL,
  allowed boolean NOT NULL,
  limit_count integer,
  remaining integer,
  reset_at timestamptz,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.api_rate_limit_events TO authenticated;
GRANT ALL ON public.api_rate_limit_events TO service_role;
ALTER TABLE public.api_rate_limit_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "api_rate_limit_team_select" ON public.api_rate_limit_events;
CREATE POLICY "api_rate_limit_team_select" ON public.api_rate_limit_events
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_api_rl_team_created ON public.api_rate_limit_events(team_id, created_at DESC);

-- 4. webhook_endpoints
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  name text NOT NULL,
  url text NOT NULL,
  secret_hash text,
  events text[] NOT NULL DEFAULT '{}'::text[],
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','paused','disabled')),
  created_by uuid,
  last_delivery_at timestamptz,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  failure_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhook_endpoints TO authenticated;
GRANT ALL ON public.webhook_endpoints TO service_role;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webhook_endpoints_team_select" ON public.webhook_endpoints;
CREATE POLICY "webhook_endpoints_team_select" ON public.webhook_endpoints
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
DROP POLICY IF EXISTS "webhook_endpoints_admin_manage" ON public.webhook_endpoints;
CREATE POLICY "webhook_endpoints_admin_manage" ON public.webhook_endpoints
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'))
  WITH CHECK (public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin'));
CREATE INDEX IF NOT EXISTS idx_webhook_endpoints_team_status ON public.webhook_endpoints(team_id, status);

CREATE OR REPLACE FUNCTION public.tg_set_updated_at_simple() RETURNS trigger
LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
DROP TRIGGER IF EXISTS webhook_endpoints_set_updated_at ON public.webhook_endpoints;
CREATE TRIGGER webhook_endpoints_set_updated_at
  BEFORE UPDATE ON public.webhook_endpoints
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_simple();

-- 5. webhook_events
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  event_type text NOT NULL,
  source text NOT NULL DEFAULT 'system',
  resource_type text,
  resource_id uuid,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.webhook_events TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webhook_events_team_select" ON public.webhook_events;
CREATE POLICY "webhook_events_team_select" ON public.webhook_events
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_webhook_events_team_type_created
  ON public.webhook_events(team_id, event_type, created_at DESC);

-- 6. webhook_deliveries
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL,
  endpoint_id uuid NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event_id uuid REFERENCES public.webhook_events(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','delivering','success','failed','retrying','canceled')),
  attempt_count integer NOT NULL DEFAULT 0,
  max_attempts integer NOT NULL DEFAULT 5,
  response_status integer,
  response_body text,
  error_message text,
  next_retry_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.webhook_deliveries TO authenticated;
GRANT ALL ON public.webhook_deliveries TO service_role;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webhook_deliveries_team_select" ON public.webhook_deliveries;
CREATE POLICY "webhook_deliveries_team_select" ON public.webhook_deliveries
  FOR SELECT TO authenticated
  USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_team_status_created
  ON public.webhook_deliveries(team_id, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_endpoint_created
  ON public.webhook_deliveries(endpoint_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_retry
  ON public.webhook_deliveries(next_retry_at, status);
DROP TRIGGER IF EXISTS webhook_deliveries_set_updated_at ON public.webhook_deliveries;
CREATE TRIGGER webhook_deliveries_set_updated_at
  BEFORE UPDATE ON public.webhook_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at_simple();

-- 7. developer_docs_feedback
CREATE TABLE IF NOT EXISTS public.developer_docs_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid,
  user_id uuid,
  page text NOT NULL,
  rating integer CHECK (rating IS NULL OR (rating BETWEEN 1 AND 5)),
  feedback text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.developer_docs_feedback TO authenticated;
GRANT ALL ON public.developer_docs_feedback TO service_role;
ALTER TABLE public.developer_docs_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "docs_feedback_insert_self" ON public.developer_docs_feedback;
CREATE POLICY "docs_feedback_insert_self" ON public.developer_docs_feedback
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "docs_feedback_select_team_or_self" ON public.developer_docs_feedback;
CREATE POLICY "docs_feedback_select_team_or_self" ON public.developer_docs_feedback
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (team_id IS NOT NULL AND public.is_team_member(auth.uid(), team_id)));

-- =========================================================
-- RPCs
-- =========================================================

-- Verify API key for a request, atomically check scope & status.
CREATE OR REPLACE FUNCTION public.verify_api_key_for_request(_key_hash text, _required_scope text DEFAULT NULL)
RETURNS TABLE(api_key_id uuid, team_id uuid, scopes text[], status text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _k public.api_keys%ROWTYPE;
BEGIN
  SELECT * INTO _k FROM public.api_keys WHERE key_hash = _key_hash LIMIT 1;
  IF _k.id IS NULL THEN RAISE EXCEPTION 'invalid_api_key' USING ERRCODE = 'P0001'; END IF;
  IF _k.revoked_at IS NOT NULL OR _k.status = 'revoked' THEN
    RAISE EXCEPTION 'key_revoked' USING ERRCODE = 'P0001';
  END IF;
  IF _k.expires_at IS NOT NULL AND _k.expires_at < now() THEN
    UPDATE public.api_keys SET status = 'expired' WHERE id = _k.id AND status <> 'expired';
    RAISE EXCEPTION 'key_expired' USING ERRCODE = 'P0001';
  END IF;
  IF _required_scope IS NOT NULL AND NOT (_required_scope = ANY(_k.scopes)) THEN
    RAISE EXCEPTION 'missing_scope:%', _required_scope USING ERRCODE = 'P0001';
  END IF;
  UPDATE public.api_keys SET last_used_at = now() WHERE id = _k.id;
  RETURN QUERY SELECT _k.id, _k.team_id, _k.scopes, _k.status;
END $$;

-- Log an API request (server-only, called via service role).
CREATE OR REPLACE FUNCTION public.log_api_request(
  p_team_id uuid, p_api_key_id uuid, p_method text, p_path text, p_status_code integer,
  p_request_id text, p_ip inet DEFAULT NULL, p_user_agent text DEFAULT NULL,
  p_latency_ms integer DEFAULT NULL, p_error_code text DEFAULT NULL,
  p_error_message text DEFAULT NULL, p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _id uuid;
BEGIN
  INSERT INTO public.api_requests(team_id, api_key_id, method, path, status_code, request_id, ip_address, user_agent, latency_ms, error_code, error_message, metadata)
  VALUES (p_team_id, p_api_key_id, p_method, p_path, p_status_code, p_request_id, p_ip, p_user_agent, p_latency_ms, p_error_code, p_error_message, COALESCE(p_metadata,'{}'::jsonb))
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Record a rate limit event.
CREATE OR REPLACE FUNCTION public.record_api_rate_limit_event(
  p_team_id uuid, p_api_key_id uuid, p_scope text, p_limit_key text,
  p_allowed boolean, p_limit_count integer DEFAULT NULL, p_remaining integer DEFAULT NULL,
  p_reset_at timestamptz DEFAULT NULL, p_reason text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _id uuid;
BEGIN
  INSERT INTO public.api_rate_limit_events(team_id, api_key_id, scope, limit_key, allowed, limit_count, remaining, reset_at, reason, metadata)
  VALUES (p_team_id, p_api_key_id, p_scope, p_limit_key, p_allowed, p_limit_count, p_remaining, p_reset_at, p_reason, COALESCE(p_metadata,'{}'::jsonb))
  RETURNING id INTO _id;
  RETURN _id;
END $$;

-- Create a webhook endpoint
CREATE OR REPLACE FUNCTION public.create_webhook_endpoint(
  p_name text, p_url text, p_events text[], p_secret_hash text DEFAULT NULL
) RETURNS webhook_endpoints LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _team uuid; _row public.webhook_endpoints%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT team_id INTO _team FROM public.team_members
    WHERE user_id = auth.uid() AND role IN ('owner','admin') AND status = 'active'
    ORDER BY CASE role WHEN 'owner' THEN 0 ELSE 1 END LIMIT 1;
  IF _team IS NULL THEN RAISE EXCEPTION 'Insufficient permissions'; END IF;
  IF p_url !~* '^https?://' THEN RAISE EXCEPTION 'Invalid URL'; END IF;

  INSERT INTO public.webhook_endpoints(team_id, name, url, events, secret_hash, created_by)
  VALUES (_team, p_name, p_url, COALESCE(p_events,'{}'::text[]), p_secret_hash, auth.uid())
  RETURNING * INTO _row;

  INSERT INTO public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  VALUES (_team, auth.uid(), 'webhook_endpoint_created', _row.name, 'info',
          jsonb_build_object('endpoint_id', _row.id, 'events', _row.events));
  RETURN _row;
END $$;

CREATE OR REPLACE FUNCTION public.update_webhook_endpoint(
  p_endpoint_id uuid, p_name text DEFAULT NULL, p_url text DEFAULT NULL,
  p_events text[] DEFAULT NULL, p_status text DEFAULT NULL
) RETURNS webhook_endpoints LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _row public.webhook_endpoints%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _row FROM public.webhook_endpoints WHERE id = p_endpoint_id;
  IF _row.id IS NULL THEN RAISE EXCEPTION 'Endpoint not found'; END IF;
  IF NOT (public.has_role(auth.uid(), _row.team_id, 'owner') OR public.has_role(auth.uid(), _row.team_id, 'admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  IF p_url IS NOT NULL AND p_url !~* '^https?://' THEN RAISE EXCEPTION 'Invalid URL'; END IF;
  IF p_status IS NOT NULL AND p_status NOT IN ('active','paused','disabled') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;

  UPDATE public.webhook_endpoints SET
    name = COALESCE(p_name, name),
    url = COALESCE(p_url, url),
    events = COALESCE(p_events, events),
    status = COALESCE(p_status, status),
    updated_at = now()
  WHERE id = p_endpoint_id RETURNING * INTO _row;

  INSERT INTO public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  VALUES (_row.team_id, auth.uid(), 'webhook_endpoint_updated', _row.name, 'info',
          jsonb_build_object('endpoint_id', _row.id));
  RETURN _row;
END $$;

CREATE OR REPLACE FUNCTION public.disable_webhook_endpoint(p_endpoint_id uuid)
RETURNS webhook_endpoints LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _row public.webhook_endpoints%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _row FROM public.webhook_endpoints WHERE id = p_endpoint_id;
  IF _row.id IS NULL THEN RAISE EXCEPTION 'Endpoint not found'; END IF;
  IF NOT (public.has_role(auth.uid(), _row.team_id, 'owner') OR public.has_role(auth.uid(), _row.team_id, 'admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  UPDATE public.webhook_endpoints SET status = 'disabled', updated_at = now()
    WHERE id = p_endpoint_id RETURNING * INTO _row;
  INSERT INTO public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  VALUES (_row.team_id, auth.uid(), 'webhook_endpoint_disabled', _row.name, 'warning',
          jsonb_build_object('endpoint_id', _row.id));
  RETURN _row;
END $$;

-- Create webhook event + fan out to active endpoints subscribed to event type.
CREATE OR REPLACE FUNCTION public.create_webhook_event(
  p_team_id uuid, p_event_type text, p_resource_type text DEFAULT NULL,
  p_resource_id uuid DEFAULT NULL, p_payload jsonb DEFAULT '{}'::jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _evt_id uuid;
BEGIN
  INSERT INTO public.webhook_events(team_id, event_type, resource_type, resource_id, payload)
  VALUES (p_team_id, p_event_type, p_resource_type, p_resource_id, COALESCE(p_payload,'{}'::jsonb))
  RETURNING id INTO _evt_id;

  INSERT INTO public.webhook_deliveries(team_id, endpoint_id, event_id, event_type, payload, status, next_retry_at)
  SELECT p_team_id, e.id, _evt_id, p_event_type,
         jsonb_build_object('id', _evt_id, 'type', p_event_type, 'created_at', now(),
                            'resource_type', p_resource_type, 'resource_id', p_resource_id,
                            'data', COALESCE(p_payload,'{}'::jsonb)),
         'pending', now()
  FROM public.webhook_endpoints e
  WHERE e.team_id = p_team_id
    AND e.status = 'active'
    AND p_event_type = ANY(e.events);
  RETURN _evt_id;
END $$;

CREATE OR REPLACE FUNCTION public.enqueue_test_webhook_delivery(p_endpoint_id uuid)
RETURNS webhook_deliveries LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _e public.webhook_endpoints%ROWTYPE; _d public.webhook_deliveries%ROWTYPE; _evt_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _e FROM public.webhook_endpoints WHERE id = p_endpoint_id;
  IF _e.id IS NULL THEN RAISE EXCEPTION 'Endpoint not found'; END IF;
  IF NOT (public.has_role(auth.uid(), _e.team_id, 'owner') OR public.has_role(auth.uid(), _e.team_id, 'admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  INSERT INTO public.webhook_events(team_id, event_type, source, payload)
  VALUES (_e.team_id, 'webhook.test', 'dashboard',
          jsonb_build_object('message','This is a test webhook delivery from RemoteDesk.'))
  RETURNING id INTO _evt_id;

  INSERT INTO public.webhook_deliveries(team_id, endpoint_id, event_id, event_type, payload, status, next_retry_at)
  VALUES (_e.team_id, _e.id, _evt_id, 'webhook.test',
          jsonb_build_object('id', _evt_id, 'type', 'webhook.test', 'created_at', now(),
                             'data', jsonb_build_object('message','test')),
          'pending', now())
  RETURNING * INTO _d;

  INSERT INTO public.audit_logs(team_id, actor_id, action, target, severity, metadata)
  VALUES (_e.team_id, auth.uid(), 'webhook_test_enqueued', _e.name, 'info',
          jsonb_build_object('endpoint_id', _e.id, 'delivery_id', _d.id));
  RETURN _d;
END $$;

-- Worker-ready: claim next pending/retry delivery.
CREATE OR REPLACE FUNCTION public.claim_next_webhook_delivery()
RETURNS webhook_deliveries LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _d public.webhook_deliveries%ROWTYPE;
BEGIN
  WITH next AS (
    SELECT id FROM public.webhook_deliveries
      WHERE status IN ('pending','retrying') AND (next_retry_at IS NULL OR next_retry_at <= now())
      ORDER BY created_at
      FOR UPDATE SKIP LOCKED LIMIT 1
  )
  UPDATE public.webhook_deliveries d
    SET status = 'delivering', attempt_count = d.attempt_count + 1, updated_at = now()
    FROM next WHERE d.id = next.id
    RETURNING d.* INTO _d;
  RETURN _d;
END $$;

CREATE OR REPLACE FUNCTION public.mark_webhook_delivery_success(
  p_delivery_id uuid, p_response_status integer DEFAULT 200, p_response_body text DEFAULT NULL
) RETURNS webhook_deliveries LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _d public.webhook_deliveries%ROWTYPE;
BEGIN
  UPDATE public.webhook_deliveries SET
    status='success', response_status=p_response_status, response_body=p_response_body,
    delivered_at=now(), next_retry_at=NULL, updated_at=now()
  WHERE id = p_delivery_id RETURNING * INTO _d;
  IF _d.id IS NULL THEN RAISE EXCEPTION 'Delivery not found'; END IF;
  UPDATE public.webhook_endpoints
    SET last_delivery_at=now(), last_success_at=now(), failure_count=0, updated_at=now()
    WHERE id = _d.endpoint_id;
  RETURN _d;
END $$;

CREATE OR REPLACE FUNCTION public.mark_webhook_delivery_failed(
  p_delivery_id uuid, p_error_message text,
  p_response_status integer DEFAULT NULL, p_response_body text DEFAULT NULL
) RETURNS webhook_deliveries LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _d public.webhook_deliveries%ROWTYPE; _next timestamptz; _final boolean;
BEGIN
  SELECT * INTO _d FROM public.webhook_deliveries WHERE id = p_delivery_id;
  IF _d.id IS NULL THEN RAISE EXCEPTION 'Delivery not found'; END IF;
  _final := _d.attempt_count >= _d.max_attempts;
  IF _final THEN _next := NULL;
  ELSE _next := now() + (LEAST(_d.attempt_count,5) * interval '1 minute');
  END IF;
  UPDATE public.webhook_deliveries SET
    status = CASE WHEN _final THEN 'failed' ELSE 'retrying' END,
    response_status=p_response_status, response_body=p_response_body,
    error_message=p_error_message, next_retry_at=_next, updated_at=now()
  WHERE id = p_delivery_id RETURNING * INTO _d;
  UPDATE public.webhook_endpoints
    SET last_delivery_at=now(), last_failure_at=now(),
        failure_count=failure_count+1, updated_at=now()
    WHERE id = _d.endpoint_id;
  RETURN _d;
END $$;

-- Developer overview summary.
CREATE OR REPLACE FUNCTION public.get_developer_overview(p_team_id uuid)
RETURNS TABLE(
  total_keys integer, active_keys integer, revoked_keys integer,
  requests_24h integer, failed_requests_24h integer, rate_limited_24h integer,
  webhook_endpoints integer, webhook_deliveries_24h integer,
  webhook_success_24h integer, webhook_failed_24h integer
) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT public.is_team_member(auth.uid(), p_team_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  RETURN QUERY
  SELECT
    (SELECT count(*)::int FROM public.api_keys WHERE team_id=p_team_id),
    (SELECT count(*)::int FROM public.api_keys WHERE team_id=p_team_id AND status='active' AND revoked_at IS NULL),
    (SELECT count(*)::int FROM public.api_keys WHERE team_id=p_team_id AND (status='revoked' OR revoked_at IS NOT NULL)),
    (SELECT count(*)::int FROM public.api_requests WHERE team_id=p_team_id AND created_at > now() - interval '24 hours'),
    (SELECT count(*)::int FROM public.api_requests WHERE team_id=p_team_id AND status_code >= 400 AND created_at > now() - interval '24 hours'),
    (SELECT count(*)::int FROM public.api_rate_limit_events WHERE team_id=p_team_id AND allowed = false AND created_at > now() - interval '24 hours'),
    (SELECT count(*)::int FROM public.webhook_endpoints WHERE team_id=p_team_id AND status <> 'disabled'),
    (SELECT count(*)::int FROM public.webhook_deliveries WHERE team_id=p_team_id AND created_at > now() - interval '24 hours'),
    (SELECT count(*)::int FROM public.webhook_deliveries WHERE team_id=p_team_id AND status='success' AND created_at > now() - interval '24 hours'),
    (SELECT count(*)::int FROM public.webhook_deliveries WHERE team_id=p_team_id AND status IN ('failed','retrying') AND created_at > now() - interval '24 hours');
END $$;
