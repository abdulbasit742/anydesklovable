import { formatDistanceToNow } from "date-fns";
import { Activity, Cpu, MemoryStick, Battery, Wifi, Clock } from "lucide-react";
import { type DevicePresence, isHeartbeatStale } from "@/lib/services/presence";
import { DevicePresenceBadge } from "./DevicePresenceBadge";
import { ConnectionQualityIndicator } from "./ConnectionQualityIndicator";

function Stat({ icon: Icon, label, value }: { icon: typeof Cpu; label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <div className="mt-1 text-sm">{value}</div>
    </div>
  );
}

export function DeviceHeartbeatCard({ presence }: { presence?: DevicePresence | null }) {
  if (!presence) {
    return (
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4 text-primary" /> Presence</div>
        <div className="mt-3 text-sm text-muted-foreground">
          This device hasn't checked in yet. Install and launch the RemoteDesk client to start broadcasting presence.
        </div>
      </div>
    );
  }
  const stale = isHeartbeatStale(presence);
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Activity className="h-4 w-4 text-primary" /> Live presence
        </div>
        <div className="flex items-center gap-2">
          <DevicePresenceBadge presence={presence} />
          <ConnectionQualityIndicator presence={presence} />
        </div>
      </div>
      {stale && (
        <div className="mt-3 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
          This device hasn't checked in recently. Connection may be unreliable.
        </div>
      )}
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat icon={Clock} label="Last heartbeat" value={presence.heartbeat_at ? formatDistanceToNow(new Date(presence.heartbeat_at), { addSuffix: true }) : "—"} />
        <Stat icon={Clock} label="Last seen" value={presence.last_seen_at ? formatDistanceToNow(new Date(presence.last_seen_at), { addSuffix: true }) : "—"} />
        <Stat icon={Wifi} label="Latency" value={presence.latency_ms != null ? `${presence.latency_ms} ms` : "—"} />
        <Stat icon={Wifi} label="Packet loss" value={presence.packet_loss != null ? `${Number(presence.packet_loss).toFixed(1)}%` : "—"} />
        <Stat icon={Cpu} label="CPU load" value={presence.cpu_load != null ? `${Number(presence.cpu_load).toFixed(0)}%` : "—"} />
        <Stat icon={MemoryStick} label="Memory" value={presence.memory_load != null ? `${Number(presence.memory_load).toFixed(0)}%` : "—"} />
        <Stat icon={Battery} label="Battery" value={presence.battery_percent != null ? `${presence.battery_percent}%` : "—"} />
        <Stat icon={Activity} label="Client" value={presence.client_version ?? "—"} />
        <Stat icon={Activity} label="Platform" value={[presence.platform, presence.os_version].filter(Boolean).join(" · ") || "—"} />
      </div>
    </div>
  );
}
