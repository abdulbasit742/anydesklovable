import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserPlus, ShieldCheck, FileText, Settings2, Trash2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useTeamMembers, useUsageSummary, usePlanLimits } from "@/lib/services";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { useAuth } from "@/hooks/use-auth";
import { DemoBanner, PanelState } from "@/components/app/DataState";
import { formatDistanceToNow } from "date-fns";
import { PlanBadge } from "@/components/app/billing/PlanBadge";
import { UsageMeter } from "@/components/app/billing/UsageMeter";
import { UpgradePrompt } from "@/components/app/billing/UpgradePrompt";

export const Route = createFileRoute("/dashboard/team")({
  head: () => ({ meta: [{ title: "Team — RemoteDesk" }] }),
  component: TeamPage,
});

function TeamPage() {
  const { data: members, isLoading, error, isDemo } = useTeamMembers();
  const { data: team } = useCurrentTeam();
  const usage = useUsageSummary();
  const plans = usePlanLimits();
  const planKey = (((team?.teams as { plan?: string } | null)?.plan) ?? "free").toLowerCase();
  const myRole = (team?.role ?? "member").toLowerCase();
  const canManageBilling = myRole === "owner" || myRole === "admin";
  const seatMeter = usage.meters.find((m) => m.key === "team_members");
  const deviceMeter = usage.meters.find((m) => m.key === "devices");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("member");


  return (
    <AppShell
      title="Team & policies"
      actions={
        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><UserPlus className="mr-1.5 h-4 w-4" /> Invite member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite a team member</DialogTitle>
              <DialogDescription>They'll receive an email with a link to join your workspace.</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label htmlFor="invite-email">Email</Label>
                <Input id="invite-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" className="mt-1.5" />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin — manage devices, policies, billing</SelectItem>
                    <SelectItem value="member">Member — connect to assigned devices</SelectItem>
                    <SelectItem value="support">Support — view audit, no policy edits</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={() => { toast.success(`Invite sent to ${email || "teammate"}`); setInviteOpen(false); setEmail(""); }}>Send invite</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    >
      {isDemo && <DemoBanner>Showing demo team. Invite real members to populate this list.</DemoBanner>}

      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-sm font-semibold">Workspace plan</div>
            <PlanBadge planKey={planKey} />
          </div>
          {canManageBilling ? (
            <UpgradePrompt plans={plans.data} currentPlanKey={planKey} defaultPlan="business" trigger={<Button size="sm" variant="outline">Upgrade</Button>} />
          ) : (
            <Button size="sm" variant="outline" disabled title="Only owners and admins can change billing">Upgrade</Button>
          )}
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {seatMeter && <UsageMeter label="Team seats" used={seatMeter.used} max={seatMeter.max} />}
          {deviceMeter && <UsageMeter label="Devices" used={deviceMeter.used} max={deviceMeter.max} />}
        </div>
      </div>


      <div className="grid gap-4 lg:grid-cols-3">
        <PolicyCard icon={ShieldCheck} title="Device policy" desc="Require device password and host approval for all sessions." status="Enforced" />
        <PolicyCard icon={FileText} title="Audit logging" desc="Capture every connection, action, and policy change." status="Active" />
        <PolicyCard icon={Settings2} title="Region restrictions" desc="Limit outbound sessions to allow-listed countries." status="Off" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Members</div>
          <div className="text-xs text-muted-foreground">{members.length} member{members.length === 1 ? "" : "s"}</div>
        </div>
        <PanelState loading={isLoading} error={error} empty={members.length === 0} emptyText="No members yet. Invite your first teammate.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Name</th>
                  <th className="px-4 py-2 text-left font-medium">Email</th>
                  <th className="px-4 py-2 text-left font-medium">Role</th>
                  <th className="px-4 py-2 text-left font-medium">Last active</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2 font-medium">{m.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{m.email}</td>
                    <td className="px-4 py-2"><span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs capitalize">{m.role}</span></td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {m.last_active ? (isDemo ? m.last_active : formatDistanceToNow(new Date(m.last_active), { addSuffix: true })) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {m.role !== "owner" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Remove {m.name}?</AlertDialogTitle>
                              <AlertDialogDescription>They'll lose access to this workspace and all assigned devices.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => toast.success(`${m.name} removed`)}>Remove</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelState>
      </div>
    </AppShell>
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
