import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, ShieldCheck, FileText, Settings2 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { teamMembers, auditLog } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/team")({
  head: () => ({ meta: [{ title: "Team — RemoteDesk" }] }),
  component: TeamPage,
});

function TeamPage() {
  return (
    <AppShell
      title="Team & policies"
      actions={
        <Button size="sm" onClick={() => toast("Invite sent")}>
          <UserPlus className="mr-1.5 h-4 w-4" /> Invite member
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <PolicyCard icon={ShieldCheck} title="Device policy" desc="Require device password and host approval for all sessions." status="Enforced" />
        <PolicyCard icon={FileText} title="Audit logging" desc="Capture every connection, action, and policy change." status="Active" />
        <PolicyCard icon={Settings2} title="Region restrictions" desc="Limit outbound sessions to allow-listed countries." status="Off" />
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Members</div>
          <div className="text-xs text-muted-foreground">{teamMembers.length} members</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Email</th>
                <th className="px-4 py-2 text-left font-medium">Role</th>
                <th className="px-4 py-2 text-left font-medium">Devices</th>
                <th className="px-4 py-2 text-left font-medium">Last active</th>
              </tr>
            </thead>
            <tbody>
              {teamMembers.map((m) => (
                <tr key={m.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{m.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.email}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs">{m.role}</span>
                  </td>
                  <td className="px-4 py-2 font-mono text-xs">{m.devices}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold">Audit log</div>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Enterprise</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Actor</th>
                <th className="px-4 py-2 text-left font-medium">Action</th>
                <th className="px-4 py-2 text-left font-medium">Target</th>
                <th className="px-4 py-2 text-left font-medium">When</th>
                <th className="px-4 py-2 text-left font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLog.map((a) => (
                <tr key={a.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{a.actor}</td>
                  <td className="px-4 py-2">{a.action}</td>
                  <td className="px-4 py-2 text-muted-foreground">{a.target}</td>
                  <td className="px-4 py-2 text-muted-foreground">{a.at}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{a.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
