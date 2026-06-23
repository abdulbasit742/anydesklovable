import { Wifi, WifiOff, Activity, AlertTriangle, Pause } from "lucide-react";
import { MetricCard } from "@/components/app/MetricCard";
import { useDevicePresenceSummary } from "@/lib/services/presence";

export function PresenceSummaryCards() {
  const { data } = useDevicePresenceSummary();
  const total = data?.total_devices ?? 0;
  const online = data?.online_devices ?? 0;
  const offline = data?.offline_devices ?? 0;
  const busy = data?.busy_devices ?? 0;
  const poor = data?.poor_quality_devices ?? 0;
  const active = data?.active_sessions ?? 0;
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard label="Devices online" value={`${online} / ${total}`} icon={online > 0 ? Wifi : WifiOff} hint={`${offline} offline`} />
      <MetricCard label="Active sessions" value={String(active)} icon={Activity} hint={active ? "Live now" : "Idle"} />
      <MetricCard label="Busy devices" value={String(busy)} icon={Pause} hint="In active use" />
      <MetricCard label="Poor connection" value={String(poor)} icon={AlertTriangle} hint="Quality below threshold" />
      <MetricCard label="Offline" value={String(offline)} icon={WifiOff} hint="No recent heartbeat" />
    </div>
  );
}
