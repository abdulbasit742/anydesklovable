import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, MonitorSmartphone, Cpu, MemoryStick, Globe, Tag, KeyRound, Trash2, Power, Pencil, ShieldCheck, History, StickyNote } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/app/StatusBadge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  useDevice, useSessions, deleteDevice, formatDuration,
  useDeviceAudit, setDeviceTrust, setUnattendedAccess, rotateUnattendedPassword,
  recordDeviceConnectAttempt, updateDeviceMeta, startRemoteSession, useRealtimeDevices,
} from "@/lib/services";
import { useDevicePresence, useDevicePresenceEvents, useMarkDeviceOffline } from "@/lib/services/presence";
import { DeviceHeartbeatCard } from "@/components/app/presence/DeviceHeartbeatCard";
import { useCurrentTeam } from "@/hooks/use-current-team";

import { DemoBanner, PanelState } from "@/components/app/DataState";
import { formatDistanceToNow } from "date-fns";

export const Route = createFileRoute("/dashboard/devices/$deviceId")({
  head: () => ({ meta: [{ title: "Device — RemoteDesk" }] }),
  component: DeviceDetail,
});

function formatRemoteDeskId(id: string) {
  return id.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");
}

const EVENT_LABEL: Record<string, string> = {
  trust_granted: "Marked trusted",
  trust_revoked: "Trust revoked",
  unattended_enabled: "Unattended access enabled",
  unattended_disabled: "Unattended access disabled",
  unattended_password_rotated: "Unattended password rotated",
  connect_attempted: "Connect attempted",
  renamed: "Renamed",
  group_changed: "Group changed",
};

function DeviceDetail() {
  const { deviceId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: device, isLoading, error, isDemo } = useDevice(deviceId);
  const history = useSessions({ deviceId: device?.id });
  const audit = useDeviceAudit(isDemo ? undefined : device?.id);
  const presenceQ = useDevicePresence(isDemo ? undefined : deviceId);
  const presenceEventsQ = useDevicePresenceEvents(isDemo ? undefined : deviceId, 15);
  const markOffline = useMarkDeviceOffline();

  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState("");
  const [groupLabel, setGroupLabel] = useState("");
  const [notes, setNotes] = useState("");
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["devices"] });
    qc.invalidateQueries({ queryKey: ["device-audit", deviceId] });
  };

  const updateMut = useMutation({
    mutationFn: () => updateDeviceMeta(device!, { name: name.trim(), group_label: groupLabel.trim() || null, notes: notes.trim() || null }),
    onSuccess: () => { invalidate(); toast.success("Device updated"); setRenameOpen(false); },
    onError: (e: Error) => toast.error(e.message),
  });
  const trustMut = useMutation({
    mutationFn: (v: boolean) => setDeviceTrust(device!, v),
    onSuccess: (_, v) => { invalidate(); toast.success(v ? "Device trusted" : "Device untrusted"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const unattendedMut = useMutation({
    mutationFn: (v: boolean) => setUnattendedAccess(device!, v),
    onSuccess: (_, v) => { invalidate(); toast.success(v ? "Unattended access enabled" : "Unattended access disabled"); },
    onError: (e: Error) => toast.error(e.message),
  });
  const pwMut = useMutation({
    mutationFn: () => rotateUnattendedPassword(device!, pw),
    onSuccess: () => { invalidate(); toast.success("Unattended password rotated"); setPwOpen(false); setPw(""); },
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

  const { data: team } = useCurrentTeam();
  useRealtimeDevices(isDemo ? undefined : team?.team_id);

  const onConnect = async () => {
    if (isDemo) { toast("Open the desktop client to connect"); return; }
    try {
      const res = await startRemoteSession(device.id);
      try { await recordDeviceConnectAttempt(device); } catch { /* logged via RPC already */ }
      invalidate();
      toast.success("Session token issued", { description: `Expires ${new Date(res.expires_at).toLocaleTimeString()}` });
    } catch (e: any) {
      toast.error(e?.message ?? "Could not start session");
    }
  };


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
                <div className="mt-0.5 text-xs text-muted-foreground">{device.os}{device.os_version ? ` · ${device.os_version}` : ""}{device.group_label ? ` · ${device.group_label}` : ""}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge variant={device.status}>{device.status}</StatusBadge>
                  {device.is_trusted && <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] text-primary"><ShieldCheck className="h-3 w-3" />trusted</span>}
                  {(device.tags ?? []).map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Tag className="h-3 w-3" />{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={() => { setName(device.name); setGroupLabel(device.group_label ?? ""); setNotes(device.notes ?? ""); setRenameOpen(true); }}>
                <Pencil className="mr-1.5 h-4 w-4" />Edit
              </Button>
              <Button size="sm" disabled={device.status !== "online"} onClick={onConnect}>
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

          {device.notes && (
            <div className="mt-4 rounded-md border border-border bg-background p-3">
              <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground"><StickyNote className="h-3 w-3" /> Notes</div>
              <div className="mt-1 whitespace-pre-wrap text-sm">{device.notes}</div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-primary" />Access</div>
            <div className="mt-3 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Trusted device</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Skip host approval prompts for team members.</div>
                </div>
                <Switch disabled={isDemo || trustMut.isPending} checked={!!device.is_trusted} onCheckedChange={(v) => trustMut.mutate(v)} />
              </div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium">Unattended access</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Allow connections without on-device approval using the unattended password.</div>
                </div>
                <Switch disabled={isDemo || unattendedMut.isPending} checked={!!device.unattended_access} onCheckedChange={(v) => unattendedMut.mutate(v)} />
              </div>
              <Button size="sm" variant="outline" className="w-full justify-start" disabled={isDemo} onClick={() => setPwOpen(true)}>
                <KeyRound className="mr-2 h-4 w-4" />
                {device.password_updated_at ? "Rotate unattended password" : "Set unattended password"}
              </Button>
              {device.password_updated_at && (
                <div className="text-[11px] text-muted-foreground">Rotated {formatDistanceToNow(new Date(device.password_updated_at), { addSuffix: true })}</div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-semibold">Danger zone</div>
            <div className="mt-3 space-y-2">
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
        </div>
      </div>

      <div className="mt-6"><DeviceHeartbeatCard presence={presenceQ.data} /></div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="text-sm font-semibold">Recent presence events</div>
            {!isDemo && presenceQ.data?.status !== "offline" && (
              <Button size="sm" variant="ghost" onClick={() => markOffline.mutate(deviceId)} disabled={markOffline.isPending}>
                Mark offline
              </Button>
            )}
          </div>
          <PanelState
            loading={presenceEventsQ.isLoading}
            error={presenceEventsQ.error}
            empty={(presenceEventsQ.data ?? []).length === 0}
            emptyText="No presence events recorded yet."
          >
            <ul className="divide-y divide-border">
              {(presenceEventsQ.data ?? []).map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium capitalize">{e.event_type.replace(/_/g, " ")}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {e.previous_status && <span className="font-mono">{e.previous_status}</span>}
                      {e.previous_status && <span> → </span>}
                      <span className="font-mono">{e.new_status}</span>
                      {e.reason && <span> · {e.reason}</span>}
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</span>
                </li>
              ))}
            </ul>
          </PanelState>
        </div>

      <div className="mt-0 grid gap-4 lg:grid-cols-1">
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3 text-sm font-semibold">Session history</div>
          <PanelState loading={history.isLoading} error={history.error} empty={history.data.length === 0} emptyText="No sessions recorded for this device.">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Initiator</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Duration</th>
                    <th className="px-4 py-2 text-left font-medium">Started</th>
                  </tr>
                </thead>
                <tbody>
                  {history.data.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-4 py-2">{s.initiator}</td>
                      <td className="px-4 py-2"><StatusBadge variant={s.status}>{s.status}</StatusBadge></td>
                      <td className="px-4 py-2 font-mono text-xs">{formatDuration(s.duration_seconds)}</td>
                      <td className="px-4 py-2 text-muted-foreground">{formatDistanceToNow(new Date(s.started_at), { addSuffix: true })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelState>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex items-center gap-2 border-b border-border px-4 py-3 text-sm font-semibold"><History className="h-4 w-4" /> Audit timeline</div>
          {isDemo ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Audit timeline becomes available once this device is connected to your workspace.</div>
          ) : audit.isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>
          ) : (audit.data ?? []).length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No activity recorded yet.</div>
          ) : (
            <ul className="divide-y divide-border">
              {(audit.data ?? []).map((e) => (
                <li key={e.id} className="flex items-start justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{EVENT_LABEL[e.event_type] ?? e.event_type}</div>
                    {(e.from_value || e.to_value) && (
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {e.from_value && <span className="font-mono">{e.from_value}</span>}
                        {e.from_value && e.to_value && <span> → </span>}
                        {e.to_value && <span className="font-mono">{e.to_value}</span>}
                      </div>
                    )}
                  </div>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit device</DialogTitle>
            <DialogDescription>Update display name, group and operator notes.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="dev-name">Name</Label>
              <Input id="dev-name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="dev-group">Group</Label>
              <Input id="dev-group" placeholder="e.g. Finance, Lab" value={groupLabel} onChange={(e) => setGroupLabel(e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="dev-notes">Notes</Label>
              <Textarea id="dev-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1.5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRenameOpen(false)}>Cancel</Button>
            <Button onClick={() => updateMut.mutate()} disabled={!name.trim() || updateMut.isPending || isDemo}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unattended password</DialogTitle>
            <DialogDescription>We store only a salted hash — the plaintext is never written to the database.</DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="dev-pw">New password</Label>
            <Input id="dev-pw" type="password" autoComplete="new-password" value={pw} onChange={(e) => setPw(e.target.value)} className="mt-1.5" />
            <div className="mt-1 text-[11px] text-muted-foreground">Minimum 8 characters. Share it through your team's secret manager.</div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button onClick={() => pwMut.mutate()} disabled={pw.length < 8 || pwMut.isPending}>Save</Button>
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
