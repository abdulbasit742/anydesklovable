import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTeam } from "@/hooks/use-current-team";

export type PolicyProfile = {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  priority: number;
  policy_type: string;
  rules: Record<string, any>;
  enforcement_mode: "monitor" | "warn" | "block" | "require_approval";
  created_by: string | null;
  updated_by: string | null;
  activated_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export function usePolicyProfiles(policyType?: string) {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id ?? null;
  return useQuery({
    queryKey: ["policy_profiles", teamId, policyType],
    enabled: !!teamId,
    queryFn: async () => {
      let q = supabase
        .from("policy_profiles")
        .select("*")
        .eq("team_id", teamId!)
        .order("priority", { ascending: true });
      if (policyType) q = q.eq("policy_type", policyType);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as PolicyProfile[];
    },
  });
}

export function usePolicyProfile(id: string | undefined) {
  return useQuery({
    queryKey: ["policy_profile", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policy_profiles")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data as PolicyProfile | null;
    },
  });
}

export function useSavePolicyRules() {
  const qc = useQueryClient();
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id ?? null;

  return useMutation({
    mutationFn: async (input: {
      policyType: string;
      name: string;
      rules: Record<string, any>;
      enforcementMode?: string;
    }) => {
      if (!teamId) throw new Error("No team context");
      // Upsert: find existing active policy of this type, or create new
      const { data: existing } = await supabase
        .from("policy_profiles")
        .select("id")
        .eq("team_id", teamId)
        .eq("policy_type", input.policyType)
        .eq("status", "active")
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("policy_profiles")
          .update({
            rules: input.rules as any,
            enforcement_mode: input.enforcementMode ?? "block",
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
        return existing.id;
      } else {
        const { data, error } = await supabase
          .from("policy_profiles")
          .insert({
            team_id: teamId,
            name: input.name,
            policy_type: input.policyType,
            rules: input.rules as any,
            enforcement_mode: input.enforcementMode ?? "block",
            status: "active",
            activated_at: new Date().toISOString(),
          })
          .select("id")
          .single();
        if (error) throw error;
        return data.id;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["policy_profiles"] });
    },
  });
}

// Load the active policy rules for a given type (used by the individual policy pages)
export function useActivePolicyRules<T extends Record<string, any>>(policyType: string, defaults: T) {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id ?? null;
  const q = useQuery({
    queryKey: ["active_policy_rules", teamId, policyType],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("policy_profiles")
        .select("id, rules, enforcement_mode")
        .eq("team_id", teamId!)
        .eq("policy_type", policyType)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  const rules = (q.data?.rules ?? defaults) as T;
  return {
    rules,
    policyId: q.data?.id ?? null,
    enforcementMode: q.data?.enforcement_mode ?? "monitor",
    isLoading: q.isLoading,
    error: q.error as Error | null,
    isNew: !q.data,
  };
}
