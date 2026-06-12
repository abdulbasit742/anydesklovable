import { cn } from "@/lib/utils";

type Variant = "online" | "offline" | "connected" | "ended" | "rejected" | "good" | "fair" | "poor" | "paid" | "neutral";

const map: Record<Variant, string> = {
  online: "bg-success/10 text-success border-success/20",
  connected: "bg-success/10 text-success border-success/20",
  good: "bg-success/10 text-success border-success/20",
  paid: "bg-success/10 text-success border-success/20",
  offline: "bg-muted text-muted-foreground border-border",
  ended: "bg-muted text-muted-foreground border-border",
  neutral: "bg-muted text-muted-foreground border-border",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  poor: "bg-destructive/10 text-destructive border-destructive/20",
  fair: "bg-warning/15 text-warning-foreground border-warning/30",
};

export function StatusBadge({ variant, children }: { variant: Variant; children: React.ReactNode }) {
  const dotColor =
    variant === "online" || variant === "connected" || variant === "good" || variant === "paid"
      ? "bg-success"
      : variant === "rejected" || variant === "poor"
      ? "bg-destructive"
      : variant === "fair"
      ? "bg-warning"
      : "bg-muted-foreground";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize", map[variant])}>
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor)} />
      {children}
    </span>
  );
}
