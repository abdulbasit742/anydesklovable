// Device presence + notifications service hooks.
import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { useAuth } from "@/hooks/use-auth";

export type PresenceStatus = "online" | "offline" | "idle" | "busy" | "maintenance" | "unknown";
export type ConnectionQuality = "excellent" | "good" | "fair" | "poor" | "unknown";
export type Severity = "info" | "warning" | "critical";

export type DevicePresence = {
  id: string;
  team_id: string;
  device_id: string;
  status: PresenceStatus;
  heartbeat_at: string | null;
  last_seen_at: string | null;
  active_session_id: string | null;
  active_user_id: string | null;
  client_version: string | null;
  platform: string | null;
  os_version: string | null;
  region: string | null;
  latency_ms: number | null;
  packet_loss: number | null;
  cpu_load: number | null;
  memory_load: number | null;
  battery_percent: number | null;
  network_type: string | null;
  connection_quality: ConnectionQuality;
  metadata: Record<string, unknown>;
  updated_at: string;
};

export type PresenceEvent = {
  id: string;
  team_id: string;
  device_id: string;
  previous_status: string | null;
  new_status: string;
  event_type: string;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type Notification = {
  id: string;
  team_id: string;
  user_id: string | null;
  device_id: string | null;
  session_id: string | null;
  rule_id: string | null;
  type: string;
  title: string;
  message: string;
  severity: Severity;
  read_at: string | null;
  archived_at: string | null;
  action_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type NotificationRule = {
  id: string;
  team_id: string;
  name: string;
  event_type: string;
  severity: Severity;
  enabled: boolean;
  conditions: Record<string, unknown>;
  channels: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export const PRESENCE_EVENT_TYPES = [
  "device.offline",
  "device.online",
  "device.poor_quality",
  "device.idle",
  "device.busy",
  "session.attached",
  "session.detached",
  "device.stale_heartbeat",
] as const;

// ---------- Presence ----------

export function useDevicePresenceMap() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const qc = useQueryClient();

  useEffect(() => {
    if (!teamId) return;
    const ch = supabase
      .channel(`rt-presence-${teamId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "device_presence", filter: `team_id=eq.${teamId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["device-presence", teamId] });
          qc.invalidateQueries({ queryKey: ["device-presence-summary", teamId] });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [teamId, qc]);

  return useQuery({
    queryKey: ["device-presence", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("device_presence")
        .select("*")
        .eq("team_id", teamId!)
        .order("last_seen_at", { ascending: false });
      if (error) throw error;
      const map = new Map<string, DevicePresence>();
      (data ?? []).forEach((p) => map.set(p.device_id, p as DevicePresence));
      return { list: (data ?? []) as DevicePresence[], map };
    },
  });
}

export function useDevicePresence(deviceId: string | undefined) {
  return useQuery({
    queryKey: ["device-presence-one", deviceId],
    enabled: !!deviceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("device_presence")
        .select("*")
        .eq("device_id", deviceId!)
        .maybeSingle();
      if (error) throw error;
      return data as DevicePresence | null;
    },
  });
}

export function useDevicePresenceEvents(deviceId: string | undefined, limit = 25) {
  return useQuery({
    queryKey: ["device-presence-events", deviceId, limit],
    enabled: !!deviceId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("device_presence_events")
        .select("*")
        .eq("device_id", deviceId!)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as PresenceEvent[];
    },
  });
}

export type PresenceSummary = {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  idle_devices: number;
  busy_devices: number;
  poor_quality_devices: number;
  active_sessions: number;
  last_updated_at: string | null;
};

export function useDevicePresenceSummary() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  return useQuery({
    queryKey: ["device-presence-summary", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_device_presence_summary");
      if (error) throw error;
      const row = (Array.isArray(data) ? data[0] : data) as PresenceSummary | undefined;
      return (
        row ?? {
          total_devices: 0,
          online_devices: 0,
          offline_devices: 0,
          idle_devices: 0,
          busy_devices: 0,
          poor_quality_devices: 0,
          active_sessions: 0,
          last_updated_at: null,
        }
      );
    },
  });
}

export function useMarkDeviceOffline() {
  const qc = useQueryClient();
  const { data: team } = useCurrentTeam();
  return useMutation({
    mutationFn: async (deviceId: string) => {
      const { data, error } = await supabase.rpc("mark_device_offline", { p_device_id: deviceId });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["device-presence", team?.team_id] });
      qc.invalidateQueries({ queryKey: ["device-presence-summary", team?.team_id] });
    },
  });
}

// ---------- Notifications ----------

export function useNotifications(opts?: { unreadOnly?: boolean; limit?: number }) {
  const { data: team } = useCurrentTeam();
  const { user } = useAuth();
  const teamId = team?.team_id;
  const qc = useQueryClient();

  useEffect(() => {
    if (!teamId) return;
    const ch = supabase
      .channel(`rt-notif-${teamId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications", filter: `team_id=eq.${teamId}` },
        () => {
          qc.invalidateQueries({ queryKey: ["notifications", teamId] });
          qc.invalidateQueries({ queryKey: ["notifications-unread", teamId, user?.id] });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [teamId, user?.id, qc]);

  return useQuery({
    queryKey: ["notifications", teamId, opts?.unreadOnly ?? false, opts?.limit ?? 50],
    enabled: !!teamId,
    queryFn: async () => {
      let q = supabase
        .from("notifications")
        .select("*")
        .eq("team_id", teamId!)
        .is("archived_at", null)
        .order("created_at", { ascending: false })
        .limit(opts?.limit ?? 50);
      if (opts?.unreadOnly) q = q.is("read_at", null);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Notification[];
    },
  });
}

export function useUnreadNotificationCount() {
  const { data: team } = useCurrentTeam();
  const { user } = useAuth();
  const teamId = team?.team_id;
  return useQuery({
    queryKey: ["notifications-unread", teamId, user?.id],
    enabled: !!teamId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("team_id", teamId!)
        .is("read_at", null)
        .is("archived_at", null);
      if (error) throw error;
      return count ?? 0;
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("mark_notification_read", { p_notification_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("mark_all_notifications_read");
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
}

// ---------- Notification rules ----------

export function useNotificationRules() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  return useQuery({
    queryKey: ["notification-rules", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notification_rules")
        .select("*")
        .eq("team_id", teamId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as NotificationRule[];
    },
  });
}

export type NotificationRuleInput = {
  name: string;
  event_type: string;
  severity: Severity;
  enabled?: boolean;
};

export function useCreateNotificationRule() {
  const qc = useQueryClient();
  const { data: team } = useCurrentTeam();
  return useMutation({
    mutationFn: async (input: NotificationRuleInput) => {
      if (!team?.team_id) throw new Error("No team");
      const { data, error } = await supabase
        .from("notification_rules")
        .insert({
          team_id: team.team_id,
          name: input.name,
          event_type: input.event_type,
          severity: input.severity,
          enabled: input.enabled ?? true,
        })
        .select()
        .single();
      if (error) throw error;
      return data as NotificationRule;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-rules", team?.team_id] }),
  });
}

export function useUpdateNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; patch: Partial<NotificationRuleInput> }) => {
      const { data, error } = await supabase
        .from("notification_rules")
        .update(input.patch)
        .eq("id", input.id)
        .select()
        .single();
      if (error) throw error;
      return data as NotificationRule;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-rules"] }),
  });
}

export function useDeleteNotificationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notification_rules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notification-rules"] }),
  });
}

// ---------- Helpers ----------

export function presenceVariant(status: PresenceStatus): "online" | "offline" | "good" | "fair" | "poor" | "neutral" {
  switch (status) {
    case "online": return "online";
    case "busy": return "fair";
    case "idle": return "neutral";
    case "maintenance": return "neutral";
    case "offline": return "offline";
    default: return "neutral";
  }
}

export function qualityVariant(q: ConnectionQuality): "good" | "fair" | "poor" | "neutral" {
  if (q === "excellent" || q === "good") return "good";
  if (q === "fair") return "fair";
  if (q === "poor") return "poor";
  return "neutral";
}

export function isHeartbeatStale(p: DevicePresence | null | undefined, thresholdSeconds = 120): boolean {
  if (!p?.heartbeat_at) return true;
  return Date.now() - new Date(p.heartbeat_at).getTime() > thresholdSeconds * 1000;
}
