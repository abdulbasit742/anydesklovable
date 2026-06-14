import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useAutomationPipelines, useCreateAutomationRow } from "@/lib/automation/hooks";
import { AutomationStatusBadge, DemoBanner, EmptyState, formatRelative } from "@/components/app/automation/shared";

export const Route = createFileRoute("/dashboard/automation/pipelines")({
  component: PipelinesPage,
});

function PipelinesPage() {
  const { data } = useAutomationPipelines();
  const create = useCreateAutomationRow("automation_pipelines", "automation_pipelines");
  const [status, setStatus] = useState<string>("all");
  const [mode, setMode] = useState<string>("all");
  const [openCreate, setOpenCreate] = useState(false);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", description: "", mode: "sequential", status: "draft" });

  const rows = data?.rows ?? [];
  const filtered = useMemo(
    () => rows.filter((r: any) => (status === "all" || r.status === status) && (mode === "all" || r.mode === mode)),
    [rows, status, mode],
  );
  const detail = filtered.find((r: any) => r.id === drawerId) ?? rows.find((r: any) => r.id === drawerId);

  return (
    <AppShell title="Pipelines" actions={
      <Dialog open={openCreate} onOpenChange={setOpenCreate}>
        <DialogTrigger asChild><Button size="sm">New pipeline</Button></DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Create pipeline</DialogTitle><DialogDescription>Define a workflow of stages your automation system will execute.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nightly verification" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Mode</Label>
                <Select value={form.mode} onValueChange={(v) => setForm({ ...form, mode: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["sequential","parallel","review","verification","formatting"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["draft","active","paused","archived"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button
              disabled={!form.name || create.isPending}
              onClick={async () => {
                try {
                  await create.mutateAsync({ ...form, stages: [] });
                  toast.success("Pipeline created");
                  setOpenCreate(false);
                  setForm({ name: "", description: "", mode: "sequential", status: "draft" });
                } catch (e: any) { toast.error(e.message ?? "Failed to create"); }
              }}
            >Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    }>
      <DemoBanner show={!!data?.isDemo} />
      <div className="mb-3 flex flex-wrap gap-2">
        <Select value={status} onValueChange={setStatus}><SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>{["all","draft","active","paused","archived"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={mode} onValueChange={setMode}><SelectTrigger className="w-40"><SelectValue placeholder="Mode" /></SelectTrigger>
          <SelectContent>{["all","sequential","parallel","review","verification","formatting"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No pipelines match your filters" description="Try clearing filters or create a new pipeline." />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow><TableHead>Name</TableHead><TableHead>Mode</TableHead><TableHead>Status</TableHead><TableHead>Stages</TableHead><TableHead>Updated</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p: any) => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => setDrawerId(p.id)}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="capitalize">{p.mode}</TableCell>
                  <TableCell><AutomationStatusBadge value={p.status} /></TableCell>
                  <TableCell>{Array.isArray(p.stages) ? p.stages.length : 0}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatRelative(p.updated_at)}</TableCell>
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
              <SheetHeader><SheetTitle>{detail.name}</SheetTitle><SheetDescription>{detail.description ?? "No description"}</SheetDescription></SheetHeader>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex gap-2"><AutomationStatusBadge value={detail.status} /><span className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs capitalize">{detail.mode}</span></div>
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Stages</div>
                  <ol className="space-y-1 rounded-md border border-border bg-muted/30 p-2">
                    {(Array.isArray(detail.stages) ? detail.stages : []).map((s: any, i: number) => (
                      <li key={i} className="rounded bg-card px-2 py-1.5 text-xs">{i + 1}. {s.name ?? JSON.stringify(s)}</li>
                    ))}
                    {(!detail.stages || detail.stages.length === 0) && <li className="px-2 py-1.5 text-xs text-muted-foreground">No stages defined.</li>}
                  </ol>
                </div>
                <div className="text-xs text-muted-foreground">Created {formatRelative(detail.created_at)} · Updated {formatRelative(detail.updated_at)}</div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
