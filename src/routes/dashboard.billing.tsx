import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Download } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/StatusBadge";
import { toast } from "sonner";
import { useInvoices, useDevices } from "@/lib/services";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { DemoBanner, PanelState } from "@/components/app/DataState";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({ meta: [{ title: "Billing — RemoteDesk" }] }),
  component: BillingPage,
});

const PLAN_LIMITS: Record<string, { devices: number; seats: number; minutes: number | null; price: string }> = {
  free: { devices: 1, seats: 1, minutes: 60, price: "$0.00" },
  pro: { devices: 5, seats: 1, minutes: null, price: "$19.00" },
  business: { devices: 25, seats: 10, minutes: null, price: "$49.00" },
  enterprise: { devices: 999, seats: 999, minutes: null, price: "Custom" },
};

function BillingPage() {
  const { data: team } = useCurrentTeam();
  const invoices = useInvoices();
  const devices = useDevices();
  const plan = ((team?.teams as { plan?: string } | null)?.plan ?? "free").toLowerCase();
  const limits = PLAN_LIMITS[plan] ?? PLAN_LIMITS.free;
  const deviceCount = devices.data.length;

  return (
    <AppShell title="Billing">
      {(invoices.isDemo || devices.isDemo) && <DemoBanner />}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Current plan</div>
              <div className="mt-1 text-2xl font-semibold capitalize">RemoteDesk {plan}</div>
              <div className="mt-1 text-sm text-muted-foreground">{limits.price} / month</div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm"><Link to="/pricing">Change plan</Link></Button>
              <Button size="sm" onClick={() => toast("Opening customer portal")}>
                <ExternalLink className="mr-1.5 h-4 w-4" /> Customer portal
              </Button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Usage label="Devices" used={deviceCount} max={limits.devices} />
            <Usage label="Session minutes" used={limits.minutes ? Math.min(limits.minutes, 248) : 248} max={limits.minutes ?? Infinity} unit="min" />
            <Usage label="Team seats" used={1} max={limits.seats} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-sm font-semibold">Need more?</div>
          <p className="mt-1 text-sm text-muted-foreground">Business unlocks team management, audit logs, file transfer, and policy controls.</p>
          <Button asChild className="mt-4 w-full"><Link to="/pricing">Upgrade plan</Link></Button>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Invoices</div>
        <PanelState loading={invoices.isLoading} error={invoices.error} empty={invoices.data.length === 0} emptyText="No invoices yet — your first invoice will appear after upgrading.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Invoice</th>
                  <th className="px-4 py-2 text-left font-medium">Date</th>
                  <th className="px-4 py-2 text-left font-medium">Amount</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {invoices.data.map((i) => (
                  <tr key={i.id} className="border-t border-border">
                    <td className="px-4 py-2 font-mono text-xs">{i.number}</td>
                    <td className="px-4 py-2 text-muted-foreground">{new Date(i.issued_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2">{(i.amount_cents / 100).toLocaleString(undefined, { style: "currency", currency: i.currency || "USD" })}</td>
                    <td className="px-4 py-2"><StatusBadge variant={i.status === "paid" ? "paid" : "neutral"}>{i.status}</StatusBadge></td>
                    <td className="px-4 py-2 text-right">
                      <Button variant="ghost" size="sm" onClick={() => i.pdf_url ? window.open(i.pdf_url) : toast("PDF not available in demo")}>
                        <Download className="mr-1.5 h-4 w-4" /> PDF
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelState>
      </div>
    </AppShell>
  );
}

function Usage({ label, used, max, unit }: { label: string; used: number; max: number; unit?: string }) {
  const pct = max === Infinity ? 25 : Math.min(100, (used / max) * 100);
  const over = max !== Infinity && used >= max;
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{used}{unit ? ` ${unit}` : ""} {max !== Infinity && `/ ${max}`}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${over ? "bg-destructive" : "bg-primary"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
