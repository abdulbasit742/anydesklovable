import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Search, ShieldAlert, Info, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/audit")({
  head: () => ({ meta: [{ title: "Audit logs — RemoteDesk" }] }),
  component: AuditPage,
});

const sevMeta = {
  info: { cls: "bg-muted text-muted-foreground border-border", icon: Info },
  warn: { cls: "bg-warning/15 text-warning-foreground border-warning/30", icon: AlertTriangle },
  critical: { cls: "bg-destructive/10 text-destructive border-destructive/20", icon: ShieldAlert },
} as const;

function AuditPage() {
  const [q, setQ] = useState("");
  const [sev, setSev] = useState<"all" | "info" | "warn" | "critical">("all");
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;

  const { data: rows = [], isLoading, error } = useQuery({
    queryKey: ["audit", teamId, sev],
    enabled: !!teamId,
    queryFn: async () => {
      let query = supabase
        .from("audit_logs")
        .select("*")
        .eq("team_id", teamId!)
        .order("created_at", { ascending: false })
        .limit(500);
      if (sev !== "all") query = query.eq("severity", sev);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const list = rows.filter(
    (a) =>
      q === "" ||
      (a.actor_label ?? "").toLowerCase().includes(q.toLowerCase()) ||
      a.action.toLowerCase().includes(q.toLowerCase()) ||
      (a.target ?? "").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <AppShell
      title="Audit logs"
      actions={
        <Button size="sm" variant="outline" onClick={() => toast("Export started")}>
          <Download className="mr-1.5 h-4 w-4" /> Export CSV
        </Button>
      }
    >
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search actor, action, target…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sev} onValueChange={(v) => setSev(v as typeof sev)}>
              <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All severities</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs text-muted-foreground">{list.length} events</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Severity</th>
                <th className="px-4 py-2 text-left font-medium">Actor</th>
                <th className="px-4 py-2 text-left font-medium">Action</th>
                <th className="px-4 py-2 text-left font-medium">Target</th>
                <th className="px-4 py-2 text-left font-medium">When</th>
                <th className="px-4 py-2 text-left font-medium">IP</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">Loading events…</td></tr>
              )}
              {error && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-destructive">{(error as Error).message}</td></tr>
              )}
              {!isLoading && !error && list.map((a) => {
                const m = sevMeta[a.severity];
                const Icon = m.icon;
                return (
                  <tr key={a.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${m.cls}`}>
                        <Icon className="h-3 w-3" /> {a.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-medium">{a.actor_label ?? "system"}</td>
                    <td className="px-4 py-2 font-mono text-xs">{a.action}</td>
                    <td className="px-4 py-2 text-muted-foreground">{a.target ?? "—"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{a.ip ?? "—"}</td>
                  </tr>
                );
              })}
              {!isLoading && !error && list.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  No audit events yet. Events appear here as your team uses RemoteDesk.
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
