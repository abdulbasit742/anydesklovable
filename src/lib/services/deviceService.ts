import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "./backendApi";

export type DeviceStatus = "online" | "offline" | "revoked" | "pending";

export type BackendDevice = {
  id: string;
  teamId?: string;
  team_id?: string;
  name: string;
  os?: string | null;
  osVersion?: string | null;
  os_version?: string | null;
  platform?: string | null;
  remoteDeskId?: string;
  remote_desk_id?: string;
  status: DeviceStatus | string;
  lastSeenAt?: string | null;
  last_seen_at?: string | null;
  last_seen?: string | null;
  appVersion?: string | null;
  client_version?: string | null;
  hostname?: string | null;
  tags?: string[] | null;
  isTrusted?: boolean | null;
  is_trusted?: boolean | null;
};

export type EnrollDeviceInput = {
  name: string;
  os?: string;
  osVersion?: string;
  platform?: string;
  hostname?: string;
  appVersion?: string;
  pairingCode?: string;
};

export type HeartbeatInput = {
  status?: "online" | "offline";
  appVersion?: string;
  platform?: string;
  hostname?: string;
  metrics?: Record<string, unknown>;
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

export async function listBackendDevices() {
  const { data } = await apiRequest<BackendDevice[] | { devices: BackendDevice[] }>("/api/devices");
  return unwrapList<BackendDevice>(data, "devices");
}

export async function getBackendDevice(deviceId: string) {
  const { data } = await apiRequest<BackendDevice | { device: BackendDevice }>(`/api/devices/${deviceId}`);
  return unwrapOne<BackendDevice>(data, "device");
}

export async function enrollBackendDevice(input: EnrollDeviceInput) {
  const { data } = await apiRequest<BackendDevice | { device: BackendDevice }>("/api/devices/enroll", {
    method: "POST",
    body: input,
  });
  return unwrapOne<BackendDevice>(data, "device");
}

export async function sendBackendDeviceHeartbeat(deviceId: string, input: HeartbeatInput = {}) {
  const { data } = await apiRequest<BackendDevice | { device: BackendDevice }>(`/api/devices/${deviceId}/heartbeat`, {
    method: "POST",
    body: input,
  });
  return unwrapOne<BackendDevice>(data, "device");
}

export async function revokeBackendDevice(deviceId: string) {
  const { data } = await apiRequest<{ ok: boolean } | BackendDevice>(`/api/devices/${deviceId}/revoke`, {
    method: "POST",
  });
  return data;
}

export function useBackendDevices(enabled = true) {
  return useQuery({
    queryKey: ["backend-devices"],
    enabled,
    queryFn: listBackendDevices,
  });
}

export function useBackendDevice(deviceId: string | undefined) {
  return useQuery({
    queryKey: ["backend-device", deviceId],
    enabled: !!deviceId,
    queryFn: () => getBackendDevice(deviceId!),
  });
}

export function useEnrollBackendDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: enrollBackendDevice,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backend-devices"] }),
  });
}

export function useRevokeBackendDevice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: revokeBackendDevice,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backend-devices"] }),
  });
}
