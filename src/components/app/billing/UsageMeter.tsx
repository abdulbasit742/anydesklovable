import { cn } from "@/lib/utils";

export type UsageMeterProps = {
  label: string;
  used: number;
  max: number | null;
  unit?: string;
  className?: string;
};

export function meterStatus(used: number, max: number | null): "unlimited" | "normal" | "warning" | "danger" | "over" {
  if (max == null) return "unlimited";
  const pct = max === 0 ? 100 : (used / max) * 100;
  if (pct > 100) return "over";
  if (pct >= 90) return "danger";
  if (pct >= 70) return "warning";
  return "normal";
}

export function UsageMeter({ label, used, max, unit, className }: UsageMeterProps) {
  const status = meterStatus(used, max);
  const pct = max == null ? 0 : Math.min(100, max === 0 ? 100 : (used / max) * 100);
  const barTone =
    status === "over" ? "bg-destructive" :
    status === "danger" ? "bg-destructive/80" :
    status === "warning" ? "bg-warning" :
    "bg-primary";
  const valueTone =
    status === "over" || status === "danger" ? "text-destructive" :
    status === "warning" ? "text-warning" : "text-foreground";

  return (
    <div className={cn("rounded-md border border-border bg-background p-3", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-mono", valueTone)}>
          {used.toLocaleString()}{unit ? ` ${unit}` : ""} {max == null ? <span className="text-muted-foreground">/ Unlimited</span> : <span className="text-muted-foreground">/ {max.toLocaleString()}</span>}
        </span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        {max != null ? (
          <div className={cn("h-full transition-all", barTone)} style={{ width: `${pct}%` }} />
        ) : (
          <div className="h-full w-1/4 bg-primary/30" />
        )}
      </div>
      {status === "over" && (
        <div className="mt-1.5 text-[11px] text-destructive">Over plan limit — upgrade required.</div>
      )}
    </div>
  );
}
