import { cn } from "@/lib/utils";

const palette: Record<string, string> = {
  // task / system
  idle: "bg-muted text-muted-foreground border-border",
  running: "bg-primary/10 text-primary border-primary/20",
  paused: "bg-warning/15 text-warning-foreground border-warning/30",
  degraded: "bg-warning/15 text-warning-foreground border-warning/30",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  queued: "bg-muted text-muted-foreground border-border",
  waiting: "bg-warning/15 text-warning-foreground border-warning/30",
  completed: "bg-success/10 text-success border-success/20",
  cancelled: "bg-muted text-muted-foreground border-border",
  // pipeline
  draft: "bg-muted text-muted-foreground border-border",
  active: "bg-success/10 text-success border-success/20",
  archived: "bg-muted text-muted-foreground border-border",
  // accounts
  available: "bg-success/10 text-success border-success/20",
  cooldown: "bg-warning/15 text-warning-foreground border-warning/30",
  limited: "bg-warning/15 text-warning-foreground border-warning/30",
  banned: "bg-destructive/10 text-destructive border-destructive/20",
  disabled: "bg-muted text-muted-foreground border-border",
  // severity / log levels
  low: "bg-muted text-muted-foreground border-border",
  medium: "bg-warning/15 text-warning-foreground border-warning/30",
  high: "bg-destructive/10 text-destructive border-destructive/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  debug: "bg-muted text-muted-foreground border-border",
  info: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-warning/15 text-warning-foreground border-warning/30",
  error: "bg-destructive/10 text-destructive border-destructive/20",
  // priority
  normal: "bg-muted text-muted-foreground border-border",
  urgent: "bg-destructive/10 text-destructive border-destructive/20",
};

export function AutomationStatusBadge({ value }: { value: string | null | undefined }) {
  const key = (value ?? "idle").toLowerCase();
  const cls = palette[key] ?? "bg-muted text-muted-foreground border-border";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize", cls)}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {value ?? "—"}
    </span>
  );
}

export function DemoBanner({ show, message }: { show: boolean; message?: string }) {
  if (!show) return null;
  return (
    <div className="mb-4 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
      <span className="font-semibold">Demo data.</span>{" "}
      {message ?? "Showing example automation rows. Create real data to see live values from your team."}
    </div>
  );
}

export function AutomationMetricCard({
  label, value, hint, tone = "default",
}: { label: string; value: string | number; hint?: string; tone?: "default" | "success" | "warning" | "danger" }) {
  const toneCls =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning-foreground" : tone === "danger" ? "text-destructive" : "";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className={cn("mt-2 text-2xl font-semibold tracking-tight", toneCls)}>{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="text-sm font-semibold">{title}</div>
      {description && <div className="mt-1 text-xs text-muted-foreground">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function formatRelative(iso: string | null | undefined) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const future = diff < 0;
  const m = Math.round(abs / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return future ? `in ${m}m` : `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return future ? `in ${h}h` : `${h}h ago`;
  const d = Math.round(h / 24);
  return future ? `in ${d}d` : `${d}d ago`;
}

export function exportToCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
