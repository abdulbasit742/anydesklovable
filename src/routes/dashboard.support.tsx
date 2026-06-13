import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { LifeBuoy, Search, MessageSquare, BookOpen, Mail, Plus } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supportArticles, supportTickets } from "@/lib/mock-data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/support")({
  head: () => ({ meta: [{ title: "Support — RemoteDesk" }] }),
  component: SupportPage,
});

function SupportPage() {
  const [q, setQ] = useState("");
  const articles = supportArticles.filter((a) =>
    q === "" || a.title.toLowerCase().includes(q.toLowerCase()) || a.excerpt.toLowerCase().includes(q.toLowerCase()),
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
            <Input className="h-11 pl-9" placeholder="Search help articles…" value={q} onChange={(e) => setQ(e.target.value)} />
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
            <div className="border-b border-border px-4 py-3 text-sm font-semibold">Your tickets</div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium">ID</th>
                    <th className="px-4 py-2 text-left font-medium">Subject</th>
                    <th className="px-4 py-2 text-left font-medium">Status</th>
                    <th className="px-4 py-2 text-left font-medium">Priority</th>
                    <th className="px-4 py-2 text-left font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {supportTickets.map((t) => (
                    <tr key={t.id} className="border-t border-border">
                      <td className="px-4 py-2 font-mono text-xs">{t.id}</td>
                      <td className="px-4 py-2">{t.subject}</td>
                      <td className="px-4 py-2 capitalize text-muted-foreground">{t.status}</td>
                      <td className="px-4 py-2 capitalize text-muted-foreground">{t.priority}</td>
                      <td className="px-4 py-2 text-muted-foreground">{t.updated}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <form
            className="rounded-lg border border-border bg-card p-4"
            onSubmit={(e) => { e.preventDefault(); toast.success("Ticket submitted"); }}
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Plus className="h-4 w-4" /> New ticket
            </div>
            <div className="mt-3 space-y-2">
              <Input placeholder="Subject" required />
              <Textarea placeholder="Describe the issue…" rows={4} required />
              <Button type="submit" className="w-full">Submit ticket</Button>
            </div>
          </form>
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
    </AppShell>
  );
}
