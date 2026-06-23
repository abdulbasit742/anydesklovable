// Automation execution engine — services for run/scheduler/summary.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type AutomationSummary = {
  active_pipelines: number;
  paused_pipelines: number;
  queued_runs: number;
  running_runs: number;
  failed_runs_24h: number;
  successful_runs_24h: number;
  queued_tasks: number;
  failed_tasks_24h: number;
  next_scheduled_run_at: string | null;
  latest_run_at: string | null;
};

export function useAutomationDashboardSummary() {
  return useQuery({
    queryKey: ["automation-summary"],
    queryFn: async (): Promise<AutomationSummary | null> => {
      const { data, error } = await supabase.rpc("get_automation_dashboard_summary");
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row as AutomationSummary) ?? null;
    },
  });
}

export function useAutomationRuns(pipelineId?: string | null) {
  return useQuery({
    queryKey: ["automation-runs", pipelineId ?? "all"],
    queryFn: async () => {
      let qb = supabase.from("automation_pipeline_runs").select("*")
        .order("created_at", { ascending: false }).limit(50);
      if (pipelineId) qb = qb.eq("pipeline_id", pipelineId);
      const { data, error } = await qb;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAutomationLogs(runId?: string | null, limit = 100) {
  return useQuery({
    queryKey: ["automation-logs", runId ?? "all", limit],
    queryFn: async () => {
      let qb = supabase.from("automation_logs").select("*")
        .order("created_at", { ascending: false }).limit(limit);
      if (runId) qb = qb.eq("run_id", runId);
      const { data, error } = await qb;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAutomationArtifacts(runId?: string | null) {
  return useQuery({
    queryKey: ["automation-artifacts", runId ?? "all"],
    queryFn: async () => {
      let qb = supabase.from("automation_artifacts").select("*")
        .order("created_at", { ascending: false }).limit(50);
      if (runId) qb = qb.eq("pipeline_run_id", runId);
      const { data, error } = await qb;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSchedulerRules() {
  return useQuery({
    queryKey: ["automation-scheduler-rules"],
    queryFn: async () => {
      const { data, error } = await supabase.from("automation_scheduler_rules").select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useRunAutomationPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ pipelineId, input }: { pipelineId: string; input?: Record<string, unknown> }) => {
      const { data, error } = await supabase.rpc("run_automation_pipeline", {
        p_pipeline_id: pipelineId,
        p_input: (input ?? {}) as never,
        p_trigger_source: "manual",
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Pipeline run queued for worker execution");
      qc.invalidateQueries({ queryKey: ["automation-runs"] });
      qc.invalidateQueries({ queryKey: ["automation-summary"] });
    },
    onError: (e: Error) => toast.error(e.message || "Could not start run"),
  });
}

export function useArchiveAutomationPipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (pipelineId: string) => {
      const { data, error } = await supabase.rpc("archive_automation_pipeline", { p_pipeline_id: pipelineId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Pipeline archived");
      qc.invalidateQueries({ queryKey: ["automation_pipelines"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useEnqueueDueScheduledRuns() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("enqueue_due_scheduled_runs");
      if (error) throw error;
      return data as number;
    },
    onSuccess: (n) => {
      toast.success(`${n ?? 0} scheduled run(s) queued`);
      qc.invalidateQueries({ queryKey: ["automation-summary"] });
      qc.invalidateQueries({ queryKey: ["automation-runs"] });
      qc.invalidateQueries({ queryKey: ["automation-scheduler-rules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCreateSchedulerRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      pipelineId: string;
      name: string;
      scheduleType: "interval" | "cron" | "daily" | "weekly" | "monthly";
      cron?: string;
      intervalMinutes?: number;
      timezone?: string;
    }) => {
      const { data, error } = await supabase.rpc("create_scheduler_rule", {
        p_pipeline_id: input.pipelineId,
        p_name: input.name,
        p_schedule_type: input.scheduleType,
        p_cron_expression: input.cron ?? undefined,
        p_interval_minutes: input.intervalMinutes ?? undefined,
        p_timezone: input.timezone ?? "UTC",
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Scheduler rule created");
      qc.invalidateQueries({ queryKey: ["automation-scheduler-rules"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useGenerateDeviceHealthReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (teamId: string) => {
      const { data, error } = await supabase.rpc("generate_device_health_report", {
        p_team_id: teamId,
        p_run_id: undefined,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Device health report generated");
      qc.invalidateQueries({ queryKey: ["automation-artifacts"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

// Built-in pipeline templates the UI can render or pre-fill.
export const AUTOMATION_TEMPLATES = [
  {
    id: "device-offline-alert",
    name: "Device Offline Alert",
    description: "Notify the team when a critical device goes offline.",
    trigger_type: "device_event" as const,
    steps: [
      { name: "Presence check", type: "device_presence_check" },
      { name: "Notify team", type: "send_notification", config: { severity: "warning" } },
      { name: "Audit log", type: "create_audit_log" },
    ],
  },
  {
    id: "poor-quality-alert",
    name: "Poor Connection Quality Alert",
    description: "Alert when a device repeatedly shows poor connection quality.",
    trigger_type: "device_event" as const,
    steps: [
      { name: "Presence check", type: "device_presence_check" },
      { name: "Notify team", type: "send_notification" },
    ],
  },
  {
    id: "daily-device-health",
    name: "Daily Device Health Report",
    description: "Generate a daily report of device fleet health.",
    trigger_type: "schedule" as const,
    steps: [
      { name: "Generate report", type: "generate_report_artifact" },
      { name: "Notify team", type: "send_notification" },
    ],
  },
  {
    id: "failed-session-followup",
    name: "Failed Session Follow-up",
    description: "Create a support ticket for failed remote sessions.",
    trigger_type: "support_event" as const,
    steps: [
      { name: "Create ticket", type: "create_support_ticket" },
      { name: "Notify team", type: "send_notification" },
    ],
  },
  {
    id: "mfa-disabled-alert",
    name: "MFA Disabled Alert",
    description: "Notify admins when a member disables MFA.",
    trigger_type: "security_event" as const,
    steps: [
      { name: "Notify admin", type: "send_notification", config: { severity: "warning" } },
      { name: "Audit log", type: "create_audit_log" },
    ],
  },
  {
    id: "billing-limit-warning",
    name: "Billing Limit Warning",
    description: "Warn when plan usage approaches its limit.",
    trigger_type: "billing_event" as const,
    steps: [
      { name: "Notify team", type: "send_notification" },
      { name: "Audit log", type: "create_audit_log" },
    ],
  },
];
