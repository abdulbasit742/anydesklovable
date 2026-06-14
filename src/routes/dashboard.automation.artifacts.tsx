import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useAutomationArtifacts } from "@/lib/automation/hooks";
import { DemoBanner, EmptyState, formatRelative } from "@/components/app/automation/shared";

export const Route = createFileRoute("/dashboard/automation/artifacts")({ component: ArtifactsPage });

function ArtifactsPage() {
  const arts = useAutomationArtifacts();
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);

  const rows = arts.data?.rows ?? [];
  const filtered = useMemo(() => rows.filter((r: any) =>
    (type === "all" || r.type === type) && (!search || r.name.toLowerCase().includes(search.toLowerCase())),
  ), [rows, type, search]);
  const detail = rows.find((r: any) => r.id === openId);

  return (
    <AppShell title="Artifacts">
      <DemoBanner show={!!arts.data?.isDemo} />
      <div className="mb-3 flex flex-wrap gap-2">
        <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
        <Select value={type} onValueChange={setType}><SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>{["all","text","json","markdown","zip","image","report","other"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No artifacts yet" description="Pipelines will write outputs and reports here." />
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table>
            <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Size</TableHead><TableHead>Created</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {filtered.map((a: any) => (
                <TableRow key={a.id} className="cursor-pointer" onClick={() => setOpenId(a.id)}>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="capitalize text-xs text-muted-foreground">{a.type}</TableCell>
                  <TableCell className="text-xs">{a.size_bytes ? `${Math.round(a.size_bytes / 1024)} KB` : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{formatRelative(a.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" disabled={!a.storage_path}
                      onClick={(e) => { e.stopPropagation(); if (a.storage_path) window.open(a.storage_path, "_blank"); }}>
                      Download
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {detail && (
            <>
              <SheetHeader><SheetTitle>{detail.name}</SheetTitle><SheetDescription>{detail.type} · {detail.size_bytes ? `${Math.round(detail.size_bytes / 1024)} KB` : "—"}</SheetDescription></SheetHeader>
              <div className="mt-4">
                {detail.preview ? (
                  <pre className="max-h-[60vh] overflow-auto rounded-md border border-border bg-muted/30 p-3 text-xs">{detail.preview}</pre>
                ) : (
                  <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">No inline preview available.</div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
