import { useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { PlanLimit } from "@/lib/services";
import { CHECKOUT_LINKS } from "@/lib/config/checkout";

export function UpgradePrompt({
  plans, currentPlanKey, trigger, defaultPlan,
}: {
  plans: PlanLimit[];
  currentPlanKey: string;
  trigger?: React.ReactNode;
  defaultPlan?: string;
}) {
  const upgradeable = plans.filter((p) => p.plan_key !== currentPlanKey && p.plan_key !== "free");
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string>(defaultPlan ?? upgradeable[0]?.plan_key ?? "pro");
  const plan = plans.find((p) => p.plan_key === target);
  const link = CHECKOUT_LINKS[target];

  function handleContinue() {
    if (link?.url) window.location.href = link.url;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm"><Sparkles className="mr-1.5 h-4 w-4" /> Upgrade plan</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade your plan</DialogTitle>
          <DialogDescription>
            Choose a plan to unlock more devices, team features, and longer audit retention.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Select value={target} onValueChange={setTarget}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {upgradeable.map((p) => (
                <SelectItem key={p.plan_key} value={p.plan_key}>
                  {p.display_name} — {p.monthly_price == null ? "Custom pricing" : `$${p.monthly_price}/mo`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {plan && (
            <div className="rounded-md border border-border bg-muted/30 p-3 text-sm">
              <div className="font-semibold">{plan.display_name}</div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                <li>Up to {plan.max_devices ?? "unlimited"} devices</li>
                <li>{plan.max_team_members == null ? "Unlimited" : plan.max_team_members} team member(s)</li>
                <li>{plan.max_monthly_session_minutes == null ? "Unlimited" : `${plan.max_monthly_session_minutes} min`} sessions / mo</li>
                <li>{plan.max_audit_retention_days ?? "Unlimited"} days audit retention</li>
                {plan.can_use_priority_support && <li>Priority support</li>}
              </ul>
            </div>
          )}

          <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-[11px] text-muted-foreground">
            Checkout is a placeholder link in this preview. Wire Stripe Checkout in <code className="rounded bg-background px-1">src/lib/config/checkout.ts</code> to enable real payments.
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleContinue} disabled={!link?.url}>
            <ExternalLink className="mr-1.5 h-4 w-4" /> Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
