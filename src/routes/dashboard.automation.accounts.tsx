import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAutomationAccounts, useAutomationRateLimits, useCreateAutomationRow } from "@/lib/automation/hooks";
import { AutomationStatusBadge, DemoBanner, EmptyState, formatRelative } from "@/components/app/automation/shared";

export const Route = createFileRoute("/dashboard/automation/accounts")({ component: AccountsPage });

const PROVIDERS = ["manus", "openai", "claude", "kimi", "lovable", "custom"];

function AccountsPage() {
  const accounts = useAutomationAccounts();
  const rates = useAutomationRateLimits();
  const create = useCreateAutomationRow("automation_accounts", "automation_accounts");
  const [openCreate, setOpenCreate] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [form, setForm] = useState({ label: "", provider: "manus", masked_label: "", notes: "" });

  const rows = accounts.data?.rows ?? [];
  const detail = rows.find((r: any) => r.id === drawerId);
  const detailEvents = (rates.data?.rows ?? []).filter((e: any) => e.account_id === drawerId);

  return (
    <AppShell title="Automation accounts" actions={
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogTrigger asChild><Button size="sm">Add account metadata</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add account metadata</DialogTitle>
            <DialogDescription>
              Register a provider account for rotation. <strong>Never paste real passwords, API keys, OAuth tokens, or TOTP secrets here.</strong>
              {" "}Store only a masked label (e.g. last 4 characters) and a reference to where the real secret lives.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label>Label</Label><Input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="manus-primary" /></div>
            <div><Label>Provider</Label>
              <Select value={form.provider} onValueChange={(v) => setForm({ ...form, provider: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROVIDERS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Masked identifier</Label><Input value={form.masked_label} onChange={(e) => setForm({ ...form, masked_label: e.target.value })} placeholder="sk-••••de12" /></div>
            <div><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button disabled={!form.label || create.isPending} onClick={async () => {
              try {
                await create.mutateAsync({ ...form, status: "available" });
                toast.success("Account metadata added");
                setOpenCreate(false);
                setForm({ label: "", provider: "manus", masked_label: "", notes: "" });
              } catch (e: any) { toast.error(e.message ?? "Failed"); }
            }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    }>
      <DemoBanner show={!!accounts.data?.isDemo} />
      {rows.length === 0 ? (
        <EmptyState title="No accounts" description="Register provider account metadata so the scheduler can rotate workloads safely." />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Label</TableHead><TableHead>Provider</TableHead><TableHead>Status</TableHead><TableHead>Health</TableHead><TableHead>Daily tasks</TableHead><TableHead>Success</TableHead><TableHead>Cooldown until</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a: any) => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => setDrawerId(a.id)}>
                  <TableCell className="font-medium">{a.label}<div className="text-xs text-muted-foreground">{a.masked_label ?? "—"}</div></TableCell>
                  <TableCell className="capitalize">{a.provider}</TableCell>
                  <TableCell><AutomationStatusBadge value={a.status} /></TableCell>
                  <TableCell>{a.health_score}%</TableCell>
                  <TableCell>{a.daily_task_count}</TableCell>
                  <TableCell>{a.success_rate ? `${Math.round(Number(a.success_rate) * 100)}%` : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatRelative(a.cooldown_until)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!drawerId} onOpenChange={(o) => !o && setDrawerId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {detail && (
            <>
              <SheetHeader><SheetTitle>{detail.label}</SheetTitle><SheetDescription>Provider: {detail.provider}</SheetDescription></SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <AutomationStatusBadge value={detail.status} />
                  <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs">Health {detail.health_score}%</span>
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-2 text-xs">
                  <div><span className="text-muted-foreground">Masked identifier:</span> {detail.masked_label ?? "—"}</div>
                  <div className="mt-1 text-muted-foreground">No plaintext secrets are stored. Real credentials must live in your secret manager.</div>
                </div>
                {detail.notes && <div className="rounded-md border border-border bg-card p-2 text-xs"><span className="font-semibold">Notes:</span> {detail.notes}</div>}
                <section>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rate-limit history</div>
                  <div className="space-y-1">
                    {detailEvents.length === 0 && <div className="text-xs text-muted-foreground">No rate-limit events.</div>}
                    {detailEvents.map((e: any) => (
                      <div key={e.id} className="flex items-center justify-between rounded border border-border bg-card px-2 py-1.5 text-xs">
                        <span>{e.signal} · {e.message}</span>
                        <AutomationStatusBadge value={e.severity} />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
