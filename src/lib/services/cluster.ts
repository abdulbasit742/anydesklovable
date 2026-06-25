/**
 * Cluster Service — Dashboard PWA
 *
 * Provides typed API calls and React Query hooks for the distributed computing
 * cluster management feature. Calls the RemoteDesk backend API directly using
 * the Supabase session token for authentication.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Cluster {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  status: string;
  inviteCode: string;
  maxNodes: number;
  nodeCount: number;
  onlineNodeCount: number;
  createdAt: string;
}

export interface ClusterNode {
  id: string;
  clusterId: string;
  deviceId: string;
  userId: string;
  nickname: string | null;
  status: string;
  cpuShareLimit: number;
  ramShareLimit: number;
  gpuShareLimit: number;
  priorityLevel: number;
  lastHeartbeatAt: string | null;
  joinedAt: string;
  latestTelemetry?: {
    cpuPercent: number;
    ramPercent: number;
    ramUsedMb: number;
    ramTotalMb: number;
    gpuPercent: number | null;
    gpuVramUsedMb: number | null;
    gpuVramTotalMb: number | null;
    gpuTempC: number | null;
    cpuTempC: number | null;
    networkUpKbps: number;
    networkDownKbps: number;
    activeTaskCount: number;
    recordedAt: string;
  } | null;
}

export interface DistributedTask {
  id: string;
  clusterId: string;
  submittedByUserId: string;
  assignedNodeId: string | null;
  type: string;
  status: string;
  priority: number;
  name: string;
  description: string | null;
  progressPercent: number;
  estimatedSeconds: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface ClusterAggregateStats {
  clusterId: string;
  totalNodes: number;
  onlineNodes: number;
  avgCpuPercent: number;
  avgRamPercent: number;
  totalRamUsedMb: number;
  totalRamTotalMb: number;
  avgGpuPercent: number | null;
  totalGpuVramUsedMb: number | null;
  totalGpuVramTotalMb: number | null;
  avgCpuTempC: number | null;
  avgGpuTempC: number | null;
  totalNetworkUpKbps: number;
  totalNetworkDownKbps: number;
  totalActiveTasks: number;
  pendingTasks: number;
  completedTasksToday: number;
  computedAt: string;
}

// ─── API base helper ──────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:4000";

async function getToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

async function apiFetch<T>(method: string, path: string, body?: unknown): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error((err as any).error ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

// ─── Query hooks ──────────────────────────────────────────────────────────────

export function useClusters() {
  return useQuery({
    queryKey: ["clusters"],
    queryFn: async () => {
      const data = await apiFetch<{ clusters: Cluster[] }>("GET", "/api/clusters");
      return data.clusters;
    },
    refetchInterval: 30_000,
  });
}

export function useClusterDetail(clusterId: string | null) {
  return useQuery({
    queryKey: ["cluster", clusterId],
    enabled: !!clusterId,
    queryFn: async () => {
      const data = await apiFetch<{ cluster: Cluster; nodes: ClusterNode[] }>(
        "GET",
        `/api/clusters/${clusterId}`
      );
      return data;
    },
    refetchInterval: 10_000,
  });
}

export function useClusterStats(clusterId: string | null) {
  return useQuery({
    queryKey: ["cluster-stats", clusterId],
    enabled: !!clusterId,
    queryFn: async () => {
      const data = await apiFetch<{ stats: ClusterAggregateStats }>(
        "GET",
        `/api/clusters/${clusterId}/stats`
      );
      return data.stats;
    },
    refetchInterval: 5_000,
  });
}

export function useClusterTelemetry(clusterId: string | null) {
  return useQuery({
    queryKey: ["cluster-telemetry", clusterId],
    enabled: !!clusterId,
    queryFn: async () => {
      const data = await apiFetch<{ nodes: ClusterNode[] }>(
        "GET",
        `/api/clusters/${clusterId}/telemetry`
      );
      return data.nodes;
    },
    refetchInterval: 5_000,
  });
}

export function useClusterTasks(clusterId: string | null, status?: string) {
  return useQuery({
    queryKey: ["cluster-tasks", clusterId, status],
    enabled: !!clusterId,
    queryFn: async () => {
      const qs = status ? `?status=${status}` : "";
      const data = await apiFetch<{ tasks: DistributedTask[] }>(
        "GET",
        `/api/clusters/${clusterId}/tasks${qs}`
      );
      return data.tasks;
    },
    refetchInterval: 5_000,
  });
}

// ─── Mutation hooks ───────────────────────────────────────────────────────────

export function useCreateCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string; description?: string; maxNodes?: number }) =>
      apiFetch<{ cluster: Cluster }>("POST", "/api/clusters", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clusters"] }),
  });
}

export function useJoinCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { inviteCode: string; deviceId: string; nickname?: string }) =>
      apiFetch<{ node: ClusterNode }>("POST", "/api/clusters/join", input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clusters"] }),
  });
}

export function useDeleteCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (clusterId: string) =>
      apiFetch<void>("DELETE", `/api/clusters/${clusterId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clusters"] }),
  });
}

export function useLeaveCluster() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ clusterId, nodeId }: { clusterId: string; nodeId: string }) =>
      apiFetch<void>("DELETE", `/api/clusters/${clusterId}/nodes/${nodeId}`),
    onSuccess: (_data, { clusterId }) => {
      qc.invalidateQueries({ queryKey: ["clusters"] });
      qc.invalidateQueries({ queryKey: ["cluster", clusterId] });
    },
  });
}

export function useUpdateNodeLimits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      clusterId,
      nodeId,
      limits,
    }: {
      clusterId: string;
      nodeId: string;
      limits: { cpuShareLimit?: number; ramShareLimit?: number; gpuShareLimit?: number; priorityLevel?: number; nickname?: string };
    }) => apiFetch<{ node: ClusterNode }>("PATCH", `/api/clusters/${clusterId}/nodes/${nodeId}`, limits),
    onSuccess: (_data, { clusterId }) => {
      qc.invalidateQueries({ queryKey: ["cluster", clusterId] });
    },
  });
}

export function useSubmitTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      clusterId,
      task,
    }: {
      clusterId: string;
      task: { name: string; type: string; priority?: number; description?: string; payload?: Record<string, unknown> };
    }) => apiFetch<{ task: DistributedTask }>("POST", `/api/clusters/${clusterId}/tasks`, { ...task, clusterId }),
    onSuccess: (_data, { clusterId }) => {
      qc.invalidateQueries({ queryKey: ["cluster-tasks", clusterId] });
    },
  });
}
