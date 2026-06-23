import { Signal, SignalHigh, SignalLow, SignalMedium, SignalZero } from "lucide-react";
import { cn } from "@/lib/utils";
import { type ConnectionQuality, type DevicePresence } from "@/lib/services/presence";

const meta: Record<ConnectionQuality, { label: string; cls: string; Icon: typeof Signal }> = {
  excellent: { label: "Excellent", cls: "text-success", Icon: SignalHigh },
  good: { label: "Good", cls: "text-success", Icon: Signal },
  fair: { label: "Fair", cls: "text-warning", Icon: SignalMedium },
  poor: { label: "Poor", cls: "text-destructive", Icon: SignalLow },
  unknown: { label: "Unknown", cls: "text-muted-foreground", Icon: SignalZero },
};

export function ConnectionQualityIndicator({
  presence,
  showDetails = false,
}: {
  presence?: DevicePresence | null;
  showDetails?: boolean;
}) {
  const q = (presence?.connection_quality ?? "unknown") as ConnectionQuality;
  const m = meta[q] ?? meta.unknown;
  return (
    <div className={cn("inline-flex items-center gap-1.5 text-xs", m.cls)}>
      <m.Icon className="h-3.5 w-3.5" />
      <span className="font-medium">{m.label}</span>
      {showDetails && presence && (
        <span className="text-muted-foreground">
          {presence.latency_ms != null && <>· {presence.latency_ms}ms</>}
          {presence.packet_loss != null && <> · {Number(presence.packet_loss).toFixed(1)}% loss</>}
          {presence.network_type && <> · {presence.network_type}</>}
        </span>
      )}
    </div>
  );
}
