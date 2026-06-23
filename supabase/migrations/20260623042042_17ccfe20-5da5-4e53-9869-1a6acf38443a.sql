
-- ============ TABLES ============

CREATE TABLE public.device_presence (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'unknown' CHECK (status IN ('online','offline','idle','busy','maintenance','unknown')),
  heartbeat_at timestamptz,
  last_seen_at timestamptz,
  active_session_id uuid,
  active_user_id uuid,
  client_version text,
  platform text,
  os_version text,
  ip_address inet,
  region text,
  latency_ms integer,
  packet_loss numeric,
  cpu_load numeric,
  memory_load numeric,
  battery_percent integer,
  network_type text,
  connection_quality text NOT NULL DEFAULT 'unknown' CHECK (connection_quality IN ('excellent','good','fair','poor','unknown')),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(device_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.device_presence TO authenticated;
GRANT ALL ON public.device_presence TO service_role;
ALTER TABLE public.device_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team members view presence" ON public.device_presence
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "admins update presence" ON public.device_presence
  FOR UPDATE TO authenticated USING (
    public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin')
  );
CREATE POLICY "admins insert presence" ON public.device_presence
  FOR INSERT TO authenticated WITH CHECK (
    public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin')
  );

CREATE INDEX idx_device_presence_team ON public.device_presence(team_id);
CREATE INDEX idx_device_presence_device ON public.device_presence(device_id);
CREATE INDEX idx_device_presence_status ON public.device_presence(status);
CREATE INDEX idx_device_presence_last_seen ON public.device_presence(last_seen_at DESC);

CREATE TRIGGER trg_device_presence_updated_at BEFORE UPDATE ON public.device_presence
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.device_presence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  device_id uuid NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  event_type text NOT NULL,
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.device_presence_events TO authenticated;
GRANT ALL ON public.device_presence_events TO service_role;
ALTER TABLE public.device_presence_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team members view presence events" ON public.device_presence_events
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE INDEX idx_device_presence_events ON public.device_presence_events(team_id, device_id, created_at DESC);

CREATE TABLE public.notification_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  name text NOT NULL,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  enabled boolean NOT NULL DEFAULT true,
  conditions jsonb NOT NULL DEFAULT '{}'::jsonb,
  channels jsonb NOT NULL DEFAULT '{"in_app": true}'::jsonb,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_rules TO authenticated;
GRANT ALL ON public.notification_rules TO service_role;
ALTER TABLE public.notification_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team members view rules" ON public.notification_rules
  FOR SELECT TO authenticated USING (public.is_team_member(auth.uid(), team_id));
CREATE POLICY "admins manage rules" ON public.notification_rules
  FOR ALL TO authenticated USING (
    public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin')
  ) WITH CHECK (
    public.has_role(auth.uid(), team_id, 'owner') OR public.has_role(auth.uid(), team_id, 'admin')
  );
CREATE INDEX idx_notification_rules ON public.notification_rules(team_id, event_type, enabled);
CREATE TRIGGER trg_notification_rules_updated_at BEFORE UPDATE ON public.notification_rules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid,
  device_id uuid,
  session_id uuid,
  rule_id uuid,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  read_at timestamptz,
  archived_at timestamptz,
  action_url text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users view their notifications" ON public.notifications
  FOR SELECT TO authenticated USING (
    (user_id = auth.uid()) OR (user_id IS NULL AND public.is_team_member(auth.uid(), team_id))
  );
CREATE POLICY "users update their notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (
    (user_id = auth.uid()) OR (user_id IS NULL AND public.is_team_member(auth.uid(), team_id))
  );
CREATE INDEX idx_notifications_inbox ON public.notifications(team_id, user_id, read_at, created_at DESC);

-- ============ FUNCTIONS ============

CREATE OR REPLACE FUNCTION public._compute_connection_quality(_latency integer, _loss numeric)
RETURNS text LANGUAGE sql IMMUTABLE AS $$
  SELECT CASE
    WHEN _latency IS NULL AND _loss IS NULL THEN 'unknown'
    WHEN COALESCE(_latency, 0) < 80 AND COALESCE(_loss, 0) < 1 THEN 'excellent'
    WHEN COALESCE(_latency, 0) < 150 AND COALESCE(_loss, 0) < 3 THEN 'good'
    WHEN COALESCE(_latency, 0) < 300 AND COALESCE(_loss, 0) < 8 THEN 'fair'
    ELSE 'poor'
  END
$$;

CREATE OR REPLACE FUNCTION public.upsert_device_presence(
  p_device_id uuid,
  p_status text,
  p_heartbeat_at timestamptz DEFAULT now(),
  p_latency_ms integer DEFAULT NULL,
  p_packet_loss numeric DEFAULT NULL,
  p_cpu_load numeric DEFAULT NULL,
  p_memory_load numeric DEFAULT NULL,
  p_battery_percent integer DEFAULT NULL,
  p_client_version text DEFAULT NULL,
  p_platform text DEFAULT NULL,
  p_os_version text DEFAULT NULL,
  p_network_type text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS public.device_presence
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _team_id uuid;
  _prev public.device_presence%ROWTYPE;
  _quality text;
  _row public.device_presence%ROWTYPE;
BEGIN
  SELECT team_id INTO _team_id FROM public.devices WHERE id = p_device_id;
  IF _team_id IS NULL THEN RAISE EXCEPTION 'Device not found'; END IF;
  IF auth.uid() IS NOT NULL AND NOT public.is_team_member(auth.uid(), _team_id) THEN
    RAISE EXCEPTION 'Forbidden';
  END IF;
  IF p_status NOT IN ('online','offline','idle','busy','maintenance','unknown') THEN
    RAISE EXCEPTION 'Invalid status %', p_status;
  END IF;

  SELECT * INTO _prev FROM public.device_presence WHERE device_id = p_device_id;
  _quality := public._compute_connection_quality(p_latency_ms, p_packet_loss);

  INSERT INTO public.device_presence (
    team_id, device_id, status, heartbeat_at, last_seen_at,
    latency_ms, packet_loss, cpu_load, memory_load, battery_percent,
    client_version, platform, os_version, network_type, connection_quality, metadata
  ) VALUES (
    _team_id, p_device_id, p_status, p_heartbeat_at, p_heartbeat_at,
    p_latency_ms, p_packet_loss, p_cpu_load, p_memory_load, p_battery_percent,
    p_client_version, p_platform, p_os_version, p_network_type, _quality, COALESCE(p_metadata, '{}'::jsonb)
  )
  ON CONFLICT (device_id) DO UPDATE SET
    status = EXCLUDED.status,
    heartbeat_at = EXCLUDED.heartbeat_at,
    last_seen_at = EXCLUDED.last_seen_at,
    latency_ms = COALESCE(EXCLUDED.latency_ms, public.device_presence.latency_ms),
    packet_loss = COALESCE(EXCLUDED.packet_loss, public.device_presence.packet_loss),
    cpu_load = COALESCE(EXCLUDED.cpu_load, public.device_presence.cpu_load),
    memory_load = COALESCE(EXCLUDED.memory_load, public.device_presence.memory_load),
    battery_percent = COALESCE(EXCLUDED.battery_percent, public.device_presence.battery_percent),
    client_version = COALESCE(EXCLUDED.client_version, public.device_presence.client_version),
    platform = COALESCE(EXCLUDED.platform, public.device_presence.platform),
    os_version = COALESCE(EXCLUDED.os_version, public.device_presence.os_version),
    network_type = COALESCE(EXCLUDED.network_type, public.device_presence.network_type),
    connection_quality = EXCLUDED.connection_quality,
    metadata = public.device_presence.metadata || COALESCE(EXCLUDED.metadata, '{}'::jsonb),
    updated_at = now()
  RETURNING * INTO _row;

  -- log event
  INSERT INTO public.device_presence_events (team_id, device_id, previous_status, new_status, event_type, metadata)
  VALUES (
    _team_id, p_device_id, _prev.status, p_status,
    CASE
      WHEN _prev.status IS NULL THEN 'heartbeat'
      WHEN _prev.status = p_status AND _prev.connection_quality IS NOT DISTINCT FROM _quality THEN 'heartbeat'
      WHEN p_status = 'online' AND _prev.status <> 'online' THEN 'went_online'
      WHEN p_status = 'offline' AND _prev.status <> 'offline' THEN 'went_offline'
      WHEN p_status = 'idle' AND _prev.status <> 'idle' THEN 'became_idle'
      WHEN p_status = 'busy' AND _prev.status <> 'busy' THEN 'became_busy'
      WHEN _prev.connection_quality IS DISTINCT FROM _quality THEN 'quality_changed'
      ELSE 'heartbeat'
    END,
    jsonb_build_object('quality', _quality, 'latency_ms', p_latency_ms, 'packet_loss', p_packet_loss)
  );

  -- notifications on bad transitions
  IF _prev.status IS NOT NULL AND _prev.status <> 'offline' AND p_status = 'offline' THEN
    PERFORM public.create_notification(
      _team_id, NULL, p_device_id, NULL,
      'device.offline', 'Device went offline',
      'A device has stopped checking in and is now offline.',
      'warning',
      '/dashboard/devices/' || p_device_id::text,
      jsonb_build_object('device_id', p_device_id)
    );
  END IF;
  IF _quality = 'poor' AND COALESCE(_prev.connection_quality,'unknown') <> 'poor' THEN
    PERFORM public.create_notification(
      _team_id, NULL, p_device_id, NULL,
      'device.poor_quality', 'Poor connection quality',
      'Remote control may feel delayed on this device.',
      'warning',
      '/dashboard/devices/' || p_device_id::text,
      jsonb_build_object('latency_ms', p_latency_ms, 'packet_loss', p_packet_loss)
    );
  END IF;

  RETURN _row;
END $$;

CREATE OR REPLACE FUNCTION public.mark_device_offline(p_device_id uuid, p_reason text DEFAULT 'timeout')
RETURNS public.device_presence
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _team_id uuid; _prev public.device_presence%ROWTYPE; _row public.device_presence%ROWTYPE;
BEGIN
  SELECT team_id INTO _team_id FROM public.devices WHERE id = p_device_id;
  IF _team_id IS NULL THEN RAISE EXCEPTION 'Device not found'; END IF;
  IF auth.uid() IS NOT NULL AND NOT (
    public.has_role(auth.uid(), _team_id, 'owner') OR public.has_role(auth.uid(), _team_id, 'admin')
  ) THEN RAISE EXCEPTION 'Forbidden'; END IF;

  SELECT * INTO _prev FROM public.device_presence WHERE device_id = p_device_id;

  INSERT INTO public.device_presence (team_id, device_id, status, last_seen_at)
  VALUES (_team_id, p_device_id, 'offline', COALESCE(_prev.last_seen_at, now()))
  ON CONFLICT (device_id) DO UPDATE SET status = 'offline', updated_at = now()
  RETURNING * INTO _row;

  INSERT INTO public.device_presence_events (team_id, device_id, previous_status, new_status, event_type, reason)
  VALUES (_team_id, p_device_id, _prev.status, 'offline', 'went_offline', p_reason);

  INSERT INTO public.audit_logs (team_id, actor_id, action, target, severity, metadata)
  VALUES (_team_id, auth.uid(), 'device_marked_offline', p_device_id::text, 'info',
          jsonb_build_object('reason', p_reason));
  RETURN _row;
END $$;

CREATE OR REPLACE FUNCTION public.create_notification(
  p_team_id uuid,
  p_user_id uuid DEFAULT NULL,
  p_device_id uuid DEFAULT NULL,
  p_session_id uuid DEFAULT NULL,
  p_type text DEFAULT 'info',
  p_title text DEFAULT '',
  p_message text DEFAULT '',
  p_severity text DEFAULT 'info',
  p_action_url text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS public.notifications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.notifications%ROWTYPE;
BEGIN
  INSERT INTO public.notifications (team_id, user_id, device_id, session_id, type, title, message, severity, action_url, metadata)
  VALUES (p_team_id, p_user_id, p_device_id, p_session_id, p_type, p_title, p_message, p_severity, p_action_url, COALESCE(p_metadata,'{}'::jsonb))
  RETURNING * INTO _row;
  RETURN _row;
END $$;

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
RETURNS public.notifications
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _row public.notifications%ROWTYPE;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  UPDATE public.notifications SET read_at = COALESCE(read_at, now())
   WHERE id = p_notification_id
     AND ((user_id = auth.uid()) OR (user_id IS NULL AND public.is_team_member(auth.uid(), team_id)))
  RETURNING * INTO _row;
  IF _row.id IS NULL THEN RAISE EXCEPTION 'Notification not found or forbidden'; END IF;
  RETURN _row;
END $$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _count integer;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  WITH upd AS (
    UPDATE public.notifications SET read_at = now()
     WHERE read_at IS NULL
       AND ((user_id = auth.uid())
            OR (user_id IS NULL AND team_id IN (SELECT public.my_team_ids(auth.uid()))))
    RETURNING 1
  )
  SELECT count(*) INTO _count FROM upd;
  RETURN _count;
END $$;

CREATE OR REPLACE FUNCTION public.get_device_presence_summary()
RETURNS TABLE(
  total_devices bigint,
  online_devices bigint,
  offline_devices bigint,
  idle_devices bigint,
  busy_devices bigint,
  poor_quality_devices bigint,
  active_sessions bigint,
  last_updated_at timestamptz
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COUNT(*)::bigint,
    COUNT(*) FILTER (WHERE status = 'online')::bigint,
    COUNT(*) FILTER (WHERE status = 'offline')::bigint,
    COUNT(*) FILTER (WHERE status = 'idle')::bigint,
    COUNT(*) FILTER (WHERE status = 'busy')::bigint,
    COUNT(*) FILTER (WHERE connection_quality = 'poor')::bigint,
    COUNT(*) FILTER (WHERE active_session_id IS NOT NULL)::bigint,
    MAX(updated_at)
  FROM public.device_presence
  WHERE team_id IN (SELECT public.my_team_ids(auth.uid()));
$$;

REVOKE EXECUTE ON FUNCTION public.create_notification(uuid,uuid,uuid,uuid,text,text,text,text,text,jsonb) FROM public, anon;

-- ============ REALTIME ============
ALTER TABLE public.device_presence REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.device_presence;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
