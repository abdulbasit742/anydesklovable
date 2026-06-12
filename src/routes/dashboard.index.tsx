import { createFileRoute, Link } from "@tanstack/react-router";
import { MonitorSmartphone, Activity, Clock, CreditCard, ShieldCheck, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { MetricCard } from "@/components/app/MetricCard";
import { RemoteDeskIdDisplay } from "@/components/app/RemoteDeskIdDisplay";
import { QuickConnectCard } from "@/components/app/QuickConnectCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { sessions, currentUser } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — RemoteDesk" }] }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <AppShell
      title="Overview"
      actions={<Button asChild size="sm"><Link to="/dashboard/devices">Add device</Link></Button>}
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Devices online" value="2 / 3" icon={MonitorSmartphone} hint="1 device offline" />
        <MetricCard label="Active sessions" value="1" icon={Activity} hint="Connected for 18m" />
        <MetricCard label="Session minutes" value="248" icon={Clock} hint="This month" />
        <MetricCard label="Current plan" value={currentUser.plan} icon={CreditCard} hint="5 device slots" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <RemoteDeskIdDisplay />
          <QuickConnectCard />
          <RecentSessions />
        </div>
        <div className="space-y-4">
          <SecurityReminders />
        </div>
      </div>
    </AppShell>
  );
}

function RecentSessions() {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-sm font-semibold">Recent sessions</div>
        <Link to="/dashboard/sessions" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Target</th>
              <th className="px-4 py-2 text-left font-medium">Role</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Duration</th>
              <th className="px-4 py-2 text-left font-medium">Quality</th>
            </tr>
          </thead>
          <tbody>
            {sessions.slice(0, 3).map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-2 font-medium">{s.target}</td>
                <td className="px-4 py-2 text-muted-foreground">{s.role}</td>
                <td className="px-4 py-2"><StatusBadge variant={s.status}>{s.status}</StatusBadge></td>
                <td className="px-4 py-2 font-mono text-xs">{s.duration}</td>
                <td className="px-4 py-2"><StatusBadge variant={s.quality}>{s.quality}</StatusBadge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SecurityReminders() {
  const items = [
    { ok: true, t: "Device password set", d: "Required for every incoming session." },
    { ok: true, t: "Host approval enabled", d: "Connections wait for your explicit accept." },
    { ok: false, t: "Two-factor authentication", d: "Add a second factor to your RemoteDesk account." },
    { ok: false, t: "Clipboard sync", d: "Disabled by default — enable per session." },
  ];
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <ShieldCheck className="h-4 w-4 text-primary" /> Security checklist
      </div>
      <ul className="mt-3 space-y-3">
        {items.map((i) => (
          <li key={i.t} className="flex items-start gap-3">
            <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${i.ok ? "bg-success" : "bg-warning"}`} />
            <div>
              <div className="text-sm font-medium">{i.t}</div>
              <div className="text-xs text-muted-foreground">{i.d}</div>
            </div>
          </li>
        ))}
      </ul>
      <Button asChild variant="outline" size="sm" className="mt-4 w-full">
        <Link to="/dashboard/security">Review security</Link>
      </Button>
    </div>
  );
}
