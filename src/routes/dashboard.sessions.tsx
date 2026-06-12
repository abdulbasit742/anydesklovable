import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Activity, OctagonAlert, MessageSquare, Signal } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { sessions } from "@/lib/mock-data";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/sessions")({
  head: () => ({ meta: [{ title: "Sessions — RemoteDesk" }] }),
  component: SessionsPage,
});

function SessionsPage() {
  const [filter, setFilter] = useState<"all" | "connected" | "ended" | "rejected">("all");
  const list = sessions.filter((s) => filter === "all" || s.status === filter);
  const active = sessions.find((s) => s.status === "connected");

  return (
    <AppShell title="Sessions">
      {active && (
        <div className="mb-6 rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                <Activity className="h-3.5 w-3.5 text-success" /> Active session
              </div>
              <div className="mt-1 text-lg font-semibold">{active.target}</div>
              <div className="text-xs text-muted-foreground">
                {active.role} · {active.initiator} · {active.startedAt}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge variant="connected">connected</StatusBadge>
              <StatusBadge variant={active.quality}>quality {active.quality}</StatusBadge>
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Stat label="Latency" value="42 ms" />
            <Stat label="Bitrate" value="6.2 Mbps" />
            <Stat label="Packet loss" value="0.1%" />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => toast("Chat opened")}>
              <MessageSquare className="mr-1.5 h-4 w-4" /> Chat
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast("Diagnostics opened")}>
              <Signal className="mr-1.5 h-4 w-4" /> Diagnostics
            </Button>
            <Button size="sm" variant="destructive" onClick={() => toast.error("Emergency stop triggered")}>
              <OctagonAlert className="mr-1.5 h-4 w-4" /> Emergency stop
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-semibold">Session history</div>
          <Select value={filter} onValueChange={(v) => setFilter(v as "all" | "connected" | "ended" | "rejected")}>
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
              {list.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{s.target}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.role}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.initiator}</td>
                  <td className="px-4 py-2"><StatusBadge variant={s.status}>{s.status}</StatusBadge></td>
                  <td className="px-4 py-2 font-mono text-xs">{s.duration}</td>
                  <td className="px-4 py-2"><StatusBadge variant={s.quality}>{s.quality}</StatusBadge></td>
                  <td className="px-4 py-2 text-muted-foreground">{s.startedAt}</td>
                  <td className="px-4 py-2 text-muted-foreground">{s.reason ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
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
