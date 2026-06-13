import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Activity, OctagonAlert, MessageSquare, Signal, Search, Download } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { useSessions, formatDuration, type SessionRow } from "@/lib/services";
import { DemoBanner, LoadingRow, EmptyRow, ErrorRow } from "@/components/app/DataState";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/sessions")({
  head: () => ({ meta: [{ title: "Sessions — RemoteDesk" }] }),
  component: SessionsPage,
});

type StatusFilter = "all" | "connected" | "ended" | "rejected";

function SessionsPage() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [q, setQ] = useState("");
  const [drawer, setDrawer] = useState<SessionRow | null>(null);
  const { data: all, isLoading, error, isDemo } = useSessions();

  const list = useMemo(
    () => all.filter((s) => (filter === "all" || s.status === filter) && (q === "" || s.target_name.toLowerCase().includes(q.toLowerCase()) || s.initiator.toLowerCase().includes(q.toLowerCase()))),
    [all, filter, q],
  );
  const active = all.find((s) => s.status === "connected");

  const exportCsv = () => {
    const header = ["target", "role", "initiator", "status", "duration_s", "quality", "started_at", "reason"];
    const rows = list.map((s) => [s.target_name, s.role, s.initiator, s.status, s.duration_seconds ?? "", s.quality ?? "", s.started_at, s.reason ?? ""]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `sessions-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported CSV");
  };

  return (
    <AppShell title="Sessions" actions={<Button size="sm" variant="outline" onClick={exportCsv}><Download className="mr-1.5 h-4 w-4" />Export CSV</Button>}>
      {isDemo && <DemoBanner />}
      {active && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-success" /> Active session
              </div>
              <div className="mt-1 text-lg font-semibold">{active.target_name}</div>
              <div className="text-xs text-muted-foreground">
                {active.role} · {active.initiator} · {formatDistanceToNow(new Date(active.started_at), { addSuffix: true })}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge variant="connected">connected</StatusBadge>
              {active.quality && <StatusBadge variant={active.quality}>quality {active.quality}</StatusBadge>}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Latency" value="42 ms" />
            <Stat label="Bitrate" value="6.2 Mbps" />
            <Stat label="Packet loss" value="0.1%" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => toast("Chat opened")}><MessageSquare className="mr-1.5 h-4 w-4" /> Chat</Button>
            <Button size="sm" variant="outline" onClick={() => toast("Diagnostics opened")}><Signal className="mr-1.5 h-4 w-4" /> Diagnostics</Button>
            <Button size="sm" variant="destructive" onClick={() => toast.error("Emergency stop triggered")}><OctagonAlert className="mr-1.5 h-4 w-4" /> Emergency stop</Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search target or user…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
          </div>
          <Select value={filter} onValueChange={(v) => setFilter(v as StatusFilter)}>
            <SelectTrigger className="h-9 w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sessions</SelectItem>
              <SelectItem value="connected">Connected</SelectItem>
              <SelectItem value="ended">Ended</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Target</th>
                <th className="px-4 py-2 text-left font-medium">Role</th>
                <th className="px-4 py-2 text-left font-medium">Initiator</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">Duration</th>
                <th className="px-4 py-2 text-left font-medium">Quality</th>
                <th className="px-4 py-2 text-left font-medium">Started</th>
                <th className="px-4 py-2 text-left font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && <LoadingRow cols={8} />}
              {error && <ErrorRow cols={8} message={error.message} />}
              {!isLoading && !error && list.length === 0 && <EmptyRow cols={8}>No sessions match.</EmptyRow>}
              {!isLoading && !error && list.map((s) => (
                <tr key={s.id} className="cursor-pointer border-t border-border hover:bg-muted/30" onClick={() => setDrawer(s)}>
                  <td className="px-4 py-2 font-medium">{s.target_name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.role}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.initiator}</td>
                  <td className="px-4 py-2"><StatusBadge variant={s.status}>{s.status}</StatusBadge></td>
                  <td className="px-4 py-2 font-mono text-xs">{formatDuration(s.duration_seconds)}</td>
                  <td className="px-4 py-2">{s.quality && <StatusBadge variant={s.quality}>{s.quality}</StatusBadge>}</td>
                  <td className="px-4 py-2 text-muted-foreground">{formatDistanceToNow(new Date(s.started_at), { addSuffix: true })}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={!!drawer} onOpenChange={(o) => !o && setDrawer(null)}>
        <SheetContent className="w-full sm:max-w-md">
          {drawer && (
            <>
              <SheetHeader>
                <SheetTitle>{drawer.target_name}</SheetTitle>
                <SheetDescription>
                  {drawer.role} · {drawer.initiator}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-3 text-sm">
                <Row label="Status" value={<StatusBadge variant={drawer.status}>{drawer.status}</StatusBadge>} />
                <Row label="Duration" value={<span className="font-mono">{formatDuration(drawer.duration_seconds)}</span>} />
                <Row label="Quality" value={drawer.quality ? <StatusBadge variant={drawer.quality}>{drawer.quality}</StatusBadge> : "—"} />
                <Row label="Started" value={<span className="text-muted-foreground">{new Date(drawer.started_at).toLocaleString()}</span>} />
                <Row label="Reason" value={<span className="text-muted-foreground">{drawer.reason ?? "—"}</span>} />
                <Row label="Session ID" value={<span className="font-mono text-xs text-muted-foreground">{drawer.id}</span>} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-lg">{value}</div>
    </div>
  );
}
function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span><span>{value}</span></div>;
}
