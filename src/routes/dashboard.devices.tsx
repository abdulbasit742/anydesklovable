import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, MoreHorizontal, MonitorSmartphone, KeyRound, Trash2, Pencil } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatRemoteDeskId } from "@/lib/formatting/remote-desk-id";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { formatDistanceToNow } from "date-fns";
import { DevicePresenceBadge } from "@/components/app/presence/DevicePresenceBadge";
import { ConnectionQualityIndicator } from "@/components/app/presence/ConnectionQualityIndicator";
import { useDevicePresenceMap } from "@/lib/services/presence";

export const Route = createFileRoute("/dashboard/devices")({
  head: () => ({ meta: [{ title: "Devices — RemoteDesk" }] }),
  component: DevicesPage,
});

function DevicesPage() {
  const [q, setQ] = useState("");
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const qc = useQueryClient();

  const presenceQ = useDevicePresenceMap();
  const presenceMap = presenceQ.data?.map;

  const { data: devices = [], isLoading, error } = useQuery({
    queryKey: ["devices", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devices")
        .select("*")
        .eq("team_id", teamId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const revoke = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("devices").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["devices", teamId] });
      toast.success("Device revoked");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = devices.filter(
    (d) => d.name.toLowerCase().includes(q.toLowerCase()) || d.remote_desk_id.includes(q.replace(/\s/g, "")),
  );

  return (
    <AppShell
      title="Devices"
      actions={<Button size="sm" onClick={() => toast("Pair a device from the desktop client")}><Plus className="mr-1.5 h-4 w-4" />Add device</Button>}
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
                <th className="px-4 py-2 text-left font-medium">Presence</th>
                <th className="px-4 py-2 text-left font-medium">Quality</th>
                <th className="px-4 py-2 text-left font-medium">RemoteDesk ID</th>
                <th className="px-4 py-2 text-left font-medium">Last seen</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">Loading devices…</td></tr>
              )}
              {error && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-destructive">{(error as Error).message}</td></tr>
              )}
              {!isLoading && !error && filtered.map((d) => {
                const presence = presenceMap?.get(d.id) ?? null;
                return (
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
                  <td className="px-4 py-2">
                    {presence
                      ? <DevicePresenceBadge presence={presence} />
                      : <StatusBadge variant={d.status}>{d.status}</StatusBadge>}
                  </td>
                  <td className="px-4 py-2"><ConnectionQualityIndicator presence={presence} /></td>
                  <td className="px-4 py-2 font-mono text-xs">{formatRemoteDeskId(d.remote_desk_id)}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {(presence?.last_seen_at || d.last_seen)
                      ? formatDistanceToNow(new Date(presence?.last_seen_at ?? d.last_seen!), { addSuffix: true })
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => toast("Rename via device detail")}><Pencil className="mr-2 h-4 w-4" />Rename</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => toast("Reset password from desktop client")}><KeyRound className="mr-2 h-4 w-4" />Set password</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={() => revoke.mutate(d.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />Revoke
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );})}
              {!isLoading && !error && filtered.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                  {devices.length === 0
                    ? "No devices yet. Install the desktop client and pair your first device."
                    : "No devices match your search."}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
