import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { usePlanLimits, type PlanLimit } from "@/lib/services";

// Map plan limits from Supabase into the display format
function mapPlansForDisplay(limits: PlanLimit[]) {
  return limits.map((p) => ({
    name: p.display_name,
    price: p.monthly_price === null ? "Custom" : p.monthly_price === 0 ? "$0" : `$${p.monthly_price}`,
    period: p.monthly_price === null ? "" : "/mo",
    tagline: p.plan_key === "free" ? "Personal use" : p.plan_key === "pro" ? "Power users" : p.plan_key === "business" ? "Teams & support" : "Large orgs",
    highlight: p.plan_key === "pro",
    features: [
      p.max_devices ? `${p.max_devices} device${p.max_devices > 1 ? "s" : ""}` : "Unlimited devices",
      p.max_monthly_session_minutes ? `${p.max_monthly_session_minutes} min session limit` : "Unlimited sessions",
      p.can_use_file_transfer ? "File transfer" : undefined,
      p.can_use_team_management ? "Team management" : undefined,
      p.can_use_unattended_access ? "Unattended access" : undefined,
      p.can_use_priority_support ? "Priority support" : undefined,
    ].filter(Boolean) as string[],
    cta: p.plan_key === "enterprise" ? "Contact sales" : p.plan_key === "free" ? "Get started" : `Upgrade to ${p.display_name}`,
  }));
}

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — RemoteDesk" },
      { name: "description", content: "Simple, transparent pricing for personal use, professional support, business teams, and enterprises." },
      { property: "og:title", content: "Pricing — RemoteDesk" },
      { property: "og:description", content: "Free, Pro, Business, and Enterprise plans for RemoteDesk." },
    ],
  }),
  component: Pricing,
});

function Pricing() {
  const { data: planLimits } = usePlanLimits();
  const plans = mapPlansForDisplay(planLimits);

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Pricing</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              Plans that scale with your team
            </h1>
            <p className="mt-3 text-muted-foreground">
              Start free, upgrade for HD streaming and team controls. Cancel anytime.
            </p>
          </div>
          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`flex flex-col rounded-lg border bg-card p-5 ${p.highlight ? "border-primary ring-1 ring-primary" : "border-border"}`}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{p.name}</div>
                  {p.highlight && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Popular</span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <div className="text-3xl font-semibold">{p.price}</div>
                  <div className="text-sm text-muted-foreground">{p.period}</div>
                </div>
                <div className="text-xs text-muted-foreground">{p.tagline}</div>
                <ul className="mt-5 flex-1 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-success" />{f}</li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full" variant={p.highlight ? "default" : "outline"}>
                  <Link to={p.name === "Enterprise" ? "/signup" : "/signup"}>{p.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
          <FAQ />
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}

function FAQ() {
  const faqs = [
    ["Is RemoteDesk peer-to-peer?", "Yes. Whenever a direct connection is possible, your screen stream stays between the two devices via WebRTC."],
    ["What happens if a connection can’t be direct?", "We fall back to encrypted TURN relays in multiple regions. Your data remains encrypted end-to-end."],
    ["Can I cancel anytime?", "Yes. Plans are billed monthly and can be canceled at the end of the current period."],
    ["Do you offer a trial of Business?", "Pro features are included free during your first 14 days, then your account moves to your selected plan."],
  ];
  return (
    <div className="mt-20">
      <h2 className="text-2xl font-semibold">Frequently asked questions</h2>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {faqs.map(([q, a]) => (
          <div key={q} className="rounded-lg border border-border bg-card p-4">
            <div className="text-sm font-semibold">{q}</div>
            <p className="mt-1 text-sm text-muted-foreground">{a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
