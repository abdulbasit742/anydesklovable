import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAutomationAlertRoutes, useAutomationLogs, useCreateAutomationRow, useUpdateAutomationRow } from "@/lib/automation/hooks";
import { AutomationStatusBadge, DemoBanner, EmptyState, formatRelative } from "@/components/app/automation/shared";

export const Route = createFileRoute("/dashboard/automation/alerts")({ component: AlertsPage });

function AlertsPage() {
  const routes = useAutomationAlertRoutes();
  const logs = useAutomationLogs();
  const create = useCreateAutomationRow("automation_alert_routes", "automation_alert_routes");
  const update = useUpdateAutomationRow("automation_alert_routes", "automation_alert_routes");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", channel: "email", configText: "" });

  const rows = routes.data?.rows ?? [];
  const isReal = !routes.data?.isDemo;
  const history = (logs.data?.rows ?? []).filter((l: any) => l.level === "warning" || l.level === "error" || l.level === "critical").slice(0, 20);

  return (
    <AppShell title="Alerts" actions={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button size="sm">New alert route</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Create alert route</DialogTitle><DialogDescription>Where should automation incidents be sent?</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Channel</Label>
              <Select value={form.channel} onValueChange={(v) => setForm({ ...form, channel: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["email","telegram","webhook","in_app"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Config (JSON)</Label><Input value={form.configText} onChange={(e) => setForm({ ...form, configText: e.target.value })} placeholder='{"to":"ops@example.com"}' /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.name || create.isPending} onClick={async () => {
              let config: any = {};
              if (form.configText.trim()) {
                try { config = JSON.parse(form.configText); } catch { toast.error("Invalid JSON in config"); return; }
              }
              try {
                await create.mutateAsync({ name: form.name, channel: form.channel, config, enabled: true });
                toast.success("Route created");
                setOpen(false);
              } catch (e: any) { toast.error(e.message ?? "Failed"); }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    }>
      <DemoBanner show={!!routes.data?.isDemo} />
      {rows.length === 0 ? <EmptyState title="No alert routes" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Channel</TableHead><TableHead>Enabled</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Test</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="capitalize">{r.channel}</TableCell>
                  <TableCell>
                    <Switch checked={r.enabled} disabled={!isReal}
                      onCheckedChange={async (v) => {
                        try { await update.mutateAsync({ id: r.id, patch: { enabled: v } }); }
                        catch (e: any) { toast.error(e.message ?? "Failed"); }
                      }} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatRelative(r.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" onClick={() => toast.success(`Test alert dispatched to ${r.channel} (${isReal ? "simulated" : "demo"})`)}>Test</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <section className="mt-6 rounded-lg border border-border bg-card">
        <header className="border-b border-border px-4 py-3 text-sm font-semibold">Alert history</header>
        <div className="divide-y divide-border">
          {history.length === 0 && <div className="px-4 py-6 text-center text-xs text-muted-foreground">No recent alerts.</div>}
          {history.map((l: any) => (
            <div key={l.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <div className="truncate text-sm">{l.message}</div>
                <div className="text-xs text-muted-foreground">{l.category ?? "—"} · {formatRelative(l.created_at)}</div>
              </div>
              <AutomationStatusBadge value={l.level} />
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
