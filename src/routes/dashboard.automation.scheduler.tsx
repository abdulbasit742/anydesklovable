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
import { useAutomationPipelines, useAutomationScheduler, useCreateAutomationRow, useUpdateAutomationRow } from "@/lib/automation/hooks";
import { DemoBanner, EmptyState, formatRelative } from "@/components/app/automation/shared";

export const Route = createFileRoute("/dashboard/automation/scheduler")({ component: SchedulerPage });

function nextRunPreview(rule: any): string {
  if (!rule.enabled) return "disabled";
  if (rule.schedule_type === "interval" && rule.interval_minutes) {
    return `every ${rule.interval_minutes}m`;
  }
  if (rule.schedule_type === "cron" && rule.cron_expression) {
    return `cron: ${rule.cron_expression}`;
  }
  return "manual trigger";
}

function SchedulerPage() {
  const sched = useAutomationScheduler();
  const pipelines = useAutomationPipelines();
  const create = useCreateAutomationRow("automation_scheduler_rules", "automation_scheduler");
  const update = useUpdateAutomationRow("automation_scheduler_rules", "automation_scheduler");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", pipeline_id: "", schedule_type: "cron", cron_expression: "0 * * * *", interval_minutes: 60, timezone: "UTC", enabled: true });

  const rows = sched.data?.rows ?? [];
  const isReal = !sched.data?.isDemo;

  return (
    <AppShell title="Scheduler" actions={
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild><Button size="sm">New schedule</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Create schedule</DialogTitle><DialogDescription>Run a pipeline on a recurring schedule.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label>Pipeline</Label>
              <Select value={form.pipeline_id} onValueChange={(v) => setForm({ ...form, pipeline_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{(pipelines.data?.rows ?? []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="inline-flex rounded-md border border-border bg-muted p-0.5 text-xs">
              {["cron","interval","manual"].map(t => (
                <button key={t} onClick={() => setForm({ ...form, schedule_type: t })}
                  className={`rounded px-3 py-1 capitalize ${form.schedule_type === t ? "bg-card shadow" : ""}`}>{t}</button>
              ))}
            </div>
            {form.schedule_type === "cron" && (
              <div><Label>Cron expression</Label><Input value={form.cron_expression} onChange={(e) => setForm({ ...form, cron_expression: e.target.value })} placeholder="0 * * * *" /></div>
            )}
            {form.schedule_type === "interval" && (
              <div><Label>Interval (minutes)</Label><Input type="number" value={form.interval_minutes} onChange={(e) => setForm({ ...form, interval_minutes: parseInt(e.target.value) || 0 })} /></div>
            )}
            <div><Label>Timezone</Label><Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.enabled} onCheckedChange={(v) => setForm({ ...form, enabled: v })} /><Label>Enabled</Label></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button disabled={!form.name || create.isPending} onClick={async () => {
              try {
                const payload: any = { ...form, pipeline_id: form.pipeline_id || null };
                if (payload.schedule_type !== "cron") payload.cron_expression = null;
                if (payload.schedule_type !== "interval") payload.interval_minutes = null;
                await create.mutateAsync(payload);
                toast.success("Schedule created");
                setOpen(false);
              } catch (e: any) { toast.error(e.message ?? "Failed"); }
            }}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    }>
      <DemoBanner show={!!sched.data?.isDemo} />
      {rows.length === 0 ? <EmptyState title="No schedules yet" /> : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Next run</TableHead><TableHead>Timezone</TableHead><TableHead>Enabled</TableHead><TableHead>Created</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.name}</TableCell>
                  <TableCell className="capitalize">{r.schedule_type}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{nextRunPreview(r)}</TableCell>
                  <TableCell className="text-xs">{r.timezone}</TableCell>
                  <TableCell>
                    <Switch checked={r.enabled} disabled={!isReal}
                      onCheckedChange={async (v) => {
                        try { await update.mutateAsync({ id: r.id, patch: { enabled: v } }); }
                        catch (e: any) { toast.error(e.message ?? "Failed"); }
                      }} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatRelative(r.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </AppShell>
  );
}
