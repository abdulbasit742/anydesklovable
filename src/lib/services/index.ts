// Typed service layer for RemoteDesk.
// Reads from Supabase when a user is signed in and rows exist. Falls back
// to mock data ONLY when:
//   - the query returns zero rows (so signed-in empty users still see a
//     demo of the UI), OR
//   - the user has no team_id yet (extremely early state).
//
// Disable fallback globally with VITE_DEMO_FALLBACK=false.

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTeam } from "@/hooks/use-current-team";
import {
  devices as mockDevices,
  sessions as mockSessions,
  auditLog as mockAudit,
  teamMembers as mockTeam,
  invoices as mockInvoices,
  adminMetrics as mockAdminMetrics,
  adminOrgs as mockAdminOrgs,
} from "@/lib/mock-data";

const DEMO_FALLBACK = (import.meta.env.VITE_DEMO_FALLBACK ?? "true") !== "false";

export type ServiceResult<T> = {
  data: T;
  isDemo: boolean;
  isLoading: boolean;
  error: Error | null;
};

function withFallback<T>(data: T[] | undefined, mock: T[], loading: boolean, error: Error | null): ServiceResult<T[]> {
  if (loading) return { data: [], isDemo: false, isLoading: true, error: null };
  if (error) return { data: [], isDemo: false, isLoading: false, error };
  if (!data || data.length === 0) {
    if (DEMO_FALLBACK) return { data: mock, isDemo: true, isLoading: false, error: null };
    return { data: [], isDemo: false, isLoading: false, error: null };
  }
  return { data, isDemo: false, isLoading: false, error: null };
}

// ----- Devices -----
export type DeviceRow = {
  id: string;
  name: string;
  os: "Windows" | "macOS" | "Linux" | string;
  os_version: string | null;
  status: "online" | "offline";
  remote_desk_id: string;
  last_seen: string | null;
  ip: string | null;
  cpu: string | null;
  ram: string | null;
  client_version: string | null;
  tags: string[] | null;
  owner_id: string | null;
};

export function useDevices() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const q = useQuery({
    queryKey: ["devices", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase.from("devices").select("*").eq("team_id", teamId!).order("created_at", { ascending: false });
      if (error) throw error;
      return data as DeviceRow[];
    },
  });
  const mock: DeviceRow[] = mockDevices.map((d) => ({
    id: d.id, name: d.name, os: d.os, os_version: d.osVersion, status: d.status,
    remote_desk_id: d.remoteDeskId, last_seen: d.status === "online" ? new Date().toISOString() : new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    ip: d.ip, cpu: d.cpu, ram: d.ram, client_version: d.clientVersion, tags: d.tags, owner_id: null,
  }));
  return withFallback(q.data, mock, q.isLoading, (q.error as Error) ?? null);
}

export function useDevice(deviceId: string) {
  const all = useDevices();
  const data = all.data.find((d) => d.id === deviceId) ?? null;
  return { ...all, data };
}

// ----- Sessions -----
export type SessionRow = {
  id: string;
  device_id: string | null;
  target_name: string;
  role: "Host" | "Viewer";
  initiator: string;
  status: "connected" | "ended" | "rejected";
  duration_seconds: number | null;
  quality: "good" | "fair" | "poor" | null;
  started_at: string;
  reason: string | null;
};

export function useSessions(opts?: { deviceId?: string; limit?: number }) {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const q = useQuery({
    queryKey: ["sessions", teamId, opts?.deviceId, opts?.limit],
    enabled: !!teamId,
    queryFn: async () => {
      let qb = supabase.from("sessions").select("*").eq("team_id", teamId!).order("started_at", { ascending: false });
      if (opts?.deviceId) qb = qb.eq("device_id", opts.deviceId);
      if (opts?.limit) qb = qb.limit(opts.limit);
      const { data, error } = await qb;
      if (error) throw error;
      return data as unknown as SessionRow[];
    },
  });
  const mock: SessionRow[] = mockSessions.map((s, i) => ({
    id: s.id, device_id: null, target_name: s.target, role: s.role, initiator: s.initiator,
    status: s.status, duration_seconds: parseDuration(s.duration), quality: s.quality,
    started_at: new Date(Date.now() - i * 3600 * 1000).toISOString(), reason: s.reason ?? null,
  }));
  return withFallback(q.data, mock, q.isLoading, (q.error as Error) ?? null);
}

function parseDuration(s: string): number | null {
  if (!s || s === "—") return null;
  const h = /(\d+)h/.exec(s)?.[1];
  const m = /(\d+)m/.exec(s)?.[1];
  return (h ? +h * 3600 : 0) + (m ? +m * 60 : 0);
}

export function formatDuration(secs: number | null) {
  if (!secs) return "—";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

// ----- Team members -----
export type MemberRow = { id: string; name: string; email: string; role: string; devices: number; last_active: string };

export function useTeamMembers() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const q = useQuery({
    queryKey: ["team-members", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("user_id, role, joined_at, profiles(full_name, email)")
        .eq("team_id", teamId!);
      if (error) throw error;
      return (data ?? []).map((m): MemberRow => ({
        id: m.user_id,
        name: (m.profiles as { full_name?: string } | null)?.full_name ?? "—",
        email: (m.profiles as { email?: string } | null)?.email ?? "",
        role: m.role,
        devices: 0,
        last_active: m.joined_at,
      }));
    },
  });
  const mock: MemberRow[] = mockTeam.map((t) => ({
    id: t.id, name: t.name, email: t.email, role: t.role, devices: t.devices, last_active: t.lastActive,
  }));
  return withFallback(q.data, mock, q.isLoading, (q.error as Error) ?? null);
}

// ----- Invoices -----
export type InvoiceRow = { id: string; number: string; amount_cents: number; currency: string; status: string; issued_at: string; pdf_url: string | null };

export function useInvoices() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const q = useQuery({
    queryKey: ["invoices", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase.from("invoices").select("*").eq("team_id", teamId!).order("issued_at", { ascending: false });
      if (error) throw error;
      return data as InvoiceRow[];
    },
  });
  const mock: InvoiceRow[] = mockInvoices.map((i) => ({
    id: i.id, number: i.id, amount_cents: 1900, currency: "USD", status: i.status.toLowerCase(), issued_at: new Date(i.date).toISOString(), pdf_url: null,
  }));
  return withFallback(q.data, mock, q.isLoading, (q.error as Error) ?? null);
}

// ----- Admin -----
export function useAdminStats() {
  const q = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [teams, devices, sessions] = await Promise.all([
        supabase.from("teams").select("id", { count: "exact", head: true }),
        supabase.from("devices").select("id", { count: "exact", head: true }),
        supabase.from("sessions").select("id", { count: "exact", head: true }).eq("status", "connected"),
      ]);
      return {
        totalAccounts: teams.count ?? 0,
        activeOrgs: teams.count ?? 0,
        liveSessions: sessions.count ?? 0,
        totalDevices: devices.count ?? 0,
      };
    },
  });
  const loading = q.isLoading;
  const error = (q.error as Error) ?? null;
  const empty = !q.data || (q.data.totalAccounts === 0 && q.data.totalDevices === 0);
  const useMock = !loading && !error && empty && DEMO_FALLBACK;
  return {
    isLoading: loading,
    error,
    isDemo: useMock,
    data: useMock
      ? { totalAccounts: mockAdminMetrics.totalAccounts, activeOrgs: mockAdminMetrics.activeOrgs, liveSessions: mockAdminMetrics.liveSessions, totalDevices: 642 }
      : q.data ?? { totalAccounts: 0, activeOrgs: 0, liveSessions: 0, totalDevices: 0 },
    orgs: useMock ? mockAdminOrgs : [],
  };
}

// ----- Mutations: devices -----
export async function renameDevice(id: string, name: string) {
  const { error } = await supabase.from("devices").update({ name }).eq("id", id);
  if (error) throw error;
}
export async function deleteDevice(id: string) {
  const { error } = await supabase.from("devices").delete().eq("id", id);
  if (error) throw error;
}
