
ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.create_api_key(uuid, text, text, text, text[], timestamptz) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.revoke_api_key(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.verify_api_key_hash(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_api_key(uuid, text, text, text, text[], timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revoke_api_key(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_api_key_hash(text) TO service_role;
