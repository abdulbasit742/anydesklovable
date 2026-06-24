import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./backendApi";

export type SessionStatus = "pending" | "requested" | "accepted" | "connected" | "denied" | "rejected" | "ended" | "failed";
export type SessionPermission = "view-only" | "remote-input" | "file-transfer" | "clipboard";

export type BackendSession = {
  id: string;
  teamId?: string;
  team_id?: string;
  deviceId?: string | null;
  device_id?: string | null;
  targetDeviceId?: string | null;
  target_device_id?: string | null;
  targetName?: string | null;
  target_name?: string | null;
  requesterId?: string | null;
  requester_id?: string | null;
  initiator?: string | null;
  status: SessionStatus | string;
  permissions?: SessionPermission[] | string[];
  startedAt?: string | null;
  started_at?: string | null;
  acceptedAt?: string | null;
  accepted_at?: string | null;
  endedAt?: string | null;
  ended_at?: string | null;
  reason?: string | null;
  quality?: "good" | "fair" | "poor" | null;
  durationSeconds?: number | null;
  duration_seconds?: number | null;
};

export type CreateSessionInput = {
  deviceId: string;
  permissions?: SessionPermission[];
  reason?: string;
  mode?: "view-only";
};

export type EndSessionInput = {
  reason?: string;
};

function unwrapList<T>(value: unknown, key: string): T[] {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && Array.isArray((value as Record<string, unknown>)[key])) {
    return (value as Record<string, unknown>)[key] as T[];
  }
  return [];
}

function unwrapOne<T>(value: unknown, key: string): T {
  if (value && typeof value === "object" && (value as Record<string, unknown>)[key]) {
    return (value as Record<string, unknown>)[key] as T;
  }
  return value as T;
}

export async function listBackendSessions(params: { deviceId?: string; status?: string } = {}) {
  const search = new URLSearchParams();
  if (params.deviceId) search.set("deviceId", params.deviceId);
  if (params.status) search.set("status", params.status);
  const suffix = search.toString() ? `?${search.toString()}` : "";
  const { data } = await apiRequest<BackendSession[] | { sessions: BackendSession[] }>(`/api/sessions${suffix}`);
  return unwrapList<BackendSession>(data, "sessions");
}

export async function getBackendSession(sessionId: string) {
  const { data } = await apiRequest<BackendSession | { session: BackendSession }>(`/api/sessions/${sessionId}`);
  return unwrapOne<BackendSession>(data, "session");
}

export async function createBackendSession(input: CreateSessionInput) {
  const { data } = await apiRequest<BackendSession | { session: BackendSession }>("/api/sessions", {
    method: "POST",
    body: input,
  });
  return unwrapOne<BackendSession>(data, "session");
}

export async function acceptBackendSession(sessionId: string) {
  const { data } = await apiRequest<BackendSession | { session: BackendSession }>(`/api/sessions/${sessionId}/accept`, {
    method: "POST",
  });
  return unwrapOne<BackendSession>(data, "session");
}

export async function denyBackendSession(sessionId: string, reason?: string) {
  const { data } = await apiRequest<BackendSession | { session: BackendSession }>(`/api/sessions/${sessionId}/deny`, {
    method: "POST",
    body: { reason },
  });
  return unwrapOne<BackendSession>(data, "session");
}

export async function endBackendSession(sessionId: string, input: EndSessionInput = {}) {
  const { data } = await apiRequest<BackendSession | { session: BackendSession }>(`/api/sessions/${sessionId}/end`, {
    method: "POST",
    body: input,
  });
  return unwrapOne<BackendSession>(data, "session");
}

export async function emergencyStopBackendSession(sessionId: string, reason = "viewer_emergency_stop") {
  const { data } = await apiRequest<BackendSession | { session: BackendSession }>(`/api/sessions/${sessionId}/emergency-stop`, {
    method: "POST",
    body: { reason },
  });
  return unwrapOne<BackendSession>(data, "session");
}

export function useBackendSessions(params: { deviceId?: string; status?: string } = {}, enabled = true) {
  return useQuery({
    queryKey: ["backend-sessions", params.deviceId, params.status],
    enabled,
    queryFn: () => listBackendSessions(params),
  });
}

export function useBackendSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ["backend-session", sessionId],
    enabled: !!sessionId,
    queryFn: () => getBackendSession(sessionId!),
  });
}

export function useCreateBackendSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBackendSession,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backend-sessions"] }),
  });
}

export function useEndBackendSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ sessionId, reason }: { sessionId: string; reason?: string }) => endBackendSession(sessionId, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backend-sessions"] }),
  });
}
