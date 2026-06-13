import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UsageMeterValue } from "@/lib/services";
import { meterStatus } from "./UsageMeter";

export function UsageWarningCard({
  meters, onUpgrade,
}: { meters: UsageMeterValue[]; onUpgrade?: () => void }) {
  const flagged = meters
    .map((m) => ({ m, s: meterStatus(m.used, m.max) }))
    .filter((x) => x.s === "warning" || x.s === "danger" || x.s === "over");
  if (flagged.length === 0) return null;
  const hasOver = flagged.some((x) => x.s === "over" || x.s === "danger");
  const tone = hasOver ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-warning/30 bg-warning/10 text-warning";

  return (
    <div className={`flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4 ${tone}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        <div>
          <div className="text-sm font-semibold text-foreground">
            {hasOver ? "Plan limit reached" : "Approaching plan limit"}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {flagged.map((x) => x.m.label).join(", ")} {hasOver ? "is at or over your plan limit." : "is above 70%."}
          </div>
        </div>
      </div>
      {onUpgrade && (
        <Button size="sm" variant={hasOver ? "destructive" : "default"} onClick={onUpgrade}>
          Upgrade plan
        </Button>
      )}
    </div>
  );
}
