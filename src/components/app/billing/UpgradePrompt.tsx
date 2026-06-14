import { useState } from "react";
import { ExternalLink, Sparkles, Send } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { PlanLimit } from "@/lib/services";
import { requestBillingChange } from "@/lib/services";
import { CHECKOUT_LINKS } from "@/lib/config/checkout";

export function UpgradePrompt({
  plans, currentPlanKey, trigger, defaultPlan, currentSeats,
}: {
  plans: PlanLimit[];
  currentPlanKey: string;
  trigger?: React.ReactNode;
  defaultPlan?: string;
  currentSeats?: number;
}) {
  const selectable = plans.filter((p) => p.plan_key !== currentPlanKey);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string>(defaultPlan ?? selectable[0]?.plan_key ?? "pro");
  const [seats, setSeats] = useState<number>(currentSeats ?? 1);
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");
  const [note, setNote] = useState("");
  const plan = plans.find((p) => p.plan_key === target);
  const link = CHECKOUT_LINKS[target];
  const qc = useQueryClient();

  const submit = useMutation({
    mutationFn: () => requestBillingChange({ toPlan: target, toSeats: seats, billingInterval: interval, note: note || undefined }),
    onSuccess: () => {
      toast.success("Plan change request submitted");
      qc.invalidateQueries({ queryKey: ["billing_change_requests"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleCheckout() {
    if (link?.url) window.location.href = link.url;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? <Button size="sm"><Sparkles className="mr-1.5 h-4 w-4" /> Change plan</Button>}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change your plan</DialogTitle>
          <DialogDescription>
            Submit an upgrade, downgrade, or seat change. Your billing admin will receive the request and Stripe will finalize the charge on confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid gap-2">
            <Label className="text-xs">Target plan</Label>
            <Select value={target} onValueChange={setTarget}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {selectable.map((p) => (
                  <SelectItem key={p.plan_key} value={p.plan_key}>
                    {p.display_name} — {p.monthly_price == null ? "Custom pricing" : `$${p.monthly_price}/mo`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label className="text-xs">Seats</Label>
              <Input
                type="number"
                min={1}
                value={seats}
                onChange={(e) => setSeats(Math.max(1, parseInt(e.target.value || "1", 10) || 1))}
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-xs">Billing interval</Label>
              <Select value={interval} onValueChange={(v) => setInterval(v as "monthly" | "yearly")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs">Note (optional)</Label>
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Reason or context for the change" />
          </div>

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
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          {link?.url && (
            <Button variant="outline" onClick={handleCheckout}>
              <ExternalLink className="mr-1.5 h-4 w-4" /> Stripe checkout
            </Button>
          )}
          <Button onClick={() => submit.mutate()} disabled={submit.isPending}>
            <Send className="mr-1.5 h-4 w-4" /> {submit.isPending ? "Submitting…" : "Submit request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
