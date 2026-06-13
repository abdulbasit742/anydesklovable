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
export type TeamRole = "owner" | "admin" | "technician" | "billing" | "viewer" | "support" | "member";
export type TeamMemberStatus = "active" | "suspended" | "removed";
export const INVITABLE_ROLES = ["admin", "technician", "billing", "viewer"] as const;
export type InvitableRole = typeof INVITABLE_ROLES[number];

export type MemberRow = {
  id: string;            // team_members.id
  user_id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  devices: number;
  last_active: string;
  joined_at: string;
  invited_by: string | null;
};

export function useTeamMembers() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const q = useQuery({
    queryKey: ["team-members", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_members")
        .select("id, user_id, role, status, joined_at, invited_by, profiles(full_name, email)")
        .eq("team_id", teamId!)
        .neq("status", "removed");
      if (error) throw error;
      return (data ?? []).map((m): MemberRow => ({
        id: (m as { id: string }).id,
        user_id: m.user_id,
        name: (m.profiles as { full_name?: string } | null)?.full_name ?? "—",
        email: (m.profiles as { email?: string } | null)?.email ?? "",
        role: m.role as TeamRole,
        status: ((m as { status?: TeamMemberStatus }).status ?? "active"),
        devices: 0,
        last_active: m.joined_at,
        joined_at: m.joined_at,
        invited_by: (m as { invited_by?: string | null }).invited_by ?? null,
      }));
    },
  });
  const mock: MemberRow[] = mockTeam.map((t) => ({
    id: t.id, user_id: t.id, name: t.name, email: t.email, role: t.role as TeamRole, status: "active" as const,
    devices: t.devices, last_active: t.lastActive, joined_at: t.lastActive, invited_by: null,
  }));
  return withFallback(q.data, mock, q.isLoading, (q.error as Error) ?? null);
}

// ----- Team invitations -----
export type TeamInvitationStatus = "pending" | "accepted" | "expired" | "revoked";
export type TeamInvitationRow = {
  id: string; team_id: string; email: string; role: string;
  status: TeamInvitationStatus; invited_by: string | null;
  expires_at: string; created_at: string;
  accepted_at: string | null; revoked_at: string | null; message: string | null;
};

export function useTeamInvitations() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  return useQuery({
    queryKey: ["team-invitations", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("team_invitations").select("*").eq("team_id", teamId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as TeamInvitationRow[];
    },
  });
}

export async function inviteTeamMember(input: { teamId: string; email: string; role: InvitableRole; message?: string }) {
  const { data: user } = await supabase.auth.getUser();
  const { data, error } = await supabase.from("team_invitations").insert({
    team_id: input.teamId,
    email: input.email.trim().toLowerCase(),
    role: input.role,
    invited_by: user.user?.id,
    message: input.message ?? null,
  }).select().single();
  if (error) throw error;
  await supabase.from("audit_logs").insert({
    team_id: input.teamId, action: "team_invite_created", target: input.email,
    severity: "info", metadata: { role: input.role, invitation_id: data.id } as never,
  }).then(() => null, () => null);
  return data as TeamInvitationRow;
}

export async function revokeTeamInvitation(invitationId: string) {
  const { error } = await supabase.rpc("revoke_team_invitation", { invitation_id: invitationId });
  if (error) throw error;
}

export async function resendTeamInvitation(invitationId: string) {
  const { error } = await supabase
    .from("team_invitations")
    .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
    .eq("id", invitationId).eq("status", "pending");
  if (error) throw error;
}

export async function acceptTeamInvitation(token: string) {
  const { data, error } = await supabase.rpc("accept_team_invitation", { invite_token: token });
  if (error) throw error;
  return (Array.isArray(data) ? data[0] : data) as { team_id: string; role: string } | null;
}

export async function updateTeamMemberRole(memberId: string, role: InvitableRole | "owner") {
  const { error } = await supabase.rpc("update_team_member_role", { member_id: memberId, new_role: role });
  if (error) throw error;
}

export async function setTeamMemberStatus(memberId: string, status: TeamMemberStatus) {
  const { error } = await supabase.rpc("set_team_member_status", { member_id: memberId, new_status: status });
  if (error) throw error;
}

export async function removeTeamMember(memberId: string) {
  return setTeamMemberStatus(memberId, "removed");
}

export async function lookupInvitationByToken(token: string) {
  const { data, error } = await supabase
    .from("team_invitations")
    .select("id, team_id, email, role, status, expires_at, teams(name)")
    .eq("token", token).maybeSingle();
  if (error) throw error;
  return data;
}

// ----- Team permission helpers -----
export function canManageTeam(r?: string | null) { return r === "owner" || r === "admin"; }
export function canManageBilling(r?: string | null) { return r === "owner" || r === "admin" || r === "billing"; }
export function canInviteMembers(r?: string | null) { return r === "owner" || r === "admin"; }
export function canChangeRole(actor?: string | null, target?: string | null, next?: string) {
  if (!canInviteMembers(actor)) return false;
  if (next === "owner" || target === "owner") return actor === "owner";
  return true;
}

// ----- Team audit timeline -----
const TEAM_AUDIT_ACTIONS = [
  "team_invite_created", "team_invite_accepted", "team_invite_revoked",
  "team_member_role_changed", "team_member_removed", "team_member_suspended", "team_member_reactivated",
];

export function useTeamAuditEvents(limit = 25) {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  return useQuery({
    queryKey: ["team-audit", teamId, limit],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, target, actor_id, actor_label, created_at, metadata, severity")
        .eq("team_id", teamId!).in("action", TEAM_AUDIT_ACTIONS)
        .order("created_at", { ascending: false }).limit(limit);
      if (error) throw error;
      return data ?? [];
    },
  });
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
      const [teams, devices, sessions, teamsByPlan] = await Promise.all([
        supabase.from("teams").select("id", { count: "exact", head: true }),
        supabase.from("devices").select("id", { count: "exact", head: true }),
        supabase.from("sessions").select("id", { count: "exact", head: true }).eq("status", "connected"),
        supabase.from("teams").select("plan"),
      ]);
      const byPlan: Record<string, number> = {};
      for (const t of teamsByPlan.data ?? []) {
        const k = (t as { plan?: string }).plan ?? "free";
        byPlan[k] = (byPlan[k] ?? 0) + 1;
      }
      return {
        totalAccounts: teams.count ?? 0,
        activeOrgs: teams.count ?? 0,
        liveSessions: sessions.count ?? 0,
        totalDevices: devices.count ?? 0,
        accountsByPlan: byPlan,
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
      ? { totalAccounts: mockAdminMetrics.totalAccounts, activeOrgs: mockAdminMetrics.activeOrgs, liveSessions: mockAdminMetrics.liveSessions, totalDevices: 642, accountsByPlan: { free: 120, pro: 64, business: 22, enterprise: 4 } }
      : q.data ?? { totalAccounts: 0, activeOrgs: 0, liveSessions: 0, totalDevices: 0, accountsByPlan: {} as Record<string, number> },
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

// ----- Support tickets -----
export const TICKET_CATEGORIES = ["connection","billing","account","desktop_app","security","feature_request","other"] as const;
export const TICKET_PRIORITIES = ["low","normal","high","urgent"] as const;
export const TICKET_STATUSES = ["open","pending","resolved","closed"] as const;

export type TicketCategory = typeof TICKET_CATEGORIES[number];
export type TicketPriority = typeof TICKET_PRIORITIES[number];
export type TicketStatus = typeof TICKET_STATUSES[number];

export type SupportTicket = {
  id: string;
  user_id: string;
  team_id: string | null;
  subject: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
};

export type TicketFilters = {
  status?: TicketStatus | "all";
  priority?: TicketPriority | "all";
  category?: TicketCategory | "all";
  search?: string;
};

const MOCK_TICKETS: SupportTicket[] = [
  { id: "demo-1", user_id: "demo", team_id: null, subject: "Cannot connect to Office-Laptop", description: "Connection times out after host approval.", category: "connection", priority: "high", status: "open", assigned_to: null, created_at: new Date(Date.now() - 12 * 60_000).toISOString(), updated_at: new Date(Date.now() - 12 * 60_000).toISOString(), closed_at: null },
  { id: "demo-2", user_id: "demo", team_id: null, subject: "File transfer stuck at 80%", description: "Large file uploads hang near the end.", category: "desktop_app", priority: "normal", status: "pending", assigned_to: null, created_at: new Date(Date.now() - 2 * 3600_000).toISOString(), updated_at: new Date(Date.now() - 3600_000).toISOString(), closed_at: null },
  { id: "demo-3", user_id: "demo", team_id: null, subject: "Add SSO for our domain", description: "Looking for SAML SSO support.", category: "feature_request", priority: "low", status: "resolved", assigned_to: null, created_at: new Date(Date.now() - 3 * 86400_000).toISOString(), updated_at: new Date(Date.now() - 86400_000).toISOString(), closed_at: null },
];

export function useSupportTickets(filters: TicketFilters = {}) {
  const q = useQuery({
    queryKey: ["support_tickets", filters],
    queryFn: async () => {
      let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);
      if (filters.priority && filters.priority !== "all") query = query.eq("priority", filters.priority);
      if (filters.category && filters.category !== "all") query = query.eq("category", filters.category);
      if (filters.search && filters.search.trim()) {
        const s = filters.search.replace(/[%,]/g, "").trim();
        query = query.or(`subject.ilike.%${s}%,description.ilike.%${s}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as SupportTicket[];
    },
  });
  const loading = q.isLoading;
  const error = (q.error as Error) ?? null;
  const rows = q.data ?? [];
  const useMock = !loading && !error && rows.length === 0 && DEMO_FALLBACK;
  let data = useMock ? MOCK_TICKETS : rows;
  if (useMock) {
    if (filters.status && filters.status !== "all") data = data.filter((t) => t.status === filters.status);
    if (filters.priority && filters.priority !== "all") data = data.filter((t) => t.priority === filters.priority);
    if (filters.category && filters.category !== "all") data = data.filter((t) => t.category === filters.category);
    if (filters.search?.trim()) {
      const s = filters.search.toLowerCase();
      data = data.filter((t) => t.subject.toLowerCase().includes(s) || t.description.toLowerCase().includes(s));
    }
  }
  return { data, isLoading: loading, error, isDemo: useMock, refetch: q.refetch };
}

export async function createSupportTicket(input: {
  subject: string; description: string; category: TicketCategory; priority: TicketPriority; team_id?: string | null;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) throw new Error("You must be signed in to create a ticket.");
  const { data, error } = await supabase.from("support_tickets").insert({
    user_id: user.id,
    team_id: input.team_id ?? null,
    subject: input.subject.trim(),
    description: input.description.trim(),
    category: input.category,
    priority: input.priority,
  }).select().single();
  if (error) throw error;
  return data as SupportTicket;
}

export async function updateSupportTicket(id: string, patch: Partial<Pick<SupportTicket, "subject"|"description"|"category"|"priority"|"status"|"assigned_to">>) {
  const { data, error } = await supabase.from("support_tickets").update(patch).eq("id", id).select().single();
  if (error) throw error;
  return data as SupportTicket;
}

export async function closeSupportTicket(id: string) {
  return updateSupportTicket(id, { status: "closed" });
}

export async function getSupportTicketById(id: string) {
  const { data, error } = await supabase.from("support_tickets").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as SupportTicket | null;
}

export async function reopenSupportTicket(id: string) {
  return updateSupportTicket(id, { status: "open" });
}

export async function assignSupportTicket(id: string, assigneeId: string | null) {
  return updateSupportTicket(id, { assigned_to: assigneeId });
}

export async function changeTicketPriority(id: string, priority: TicketPriority) {
  return updateSupportTicket(id, { priority });
}

export async function changeTicketStatus(id: string, status: TicketStatus) {
  return updateSupportTicket(id, { status });
}

// ----- Ticket comments -----
export type SupportTicketComment = {
  id: string;
  ticket_id: string;
  author_id: string;
  body: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  author?: { full_name: string | null; email: string | null } | null;
};

export function useTicketComments(ticketId: string | null) {
  return useQuery({
    queryKey: ["ticket_comments", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_ticket_comments")
        .select("*, author:profiles!support_ticket_comments_author_id_fkey(full_name, email)")
        .eq("ticket_id", ticketId!)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as SupportTicketComment[];
    },
  });
}

export async function addTicketComment(ticketId: string, body: string, isInternal = false) {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) throw new Error("Sign in required.");
  const { data, error } = await supabase.from("support_ticket_comments").insert({
    ticket_id: ticketId, author_id: userRes.user.id, body: body.trim(), is_internal: isInternal,
  }).select().single();
  if (error) throw error;
  return data as unknown as SupportTicketComment;
}

export async function softDeleteComment(commentId: string) {
  const { error } = await supabase.from("support_ticket_comments")
    .update({ deleted_at: new Date().toISOString() }).eq("id", commentId);
  if (error) throw error;
}

// ----- Ticket attachments (metadata only) -----
export type SupportTicketAttachment = {
  id: string;
  ticket_id: string;
  comment_id: string | null;
  uploaded_by: string;
  file_name: string;
  file_size: number;
  mime_type: string | null;
  storage_bucket: string;
  storage_path: string;
  checksum_sha256: string | null;
  scan_status: "pending" | "clean" | "blocked" | "failed";
  created_at: string;
  deleted_at: string | null;
};

export function useTicketAttachments(ticketId: string | null) {
  return useQuery({
    queryKey: ["ticket_attachments", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_ticket_attachments")
        .select("*")
        .eq("ticket_id", ticketId!)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as SupportTicketAttachment[];
    },
  });
}

export async function createAttachmentMetadata(input: {
  ticket_id: string; file_name: string; file_size: number; mime_type?: string | null;
  storage_path?: string; comment_id?: string | null;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes.user) throw new Error("Sign in required.");
  const path = input.storage_path ?? `${input.ticket_id}/${Date.now()}-${input.file_name}`;
  const { data, error } = await supabase.from("support_ticket_attachments").insert({
    ticket_id: input.ticket_id,
    comment_id: input.comment_id ?? null,
    uploaded_by: userRes.user.id,
    file_name: input.file_name,
    file_size: input.file_size,
    mime_type: input.mime_type ?? null,
    storage_path: path,
  }).select().single();
  if (error) throw error;
  return data as unknown as SupportTicketAttachment;
}

export async function softDeleteAttachment(attachmentId: string) {
  const { error } = await supabase.from("support_ticket_attachments")
    .update({ deleted_at: new Date().toISOString() }).eq("id", attachmentId);
  if (error) throw error;
}

// ----- Ticket events (timeline) -----
export type SupportTicketEventType =
  | "ticket_created" | "comment_added" | "internal_note_added" | "attachment_added"
  | "status_changed" | "priority_changed" | "assigned" | "unassigned"
  | "ticket_closed" | "ticket_reopened";

export type SupportTicketEvent = {
  id: string;
  ticket_id: string;
  actor_id: string | null;
  event_type: SupportTicketEventType;
  from_value: string | null;
  to_value: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function useTicketEvents(ticketId: string | null) {
  return useQuery({
    queryKey: ["ticket_events", ticketId],
    enabled: !!ticketId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_ticket_events")
        .select("*")
        .eq("ticket_id", ticketId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as SupportTicketEvent[];
    },
  });
}

// Permission helper for a single ticket (RLS is authoritative on the server).
export function canTriageTicket(ticket: SupportTicket | null, role: TeamRole | null | undefined): boolean {
  if (!ticket?.team_id || !role) return false;
  return role === "owner" || role === "admin" || role === "support";
}


// =====================================================================
// SECURITY: trusted devices, active sessions, security events, MFA
// =====================================================================

export type TrustedDevice = {
  id: string;
  user_id: string;
  device_name: string;
  device_fingerprint: string;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  trusted_at: string;
  last_seen_at: string | null;
  revoked_at: string | null;
  created_at: string;
};

export type ActiveSession = {
  id: string;
  user_id: string;
  session_label: string | null;
  ip_address: string | null;
  user_agent: string | null;
  device_name: string | null;
  location: string | null;
  last_active_at: string;
  created_at: string;
  revoked_at: string | null;
};

export type SecurityEventSeverity = "info" | "warning" | "critical";
export const SECURITY_EVENT_TYPES = [
  "login","logout","password_changed","mfa_enabled","mfa_disabled",
  "trusted_device_added","trusted_device_revoked","session_revoked",
  "global_signout","failed_login",
] as const;
export type SecurityEventType = typeof SECURITY_EVENT_TYPES[number] | string;

export type SecurityEvent = {
  id: string;
  user_id: string;
  event_type: SecurityEventType;
  severity: SecurityEventSeverity;
  ip_address: string | null;
  user_agent: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type SecurityEventFilters = {
  severity?: SecurityEventSeverity | "all";
  event_type?: string | "all";
};

const MOCK_TRUSTED_DEVICES: TrustedDevice[] = [
  { id: "demo-td-1", user_id: "demo", device_name: "Office MacBook Pro", device_fingerprint: "demo-fp-1", browser: "Safari 17", os: "macOS 14", ip_address: "203.0.113.42", trusted_at: new Date(Date.now() - 12 * 86400_000).toISOString(), last_seen_at: new Date(Date.now() - 2 * 3600_000).toISOString(), revoked_at: null, created_at: new Date(Date.now() - 12 * 86400_000).toISOString() },
];
const MOCK_ACTIVE_SESSIONS: ActiveSession[] = [
  { id: "demo-as-1", user_id: "demo", session_label: "This browser", ip_address: "203.0.113.42", user_agent: "Chrome 124 on macOS", device_name: "MacBook Pro", location: "Berlin, DE", last_active_at: new Date().toISOString(), created_at: new Date(Date.now() - 3600_000).toISOString(), revoked_at: null },
];
const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  { id: "demo-ev-1", user_id: "demo", event_type: "login", severity: "info", ip_address: "203.0.113.42", user_agent: "Chrome 124", metadata: {}, created_at: new Date(Date.now() - 60_000).toISOString() },
  { id: "demo-ev-2", user_id: "demo", event_type: "failed_login", severity: "warning", ip_address: "198.51.100.7", user_agent: "Unknown", metadata: { reason: "invalid_password" }, created_at: new Date(Date.now() - 3600_000).toISOString() },
];

export function useTrustedDevices() {
  const { user } = useAuthUser();
  const q = useQuery({
    queryKey: ["trusted-devices", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("trusted_devices").select("*").is("revoked_at", null).order("trusted_at", { ascending: false });
      if (error) throw error;
      return data as TrustedDevice[];
    },
  });
  return withFallback(q.data, MOCK_TRUSTED_DEVICES, q.isLoading, (q.error as Error) ?? null);
}

export function useActiveSessions() {
  const { user } = useAuthUser();
  const q = useQuery({
    queryKey: ["active-sessions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase.from("active_sessions").select("*").is("revoked_at", null).order("last_active_at", { ascending: false });
      if (error) throw error;
      return data as ActiveSession[];
    },
  });
  return withFallback(q.data, MOCK_ACTIVE_SESSIONS, q.isLoading, (q.error as Error) ?? null);
}

export function useSecurityEvents(filters: SecurityEventFilters = {}) {
  const { user } = useAuthUser();
  const q = useQuery({
    queryKey: ["security-events", user?.id, filters],
    enabled: !!user,
    queryFn: async () => {
      let qb = supabase.from("security_events").select("*").order("created_at", { ascending: false }).limit(100);
      if (filters.severity && filters.severity !== "all") qb = qb.eq("severity", filters.severity);
      if (filters.event_type && filters.event_type !== "all") qb = qb.eq("event_type", filters.event_type);
      const { data, error } = await qb;
      if (error) throw error;
      return data as unknown as SecurityEvent[];
    },
  });
  const loading = q.isLoading;
  const error = (q.error as Error) ?? null;
  const rows = q.data ?? [];
  const useMock = !loading && !error && rows.length === 0 && DEMO_FALLBACK;
  let data: SecurityEvent[] = useMock ? MOCK_SECURITY_EVENTS : rows;
  if (useMock) {
    if (filters.severity && filters.severity !== "all") data = data.filter((e) => e.severity === filters.severity);
    if (filters.event_type && filters.event_type !== "all") data = data.filter((e) => e.event_type === filters.event_type);
  }
  return { data, isLoading: loading, error, isDemo: useMock };
}

export async function revokeTrustedDevice(id: string) {
  const { error } = await supabase.from("trusted_devices").update({ revoked_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  await createSecurityEvent({ event_type: "trusted_device_revoked", severity: "info", metadata: { trusted_device_id: id } }).catch(() => {});
}

export async function revokeActiveSession(id: string) {
  const { error } = await supabase.from("active_sessions").update({ revoked_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
  await createSecurityEvent({ event_type: "session_revoked", severity: "info", metadata: { session_id: id } }).catch(() => {});
}

export async function createSecurityEvent(input: {
  event_type: SecurityEventType;
  severity?: SecurityEventSeverity;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) return;
  await supabase.from("security_events").insert({
    user_id: user.id,
    event_type: input.event_type,
    severity: input.severity ?? "info",
    ip_address: input.ip_address ?? null,
    user_agent: input.user_agent ?? (typeof navigator !== "undefined" ? navigator.userAgent : null),
    metadata: (input.metadata ?? {}) as never,
  });
}

export function useMfaStatus() {
  return useQuery({
    queryKey: ["mfa-status"],
    queryFn: async () => {
      // Real Supabase MFA read. Enrollment is not wired in this UI.
      try {
        const { data, error } = await supabase.auth.mfa.listFactors();
        if (error) throw error;
        const totp = data?.totp ?? [];
        const verified = totp.filter((f) => f.status === "verified");
        return {
          enabled: verified.length > 0,
          factorCount: verified.length,
          totpFactors: verified,
          enrollmentSupported: false as const, // QR/enrollment flow not implemented this turn
        };
      } catch {
        return { enabled: false, factorCount: 0, totpFactors: [], enrollmentSupported: false as const };
      }
    },
  });
}

// Small helper local to this file — avoids importing useAuth in services.
function useAuthUser() {
  const q = useQuery({
    queryKey: ["__auth_user__"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser();
      return data.user;
    },
    staleTime: 60_000,
  });
  return { user: q.data ?? null };
}

// =====================================================================
// BILLING: plan limits, current subscription, usage summary
// =====================================================================

export type PlanLimit = {
  id: string;
  plan_key: string;
  display_name: string;
  monthly_price: number | null;
  yearly_price: number | null;
  currency: string;
  max_devices: number | null;
  max_team_members: number | null;
  max_monthly_session_minutes: number | null;
  max_file_transfer_mb: number | null;
  max_audit_retention_days: number | null;
  can_use_file_transfer: boolean;
  can_use_clipboard_sync: boolean;
  can_use_unattended_access: boolean;
  can_use_team_management: boolean;
  can_use_admin_console: boolean;
  can_use_priority_support: boolean;
};

const DEFAULT_PLAN_LIMITS: PlanLimit[] = [
  { id: "p-free",  plan_key: "free",       display_name: "Free",       monthly_price: 0,    yearly_price: 0,    currency: "usd", max_devices: 1,    max_team_members: 1,    max_monthly_session_minutes: 60,   max_file_transfer_mb: 50,   max_audit_retention_days: 7,   can_use_file_transfer: false, can_use_clipboard_sync: false, can_use_unattended_access: false, can_use_team_management: false, can_use_admin_console: false, can_use_priority_support: false },
  { id: "p-pro",   plan_key: "pro",        display_name: "Pro",        monthly_price: 19,   yearly_price: 190,  currency: "usd", max_devices: 5,    max_team_members: 1,    max_monthly_session_minutes: null, max_file_transfer_mb: 500,  max_audit_retention_days: 30,  can_use_file_transfer: true,  can_use_clipboard_sync: true,  can_use_unattended_access: true,  can_use_team_management: false, can_use_admin_console: false, can_use_priority_support: false },
  { id: "p-biz",   plan_key: "business",   display_name: "Business",   monthly_price: 49,   yearly_price: 490,  currency: "usd", max_devices: 25,   max_team_members: 10,   max_monthly_session_minutes: null, max_file_transfer_mb: 5000, max_audit_retention_days: 90,  can_use_file_transfer: true,  can_use_clipboard_sync: true,  can_use_unattended_access: true,  can_use_team_management: true,  can_use_admin_console: false, can_use_priority_support: true },
  { id: "p-ent",   plan_key: "enterprise", display_name: "Enterprise", monthly_price: null, yearly_price: null, currency: "usd", max_devices: null, max_team_members: null, max_monthly_session_minutes: null, max_file_transfer_mb: null, max_audit_retention_days: 365, can_use_file_transfer: true,  can_use_clipboard_sync: true,  can_use_unattended_access: true,  can_use_team_management: true,  can_use_admin_console: true,  can_use_priority_support: true },
];

export function usePlanLimits() {
  const q = useQuery({
    queryKey: ["plan-limits"],
    queryFn: async () => {
      const { data, error } = await supabase.from("plan_limits").select("*").order("monthly_price", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as PlanLimit[];
    },
    staleTime: 5 * 60_000,
  });
  const loading = q.isLoading;
  const error = (q.error as Error) ?? null;
  const rows = q.data ?? [];
  const isDemo = !loading && !error && rows.length === 0;
  return {
    data: rows.length ? rows : DEFAULT_PLAN_LIMITS,
    isLoading: loading,
    error,
    isDemo,
  };
}

export function useCurrentSubscription() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const q = useQuery({
    queryKey: ["subscription", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase.from("subscriptions").select("*").eq("team_id", teamId!).maybeSingle();
      if (error) throw error;
      return data;
    },
  });
  return { data: q.data, isLoading: q.isLoading, error: (q.error as Error) ?? null };
}

export type UsageMeterValue = {
  key: string;
  label: string;
  used: number;
  max: number | null; // null = unlimited
  unit?: string;
};

export type UsageSummary = {
  meters: UsageMeterValue[];
  isDemo: boolean;
  isLoading: boolean;
  error: Error | null;
  planKey: string;
};

export function useUsageSummary(): UsageSummary {
  const { data: team } = useCurrentTeam();
  const devices = useDevices();
  const sessions = useSessions({ limit: 500 });
  const members = useTeamMembers();
  const tickets = useSupportTickets();
  const plans = usePlanLimits();

  const planKey = (((team?.teams as { plan?: string } | null)?.plan) ?? "free").toLowerCase();
  const limit = plans.data.find((p) => p.plan_key === planKey) ?? plans.data[0];

  const isLoading = devices.isLoading || sessions.isLoading || members.isLoading || tickets.isLoading || plans.isLoading;
  const error = devices.error || sessions.error || members.error || tickets.error || plans.error;
  // Demo when any underlying source is demo-fallback OR when plan catalog came from defaults.
  const isDemo = devices.isDemo || sessions.isDemo || members.isDemo || tickets.isDemo || plans.isDemo;

  const onlineDevices = devices.data.filter((d) => d.status === "online").length;
  const sessionMinutes = Math.floor(sessions.data.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) / 60);

  const meters: UsageMeterValue[] = [
    { key: "devices",         label: "Devices",         used: devices.data.length, max: limit.max_devices },
    { key: "active_devices",  label: "Active devices",  used: onlineDevices,        max: limit.max_devices },
    { key: "session_minutes", label: "Session minutes", used: sessionMinutes,       max: limit.max_monthly_session_minutes, unit: "min" },
    { key: "team_members",    label: "Team members",    used: members.data.length,  max: limit.max_team_members },
    { key: "support_tickets", label: "Support tickets", used: tickets.data.length,  max: null },
  ];

  return { meters, isDemo, isLoading, error, planKey };
}

