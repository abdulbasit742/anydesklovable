import { createFileRoute } from "@tanstack/react-router";
import { Crown, Users, Building2, Activity, DollarSign, TrendingUp, TrendingDown, Server, Search } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { MetricCard } from "@/components/app/MetricCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adminMetrics } from "@/lib/mock-data";
import { useAdminStats } from "@/lib/services";
import { DemoBanner } from "@/components/app/DataState";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/admin")({
  head: () => ({ meta: [{ title: "Admin console — RemoteDesk" }] }),
  component: AdminPage,
});

const statusTone: Record<string, string> = {
  active: "bg-success/10 text-success border-success/20",
  trial: "bg-primary/10 text-primary border-primary/20",
  past_due: "bg-destructive/10 text-destructive border-destructive/20",
};

function AdminPage() {
  const [q, setQ] = useState("");
  const stats = useAdminStats();
  const orgs = stats.orgs.filter((o) => o.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell
      title="Admin console"
      actions={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          <Crown className="h-3.5 w-3.5" /> Owner access
        </span>
      }
    >
      {stats.isDemo && <DemoBanner />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Total accounts" value={stats.data.totalAccounts.toLocaleString()} icon={Users} hint={`+${adminMetrics.signups7d} this week`} />
        <MetricCard label="Active organizations" value={stats.data.activeOrgs.toString()} icon={Building2} hint="Across all plans" />
        <MetricCard label="Live sessions" value={stats.data.liveSessions.toString()} icon={Activity} hint="Right now" />
        <MetricCard label="Total devices" value={stats.data.totalDevices.toLocaleString()} icon={Server} hint="Across all orgs" />
        <MetricCard label="Monthly revenue" value={adminMetrics.monthlyRevenue} icon={DollarSign} hint="MRR (placeholder)" />
        <MetricCard label="Churn rate" value={adminMetrics.churnRate} icon={TrendingDown} hint="Trailing 30 days" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="text-sm font-semibold">Platform health</div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" /> All systems operational
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <HealthRow label="Signaling" value="us-east, eu-west, ap-south" status="ok" />
            <HealthRow label="TURN relays" value="14 / 14 healthy" status="ok" />
            <HealthRow label="API" value="p95 84 ms" status="ok" />
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-semibold">Recent platform events</div>
          <ul className="mt-3 space-y-2 text-sm">
            <li className="text-muted-foreground"><span className="text-foreground">eu-west signaling</span> · redeploy succeeded · 12m ago</li>
            <li className="text-muted-foreground"><span className="text-foreground">Globex</span> · started Pro trial · 1h ago</li>
            <li className="text-muted-foreground"><span className="text-foreground">Initech</span> · payment failed · 3h ago</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <div className="text-sm font-semibold">Organizations</div>
          </div>
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search organization…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Organization</th>
                <th className="px-4 py-2 text-left font-medium">Plan</th>
                <th className="px-4 py-2 text-left font-medium">Seats</th>
                <th className="px-4 py-2 text-left font-medium">Devices</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => (
                <tr key={o.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{o.name}</td>
                  <td className="px-4 py-2"><span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs">{o.plan}</span></td>
                  <td className="px-4 py-2 font-mono text-xs">{o.seats}</td>
                  <td className="px-4 py-2 font-mono text-xs">{o.devices}</td>
                  <td className="px-4 py-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${statusTone[o.status]}`}>
                      {o.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => toast(`Impersonating ${o.name}`)}>Impersonate</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function HealthRow({ label, value, status }: { label: string; value: string; status: "ok" | "warn" | "down" }) {
  const dot = status === "ok" ? "bg-success" : status === "warn" ? "bg-warning" : "bg-destructive";
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className={`h-1.5 w-1.5 rounded-full ${dot}`} /> {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}
