import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MonitorSmartphone, Cpu, MemoryStick, Globe, Tag, KeyRound, Trash2, Power, Pencil, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/app/StatusBadge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useDevice, useSessions, renameDevice, deleteDevice, formatDuration } from "@/lib/services";
import { DemoBanner, PanelState } from "@/components/app/DataState";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/devices/$deviceId")({
  head: () => ({ meta: [{ title: "Device — RemoteDesk" }] }),
  component: DeviceDetail,
});

function formatRemoteDeskId(id: string) {
  return id.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

function DeviceDetail() {
  const { deviceId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: device, isLoading, error, isDemo } = useDevice(deviceId);
  const history = useSessions({ deviceId: device?.id });

  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState("");
  const [trusted, setTrusted] = useState(true);

  const renameMut = useMutation({
    mutationFn: (n: string) => renameDevice(deviceId, n),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["devices"] }); toast.success("Device renamed"); setRenameOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: () => deleteDevice(deviceId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["devices"] }); toast.success("Device revoked"); navigate({ to: "/dashboard/devices" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <AppShell title="Device"><div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">Loading…</div></AppShell>;
  if (error) return <AppShell title="Device"><div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">{error.message}</div></AppShell>;
  if (!device) return (
    <AppShell title="Device not found">
      <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        That device doesn't exist or has been revoked.
        <div className="mt-4"><Button asChild size="sm"><Link to="/dashboard/devices">Back to devices</Link></Button></div>
      </div>
    </AppShell>
  );

  return (
    <AppShell
      title={device.name}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/devices"><ArrowLeft className="mr-1.5 h-4 w-4" />All devices</Link>
        </Button>
      }
    >
      {isDemo && <DemoBanner />}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                <MonitorSmartphone className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="truncate text-lg font-semibold">{device.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{device.os}{device.os_version ? ` · ${device.os_version}` : ""}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge variant={device.status}>{device.status}</StatusBadge>
                  {(device.tags ?? []).map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Tag className="h-3 w-3" />{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => { setName(device.name); setRenameOpen(true); }}>
                <Pencil className="mr-1.5 h-4 w-4" />Rename
              </Button>
              <Button size="sm" disabled={device.status !== "online"} onClick={() => toast("Open the desktop client to connect")}>
                <Power className="mr-1.5 h-4 w-4" />Connect
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info icon={KeyRound} label="RemoteDesk ID" value={formatRemoteDeskId(device.remote_desk_id)} mono />
            <Info icon={Globe} label="Public IP" value={device.ip ?? "—"} mono />
            <Info icon={Cpu} label="CPU" value={device.cpu ?? "—"} />
            <Info icon={MemoryStick} label="RAM" value={device.ram ?? "—"} />
            <Info label="Client version" value={device.client_version ?? "—"} mono />
            <Info label="Last seen" value={device.last_seen ? formatDistanceToNow(new Date(device.last_seen), { addSuffix: true }) : "—"} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-semibold">Quick actions</div>
            <div className="mt-3 space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast.success("Unattended password rotated")}>
                <KeyRound className="mr-2 h-4 w-4" /> Set unattended password
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast("Wake-on-LAN sent")}>
                <Power className="mr-2 h-4 w-4" /> Wake on LAN
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="outline" className="w-full justify-start text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Revoke access
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Revoke {device.name}?</AlertDialogTitle>
                    <AlertDialogDescription>This removes the device from your workspace. It will need to be re-paired from the desktop client.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => deleteMut.mutate()}>Revoke</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-primary" />Trust</div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Trusted device</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Trusted devices skip host approval for members.</div>
              </div>
              <Switch checked={trusted} onCheckedChange={(v) => { setTrusted(v); toast(v ? "Device trusted" : "Device untrusted"); }} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-semibold">Health</div>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Heartbeat" value={<StatusBadge variant={device.status === "online" ? "good" : "neutral"}>{device.status === "online" ? "healthy" : "idle"}</StatusBadge>} />
              <Row label="Latency" value={<span className="font-mono">{device.status === "online" ? "42 ms" : "—"}</span>} />
              <Row label="Update available" value={<span className="text-muted-foreground">4.2.2</span>} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Session history</div>
        <PanelState loading={history.isLoading} error={history.error} empty={history.data.length === 0} emptyText="No sessions recorded for this device.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Initiator</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Duration</th>
                  <th className="px-4 py-2 text-left font-medium">Quality</th>
                  <th className="px-4 py-2 text-left font-medium">Started</th>
                </tr>
              </thead>
              <tbody>
                {history.data.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-2">{s.initiator}</td>
                    <td className="px-4 py-2"><StatusBadge variant={s.status}>{s.status}</StatusBadge></td>
                    <td className="px-4 py-2 font-mono text-xs">{formatDuration(s.duration_seconds)}</td>
                    <td className="px-4 py-2">{s.quality && <StatusBadge variant={s.quality}>{s.quality}</StatusBadge>}</td>
                    <td className="px-4 py-2 text-muted-foreground">{formatDistanceToNow(new Date(s.started_at), { addSuffix: true })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelState>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename device</DialogTitle>
            <DialogDescription>Pick a short name your team will recognize.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="dev-name">Name</Label>
            <Input id="dev-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button onClick={() => renameMut.mutate(name.trim())} disabled={!name.trim() || renameMut.isPending}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Info({ icon: Icon, label, value, mono }: { icon?: typeof KeyRound; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </div>
      <div className={`mt-1 break-words text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
}
