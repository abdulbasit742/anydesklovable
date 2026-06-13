import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Plus, MoreHorizontal, MonitorSmartphone, KeyRound, Trash2, Pencil } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { devices, formatRemoteDeskId } from "@/lib/mock-data";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/devices")({
  head: () => ({ meta: [{ title: "Devices — RemoteDesk" }] }),
  component: DevicesPage,
});

function DevicesPage() {
  const [q, setQ] = useState("");
  const filtered = devices.filter(
    (d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.remoteDeskId.includes(q.replace(/\s/g, "")),
  );
  return (
    <AppShell
      title="Devices"
      actions={<Button size="sm" onClick={() => toast("Pairing flow opened")}><Plus className="mr-1.5 h-4 w-4" />Add device</Button>}
    >
      <div className="rounded-lg border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search devices or IDs…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
          </div>
          <div className="text-xs text-muted-foreground">{filtered.length} of {devices.length} devices</div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Device</th>
                <th className="px-4 py-2 text-left font-medium">OS</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2 text-left font-medium">RemoteDesk ID</th>
                <th className="px-4 py-2 text-left font-medium">Last seen</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">
                    <Link
                      to="/dashboard/devices/$deviceId"
                      params={{ deviceId: d.id }}
                      className="flex items-center gap-2 hover:text-primary"
                    >
                      <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                      {d.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-xs">{d.os}</span>
                  </td>
                  <td className="px-4 py-2"><StatusBadge variant={d.status}>{d.status}</StatusBadge></td>
                  <td className="px-4 py-2 font-mono text-xs">{formatRemoteDeskId(d.remoteDeskId)}</td>
                  <td className="px-4 py-2 text-muted-foreground">{d.lastSeen}</td>
                  <td className="px-4 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => toast("Rename device")}><Pencil className="mr-2 h-4 w-4" />Rename</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toast("Password reset")}><KeyRound className="mr-2 h-4 w-4" />Set password</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => toast.error("Device revoked")}>
                          <Trash2 className="mr-2 h-4 w-4" />Revoke
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No devices match your search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
