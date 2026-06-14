import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAutomationLogs, useAutomationSystems } from "@/lib/automation/hooks";
import { AutomationStatusBadge, DemoBanner, EmptyState, exportToCsv, formatRelative } from "@/components/app/automation/shared";

export const Route = createFileRoute("/dashboard/automation/logs")({ component: LogsPage });

function LogsPage() {
  const logs = useAutomationLogs();
  const systems = useAutomationSystems();
  const [level, setLevel] = useState("all");
  const [category, setCategory] = useState("all");
  const [systemId, setSystemId] = useState("all");
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = logs.data?.rows ?? [];
  const cats = Array.from(new Set(rows.map((r: any) => r.category).filter(Boolean))) as string[];
  const sysMap: Record<string, string> = Object.fromEntries((systems.data?.rows ?? []).map((s: any) => [s.id, s.name]));

  const filtered = useMemo(() => rows.filter((r: any) => {
    if (level !== "all" && r.level !== level) return false;
    if (category !== "all" && r.category !== category) return false;
    if (systemId !== "all" && r.system_id !== systemId) return false;
    if (search && !r.message.toLowerCase().includes(search.toLowerCase())) return false;
    const t = new Date(r.created_at).getTime();
    if (from && t < new Date(from).getTime()) return false;
    if (to && t > new Date(to).getTime()) return false;
    return true;
  }), [rows, level, category, systemId, search, from, to]);

  const hasFilters = level !== "all" || category !== "all" || systemId !== "all" || !!search || !!from || !!to;

  return (
    <AppShell title="Logs" actions={
      <Button size="sm" variant="outline" onClick={() => exportToCsv("automation-logs.csv", filtered)}>Export CSV</Button>
    }>
      <DemoBanner show={!!logs.data?.isDemo} />
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Input placeholder="Search messages…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <Select value={level} onValueChange={setLevel}><SelectTrigger className="w-36"><SelectValue placeholder="Level" /></SelectTrigger>
          <SelectContent>{["all","debug","info","warning","error","critical"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}><SelectTrigger className="w-40"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>{["all", ...cats].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={systemId} onValueChange={setSystemId}><SelectTrigger className="w-40"><SelectValue placeholder="System" /></SelectTrigger>
          <SelectContent><SelectItem value="all">all systems</SelectItem>{(systems.data?.rows ?? []).map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
        </Select>
        <Input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} className="w-52" />
        <Input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} className="w-52" />
        {hasFilters && <Button size="sm" variant="ghost" onClick={() => { setLevel("all"); setCategory("all"); setSystemId("all"); setSearch(""); setFrom(""); setTo(""); }}>Clear filters</Button>}
      </div>

      {filtered.length === 0 ? <EmptyState title="No logs match" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Time</TableHead><TableHead>Level</TableHead><TableHead>Category</TableHead><TableHead>System</TableHead><TableHead>Message</TableHead><TableHead>Task</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="text-xs text-muted-foreground">{formatRelative(l.created_at)}</TableCell>
                  <TableCell><AutomationStatusBadge value={l.level} /></TableCell>
                  <TableCell className="text-xs">{l.category ?? "—"}</TableCell>
                  <TableCell className="text-xs">{sysMap[l.system_id] ?? "—"}</TableCell>
                  <TableCell className="max-w-[420px] truncate text-sm">{l.message}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.task_id ? l.task_id.slice(0, 8) : "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
