// Developer Platform service hooks — API logs, rate limits, webhooks.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTeam } from "@/hooks/use-current-team";

export const API_SCOPES = [
  { group: "Team", value: "read:team", label: "Read team" },
  { group: "Devices", value: "read:devices", label: "Read devices" },
  { group: "Devices", value: "write:devices", label: "Write devices" },
  { group: "Devices", value: "read:presence", label: "Read presence" },
  { group: "Sessions", value: "read:sessions", label: "Read sessions" },
  { group: "Sessions", value: "write:sessions", label: "End / create sessions" },
  { group: "Support", value: "read:support", label: "Read support tickets" },
  { group: "Support", value: "write:support", label: "Create support tickets" },
  { group: "Automation", value: "read:automation", label: "Read pipelines / runs" },
  { group: "Automation", value: "write:automation", label: "Trigger pipelines" },
  { group: "Billing", value: "read:billing", label: "Read billing usage" },
  { group: "Audit", value: "read:audit", label: "Read audit logs" },
  { group: "Notifications", value: "read:notifications", label: "Read notifications" },
  { group: "Webhooks", value: "read:webhooks", label: "Read webhook endpoints" },
  { group: "Webhooks", value: "write:webhooks", label: "Manage webhook endpoints" },
] as const;

export type DeveloperOverview = {
  total_keys: number; active_keys: number; revoked_keys: number;
  requests_24h: number; failed_requests_24h: number; rate_limited_24h: number;
  webhook_endpoints: number; webhook_deliveries_24h: number;
  webhook_success_24h: number; webhook_failed_24h: number;
};

export function useDeveloperOverview() {
  const { data: team } = useCurrentTeam();
  return useQuery({
    queryKey: ["developer-overview", team?.team_id],
    enabled: !!team?.team_id,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_developer_overview", { p_team_id: team!.team_id });
      if (error) throw error;
      const row = Array.isArray(data) ? data[0] : data;
      return (row ?? null) as DeveloperOverview | null;
    },
  });
}

export type ApiRequestLog = {
  id: string; team_id: string; api_key_id: string | null;
  method: string; path: string; status_code: number;
  request_id: string; latency_ms: number | null;
  error_code: string | null; error_message: string | null;
  user_agent: string | null; created_at: string;
};

export function useApiRequestLogs(opts?: { method?: string; status?: number; search?: string; limit?: number }) {
  const { data: team } = useCurrentTeam();
  return useQuery({
    queryKey: ["api-request-logs", team?.team_id, opts],
    enabled: !!team?.team_id,
    queryFn: async () => {
      let q = supabase.from("api_requests").select("*").eq("team_id", team!.team_id)
        .order("created_at", { ascending: false }).limit(opts?.limit ?? 100);
      if (opts?.method) q = q.eq("method", opts.method);
      if (typeof opts?.status === "number") q = q.eq("status_code", opts.status);
      if (opts?.search) q = q.ilike("path", `%${opts.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as ApiRequestLog[];
    },
  });
}

export type ApiRateLimitEvent = {
  id: string; team_id: string; api_key_id: string | null;
  scope: string; limit_key: string; allowed: boolean;
  limit_count: number | null; remaining: number | null;
  reset_at: string | null; reason: string | null; created_at: string;
};

export function useApiRateLimitEvents(limit = 100) {
  const { data: team } = useCurrentTeam();
  return useQuery({
    queryKey: ["api-rate-limit-events", team?.team_id, limit],
    enabled: !!team?.team_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("api_rate_limit_events").select("*")
        .eq("team_id", team!.team_id).order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return (data ?? []) as ApiRateLimitEvent[];
    },
  });
}

export type WebhookEndpoint = {
  id: string; team_id: string; name: string; url: string;
  events: string[]; status: "active" | "paused" | "disabled";
  last_delivery_at: string | null; last_success_at: string | null;
  last_failure_at: string | null; failure_count: number;
  created_at: string; updated_at: string;
};

export function useWebhookEndpoints() {
  const { data: team } = useCurrentTeam();
  return useQuery({
    queryKey: ["webhook-endpoints", team?.team_id],
    enabled: !!team?.team_id,
    queryFn: async () => {
      const { data, error } = await supabase.from("webhook_endpoints").select("*")
        .eq("team_id", team!.team_id).order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as WebhookEndpoint[];
    },
  });
}

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomSecret(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  let bin = ""; for (const b of arr) bin += b.toString(16).padStart(2, "0");
  return `whsec_${bin}`;
}

export function useCreateWebhookEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; url: string; events: string[] }) => {
      const secret = randomSecret();
      const secret_hash = await sha256Hex(secret);
      const { data, error } = await supabase.rpc("create_webhook_endpoint", {
        p_name: input.name, p_url: input.url, p_events: input.events, p_secret_hash: secret_hash,
      });
      if (error) throw error;
      return { endpoint: data as unknown as WebhookEndpoint, secret };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhook-endpoints"] }),
  });
}

export function useUpdateWebhookEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; name?: string; url?: string; events?: string[]; status?: string }) => {
      const { data, error } = await supabase.rpc("update_webhook_endpoint", {
        p_endpoint_id: input.id,
        p_name: input.name ?? null,
        p_url: input.url ?? null,
        p_events: input.events ?? null,
        p_status: input.status ?? null,
      });
      if (error) throw error;
      return data as unknown as WebhookEndpoint;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhook-endpoints"] }),
  });
}

export function useDisableWebhookEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("disable_webhook_endpoint", { p_endpoint_id: id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["webhook-endpoints"] }),
  });
}

export function useTestWebhookEndpoint() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.rpc("enqueue_test_webhook_delivery", { p_endpoint_id: id });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["webhook-deliveries"] });
      qc.invalidateQueries({ queryKey: ["webhook-endpoints"] });
    },
  });
}

export type WebhookDelivery = {
  id: string; team_id: string; endpoint_id: string;
  event_type: string; status: string;
  attempt_count: number; max_attempts: number;
  response_status: number | null; error_message: string | null;
  next_retry_at: string | null; delivered_at: string | null;
  created_at: string;
};

export function useWebhookDeliveries(endpointId?: string, limit = 100) {
  const { data: team } = useCurrentTeam();
  return useQuery({
    queryKey: ["webhook-deliveries", team?.team_id, endpointId, limit],
    enabled: !!team?.team_id,
    queryFn: async () => {
      let q = supabase.from("webhook_deliveries").select("*").eq("team_id", team!.team_id)
        .order("created_at", { ascending: false }).limit(limit);
      if (endpointId) q = q.eq("endpoint_id", endpointId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as WebhookDelivery[];
    },
  });
}

export const WEBHOOK_EVENT_TYPES = [
  "device.created", "device.updated", "device.online", "device.offline", "device.quality_poor",
  "session.started", "session.ended",
  "support.ticket_created", "support.ticket_updated",
  "automation.run_started", "automation.run_succeeded", "automation.run_failed",
  "billing.invoice_created", "billing.subscription_updated",
  "security.mfa_enabled", "security.mfa_disabled",
  "api.key_created", "api.key_revoked",
] as const;
