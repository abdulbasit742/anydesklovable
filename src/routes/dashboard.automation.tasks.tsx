import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAutomationPipelines, useAutomationTasks, useCreateAutomationRow, useUpdateAutomationRow } from "@/lib/automation/hooks";
import { AutomationStatusBadge, DemoBanner, EmptyState, exportToCsv, formatRelative } from "@/components/app/automation/shared";

export const Route = createFileRoute("/dashboard/automation/tasks")({
  component: TasksPage,
});

const STATUSES = ["queued", "running", "waiting", "completed", "failed", "cancelled"];
const PRIORITIES = ["low", "normal", "high", "urgent"];

function TasksPage() {
  const tasks = useAutomationTasks();
  const pipelines = useAutomationPipelines();
  const create = useCreateAutomationRow("automation_tasks", "automation_tasks");
  const update = useUpdateAutomationRow("automation_tasks", "automation_tasks");
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", prompt: "", priority: "normal", pipeline_id: "" });

  const rows = tasks.data?.rows ?? [];
  const filtered = useMemo(
    () => rows.filter((r: any) => (status === "all" || r.status === status) && (priority === "all" || r.priority === priority)),
    [rows, status, priority],
  );
  const detail = rows.find((r: any) => r.id === drawerId);
  const isReal = !tasks.data?.isDemo;

  return (
    <AppShell title="Tasks" actions={
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => exportToCsv("automation-tasks.csv", filtered)}>Export CSV</Button>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild><Button size="sm">New task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create task</DialogTitle><DialogDescription>Queue a new task for one of your pipelines.</DialogDescription></DialogHeader>
            <div className="space-y-3">
              <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div><Label>Prompt</Label><Textarea rows={4} value={form.prompt} onChange={(e) => setForm({ ...form, prompt: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Pipeline</Label>
                  <Select value={form.pipeline_id} onValueChange={(v) => setForm({ ...form, pipeline_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{(pipelines.data?.rows ?? []).map((p: any) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
              <Button disabled={!form.title || !form.prompt || create.isPending} onClick={async () => {
                try {
                  await create.mutateAsync({ title: form.title, prompt: form.prompt, priority: form.priority, pipeline_id: form.pipeline_id || null, status: "queued" });
                  toast.success("Task queued");
                  setOpenCreate(false);
                  setForm({ title: "", prompt: "", priority: "normal", pipeline_id: "" });
                } catch (e: any) { toast.error(e.message ?? "Failed"); }
              }}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    }>
      <DemoBanner show={!!tasks.data?.isDemo} />
      <div className="mb-3 flex flex-wrap gap-2">
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{["all", ...STATUSES].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}><SelectTrigger className="w-40"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>{["all", ...PRIORITIES].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No tasks match your filters" />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Title</TableHead><TableHead>Status</TableHead><TableHead>Priority</TableHead><TableHead>Stage</TableHead><TableHead>Progress</TableHead><TableHead>Created</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t: any) => (
                <TableRow key={t.id} className="cursor-pointer" onClick={() => setDrawerId(t.id)}>
                  <TableCell className="max-w-[300px] truncate font-medium">{t.title}</TableCell>
                  <TableCell><AutomationStatusBadge value={t.status} /></TableCell>
                  <TableCell><AutomationStatusBadge value={t.priority} /></TableCell>
                  <TableCell>{t.current_stage}</TableCell>
                  <TableCell>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${t.progress ?? 0}%` }} />
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatRelative(t.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!drawerId} onOpenChange={(o) => !o && setDrawerId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {detail && (
            <>
              <SheetHeader><SheetTitle>{detail.title}</SheetTitle><SheetDescription>Task detail and lifecycle controls.</SheetDescription></SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex flex-wrap gap-2">
                  <AutomationStatusBadge value={detail.status} />
                  <AutomationStatusBadge value={detail.priority} />
                  <span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs">Stage {detail.current_stage} · {detail.progress}%</span>
                </div>
                <section>
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prompt</div>
                  <div className="rounded-md border border-border bg-muted/30 p-2 text-xs">{detail.prompt}</div>
                </section>
                {detail.error_message && (
                  <section>
                    <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-destructive">Error</div>
                    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs">{detail.error_message}</div>
                  </section>
                )}
                {detail.input_payload && (
                  <section><div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Input</div>
                    <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-2 text-xs">{JSON.stringify(detail.input_payload, null, 2)}</pre></section>
                )}
                {detail.output_payload && (
                  <section><div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Output</div>
                    <pre className="overflow-auto rounded-md border border-border bg-muted/30 p-2 text-xs">{JSON.stringify(detail.output_payload, null, 2)}</pre></section>
                )}

                <section>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Actions</div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={!isReal || detail.status !== "running"}
                      onClick={async () => { await update.mutateAsync({ id: detail.id, patch: { status: "waiting" } }); toast.success("Paused"); }}>Pause</Button>
                    <Button size="sm" variant="outline" disabled={!isReal || detail.status !== "waiting"}
                      onClick={async () => { await update.mutateAsync({ id: detail.id, patch: { status: "running" } }); toast.success("Resumed"); }}>Resume</Button>
                    <Button size="sm" variant="outline" disabled={!isReal || detail.status !== "failed"}
                      onClick={async () => { await update.mutateAsync({ id: detail.id, patch: { status: "queued", error_message: null, progress: 0, current_stage: 0 } }); toast.success("Retried"); }}>Retry</Button>
                    <Button size="sm" variant="outline" disabled={!isReal || ["completed","cancelled","failed"].includes(detail.status)}
                      onClick={async () => { await update.mutateAsync({ id: detail.id, patch: { status: "cancelled", finished_at: new Date().toISOString() } }); toast.success("Cancelled"); }}>Cancel</Button>
                    <Button size="sm" variant="outline" disabled={!isReal}
                      onClick={async () => {
                        try {
                          await create.mutateAsync({ title: `${detail.title} (clone)`, prompt: detail.prompt, priority: detail.priority, pipeline_id: detail.pipeline_id, status: "queued" });
                          toast.success("Cloned");
                        } catch (e: any) { toast.error(e.message ?? "Failed"); }
                      }}>Clone</Button>
                  </div>
                  {!isReal && <div className="mt-2 text-xs text-muted-foreground">Actions are disabled on demo data. Create a real task to manage its lifecycle.</div>}
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
