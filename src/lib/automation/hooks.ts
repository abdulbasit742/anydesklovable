import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { useAuth } from "@/hooks/use-auth";
import {
  mockSystems, mockPipelines, mockTasks, mockAccounts,
  mockRateLimits, mockScheduler, mockAlertRoutes, mockLogs, mockArtifacts,
} from "./mock";

// Wrap a fetcher so empty Supabase results fall back to mock data.
// Pages can read .isDemo to render a "Demo data" banner.
function withFallback<T>(rows: T[] | null | undefined, mock: T[]) {
  if (!rows || rows.length === 0) return { rows: mock, isDemo: true };
  return { rows, isDemo: false };
}

function useTeamId() {
  const { data } = useCurrentTeam();
  return data?.team_id ?? null;
}

export function useAutomationSystems() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["automation_systems", teamId],
    queryFn: async () => {
      const q = supabase.from("automation_systems").select("*").order("created_at", { ascending: false });
      const { data, error } = teamId ? await q.eq("team_id", teamId) : await q;
      if (error) throw error;
      return withFallback(data as any[], mockSystems as any[]);
    },
  });
}

export function useAutomationPipelines() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["automation_pipelines", teamId],
    queryFn: async () => {
      const q = supabase.from("automation_pipelines").select("*").order("created_at", { ascending: false });
      const { data, error } = teamId ? await q.eq("team_id", teamId) : await q;
      if (error) throw error;
      return withFallback(data as any[], mockPipelines as any[]);
    },
  });
}

export function useAutomationTasks() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["automation_tasks", teamId],
    queryFn: async () => {
      const q = supabase.from("automation_tasks").select("*").order("created_at", { ascending: false }).limit(200);
      const { data, error } = teamId ? await q.eq("team_id", teamId) : await q;
      if (error) throw error;
      return withFallback(data as any[], mockTasks as any[]);
    },
  });
}

export function useAutomationAccounts() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["automation_accounts", teamId],
    queryFn: async () => {
      const q = supabase.from("automation_accounts").select("*").order("created_at", { ascending: false });
      const { data, error } = teamId ? await q.eq("team_id", teamId) : await q;
      if (error) throw error;
      return withFallback(data as any[], mockAccounts as any[]);
    },
  });
}

export function useAutomationRateLimits() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["automation_rate_limits", teamId],
    queryFn: async () => {
      const q = supabase.from("automation_rate_limit_events").select("*").order("detected_at", { ascending: false }).limit(200);
      const { data, error } = teamId ? await q.eq("team_id", teamId) : await q;
      if (error) throw error;
      return withFallback(data as any[], mockRateLimits as any[]);
    },
  });
}

export function useAutomationScheduler() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["automation_scheduler", teamId],
    queryFn: async () => {
      const q = supabase.from("automation_scheduler_rules").select("*").order("created_at", { ascending: false });
      const { data, error } = teamId ? await q.eq("team_id", teamId) : await q;
      if (error) throw error;
      return withFallback(data as any[], mockScheduler as any[]);
    },
  });
}

export function useAutomationAlertRoutes() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["automation_alert_routes", teamId],
    queryFn: async () => {
      const q = supabase.from("automation_alert_routes").select("*").order("created_at", { ascending: false });
      const { data, error } = teamId ? await q.eq("team_id", teamId) : await q;
      if (error) throw error;
      return withFallback(data as any[], mockAlertRoutes as any[]);
    },
  });
}

export function useAutomationLogs() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["automation_logs", teamId],
    queryFn: async () => {
      const q = supabase.from("automation_logs").select("*").order("created_at", { ascending: false }).limit(500);
      const { data, error } = teamId ? await q.eq("team_id", teamId) : await q;
      if (error) throw error;
      return withFallback(data as any[], mockLogs as any[]);
    },
  });
}

export function useAutomationArtifacts() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: ["automation_artifacts", teamId],
    queryFn: async () => {
      const q = supabase.from("automation_artifacts").select("*").order("created_at", { ascending: false }).limit(200);
      const { data, error } = teamId ? await q.eq("team_id", teamId) : await q;
      if (error) throw error;
      return withFallback(data as any[], mockArtifacts as any[]);
    },
  });
}

// ---------- Mutations ----------

export function useCreateAutomationRow<T extends Record<string, any>>(
  table:
    | "automation_systems" | "automation_pipelines" | "automation_tasks"
    | "automation_accounts" | "automation_scheduler_rules" | "automation_alert_routes",
  invalidateKey: string,
) {
  const qc = useQueryClient();
  const teamId = useTeamId();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (input: T) => {
      const payload: any = { ...input, team_id: teamId };
      if ("created_by" in input === false && user?.id) payload.created_by = user.id;
      const { data, error } = await (supabase as any).from(table).insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [invalidateKey] }),
  });
}

export function useUpdateAutomationRow(
  table:
    | "automation_systems" | "automation_pipelines" | "automation_tasks"
    | "automation_accounts" | "automation_scheduler_rules" | "automation_alert_routes",
  invalidateKey: string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: Record<string, any> }) => {
      const { data, error } = await (supabase as any).from(table).update(patch).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [invalidateKey] }),
  });
}
