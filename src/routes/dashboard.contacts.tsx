import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Star, StarOff, Edit3, Trash2, Zap, Users as UsersIcon, BookUser, RefreshCw, AlertCircle, Inbox } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/contacts")({
  head: () => ({ meta: [{ title: "Contacts — RemoteDesk" }] }),
  component: ContactsPage,
});

type Contact = {
  id: string;
  owner_id: string;
  team_id: string | null;
  display_name: string;
  remote_desk_id: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  tags: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
};

function useContacts() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["device_contacts", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Contact[]> => {
      const { data, error } = await supabase
        .from("device_contacts")
        .select("*")
        .order("is_favorite", { ascending: false })
        .order("display_name", { ascending: true });
      if (error) throw error;
      return (data as Contact[]) ?? [];
    },
  });
}

function ContactsPage() {
  const { user } = useAuth();
  const { data: team } = useCurrentTeam();
  const qc = useQueryClient();
  const contacts = useContacts();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [editing, setEditing] = useState<Contact | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["device_contacts"] });

  const all = contacts.data ?? [];
  const allTags = useMemo(() => Array.from(new Set(all.flatMap((c) => c.tags))).sort(), [all]);
  const filtered = all.filter((c) => {
    if (tagFilter && !c.tags.includes(tagFilter)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.display_name.toLowerCase().includes(q) ||
      (c.remote_desk_id ?? "").toLowerCase().includes(q) ||
      (c.email ?? "").toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const toggleFavorite = async (c: Contact) => {
    const { error } = await supabase.from("device_contacts").update({ is_favorite: !c.is_favorite }).eq("id", c.id);
    if (error) return toast.error(error.message);
    invalidate();
  };
  const remove = async (c: Contact) => {
    if (!confirm(`Delete contact "${c.display_name}"?`)) return;
    const { error } = await supabase.from("device_contacts").delete().eq("id", c.id);
    if (error) return toast.error(error.message);
    toast.success("Contact deleted");
    invalidate();
  };
  const connect = (c: Contact) => {
    if (!c.remote_desk_id) return toast.error("No RemoteDesk ID set for this contact.");
    toast.success(`Requesting connection to ${c.remote_desk_id}…`);
  };

  return (
    <AppShell title="Address book">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Contacts</h2>
          <p className="text-sm text-muted-foreground">People and devices you connect to most.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} disabled={!user}>
          <Plus className="mr-1 h-4 w-4" /> New contact
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-9 pl-8" placeholder="Search by name, ID, email, tag…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button variant="ghost" size="sm" onClick={() => contacts.refetch()} disabled={contacts.isLoading}>
          <RefreshCw className={`h-3.5 w-3.5 ${contacts.isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {allTags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <button onClick={() => setTagFilter(null)} className={`rounded-full border px-2.5 py-0.5 text-xs ${tagFilter === null ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/40"}`}>All</button>
          {allTags.map((t) => (
            <button key={t} onClick={() => setTagFilter(t === tagFilter ? null : t)} className={`rounded-full border px-2.5 py-0.5 text-xs ${tagFilter === t ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted/40"}`}>
              #{t}
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 rounded-lg border border-border bg-card">
        {contacts.isLoading && (
          <div className="space-y-2 p-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        )}
        {!contacts.isLoading && contacts.error && (
          <div className="px-4 py-10 text-center text-sm text-destructive">
            <AlertCircle className="mx-auto mb-2 h-5 w-5" />
            {(contacts.error as Error).message}
          </div>
        )}
        {!contacts.isLoading && !contacts.error && filtered.length === 0 && (
          <div className="px-4 py-14 text-center text-sm text-muted-foreground">
            <BookUser className="mx-auto mb-2 h-6 w-6 opacity-60" />
            {all.length === 0 ? "Your address book is empty. Add the people and machines you connect to." : "No contacts match these filters."}
            {all.length === 0 && (
              <div className="mt-3"><Button size="sm" onClick={() => setCreateOpen(true)}><Plus className="mr-1 h-3.5 w-3.5" />Add your first contact</Button></div>
            )}
          </div>
        )}
        {!contacts.isLoading && !contacts.error && filtered.length > 0 && (
          <div className="divide-y divide-border">
            {filtered.map((c) => (
              <div key={c.id} className="flex flex-wrap items-center gap-3 p-3 sm:p-4">
                <button onClick={() => toggleFavorite(c)} aria-label="Toggle favorite" className="text-muted-foreground hover:text-amber-400">
                  {c.is_favorite ? <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> : <StarOff className="h-4 w-4" />}
                </button>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase">{c.display_name.slice(0, 2)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {c.display_name}
                    {c.team_id && <Badge variant="outline" className="text-[10px]"><UsersIcon className="mr-1 h-3 w-3" />Team</Badge>}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {c.remote_desk_id ? <span className="font-mono">{c.remote_desk_id}</span> : "—"}
                    {c.email && <> · {c.email}</>}
                  </div>
                  {c.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {c.tags.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">#{t}</Badge>)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" onClick={() => connect(c)} disabled={!c.remote_desk_id}><Zap className="mr-1 h-3.5 w-3.5" />Connect</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(c)}><Edit3 className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(c)} className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ContactDialog
        open={createOpen || !!editing}
        onOpenChange={(o) => { if (!o) { setCreateOpen(false); setEditing(null); } }}
        contact={editing}
        teamId={team?.team_id ?? null}
        userId={user?.id ?? null}
        onSaved={() => { invalidate(); setCreateOpen(false); setEditing(null); }}
      />
    </AppShell>
  );
}

function ContactDialog({
  open, onOpenChange, contact, teamId, userId, onSaved,
}: {
  open: boolean; onOpenChange: (b: boolean) => void; contact: Contact | null; teamId: string | null; userId: string | null; onSaved: () => void;
}) {
  const [name, setName] = useState(contact?.display_name ?? "");
  const [rdId, setRdId] = useState(contact?.remote_desk_id ?? "");
  const [email, setEmail] = useState(contact?.email ?? "");
  const [phone, setPhone] = useState(contact?.phone ?? "");
  const [notes, setNotes] = useState(contact?.notes ?? "");
  const [tags, setTags] = useState((contact?.tags ?? []).join(", "));
  const [shareTeam, setShareTeam] = useState(!!contact?.team_id);
  const [busy, setBusy] = useState(false);

  // Reset when opened with different contact
  useMemo(() => {
    setName(contact?.display_name ?? "");
    setRdId(contact?.remote_desk_id ?? "");
    setEmail(contact?.email ?? "");
    setPhone(contact?.phone ?? "");
    setNotes(contact?.notes ?? "");
    setTags((contact?.tags ?? []).join(", "));
    setShareTeam(!!contact?.team_id);
  }, [contact?.id, open]);

  const save = async () => {
    if (!userId) return toast.error("Please sign in.");
    if (name.trim().length < 2) return toast.error("Name is required.");
    setBusy(true);
    const payload = {
      owner_id: userId,
      team_id: shareTeam ? teamId : null,
      display_name: name.trim(),
      remote_desk_id: rdId.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
    const q = contact
      ? supabase.from("device_contacts").update(payload).eq("id", contact.id)
      : supabase.from("device_contacts").insert(payload);
    const { error } = await q;
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(contact ? "Contact updated" : "Contact added");
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{contact ? "Edit contact" : "New contact"}</DialogTitle>
          <DialogDescription>Used for quick connections from the dashboard.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Display name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>RemoteDesk ID</Label><Input value={rdId} onChange={(e) => setRdId(e.target.value)} placeholder="123 456 789" className="font-mono" /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          </div>
          <div className="space-y-1.5"><Label>Tags (comma-separated)</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="client, office, server" /></div>
          <div className="space-y-1.5"><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></div>
          {teamId && (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" checked={shareTeam} onChange={(e) => setShareTeam(e.target.checked)} className="rounded border-border" />
              Share with team
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
