import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Download, Save } from "lucide-react";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/app/StatusBadge";
import { toast } from "sonner";
import { useInvoices, useCurrentSubscription, usePlanLimits, useUsageSummary, useBillingChangeRequests, setSubscriptionSeats, applyBillingChangeRequest, rejectBillingChangeRequest } from "@/lib/services";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { DemoBanner, PanelState } from "@/components/app/DataState";
import { UsageMeter } from "@/components/app/billing/UsageMeter";
import { PlanBadge } from "@/components/app/billing/PlanBadge";
import { PlanComparisonTable } from "@/components/app/billing/PlanComparisonTable";
import { UpgradePrompt } from "@/components/app/billing/UpgradePrompt";
import { UsageWarningCard } from "@/components/app/billing/UsageWarningCard";
import { CUSTOMER_PORTAL_URL } from "@/lib/config/checkout";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export const Route = createFileRoute("/dashboard/billing")({
  head: () => ({ meta: [{ title: "Billing — RemoteDesk" }] }),
  component: BillingPage,
});

function BillingPage() {
  const { data: team } = useCurrentTeam();
  const invoices = useInvoices();
  const subscription = useCurrentSubscription();
  const plans = usePlanLimits();
  const usage = useUsageSummary();
  const changeRequests = useBillingChangeRequests();
  const qc = useQueryClient();

  const planKey = (((team?.teams as { plan?: string } | null)?.plan) ?? "free").toLowerCase();
  const limit = plans.data.find((p) => p.plan_key === planKey) ?? plans.data[0];
  const currentSeats = subscription.data?.seats ?? 1;
  const [seats, setSeats] = useState<number>(currentSeats);
  const isOwner = team?.role === "owner";

  const seatsMut = useMutation({
    mutationFn: (n: number) => setSubscriptionSeats(n),
    onSuccess: () => {
      toast.success("Seats updated");
      qc.invalidateQueries({ queryKey: ["subscription"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell title="Billing">
      {(invoices.isDemo || usage.isDemo || plans.isDemo) && (
        <DemoBanner>Some billing data is computed locally for preview because production billing tables are empty or unavailable.</DemoBanner>
      )}

      {/* Current plan */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
                Current plan <PlanBadge planKey={planKey} />
              </div>
              <div className="mt-1 text-2xl font-semibold">{limit?.display_name ?? "Free"}</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {limit?.monthly_price == null ? "Custom pricing" : limit.monthly_price === 0 ? "$0 / month" : `$${limit.monthly_price} / month`}
                {subscription.data?.billing_interval && ` · billed ${subscription.data.billing_interval}`}
              </div>
              {subscription.data?.current_period_end && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {subscription.data.cancel_at_period_end ? "Cancels" : "Renews"} on {format(new Date(subscription.data.current_period_end), "MMM d, yyyy")}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <UpgradePrompt plans={plans.data} currentPlanKey={planKey} currentSeats={currentSeats} trigger={<Button size="sm">Change plan</Button>} />
              <Button size="sm" variant="outline" onClick={() => CUSTOMER_PORTAL_URL.url ? window.open(CUSTOMER_PORTAL_URL.url) : toast("Customer portal not configured")}>
                <ExternalLink className="mr-1.5 h-4 w-4" /> Customer portal
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-sm font-semibold">Seats</div>
          <p className="mt-1 text-xs text-muted-foreground">
            Currently {currentSeats} seat{currentSeats === 1 ? "" : "s"}.
            {isOwner ? " Owners can update seat count directly." : " Ask the team owner to change seats."}
          </p>
          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <Label htmlFor="seats" className="text-xs">Seat count</Label>
              <Input id="seats" type="number" min={1} value={seats} disabled={!isOwner}
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value || "1", 10) || 1))} />
            </div>
            <Button size="sm" disabled={!isOwner || seats === currentSeats || seatsMut.isPending} onClick={() => seatsMut.mutate(seats)}>
              <Save className="mr-1.5 h-4 w-4" /> Save
            </Button>
          </div>
          <UpgradePrompt
            plans={plans.data}
            currentPlanKey={planKey}
            currentSeats={currentSeats}
            defaultPlan={planKey === "free" ? "pro" : planKey}
            trigger={<Button variant="outline" size="sm" className="mt-3 w-full">Request plan or seat change</Button>}
          />
        </div>
      </div>

      {/* Over-limit warning */}
      <div className="mt-4">
        <UsageWarningCard meters={usage.meters} />
      </div>

      {/* Usage meters */}
      <div className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm font-semibold">Usage this period</div>
          {usage.isLoading && <span className="text-xs text-muted-foreground">Refreshing…</span>}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {usage.meters.map((m) => (
            <UsageMeter key={m.key} label={m.label} used={m.used} max={m.max} unit={m.unit} />
          ))}
        </div>
      </div>

      {/* Plan comparison */}
      <div className="mt-6">
        <div className="mb-2 text-sm font-semibold">Compare plans</div>
        <PlanComparisonTable plans={plans.data} currentPlanKey={planKey} />
      </div>

      {/* Invoices */}
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

      {/* Change requests */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Plan change requests</div>
        <PanelState loading={changeRequests.isLoading} error={changeRequests.error} empty={changeRequests.data.length === 0} emptyText="No pending plan or seat change requests.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Requested</th>
                  <th className="px-4 py-2 text-left font-medium">From → To</th>
                  <th className="px-4 py-2 text-left font-medium">Seats</th>
                  <th className="px-4 py-2 text-left font-medium">Interval</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {changeRequests.data.map((r) => {
                  const canTriage = (team?.role === "owner" || team?.role === "admin") && r.status === "pending";
                  return (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-4 py-2 text-muted-foreground">{format(new Date(r.created_at), "MMM d, yyyy HH:mm")}</td>
                      <td className="px-4 py-2"><span className="font-mono text-xs">{r.from_plan ?? "—"} → {r.to_plan}</span></td>
                      <td className="px-4 py-2">{r.from_seats ?? "—"} → {r.to_seats}</td>
                      <td className="px-4 py-2 capitalize">{r.billing_interval}</td>
                      <td className="px-4 py-2"><StatusBadge variant={r.status === "applied" ? "paid" : r.status === "rejected" ? "rejected" : "neutral"}>{r.status}</StatusBadge></td>
                      <td className="px-4 py-2 text-right">
                        {canTriage && (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={async () => {
                              try {
                                await rejectBillingChangeRequest(r.id);
                                toast.success("Request rejected");
                                qc.invalidateQueries({ queryKey: ["billing_change_requests"] });
                              } catch (e) { toast.error((e as Error).message); }
                            }}>Reject</Button>
                            <Button size="sm" onClick={async () => {
                              try {
                                await applyBillingChangeRequest(r.id);
                                toast.success("Plan change applied");
                                qc.invalidateQueries({ queryKey: ["billing_change_requests"] });
                                qc.invalidateQueries({ queryKey: ["subscription"] });
                                qc.invalidateQueries({ queryKey: ["current-team"] });
                              } catch (e) { toast.error((e as Error).message); }
                            }}>Approve</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PanelState>
      </div>
    </AppShell>
  );
}
