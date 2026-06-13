import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MonitorSmartphone, Activity, Clock, CreditCard, ShieldCheck, ArrowRight, Wifi, WifiOff } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { MetricCard } from "@/components/app/MetricCard";
import { RemoteDeskIdDisplay } from "@/components/app/RemoteDeskIdDisplay";
import { QuickConnectCard } from "@/components/app/QuickConnectCard";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { useDevices, useSessions, formatDuration } from "@/lib/services";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { DemoBanner, LoadingRow, EmptyRow, ErrorRow } from "@/components/app/DataState";

export const Route = createFileRoute("/dashboard/")({
  head: () => ({ meta: [{ title: "Dashboard — RemoteDesk" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: team } = useCurrentTeam();
  const devices = useDevices();
  const sessions = useSessions({ limit: 5 });
  const online = devices.data.filter((d) => d.status === "online").length;
  const active = sessions.data.filter((s) => s.status === "connected").length;
  const totalMinutes = Math.floor(sessions.data.reduce((acc, s) => acc + (s.duration_seconds ?? 0), 0) / 60);
  const isDemo = devices.isDemo || sessions.isDemo;
  const plan = (team?.teams as { plan?: string } | null)?.plan ?? "Free";

  return (
    <AppShell
      title="Overview"
      actions={<Button asChild size="sm"><Link to="/dashboard/devices">Manage devices</Link></Button>}
    >
      {isDemo && <DemoBanner />}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Devices online" value={`${online} / ${devices.data.length}`} icon={online > 0 ? Wifi : WifiOff} hint={`${devices.data.length - online} offline`} />
        <MetricCard label="Active sessions" value={String(active)} icon={Activity} hint={active ? "Live now" : "Idle"} />
        <MetricCard label="Session minutes" value={String(totalMinutes)} icon={Clock} hint="Recent activity" />
        <MetricCard label="Current plan" value={plan} icon={CreditCard} hint="Manage in billing" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <RemoteDeskIdDisplay />
          <QuickConnectCard />
          <RecentSessions
            loading={sessions.isLoading}
            error={sessions.error}
            rows={sessions.data.slice(0, 5)}
          />
        </div>
        <div className="space-y-4">
          <SecurityReminders />
        </div>
      </div>
    </AppShell>
  );
}

type SessionLite = ReturnType<typeof useSessions>["data"][number];

function RecentSessions({ loading, error, rows }: { loading: boolean; error: Error | null; rows: SessionLite[] }) {
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
            {loading && <LoadingRow cols={5} />}
            {error && <ErrorRow cols={5} message={error.message} />}
            {!loading && !error && rows.length === 0 && <EmptyRow cols={5}>No sessions yet.</EmptyRow>}
            {!loading && !error && rows.map((s) => (
              <tr key={s.id} className="border-t border-border">
                <td className="px-4 py-2 font-medium">{s.target_name}</td>
                <td className="px-4 py-2 text-muted-foreground">{s.role}</td>
                <td className="px-4 py-2"><StatusBadge variant={s.status}>{s.status}</StatusBadge></td>
                <td className="px-4 py-2 font-mono text-xs">{formatDuration(s.duration_seconds)}</td>
                <td className="px-4 py-2">{s.quality && <StatusBadge variant={s.quality}>{s.quality}</StatusBadge>}</td>
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
