import { Check, Minus } from "lucide-react";
import type { PlanLimit } from "@/lib/services";
import { cn } from "@/lib/utils";

function fmtLimit(v: number | null, unit?: string) {
  if (v == null) return "Unlimited";
  return `${v.toLocaleString()}${unit ? ` ${unit}` : ""}`;
}
function price(p: PlanLimit) {
  if (p.monthly_price == null) return "Custom";
  if (p.monthly_price === 0) return "Free";
  return `$${p.monthly_price}/mo`;
}

const ROWS: { label: string; render: (p: PlanLimit) => React.ReactNode }[] = [
  { label: "Max devices",          render: (p) => fmtLimit(p.max_devices) },
  { label: "Team members",         render: (p) => fmtLimit(p.max_team_members) },
  { label: "Session minutes / mo", render: (p) => fmtLimit(p.max_monthly_session_minutes, "min") },
  { label: "File transfer",        render: (p) => fmtLimit(p.max_file_transfer_mb, "MB") },
  { label: "Audit retention",      render: (p) => fmtLimit(p.max_audit_retention_days, "days") },
  { label: "Clipboard sync",       render: (p) => boolCell(p.can_use_clipboard_sync) },
  { label: "Unattended access",    render: (p) => boolCell(p.can_use_unattended_access) },
  { label: "Team management",      render: (p) => boolCell(p.can_use_team_management) },
  { label: "Admin console",        render: (p) => boolCell(p.can_use_admin_console) },
  { label: "Priority support",     render: (p) => boolCell(p.can_use_priority_support) },
];

function boolCell(v: boolean) {
  return v
    ? <Check className="mx-auto h-4 w-4 text-success" />
    : <Minus className="mx-auto h-4 w-4 text-muted-foreground/50" />;
}

export function PlanComparisonTable({ plans, currentPlanKey }: { plans: PlanLimit[]; currentPlanKey: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Feature</th>
            {plans.map((p) => (
              <th key={p.plan_key} className={cn("px-4 py-3 text-center font-medium", p.plan_key === currentPlanKey && "bg-primary/5")}>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-foreground">{p.display_name}</span>
                  <span className="text-[11px] font-normal text-muted-foreground">{price(p)}</span>
                  {p.plan_key === currentPlanKey && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">Current</span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label} className="border-t border-border">
              <td className="px-4 py-2 text-muted-foreground">{row.label}</td>
              {plans.map((p) => (
                <td key={p.plan_key} className={cn("px-4 py-2 text-center", p.plan_key === currentPlanKey && "bg-primary/5")}>
                  {row.render(p)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
