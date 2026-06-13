
revoke execute on function public.has_role(uuid, uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.is_team_member(uuid, uuid) from public, anon, authenticated;
revoke execute on function public.my_team_ids(uuid) from public, anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
