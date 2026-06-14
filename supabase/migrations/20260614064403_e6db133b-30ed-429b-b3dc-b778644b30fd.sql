
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL UNIQUE,
  scopes text[] NOT NULL DEFAULT ARRAY['read']::text[],
  last_used_at timestamptz,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX api_keys_team_id_idx ON public.api_keys(team_id);
CREATE INDEX api_keys_prefix_idx ON public.api_keys(key_prefix);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT ALL ON public.api_keys TO service_role;

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team members can view api keys" ON public.api_keys FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = api_keys.team_id AND tm.user_id = auth.uid()));
CREATE POLICY "Admins can insert api keys" ON public.api_keys FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = api_keys.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner','admin')));
CREATE POLICY "Admins can update api keys" ON public.api_keys FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = api_keys.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner','admin')));
CREATE POLICY "Admins can delete api keys" ON public.api_keys FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = api_keys.team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner','admin')));

CREATE TRIGGER api_keys_set_updated_at BEFORE UPDATE ON public.api_keys
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.create_api_key(
  _team_id uuid, _name text, _key_prefix text, _key_hash text,
  _scopes text[] DEFAULT ARRAY['read']::text[], _expires_at timestamptz DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = _team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner','admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  INSERT INTO public.api_keys (team_id, created_by, name, key_prefix, key_hash, scopes, expires_at)
  VALUES (_team_id, auth.uid(), _name, _key_prefix, _key_hash, COALESCE(_scopes, ARRAY['read']::text[]), _expires_at)
  RETURNING id INTO _id;
  INSERT INTO public.audit_logs (team_id, actor_id, action, target_type, target_id, metadata)
  VALUES (_team_id, auth.uid(), 'api_key.created', 'api_key', _id::text,
          jsonb_build_object('name', _name, 'prefix', _key_prefix, 'scopes', _scopes));
  RETURN _id;
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_api_key(_key_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _team_id uuid;
BEGIN
  SELECT team_id INTO _team_id FROM public.api_keys WHERE id = _key_id;
  IF _team_id IS NULL THEN RAISE EXCEPTION 'API key not found'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = _team_id AND tm.user_id = auth.uid() AND tm.role IN ('owner','admin')) THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;
  UPDATE public.api_keys SET revoked_at = now() WHERE id = _key_id AND revoked_at IS NULL;
  INSERT INTO public.audit_logs (team_id, actor_id, action, target_type, target_id, metadata)
  VALUES (_team_id, auth.uid(), 'api_key.revoked', 'api_key', _key_id::text, '{}'::jsonb);
END; $$;

CREATE OR REPLACE FUNCTION public.verify_api_key_hash(_key_hash text)
RETURNS TABLE (id uuid, team_id uuid, scopes text[], revoked boolean, expired boolean)
LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT k.id, k.team_id, k.scopes,
         (k.revoked_at IS NOT NULL) AS revoked,
         (k.expires_at IS NOT NULL AND k.expires_at < now()) AS expired
  FROM public.api_keys k WHERE k.key_hash = _key_hash LIMIT 1;
$$;
