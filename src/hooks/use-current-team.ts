import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./use-auth";

export function useCurrentTeam() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["current-team", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("team_id, role, teams(id, name, plan, owner_id)")
        .eq("user_id", user!.id)
        .order("joined_at", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}
