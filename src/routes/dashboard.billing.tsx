import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink, Download } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/app/StatusBadge";
import { invoices, currentUser } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({ meta: [{ title: "Billing — RemoteDesk" }] }),
  component: BillingPage,
});

function BillingPage() {
  return (
    <AppShell title="Billing">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Current plan</div>
              <div className="mt-1 text-2xl font-semibold">RemoteDesk {currentUser.plan}</div>
              <div className="mt-1 text-sm text-muted-foreground">Renews on Jul 1, 2026 · $19.00 / month</div>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm"><Link to="/pricing">Change plan</Link></Button>
              <Button size="sm" onClick={() => toast("Opening customer portal")}>
                <ExternalLink className="mr-1.5 h-4 w-4" /> Customer portal
              </Button>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <Usage label="Devices" used={3} max={5} />
            <Usage label="Session minutes" used={248} max={Infinity} unit="min" />
            <Usage label="Team seats" used={1} max={1} />
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
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-border">
                  <td className="px-4 py-2 font-mono text-xs">{i.id}</td>
                  <td className="px-4 py-2 text-muted-foreground">{i.date}</td>
                  <td className="px-4 py-2">{i.amount}</td>
                  <td className="px-4 py-2"><StatusBadge variant="paid">paid</StatusBadge></td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="sm" onClick={() => toast("Downloading invoice")}>
                      <Download className="mr-1.5 h-4 w-4" /> PDF
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}

function Usage({ label, used, max, unit }: { label: string; used: number; max: number; unit?: string }) {
  const pct = max === Infinity ? 25 : Math.min(100, (used / max) * 100);
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{used}{unit ? ` ${unit}` : ""} {max !== Infinity && `/ ${max}`}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
