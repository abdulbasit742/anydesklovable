import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { UserPlus, ShieldCheck, FileText, Settings2, Trash2, MoreHorizontal, Copy, RefreshCw, X, History } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import {
  useTeamMembers, useUsageSummary, usePlanLimits, useTeamInvitations, useTeamAuditEvents,
  inviteTeamMember, revokeTeamInvitation, resendTeamInvitation,
  updateTeamMemberRole, setTeamMemberStatus, removeTeamMember,
  canInviteMembers, canChangeRole, INVITABLE_ROLES,
  type MemberRow, type InvitableRole, type TeamInvitationRow,
} from "@/lib/services";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { DemoBanner, PanelState } from "@/components/app/DataState";
import { formatDistanceToNow } from "date-fns";
import { PlanBadge } from "@/components/app/billing/PlanBadge";
import { UsageMeter } from "@/components/app/billing/UsageMeter";
import { UpgradePrompt } from "@/components/app/billing/UpgradePrompt";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/dashboard/team")({
  head: () => ({ meta: [{ title: "Team — RemoteDesk" }] }),
  component: TeamPage,
});

const ROLE_TONES: Record<string, string> = {
  owner:      "bg-primary/15 text-primary",
  admin:      "bg-info/15 text-info",
  technician: "bg-success/15 text-success",
  support:    "bg-success/15 text-success",
  billing:    "bg-warning/15 text-warning",
  viewer:     "bg-muted text-muted-foreground",
  member:     "bg-muted text-muted-foreground",
};
const STATUS_TONES: Record<string, string> = {
  active:    "bg-success/15 text-success",
  suspended: "bg-warning/15 text-warning",
  pending:   "bg-info/15 text-info",
  expired:   "bg-muted text-muted-foreground",
  revoked:   "bg-destructive/15 text-destructive",
  accepted:  "bg-success/15 text-success",
};

function TeamPage() {
  const qc = useQueryClient();
  const { data: members, isLoading, error, isDemo } = useTeamMembers();
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const usage = useUsageSummary();
  const plans = usePlanLimits();
  const invitesQ = useTeamInvitations();
  const auditQ = useTeamAuditEvents(15);

  const planKey = (((team?.teams as { plan?: string } | null)?.plan) ?? "free").toLowerCase();
  const myRole = (team?.role ?? "viewer").toLowerCase();
  const canInvite = canInviteMembers(myRole);
  const seatMeter = usage.meters.find((m) => m.key === "team_members");
  const deviceMeter = usage.meters.find((m) => m.key === "devices");
  const seatLimit = seatMeter?.max ?? null;
  const seatsUsed = seatMeter?.used ?? members.length;
  const pendingInvites = (invitesQ.data ?? []).filter((i) => i.status === "pending");
  const totalSeatsTaken = seatsUsed + pendingInvites.length;
  const limitReached = seatLimit != null && totalSeatsTaken >= seatLimit;
  const limitNear = seatLimit != null && totalSeatsTaken / seatLimit >= 0.8 && !limitReached;

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["team-members"] });
    qc.invalidateQueries({ queryKey: ["team-invitations"] });
    qc.invalidateQueries({ queryKey: ["team-audit"] });
  };

  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <AppShell
      title="Team & policies"
      actions={
        <InviteDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          teamId={teamId}
          canInvite={canInvite}
          limitReached={limitReached}
          pendingInvites={pendingInvites}
          onInvited={refreshAll}
        />
      }
    >
      {isDemo && <DemoBanner>Showing demo team. Invite real members to populate this list.</DemoBanner>}

      {/* Overview */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Workspace</div>
              <div className="text-base font-semibold">{(team?.teams as { name?: string } | null)?.name ?? "—"}</div>
            </div>
            <PlanBadge planKey={planKey} />
            <span className="text-xs text-muted-foreground">
              {seatsUsed} member{seatsUsed === 1 ? "" : "s"} · {pendingInvites.length} pending
            </span>
          </div>
          {canInvite ? (
            <UpgradePrompt
              plans={plans.data}
              currentPlanKey={planKey}
              defaultPlan="business"
              trigger={<Button size="sm" variant="outline">Upgrade plan</Button>}
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span><Button size="sm" variant="outline" disabled>Upgrade plan</Button></span>
              </TooltipTrigger>
              <TooltipContent>Only owners and admins can change billing.</TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {seatMeter && (
            <UsageMeter
              label="Team seats (members + pending invites)"
              used={totalSeatsTaken}
              max={seatLimit}
            />
          )}
          {deviceMeter && <UsageMeter label="Devices" used={deviceMeter.used} max={deviceMeter.max} />}
        </div>
        {(limitReached || limitNear) && (
          <div className={`mt-3 rounded-md border px-3 py-2 text-xs ${limitReached ? "border-destructive/40 bg-destructive/10 text-destructive" : "border-warning/40 bg-warning/10 text-warning"}`}>
            {limitReached
              ? "You've reached your plan's team seat limit. Upgrade to invite more members."
              : "You're approaching your team seat limit. Consider upgrading soon."}
          </div>
        )}
      </div>

      {/* Policies (existing summary cards) */}
      <div className="grid gap-4 lg:grid-cols-3">
        <PolicyCard icon={ShieldCheck} title="Device policy" desc="Require device password and host approval for all sessions." status="Enforced" />
        <PolicyCard icon={FileText} title="Audit logging" desc="Capture every connection, action, and policy change." status="Active" />
        <PolicyCard icon={Settings2} title="Region restrictions" desc="Limit outbound sessions to allow-listed countries." status="Off" />
      </div>

      <TooltipProvider>
        {/* Members table */}
        <div className="mt-6 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Members</div>
            <div className="text-xs text-muted-foreground">{members.length} member{members.length === 1 ? "" : "s"}</div>
          </div>
          <PanelState loading={isLoading} error={error} empty={members.length === 0} emptyText="No members yet. Invite your first teammate.">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Member</th>
                    <th className="px-4 py-2 text-left font-medium">Role</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Joined</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((m) => (
                    <MemberRowView key={m.id} m={m} myRole={myRole} isDemo={isDemo} onChanged={refreshAll} />
                  ))}
                </tbody>
              </table>
            </div>
          </PanelState>
        </div>

        {/* Pending invitations */}
        <div className="mt-6 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Pending invitations</div>
            <div className="text-xs text-muted-foreground">{pendingInvites.length} pending</div>
          </div>
          <PanelState
            loading={invitesQ.isLoading}
            error={(invitesQ.error as Error) ?? null}
            empty={(invitesQ.data ?? []).length === 0}
            emptyText="No invitations yet. Invite a teammate to get started."
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Email</th>
                    <th className="px-4 py-2 text-left font-medium">Role</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Sent</th>
                    <th className="px-4 py-2 text-left font-medium">Expires</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {(invitesQ.data ?? []).map((inv) => (
                    <InvitationRow key={inv.id} inv={inv} canManage={canInvite} onChanged={refreshAll} />
                  ))}
                </tbody>
              </table>
            </div>
          </PanelState>
        </div>

        {/* Audit timeline */}
        <div className="mt-6 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4" /> Recent team activity</div>
            <div className="text-xs text-muted-foreground">{auditQ.data?.length ?? 0} event{(auditQ.data?.length ?? 0) === 1 ? "" : "s"}</div>
          </div>
          <PanelState
            loading={auditQ.isLoading}
            error={(auditQ.error as Error) ?? null}
            empty={(auditQ.data ?? []).length === 0}
            emptyText="No team events yet. Invite, role changes, and removals will appear here."
          >
            <ul className="divide-y divide-border">
              {(auditQ.data ?? []).map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                  <div className="min-w-0">
                    <div className="font-medium">{prettyAction(e.action)}</div>
                    <div className="truncate text-xs text-muted-foreground">{e.target ?? ""}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</div>
                </li>
              ))}
            </ul>
          </PanelState>
        </div>
      </TooltipProvider>
    </AppShell>
  );
}

function prettyAction(a: string) {
  return a.replace(/^team_/, "").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function MemberRowView({ m, myRole, isDemo, onChanged }: { m: MemberRow; myRole: string; isDemo: boolean; onChanged: () => void }) {
  const canManage = canInviteMembers(myRole) && m.role !== "owner";
  const canEditOwner = myRole === "owner";

  const doRoleChange = async (role: InvitableRole | "owner") => {
    if (!canChangeRole(myRole, m.role, role)) {
      toast.error("You don't have permission for that role change.");
      return;
    }
    try {
      await updateTeamMemberRole(m.id, role);
      toast.success(`Role updated to ${role}`);
      onChanged();
    } catch (err) { toast.error((err as Error).message); }
  };

  const doStatus = async (status: "active" | "suspended") => {
    try {
      await setTeamMemberStatus(m.id, status);
      toast.success(status === "active" ? "Member reactivated" : "Member suspended");
      onChanged();
    } catch (err) { toast.error((err as Error).message); }
  };

  const doRemove = async () => {
    try {
      await removeTeamMember(m.id);
      toast.success("Member removed");
      onChanged();
    } catch (err) { toast.error((err as Error).message); }
  };

  return (
    <tr className="border-t border-border hover:bg-muted/30">
      <td className="px-4 py-2">
        <div className="font-medium">{m.name}</div>
        <div className="text-xs text-muted-foreground">{m.email}</div>
      </td>
      <td className="px-4 py-2">
        <span className={`rounded-md px-1.5 py-0.5 text-xs capitalize ${ROLE_TONES[m.role] ?? "bg-muted"}`}>{m.role}</span>
      </td>
      <td className="px-4 py-2">
        <span className={`rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_TONES[m.status] ?? "bg-muted"}`}>{m.status}</span>
      </td>
      <td className="px-4 py-2 text-muted-foreground text-xs">
        {m.joined_at ? (isDemo ? m.joined_at : formatDistanceToNow(new Date(m.joined_at), { addSuffix: true })) : "—"}
      </td>
      <td className="px-4 py-2 text-right">
        {canManage ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Change role</DropdownMenuLabel>
              {INVITABLE_ROLES.map((r) => (
                <DropdownMenuItem key={r} disabled={r === m.role} onClick={() => doRoleChange(r)}>
                  <span className="capitalize">{r}</span>
                </DropdownMenuItem>
              ))}
              {canEditOwner && (
                <DropdownMenuItem onClick={() => doRoleChange("owner")} disabled={m.role === "owner"}>
                  Transfer ownership
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {m.status === "active" ? (
                <DropdownMenuItem onClick={() => doStatus("suspended")}>Suspend</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => doStatus("active")}>Reactivate</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Remove
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remove {m.name || m.email}?</AlertDialogTitle>
                    <AlertDialogDescription>They'll lose access to this workspace and all assigned devices. This cannot be undone from the UI.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={doRemove}>Remove</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span><Button variant="ghost" size="icon" className="h-8 w-8" disabled><MoreHorizontal className="h-4 w-4" /></Button></span>
            </TooltipTrigger>
            <TooltipContent>{m.role === "owner" ? "Owner can't be modified here." : "Requires admin or owner."}</TooltipContent>
          </Tooltip>
        )}
      </td>
    </tr>
  );
}

function InvitationRow({ inv, canManage, onChanged }: { inv: TeamInvitationRow; canManage: boolean; onChanged: () => void }) {
  const expired = new Date(inv.expires_at).getTime() < Date.now();
  const displayStatus = inv.status === "pending" && expired ? "expired" : inv.status;
  const isPending = inv.status === "pending" && !expired;

  const copyLink = async () => {
    try {
      // We can't expose token here without it being in select; build accept URL from id route only.
      // Fallback: copy invitation id as reference.
      await navigator.clipboard.writeText(`${window.location.origin}/invite/${inv.id}`);
      toast.success("Invitation reference copied");
    } catch { toast.error("Could not copy"); }
  };

  return (
    <tr className="border-t border-border hover:bg-muted/30">
      <td className="px-4 py-2 font-medium">{inv.email}</td>
      <td className="px-4 py-2"><span className={`rounded-md px-1.5 py-0.5 text-xs capitalize ${ROLE_TONES[inv.role] ?? "bg-muted"}`}>{inv.role}</span></td>
      <td className="px-4 py-2"><span className={`rounded-full px-2 py-0.5 text-xs capitalize ${STATUS_TONES[displayStatus] ?? "bg-muted"}`}>{displayStatus}</span></td>
      <td className="px-4 py-2 text-xs text-muted-foreground">{formatDistanceToNow(new Date(inv.created_at), { addSuffix: true })}</td>
      <td className="px-4 py-2 text-xs text-muted-foreground">{formatDistanceToNow(new Date(inv.expires_at), { addSuffix: true })}</td>
      <td className="px-4 py-2 text-right">
        {canManage && isPending ? (
          <div className="inline-flex gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Copy invite reference</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => {
                  try { await resendTeamInvitation(inv.id); toast.success("Invitation refreshed"); onChanged(); }
                  catch (e) { toast.error((e as Error).message); }
                }}><RefreshCw className="h-4 w-4" /></Button>
              </TooltipTrigger>
              <TooltipContent>Extend expiry</TooltipContent>
            </Tooltip>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><X className="h-4 w-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke invitation?</AlertDialogTitle>
                  <AlertDialogDescription>{inv.email} will no longer be able to accept this invite.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={async () => {
                    try { await revokeTeamInvitation(inv.id); toast.success("Invitation revoked"); onChanged(); }
                    catch (e) { toast.error((e as Error).message); }
                  }}>Revoke</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : null}
      </td>
    </tr>
  );
}

function InviteDialog({
  open, onOpenChange, teamId, canInvite, limitReached, pendingInvites, onInvited,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; teamId: string | undefined;
  canInvite: boolean; limitReached: boolean; pendingInvites: TeamInvitationRow[]; onInvited: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InvitableRole>("viewer");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), [email]);
  const duplicate = useMemo(
    () => pendingInvites.some((i) => i.email.toLowerCase() === email.trim().toLowerCase()),
    [pendingInvites, email],
  );

  const blockedReason = !canInvite
    ? "Only owners and admins can invite members."
    : limitReached
      ? "You've reached your plan's team seat limit. Upgrade to invite more."
      : null;

  const submit = async () => {
    if (!teamId) { toast.error("No team context yet."); return; }
    if (!emailValid) { toast.error("Please enter a valid email."); return; }
    if (duplicate) { toast.error("A pending invite already exists for this email."); return; }
    setSubmitting(true);
    try {
      await inviteTeamMember({ teamId, email, role, message: message.trim() || undefined });
      toast.success(`Invitation queued for ${email}`, {
        description: "Email delivery requires server-side wiring; the invite is recorded and revocable below.",
      });
      onInvited();
      onOpenChange(false);
      setEmail(""); setMessage(""); setRole("viewer");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Tooltip>
          <TooltipProvider>
            <TooltipTrigger asChild>
              <span>
                <Button size="sm" disabled={!canInvite || limitReached}>
                  <UserPlus className="mr-1.5 h-4 w-4" /> Invite member
                </Button>
              </span>
            </TooltipTrigger>
            {blockedReason && <TooltipContent>{blockedReason}</TooltipContent>}
          </TooltipProvider>
        </Tooltip>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
          <DialogDescription>They'll receive a link to join your workspace once email delivery is connected.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="teammate@company.com" className="mt-1.5"
              aria-invalid={!!email && !emailValid}
            />
            {email && !emailValid && <p className="mt-1 text-xs text-destructive">Please enter a valid email address.</p>}
            {duplicate && <p className="mt-1 text-xs text-warning">A pending invite already exists for this email.</p>}
          </div>
          <div>
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as InvitableRole)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin — manage devices, policies, billing</SelectItem>
                <SelectItem value="technician">Technician — operate devices and sessions</SelectItem>
                <SelectItem value="billing">Billing — view invoices and plan</SelectItem>
                <SelectItem value="viewer">Viewer — read-only access</SelectItem>
              </SelectContent>
            </Select>
            <p className="mt-1 text-xs text-muted-foreground">Owner role can only be assigned via "Transfer ownership" on an existing member.</p>
          </div>
          <div>
            <Label htmlFor="invite-msg">Message (optional)</Label>
            <Textarea id="invite-msg" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Welcome to the team!" className="mt-1.5" rows={2} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting || !!blockedReason || !emailValid || duplicate}>
            {submitting ? "Sending…" : "Send invite"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PolicyCard({
  icon: Icon, title, desc, status,
}: { icon: typeof ShieldCheck; title: string; desc: string; status: string }) {
  const tone = status === "Off" ? "text-muted-foreground bg-muted" : "text-success bg-success/10";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">{title}</div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{status}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}
