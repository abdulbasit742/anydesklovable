import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { LifeBuoy, Search, MessageSquare, BookOpen, Mail, Plus, RefreshCw } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DemoBanner } from "@/components/app/DataState";
import { supportArticles } from "@/lib/mock-data";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { useAuth } from "@/hooks/use-auth";
import {
  useSupportTickets,
  createSupportTicket,
  TICKET_CATEGORIES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  type SupportTicket,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@/lib/services";
import { TicketDetailPanel } from "@/components/app/support/TicketDetailPanel";
import { toast } from "sonner";
import { AlertCircle, Inbox } from "lucide-react";


export const Route = createFileRoute("/dashboard/support")({
  head: () => ({ meta: [{ title: "Support — RemoteDesk" }] }),
  component: SupportPage,
});

const CATEGORY_LABEL: Record<TicketCategory, string> = {
  connection: "Connection",
  billing: "Billing",
  account: "Account",
  desktop_app: "Desktop app",
  security: "Security",
  feature_request: "Feature request",
  other: "Other",
};

function statusVariant(s: TicketStatus): "default" | "secondary" | "outline" | "destructive" {
  switch (s) {
    case "open": return "default";
    case "pending": return "secondary";
    case "resolved": return "outline";
    case "closed": return "outline";
  }
}
function priorityVariant(p: TicketPriority): "default" | "secondary" | "outline" | "destructive" {
  switch (p) {
    case "urgent": return "destructive";
    case "high": return "default";
    case "normal": return "secondary";
    case "low": return "outline";
  }
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function SupportPage() {
  const [articleQuery, setArticleQuery] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "all">("all");
  const [priority, setPriority] = useState<TicketPriority | "all">("all");
  const [category, setCategory] = useState<TicketCategory | "all">("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [active, setActive] = useState<SupportTicket | null>(null);

  const tickets = useSupportTickets({ status, priority, category, search });
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ["support_tickets"] });

  const articles = supportArticles.filter(
    (a) => articleQuery === "" || a.title.toLowerCase().includes(articleQuery.toLowerCase()) || a.excerpt.toLowerCase().includes(articleQuery.toLowerCase()),
  );
  const categories = Array.from(new Set(articles.map((a) => a.category)));

  return (
    <AppShell title="Help center">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-6 sm:p-10">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <LifeBuoy className="h-5 w-5" />
          </span>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">How can we help?</h2>
          <p className="mt-1 text-sm text-muted-foreground">Search the docs, browse FAQs, or open a ticket with our team.</p>
          <div className="relative mt-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-11 pl-9" placeholder="Search help articles…" value={articleQuery} onChange={(e) => setArticleQuery(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {categories.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-10 text-center text-sm text-muted-foreground">No articles match your search.</div>
          )}
          {categories.map((cat) => (
            <div key={cat}>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <BookOpen className="h-3.5 w-3.5" /> {cat}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {articles.filter((a) => a.category === cat).map((a) => (
                  <Link
                    key={a.id}
                    to="/dashboard/support"
                    className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-muted/30"
                  >
                    <div className="text-sm font-semibold">{a.title}</div>
                    <p className="mt-1 text-sm text-muted-foreground">{a.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-lg border border-border bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div className="text-sm font-semibold">Your tickets</div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => tickets.refetch()} disabled={tickets.isLoading}>
                  <RefreshCw className={`h-3.5 w-3.5 ${tickets.isLoading ? "animate-spin" : ""}`} />
                </Button>
                <CreateTicketButton open={createOpen} setOpen={setCreateOpen} onCreated={invalidate} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input className="h-9 pl-8" placeholder="Search tickets…" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <FilterSelect value={status} onChange={(v) => setStatus(v as TicketStatus | "all")} label="Status" options={["all", ...TICKET_STATUSES]} />
              <FilterSelect value={priority} onChange={(v) => setPriority(v as TicketPriority | "all")} label="Priority" options={["all", ...TICKET_PRIORITIES]} />
              <FilterSelect value={category} onChange={(v) => setCategory(v as TicketCategory | "all")} label="Category" options={["all", ...TICKET_CATEGORIES]} labelFor={(v) => v === "all" ? "All categories" : CATEGORY_LABEL[v as TicketCategory]} />
            </div>

            {tickets.isDemo && <div className="px-4 pt-3"><DemoBanner>Showing demo tickets — create your first ticket to see real data.</DemoBanner></div>}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">Subject</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Priority</th>
                    <th className="px-4 py-2 text-left font-medium">Category</th>
                    <th className="px-4 py-2 text-left font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.isLoading && Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-t border-border">
                      {Array.from({ length: 5 }).map((__, j) => (
                        <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-full max-w-[160px]" /></td>
                      ))}
                    </tr>
                  ))}
                  {!tickets.isLoading && tickets.error && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-destructive">
                      <AlertCircle className="mx-auto mb-2 h-5 w-5" />
                      {tickets.error.message}
                      <div className="mt-3"><Button variant="outline" size="sm" onClick={() => tickets.refetch()}>Retry</Button></div>
                    </td></tr>
                  )}
                  {!tickets.isLoading && !tickets.error && tickets.data.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
                      <Inbox className="mx-auto mb-2 h-5 w-5 opacity-60" />
                      No tickets match these filters.
                    </td></tr>
                  )}
                  {!tickets.isLoading && !tickets.error && tickets.data.map((t) => (
                    <tr key={t.id} className="border-t border-border cursor-pointer hover:bg-muted/30" onClick={() => setActive(t)}>
                      <td className="px-4 py-2 font-medium">{t.subject}</td>
                      <td className="px-4 py-2"><Badge variant={statusVariant(t.status)} className="capitalize">{t.status}</Badge></td>
                      <td className="px-4 py-2"><Badge variant={priorityVariant(t.priority)} className="capitalize">{t.priority}</Badge></td>
                      <td className="px-4 py-2 text-muted-foreground">{CATEGORY_LABEL[t.category]}</td>
                      <td className="px-4 py-2 text-muted-foreground">{timeAgo(t.updated_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><Plus className="h-4 w-4" /> Need help?</div>
            <p className="mt-1 text-sm text-muted-foreground">Open a ticket and our team will reply by email.</p>
            <Button className="mt-3 w-full" onClick={() => setCreateOpen(true)}>New ticket</Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold"><MessageSquare className="h-4 w-4" /> Live chat</div>
            <p className="mt-1 text-muted-foreground">Pro & Business plans get chat during business hours.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold"><Mail className="h-4 w-4" /> Email</div>
            <a href="mailto:support@remotedesk.io" className="mt-1 inline-block text-primary hover:underline">support@remotedesk.io</a>
          </div>
        </aside>
      </div>

      <TicketDrawer ticket={active} onClose={() => setActive(null)} onChanged={invalidate} />
    </AppShell>
  );
}

function FilterSelect({
  value, onChange, label, options, labelFor,
}: {
  value: string; onChange: (v: string) => void; label: string; options: readonly string[]; labelFor?: (v: string) => string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-9 w-[140px]"><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="capitalize">
            {o === "all" ? `All ${label.toLowerCase()}` : labelFor ? labelFor(o) : o.replace("_", " ")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function CreateTicketButton({ open, setOpen, onCreated }: { open: boolean; setOpen: (b: boolean) => void; onCreated: () => void }) {
  const { user } = useAuth();
  const { data: team } = useCurrentTeam();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("connection");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [includeTeam, setIncludeTeam] = useState(true);
  const [busy, setBusy] = useState(false);

  const reset = () => { setSubject(""); setDescription(""); setCategory("connection"); setPriority("normal"); setIncludeTeam(true); };

  const submit = async () => {
    if (!user) { toast.error("Please sign in first."); return; }
    if (subject.trim().length < 4) { toast.error("Subject must be at least 4 characters."); return; }
    if (description.trim().length < 10) { toast.error("Description must be at least 10 characters."); return; }
    setBusy(true);
    try {
      await createSupportTicket({
        subject, description, category, priority,
        team_id: includeTeam && team?.team_id ? team.team_id : null,
      });
      toast.success("Ticket submitted");
      reset();
      setOpen(false);
      onCreated();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to create ticket");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm"><Plus className="mr-1 h-3.5 w-3.5" />New ticket</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New support ticket</DialogTitle>
          <DialogDescription>Tell us what's happening and we'll get back to you by email.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="t-subject">Subject</Label>
            <Input id="t-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Short summary" maxLength={120} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TicketCategory)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{CATEGORY_LABEL[c]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TicketPriority)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TICKET_PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-desc">Description</Label>
            <Textarea id="t-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} placeholder="Steps to reproduce, error messages, what you expected…" maxLength={4000} />
          </div>
          {team?.team_id && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={includeTeam} onChange={(e) => setIncludeTeam(e.target.checked)} className="rounded border-border" />
              Visible to team admins of <span className="font-medium text-foreground">{(team as any).teams?.name ?? "your team"}</span>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit ticket"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TicketDrawer({ ticket, onClose, onChanged }: { ticket: SupportTicket | null; onClose: () => void; onChanged: () => void }) {
  if (!ticket) return null;
  return (
    <Sheet open={!!ticket} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>{ticket.subject}</SheetTitle>
          <SheetDescription>Ticket #{ticket.id.slice(0, 8)} · {CATEGORY_LABEL[ticket.category]}</SheetDescription>
        </SheetHeader>
        <div className="mt-4">
          <TicketDetailPanel ticket={ticket} onChanged={onChanged} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

