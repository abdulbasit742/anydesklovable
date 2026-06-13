import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, MonitorSmartphone, Cpu, MemoryStick, Globe, Tag, KeyRound, Trash2, Power, Pencil } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/StatusBadge";
import { devices, sessions, formatRemoteDeskId } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/devices/$deviceId")({
  head: () => ({ meta: [{ title: "Device — RemoteDesk" }] }),
  loader: ({ params }) => {
    const device = devices.find((d) => d.id === params.deviceId);
    if (!device) throw notFound();
    return { device };
  },
  notFoundComponent: () => (
    <AppShell title="Device not found">
      <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">
        That device doesn't exist or has been revoked.
        <div className="mt-4"><Button asChild size="sm"><Link to="/dashboard/devices">Back to devices</Link></Button></div>
      </div>
    </AppShell>
  ),
  errorComponent: ({ error }) => (
    <AppShell title="Error">
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">{error.message}</div>
    </AppShell>
  ),
  component: DeviceDetail,
});

function DeviceDetail() {
  const { device } = Route.useLoaderData();
  const history = sessions.filter((s) => s.target === device.name);

  return (
    <AppShell
      title={device.name}
      actions={
        <Button asChild variant="ghost" size="sm">
          <Link to="/dashboard/devices"><ArrowLeft className="mr-1.5 h-4 w-4" />All devices</Link>
        </Button>
      }
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                <MonitorSmartphone className="h-5 w-5" />
              </span>
              <div>
                <div className="text-lg font-semibold">{device.name}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{device.os} · {device.osVersion}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge variant={device.status}>{device.status}</StatusBadge>
                  {device.tags.map((t) => (
                    <span key={t} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                      <Tag className="h-3 w-3" />{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => toast("Rename device")}><Pencil className="mr-1.5 h-4 w-4" />Rename</Button>
              <Button size="sm" onClick={() => toast("Connecting…")}><Power className="mr-1.5 h-4 w-4" />Connect</Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Info icon={KeyRound} label="RemoteDesk ID" value={formatRemoteDeskId(device.remoteDeskId)} mono />
            <Info icon={Globe} label="Public IP" value={device.ip} mono />
            <Info icon={Cpu} label="CPU" value={device.cpu} />
            <Info icon={MemoryStick} label="RAM" value={device.ram} />
            <Info label="Owner" value={device.owner} />
            <Info label="Client version" value={device.clientVersion} mono />
            <Info label="Last seen" value={device.lastSeen} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-semibold">Quick actions</div>
            <div className="mt-3 space-y-2">
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast("Password rotated")}>
                <KeyRound className="mr-2 h-4 w-4" /> Rotate device password
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start" onClick={() => toast("Wake-on-LAN sent")}>
                <Power className="mr-2 h-4 w-4" /> Wake on LAN
              </Button>
              <Button size="sm" variant="outline" className="w-full justify-start text-destructive" onClick={() => toast.error("Device revoked")}>
                <Trash2 className="mr-2 h-4 w-4" /> Revoke access
              </Button>
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
        {history.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground">No sessions recorded for this device.</div>
        ) : (
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
                {history.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-4 py-2">{s.initiator}</td>
                    <td className="px-4 py-2"><StatusBadge variant={s.status}>{s.status}</StatusBadge></td>
                    <td className="px-4 py-2 font-mono text-xs">{s.duration}</td>
                    <td className="px-4 py-2"><StatusBadge variant={s.quality}>{s.quality}</StatusBadge></td>
                    <td className="px-4 py-2 text-muted-foreground">{s.startedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}

function Info({
  icon: Icon, label, value, mono,
}: { icon?: typeof KeyRound; label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </div>
      <div className={`mt-1 text-sm ${mono ? "font-mono" : ""}`}>{value}</div>
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
