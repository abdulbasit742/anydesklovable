import type { LucideIcon } from "lucide-react";

export function MetricCard({
  label, value, delta, icon: Icon, hint,
}: { label: string; value: string; delta?: string; icon: LucideIcon; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      {(delta || hint) && (
        <div className="mt-2 text-xs text-muted-foreground">{delta ?? hint}</div>
      )}
    </div>
  );
}
