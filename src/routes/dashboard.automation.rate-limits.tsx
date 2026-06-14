import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAutomationAccounts, useAutomationRateLimits } from "@/lib/automation/hooks";
import { AutomationStatusBadge, DemoBanner, EmptyState, formatRelative } from "@/components/app/automation/shared";

export const Route = createFileRoute("/dashboard/automation/rate-limits")({ component: RateLimitsPage });

function RateLimitsPage() {
  const rates = useAutomationRateLimits();
  const accounts = useAutomationAccounts();
  const [provider, setProvider] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [resolved, setResolved] = useState("all");

  const rows = rates.data?.rows ?? [];
  const accLookup: Record<string, any> = Object.fromEntries((accounts.data?.rows ?? []).map((a: any) => [a.id, a]));

  const filtered = useMemo(() => rows.filter((r: any) =>
    (provider === "all" || r.provider === provider) &&
    (severity === "all" || r.severity === severity) &&
    (resolved === "all" || (resolved === "open" ? !r.resolved_at : !!r.resolved_at)),
  ), [rows, provider, severity, resolved]);

  // Simple ascii-style bar chart by day count
  const buckets: Record<string, number> = {};
  filtered.forEach((r: any) => {
    const d = new Date(r.detected_at).toISOString().slice(0, 10);
    buckets[d] = (buckets[d] ?? 0) + 1;
  });
  const days = Object.entries(buckets).sort();
  const max = Math.max(1, ...Object.values(buckets));

  return (
    <AppShell title="Rate limits">
      <DemoBanner show={!!rates.data?.isDemo} />
      <div className="mb-3 flex flex-wrap gap-2">
        <Select value={provider} onValueChange={setProvider}><SelectTrigger className="w-40"><SelectValue placeholder="Provider" /></SelectTrigger>
          <SelectContent>{["all","manus","openai","claude","kimi","lovable","custom"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={severity} onValueChange={setSeverity}><SelectTrigger className="w-40"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>{["all","low","medium","high","critical"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={resolved} onValueChange={setResolved}><SelectTrigger className="w-40"><SelectValue placeholder="State" /></SelectTrigger>
          <SelectContent>{[["all","All"],["open","Unresolved"],["closed","Resolved"]].map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-card p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold">Events over time</div>
          <div className="text-xs text-muted-foreground" title="The scheduler rotates traffic across available accounts when rate limits or cooldowns hit one provider.">Rotation enabled</div>
        </div>
        {days.length === 0 ? <div className="py-4 text-center text-xs text-muted-foreground">No events in range.</div> : (
          <div className="flex h-24 items-end gap-1">
            {days.map(([d, c]) => (
              <div key={d} className="flex flex-1 flex-col items-center gap-1" title={`${d}: ${c} events`}>
                <div className="w-full rounded-sm bg-primary/70" style={{ height: `${(c / max) * 100}%` }} />
                <div className="text-[9px] text-muted-foreground">{d.slice(5)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No rate-limit events" description="Healthy automation — no providers have hit a limit recently." />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Detected</TableHead><TableHead>Provider</TableHead><TableHead>Account</TableHead><TableHead>Signal</TableHead><TableHead>Severity</TableHead><TableHead>Cooldown</TableHead><TableHead>Resolved</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((r: any) => {
                const acc = accLookup[r.account_id];
                const cooldownLeft = r.cooldown_seconds && !r.resolved_at
                  ? Math.max(0, r.cooldown_seconds - Math.round((Date.now() - new Date(r.detected_at).getTime()) / 1000))
                  : 0;
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-xs text-muted-foreground">{formatRelative(r.detected_at)}</TableCell>
                    <TableCell className="capitalize">{r.provider}</TableCell>
                    <TableCell>{acc?.label ?? "—"}</TableCell>
                    <TableCell>{r.signal}<div className="text-xs text-muted-foreground">{r.message}</div></TableCell>
                    <TableCell><AutomationStatusBadge value={r.severity} /></TableCell>
                    <TableCell className="text-xs">{cooldownLeft > 0 ? `${Math.floor(cooldownLeft / 60)}m ${cooldownLeft % 60}s` : "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{r.resolved_at ? formatRelative(r.resolved_at) : <span className="text-warning-foreground">open</span>}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
