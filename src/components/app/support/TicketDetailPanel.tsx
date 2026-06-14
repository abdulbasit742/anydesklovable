import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertCircle, Paperclip, MessageSquare, Lock, Activity, Download,
  CheckCircle2, RotateCcw, Inbox, Trash2, UserPlus, Timer, Upload,
} from "lucide-react";
import {
  useTicketComments, useTicketAttachments, useTicketEvents, useTicketRealtime,
  addTicketComment, softDeleteComment, uploadTicketAttachment, softDeleteAttachment,
  getAttachmentDownloadUrl, useAssignableAgents,
  changeTicketStatus, changeTicketPriority, assignSupportTicket,
  closeSupportTicket, reopenSupportTicket,
  canTriageTicket, TICKET_PRIORITIES, TICKET_STATUSES,
  ticketSlaState, SUPPORT_MAX_SIZE_MB,
  type SupportTicket, type TicketStatus, type TicketPriority, type SupportTicketEventType,
  type SupportTicketAttachment,
} from "@/lib/services";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";


const ALLOWED_MIME = ["image/png","image/jpeg","application/pdf","text/plain","application/zip","application/json"];
const MAX_SIZE_MB = 25;

function fmtTime(iso: string) { return new Date(iso).toLocaleString(); }
function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

function statusVariant(s: TicketStatus): "default" | "secondary" | "outline" | "destructive" {
  return s === "open" ? "default" : s === "pending" ? "secondary" : "outline";
}
function priorityVariant(p: TicketPriority): "default" | "secondary" | "outline" | "destructive" {
  return p === "urgent" ? "destructive" : p === "high" ? "default" : p === "normal" ? "secondary" : "outline";
}

const EVENT_LABEL: Record<SupportTicketEventType, string> = {
  ticket_created: "Ticket created",
  comment_added: "Reply added",
  internal_note_added: "Internal note added",
  attachment_added: "Attachment uploaded",
  status_changed: "Status changed",
  priority_changed: "Priority changed",
  assigned: "Assigned",
  unassigned: "Unassigned",
  ticket_closed: "Ticket closed",
  ticket_reopened: "Ticket reopened",
};

export function TicketDetailPanel({ ticket, onChanged }: { ticket: SupportTicket; onChanged: () => void }) {
  const { user } = useAuth();
  const { data: team } = useCurrentTeam();
  const role = (team as { role?: string } | null | undefined)?.role as
    | "owner" | "admin" | "support" | "member" | undefined;
  const canTriage = canTriageTicket(ticket, role ?? null);
  const isOwner = user?.id === ticket.user_id;
  const canReply = isOwner || canTriage;

  const comments = useTicketComments(ticket.id);
  const attachments = useTicketAttachments(ticket.id);
  const events = useTicketEvents(ticket.id);
  useTicketRealtime(ticket.id);

  // First public reply from someone other than the requester == first response
  const firstReplyAt = (comments.data ?? []).find((c) => !c.is_internal && c.author_id !== ticket.user_id)?.created_at ?? null;
  const sla = ticketSlaState(ticket, firstReplyAt);

  const qc = useQueryClient();
  const refetchAll = () => {
    qc.invalidateQueries({ queryKey: ["ticket_comments", ticket.id] });
    qc.invalidateQueries({ queryKey: ["ticket_attachments", ticket.id] });
    qc.invalidateQueries({ queryKey: ["ticket_events", ticket.id] });
    qc.invalidateQueries({ queryKey: ["support_tickets"] });
    onChanged();
  };


  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant(ticket.status)} className="capitalize">{ticket.status}</Badge>
        <Badge variant={priorityVariant(ticket.priority)} className="capitalize">{ticket.priority}</Badge>
        <Badge variant="outline" className="capitalize">{ticket.category.replace("_", " ")}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
        <div>Created<br /><span className="text-foreground">{fmtTime(ticket.created_at)}</span></div>
        <div>Updated<br /><span className="text-foreground">{fmtTime(ticket.updated_at)}</span></div>
        {ticket.assigned_to && <div className="col-span-2">Assigned to<br /><span className="font-mono text-foreground">{ticket.assigned_to.slice(0, 8)}…</span></div>}
      </div>

      <div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Description</div>
        <div className="rounded-md border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">{ticket.description}</div>
      </div>

      <SlaPanel sla={sla} />

      {canTriage && <TriageControls ticket={ticket} onChanged={refetchAll} />}


      {/* Comments */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><MessageSquare className="h-4 w-4" /> Conversation</h3>
        {comments.isLoading && <Skeleton className="h-16 w-full" />}
        {comments.error && <ErrorRow msg={comments.error.message} onRetry={() => comments.refetch()} />}
        {!comments.isLoading && !comments.error && comments.data?.length === 0 && (
          <EmptyRow icon={<Inbox className="h-4 w-4" />} text="No replies yet." />
        )}
        <div className="space-y-3">
          {comments.data?.map((c) => {
            const authorName = c.author?.full_name || c.author?.email || c.author_id.slice(0, 8);
            const mine = c.author_id === user?.id;
            return (
              <div key={c.id} className={`rounded-md border p-3 text-sm ${c.is_internal ? "border-amber-500/40 bg-amber-500/5" : "border-border bg-card"}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-medium text-foreground">{authorName}</span>
                    {c.is_internal && <Badge variant="outline" className="gap-1 border-amber-500/50 text-amber-600 dark:text-amber-400"><Lock className="h-3 w-3" />Internal</Badge>}
                    <span className="text-muted-foreground">· {fmtTime(c.created_at)}</span>
                  </div>
                  {(mine || canTriage) && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" title="Delete"
                      onClick={async () => { try { await softDeleteComment(c.id); toast.success("Comment removed"); refetchAll(); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
                <div className="mt-1 whitespace-pre-wrap">{c.body}</div>
              </div>
            );
          })}
        </div>

        {canReply && <ReplyBox ticketId={ticket.id} canInternal={canTriage} onPosted={refetchAll} />}
      </section>

      {/* Attachments */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Paperclip className="h-4 w-4" /> Attachments</h3>
        {attachments.isLoading && <Skeleton className="h-10 w-full" />}
        {attachments.error && <ErrorRow msg={attachments.error.message} onRetry={() => attachments.refetch()} />}
        {!attachments.isLoading && !attachments.error && attachments.data?.length === 0 && (
          <EmptyRow icon={<Paperclip className="h-4 w-4" />} text="No attachments." />
        )}
        <ul className="space-y-2">
          {attachments.data?.map((a) => (
            <li key={a.id} className="flex items-center justify-between rounded-md border border-border bg-card p-2.5 text-sm">
              <div className="min-w-0">
                <div className="truncate font-medium">{a.file_name}</div>
                <div className="text-xs text-muted-foreground">
                  {fmtBytes(a.file_size)} · {a.mime_type ?? "unknown"} · <ScanBadge status={a.scan_status} />
                </div>
              </div>
              <div className="flex items-center gap-1">
                {a.storage_path && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Download"
                    onClick={async () => {
                      try { const url = await getAttachmentDownloadUrl(a); window.open(url, "_blank", "noopener"); }
                      catch (e: any) { toast.error(e?.message ?? "Download failed"); }
                    }}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                )}
                {(a.uploaded_by === user?.id || canTriage) && (
                  <Button variant="ghost" size="icon" className="h-7 w-7" title="Remove"
                    onClick={async () => { try { await softDeleteAttachment(a.id); toast.success("Removed"); refetchAll(); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
        {canReply && <AttachmentUploader ticketId={ticket.id} onAdded={refetchAll} />}
        <p className="mt-2 text-xs text-muted-foreground">
          Files are stored in the private <code>support-attachments</code> bucket and served via 60-second signed URLs.
        </p>

      </section>

      {/* Timeline */}
      <section>
        <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Activity className="h-4 w-4" /> Timeline</h3>
        {events.isLoading && <Skeleton className="h-16 w-full" />}
        {events.error && <ErrorRow msg={events.error.message} onRetry={() => events.refetch()} />}
        <ol className="space-y-1.5 text-xs">
          {events.data?.map((e) => (
            <li key={e.id} className="flex items-baseline justify-between gap-2 border-l-2 border-border pl-3">
              <span>
                <span className="font-medium text-foreground">{EVENT_LABEL[e.event_type]}</span>
                {e.from_value && e.to_value && <span className="text-muted-foreground"> · {e.from_value} → {e.to_value}</span>}
                {!e.from_value && e.to_value && <span className="text-muted-foreground"> · {e.to_value}</span>}
              </span>
              <span className="shrink-0 text-muted-foreground">{fmtTime(e.created_at)}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Close / reopen */}
      {isOwner && (
        <div className="flex flex-wrap gap-2 border-t border-border pt-4">
          {ticket.status !== "closed" ? (
            <Button variant="destructive" size="sm"
              onClick={async () => { try { await closeSupportTicket(ticket.id); toast.success("Ticket closed"); refetchAll(); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }}>
              <CheckCircle2 className="mr-1 h-4 w-4" /> Close ticket
            </Button>
          ) : (
            <Button variant="outline" size="sm"
              onClick={async () => { try { await reopenSupportTicket(ticket.id); toast.success("Ticket reopened"); refetchAll(); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }}>
              <RotateCcw className="mr-1 h-4 w-4" /> Reopen
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function ScanBadge({ status }: { status: "pending" | "clean" | "blocked" | "failed" }) {
  const cls = status === "clean" ? "text-emerald-600" : status === "blocked" || status === "failed" ? "text-destructive" : "text-muted-foreground";
  return <span className={`capitalize ${cls}`}>{status}</span>;
}

function EmptyRow({ icon, text }: { icon: React.ReactNode; text: string }) {
  return <div className="flex items-center gap-2 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">{icon}{text}</div>;
}
function ErrorRow({ msg, onRetry }: { msg: string; onRetry: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
      <span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{msg}</span>
      <Button size="sm" variant="outline" onClick={onRetry}>Retry</Button>
    </div>
  );
}

function TriageControls({ ticket, onChanged }: { ticket: SupportTicket; onChanged: () => void }) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const agents = useAssignableAgents(ticket.team_id);
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Triage</div>
      <div className="grid grid-cols-2 gap-2">
        <Select value={ticket.status} onValueChange={async (v) => { try { await changeTicketStatus(ticket.id, v as TicketStatus); toast.success("Status updated"); onChanged(); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{TICKET_STATUSES.map((s) => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={ticket.priority} onValueChange={async (v) => { try { await changeTicketPriority(ticket.id, v as TicketPriority); toast.success("Priority updated"); onChanged(); } catch (e: any) { toast.error(e?.message ?? "Failed"); } }}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>{TICKET_PRIORITIES.map((p) => <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>)}</SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center gap-1.5 text-xs"><UserPlus className="h-3.5 w-3.5" /> Assignee</Label>
        <Select
          value={ticket.assigned_to ?? "__unassigned"}
          onValueChange={async (v) => {
            try {
              await assignSupportTicket(ticket.id, v === "__unassigned" ? null : v);
              toast.success(v === "__unassigned" ? "Unassigned" : "Assigned");
              onChanged();
            } catch (e: any) { toast.error(e?.message ?? "Failed"); }
          }}>
          <SelectTrigger className="h-9"><SelectValue placeholder="Unassigned" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__unassigned">Unassigned</SelectItem>
            {(agents.data ?? []).map((a) => (
              <SelectItem key={a.user_id} value={a.user_id}>{a.name} <span className="ml-1 text-[10px] text-muted-foreground capitalize">· {a.role}</span></SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="internal-note" className="text-xs">Internal note (hidden from customer)</Label>
        <Textarea id="internal-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note visible only to admins/support…" />
        <Button size="sm" variant="secondary" disabled={busy || note.trim().length < 1}
          onClick={async () => {
            setBusy(true);
            try { await addTicketComment(ticket.id, note, true); setNote(""); toast.success("Internal note added"); onChanged(); }
            catch (e: any) { toast.error(e?.message ?? "Failed"); }
            finally { setBusy(false); }
          }}>
          <Lock className="mr-1 h-3.5 w-3.5" /> Save internal note
        </Button>
      </div>
    </div>
  );
}

function ReplyBox({ ticketId, canInternal, onPosted }: { ticketId: string; canInternal: boolean; onPosted: () => void }) {
  const [text, setText] = useState("");
  const [internal, setInternal] = useState(false);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (text.trim().length < 1) return;
    setBusy(true);
    try { await addTicketComment(ticketId, text, internal); setText(""); setInternal(false); toast.success("Reply posted"); onPosted(); }
    catch (e: any) { toast.error(e?.message ?? "Failed"); }
    finally { setBusy(false); }
  };
  return (
    <div className="mt-3 space-y-2">
      <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Write a reply…" maxLength={4000} />
      <div className="flex items-center justify-between">
        {canInternal ? (
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} className="rounded border-border" />
            Post as internal note
          </label>
        ) : <span />}
        <Button size="sm" onClick={submit} disabled={busy || text.trim().length < 1}>{busy ? "Posting…" : "Post reply"}</Button>
      </div>
    </div>
  );
}

function AttachmentUploader({ ticketId, onAdded }: { ticketId: string; onAdded: () => void }) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const onPick = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      for (const f of Array.from(files)) {
        await uploadTicketAttachment(ticketId, f);
      }
      toast.success(files.length === 1 ? "File uploaded" : `${files.length} files uploaded`);
      onAdded();
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setBusy(false);
      if (ref.current) ref.current.value = "";
    }
  };
  return (
    <div className="mt-3 rounded-md border border-dashed border-border p-3">
      <input ref={ref} type="file" multiple className="hidden"
        onChange={(e) => onPick(e.target.files)} />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-muted-foreground">PNG, JPEG, PDF, TXT, ZIP, JSON · up to {SUPPORT_MAX_SIZE_MB} MB each</div>
        <Button size="sm" variant="outline" disabled={busy} onClick={() => ref.current?.click()}>
          <Upload className="mr-1.5 h-4 w-4" /> {busy ? "Uploading…" : "Upload files"}
        </Button>
      </div>
    </div>
  );
}

type SlaState = ReturnType<typeof ticketSlaState>;
function SlaPanel({ sla }: { sla: SlaState }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <SlaCard label="First response" item={sla.firstResponse} />
      <SlaCard label="Resolution" item={sla.resolution} />
    </div>
  );
}

function SlaCard({ label, item }: { label: string; item: SlaState["firstResponse"] }) {
  const tone =
    item.status === "met" ? "border-emerald-500/40 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400" :
    item.status === "breached" ? "border-destructive/40 bg-destructive/5 text-destructive" :
    "border-amber-500/40 bg-amber-500/5 text-amber-700 dark:text-amber-400";
  const now = Date.now();
  const verb =
    item.status === "met" ? `met ${formatDistanceToNow(item.at!, { addSuffix: true })}` :
    item.status === "breached" && item.at ? `breached, completed ${formatDistanceToNow(item.at, { addSuffix: true })}` :
    item.status === "breached" ? `breached ${formatDistanceToNow(item.deadline, { addSuffix: true })}` :
    `due ${formatDistanceToNow(item.deadline, { addSuffix: true })}`;
  const pct =
    item.at ? Math.min(100, Math.round(((item.at - (item.deadline - (item.deadline - (item.deadline - now)))) / (item.deadline - now + 1)) * 100))
    : Math.min(100, Math.max(0, Math.round(((now - (item.deadline - (item.deadline - now))) / Math.max(1, item.deadline - (item.deadline - now))) * 100)));
  return (
    <div className={`rounded-md border p-3 ${tone}`}>
      <div className="flex items-center gap-1.5 text-xs font-semibold"><Timer className="h-3.5 w-3.5" /> {label}</div>
      <div className="mt-1 text-sm">{verb}</div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-foreground/10">
        <div className="h-full bg-current opacity-60" style={{ width: `${Math.min(100, Math.max(4, pct))}%` }} />
      </div>
      <div className="mt-1 text-[11px] opacity-70">Target {new Date(item.deadline).toLocaleString()}</div>
    </div>
  );
}

