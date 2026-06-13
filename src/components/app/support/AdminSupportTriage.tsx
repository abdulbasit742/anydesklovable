import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LifeBuoy, AlertTriangle, Clock, Inbox, CheckCircle2 } from "lucide-react";
import {
  useSupportTickets, TICKET_STATUSES, TICKET_PRIORITIES,
  type SupportTicket, type TicketStatus, type TicketPriority,
} from "@/lib/services";
import { TicketDetailPanel } from "@/components/app/support/TicketDetailPanel";

const QUEUE = [
  { id: "unassigned", label: "Unassigned", icon: Inbox },
  { id: "urgent", label: "Urgent", icon: AlertTriangle },
  { id: "waiting", label: "Waiting on customer", icon: Clock },
  { id: "recent", label: "Recently updated", icon: LifeBuoy },
  { id: "resolved", label: "Resolved", icon: CheckCircle2 },
] as const;
type QueueId = typeof QUEUE[number]["id"];

function statusVariant(s: TicketStatus): "default" | "secondary" | "outline" {
  return s === "open" ? "default" : s === "pending" ? "secondary" : "outline";
}
function priorityVariant(p: TicketPriority): "default" | "secondary" | "outline" | "destructive" {
  return p === "urgent" ? "destructive" : p === "high" ? "default" : p === "normal" ? "secondary" : "outline";
}
function hoursSince(iso: string) { return (Date.now() - new Date(iso).getTime()) / 3600_000; }

export function AdminSupportTriage() {
  const [queue, setQueue] = useState<QueueId>("unassigned");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [priority, setPriority] = useState<TicketPriority | "all">("all");
  const [active, setActive] = useState<SupportTicket | null>(null);
  const tickets = useSupportTickets({ status, priority });
  const qc = useQueryClient();

  const filtered = useMemo(() => {
    let rows = tickets.data;
    if (queue === "unassigned") rows = rows.filter((t) => !t.assigned_to && t.status !== "closed");
    if (queue === "urgent") rows = rows.filter((t) => t.priority === "urgent" && t.status !== "closed");
    if (queue === "waiting") rows = rows.filter((t) => t.status === "pending");
    if (queue === "recent") rows = [...rows].sort((a, b) => +new Date(b.updated_at) - +new Date(a.updated_at)).slice(0, 25);
    if (queue === "resolved") rows = rows.filter((t) => t.status === "resolved" || t.status === "closed");
    return rows;
  }, [tickets.data, queue]);

  const counts = useMemo(() => ({
    unassigned: tickets.data.filter((t) => !t.assigned_to && t.status !== "closed").length,
    urgent: tickets.data.filter((t) => t.priority === "urgent" && t.status !== "closed").length,
    waiting: tickets.data.filter((t) => t.status === "pending").length,
    recent: Math.min(25, tickets.data.length),
    resolved: tickets.data.filter((t) => t.status === "resolved" || t.status === "closed").length,
  }), [tickets.data]);

  return (
    <div className="mt-6 rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-3">
        <div className="flex items-center gap-2 text-sm font-semibold"><LifeBuoy className="h-4 w-4" /> Support triage</div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => setStatus(v as TicketStatus | "all")}>
            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {TICKET_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority | "all")}>
            <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All priorities</SelectItem>
              {TICKET_PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-border px-3 py-2">
        {QUEUE.map((q) => {
          const Icon = q.icon;
          const active = q.id === queue;
          return (
            <button key={q.id} onClick={() => setQueue(q.id)}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs ${active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/50"}`}>
              <Icon className="h-3.5 w-3.5" /> {q.label}
              <span className="ml-1 rounded-full bg-background px-1.5 font-mono text-[10px]">{counts[q.id]}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-4 py-2 text-left font-medium">Subject</th>
              <th className="px-4 py-2 text-left font-medium">Status</th>
              <th className="px-4 py-2 text-left font-medium">Priority</th>
              <th className="px-4 py-2 text-left font-medium">Assignee</th>
              <th className="px-4 py-2 text-left font-medium">Age</th>
            </tr>
          </thead>
          <tbody>
            {tickets.isLoading && Array.from({ length: 3 }).map((_, i) => (
              <tr key={i} className="border-t border-border">{Array.from({ length: 5 }).map((__, j) => (
                <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-32" /></td>))}</tr>
            ))}
            {!tickets.isLoading && filtered.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">Queue empty.</td></tr>
            )}
            {filtered.map((t) => {
              const stale = t.priority === "urgent" && t.status !== "closed" && hoursSince(t.updated_at) > 4;
              return (
                <tr key={t.id} className="cursor-pointer border-t border-border hover:bg-muted/30" onClick={() => setActive(t)}>
                  <td className="px-4 py-2">
                    <div className="font-medium">{t.subject}</div>
                    {stale && <div className="text-[10px] font-medium uppercase text-destructive">SLA at risk · {Math.round(hoursSince(t.updated_at))}h since last update</div>}
                  </td>
                  <td className="px-4 py-2"><Badge variant={statusVariant(t.status)} className="capitalize">{t.status}</Badge></td>
                  <td className="px-4 py-2"><Badge variant={priorityVariant(t.priority)} className="capitalize">{t.priority}</Badge></td>
                  <td className="px-4 py-2 font-mono text-xs">{t.assigned_to ? t.assigned_to.slice(0, 8) + "…" : <span className="text-muted-foreground">Unassigned</span>}</td>
                  <td className="px-4 py-2 text-xs text-muted-foreground">{Math.max(1, Math.round(hoursSince(t.created_at)))}h</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Sheet open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {active && (
            <>
              <SheetHeader>
                <SheetTitle>{active.subject}</SheetTitle>
                <SheetDescription>Ticket #{active.id.slice(0, 8)}</SheetDescription>
              </SheetHeader>
              <div className="mt-4">
                <TicketDetailPanel ticket={active} onChanged={() => qc.invalidateQueries({ queryKey: ["support_tickets"] })} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
