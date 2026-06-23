import { formatDistanceToNow } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { StatusBadge } from "@/components/app/StatusBadge";
import { type DevicePresence, type PresenceStatus, presenceVariant, isHeartbeatStale } from "@/lib/services/presence";

export function DevicePresenceBadge({
  presence,
  fallbackStatus,
}: {
  presence?: DevicePresence | null;
  fallbackStatus?: PresenceStatus | string;
}) {
  const status: PresenceStatus = (presence?.status ?? (fallbackStatus as PresenceStatus) ?? "unknown") as PresenceStatus;
  const stale = presence ? isHeartbeatStale(presence) : false;
  const effective: PresenceStatus = stale && status === "online" ? "unknown" : status;
  const tip = presence?.heartbeat_at
    ? `Last heartbeat ${formatDistanceToNow(new Date(presence.heartbeat_at), { addSuffix: true })}`
    : "No heartbeat received yet";
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span><StatusBadge variant={presenceVariant(effective)}>{effective}</StatusBadge></span>
        </TooltipTrigger>
        <TooltipContent>{tip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
