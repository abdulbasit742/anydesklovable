import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import {
  useAutomationSystems, useAutomationTasks, useAutomationAccounts,
  useAutomationRateLimits, useAutomationLogs,
} from "@/lib/automation/hooks";
import {
  AutomationMetricCard, AutomationStatusBadge, DemoBanner, formatRelative,
} from "@/components/app/automation/shared";
import { useAutomationDashboardSummary, useEnqueueDueScheduledRuns } from "@/lib/services/automation-engine";

export const Route = createFileRoute("/dashboard/automation/")({
  component: AutomationOverview,
});

function AutomationOverview() {
  const systems = useAutomationSystems();
  const tasks = useAutomationTasks();
  const accounts = useAutomationAccounts();
  const rates = useAutomationRateLimits();
  const logs = useAutomationLogs();

  const isDemo =
    !!systems.data?.isDemo || !!tasks.data?.isDemo || !!accounts.data?.isDemo ||
    !!rates.data?.isDemo || !!logs.data?.isDemo;

  const t = tasks.data?.rows ?? [];
  const queued = t.filter((x: any) => x.status === "queued").length;
  const running = t.filter((x: any) => x.status === "running").length;
  const failed = t.filter((x: any) => x.status === "failed").length;
  const completed = t.filter((x: any) => x.status === "completed");
  const total = completed.length + failed;
  const successRate = total ? Math.round((completed.length / total) * 100) : 0;
  const avgDuration =
    completed.length
      ? Math.round(
          completed.reduce((acc: number, x: any) => {
            if (!x.started_at || !x.finished_at) return acc;
            return acc + (new Date(x.finished_at).getTime() - new Date(x.started_at).getTime());
          }, 0) / completed.length / 1000,
        )
      : 0;
  const acc = accounts.data?.rows ?? [];
  const onCooldown = acc.filter((a: any) => a.status === "cooldown" || a.status === "limited").length;
  const activePipelines = (systems.data?.rows ?? []).filter((s: any) => s.status === "running").length;
  const lastHeartbeat = (systems.data?.rows ?? [])
    .map((s: any) => s.last_heartbeat_at)
    .filter(Boolean)
    .sort()
    .reverse()[0];
  const recentRateLimits = (rates.data?.rows ?? []).slice(0, 5);
  const recentTasks = t.slice(0, 6);

  return (
    <AppShell title="Automation Center">
      <DemoBanner show={isDemo} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <AutomationMetricCard label="Active systems" value={activePipelines} hint={`${systems.data?.rows.length ?? 0} total`} />
        <AutomationMetricCard label="Queued tasks" value={queued} />
        <AutomationMetricCard label="Running tasks" value={running} tone={running ? "success" : "default"} />
        <AutomationMetricCard label="Failed tasks" value={failed} tone={failed ? "danger" : "default"} />
        <AutomationMetricCard label="Accounts on cooldown" value={onCooldown} tone={onCooldown ? "warning" : "default"} />
        <AutomationMetricCard label="Success rate" value={`${successRate}%`} tone={successRate >= 90 ? "success" : "warning"} />
        <AutomationMetricCard label="Avg duration" value={`${avgDuration}s`} hint="last completed tasks" />
        <AutomationMetricCard label="Last heartbeat" value={formatRelative(lastHeartbeat)} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">System health</header>
          <div className="divide-y divide-border">
            {(systems.data?.rows ?? []).map((s: any) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{s.name}</div>
                  <div className="text-xs text-muted-foreground">{s.description ?? "—"}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{s.health_score}%</span>
                  <AutomationStatusBadge value={s.status} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">Recent task activity</header>
          <div className="divide-y divide-border">
            {recentTasks.map((x: any) => (
              <div key={x.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{x.title}</div>
                  <div className="text-xs text-muted-foreground">{formatRelative(x.created_at)} · stage {x.current_stage} · {x.progress}%</div>
                </div>
                <AutomationStatusBadge value={x.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">Recent rate limits</header>
          <div className="divide-y divide-border">
            {recentRateLimits.length === 0 && (
              <div className="px-4 py-6 text-center text-xs text-muted-foreground">No recent rate limit events.</div>
            )}
            {recentRateLimits.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{r.provider} · {r.signal}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.message}</div>
                </div>
                <AutomationStatusBadge value={r.severity} />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card">
          <header className="border-b border-border px-4 py-3 text-sm font-semibold">Alerts requiring attention</header>
          <div className="divide-y divide-border">
            {(logs.data?.rows ?? [])
              .filter((l: any) => l.level === "error" || l.level === "critical" || l.level === "warning")
              .slice(0, 6)
              .map((l: any) => (
                <div key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{l.message}</div>
                    <div className="text-xs text-muted-foreground">{l.category ?? "—"} · {formatRelative(l.created_at)}</div>
                  </div>
                  <AutomationStatusBadge value={l.level} />
                </div>
              ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
