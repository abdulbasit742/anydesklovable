import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Code2, Terminal, KeyRound, BookOpen, Plus, Trash2, Eye, EyeOff } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useApiKeys, createApiKey, revokeApiKey, type CreatedApiKey } from "@/lib/services";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { PanelState } from "@/components/app/DataState";
import { StatusBadge } from "@/components/app/StatusBadge";

export const Route = createFileRoute("/dashboard/developer")({
  head: () => ({ meta: [{ title: "Developer & SDK — RemoteDesk" }] }),
  component: DeveloperPage,
});

const SNIPPETS = {
  install: `# npm\nnpm install @remotedesk/sdk\n\n# pnpm\npnpm add @remotedesk/sdk\n\n# bun\nbun add @remotedesk/sdk`,
  init: `import { RemoteDeskAPI } from "@remotedesk/sdk";\n\nexport const rd = new RemoteDeskAPI({\n  apiKey: process.env.REMOTEDESK_API_KEY!,\n  baseUrl: "https://api.remotedesk.io/v1",\n});`,
  verify: `# Verify an API key against the public endpoint\ncurl -H "Authorization: Bearer rd_live_..." \\\n  https://<your-app>/api/public/v1/me`,
  sessions: `// List recent remote sessions for the current team\nconst { data: sessions } = await rd.sessions.list({\n  teamId: "<team-id>",\n  limit: 20,\n  order: "started_at.desc",\n});`,
  devices: `// Lookup a device by RemoteDesk ID\nconst device = await rd.devices.getByRemoteDeskId("123 456 789");`,
};

function DeveloperPage() {
  return (
    <AppShell title="Developer & SDK">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Code2 className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-semibold">Build with the RemoteDesk SDK</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Programmatic access to devices, sessions, contacts, and auth. Manage API keys below and verify them against <code className="font-mono">/api/public/v1/me</code>.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">TypeScript</Badge>
              <Badge variant="outline">Node 18+</Badge>
              <Badge variant="outline">Edge runtimes</Badge>
              <Badge variant="secondary">v1 stable</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <ApiKeysSection />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Snippet icon={<Terminal className="h-4 w-4" />} title="1 · Install" code={SNIPPETS.install} />
          <Snippet icon={<KeyRound className="h-4 w-4" />} title="2 · Initialize" code={SNIPPETS.init} />
          <Snippet icon={<Code2 className="h-4 w-4" />} title="3 · Verify your key" code={SNIPPETS.verify} />
          <Snippet icon={<Code2 className="h-4 w-4" />} title="4 · Sessions history" code={SNIPPETS.sessions} />
          <Snippet icon={<Code2 className="h-4 w-4" />} title="5 · Device lookup" code={SNIPPETS.devices} />
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4" /> Docs</div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>· REST API reference</li>
              <li>· SDK guides (Node, browser, Workers)</li>
              <li>· Webhooks &amp; events</li>
              <li>· Rate limits &amp; quotas</li>
            </ul>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            Secrets are only shown once at creation. Store them in your platform's secret manager — RemoteDesk only keeps a hash.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

// ---------- API Keys section ----------
function ApiKeysSection() {
  const qc = useQueryClient();
  const { data: team } = useCurrentTeam();
  const keys = useApiKeys();
  const canManage = team?.role === "owner" || team?.role === "admin";

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"read" | "read_write">("read");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const [reveal, setReveal] = useState(false);

  async function handleCreate() {
    if (!team?.team_id) return;
    if (!name.trim()) { toast.error("Name is required"); return; }
    setCreating(true);
    try {
      const result = await createApiKey({
        teamId: team.team_id,
        name: name.trim(),
        scopes: scope === "read_write" ? ["read", "write"] : ["read"],
      });
      setCreated(result);
      setReveal(true);
      setName("");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string, label: string) {
    try {
      await revokeApiKey(id);
      toast.success(`Revoked ${label}`);
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div>
          <div className="text-sm font-semibold flex items-center gap-2"><KeyRound className="h-4 w-4" /> API keys</div>
          <div className="text-xs text-muted-foreground">Personal-style keys scoped to this workspace. Secrets are shown once.</div>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setCreated(null); setReveal(false); } }}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!canManage} title={canManage ? "" : "Owners and admins only"}>
              <Plus className="mr-1.5 h-4 w-4" /> New key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{created ? "Save your new API key" : "Create API key"}</DialogTitle>
              <DialogDescription>
                {created
                  ? "Copy the secret now — it will not be shown again."
                  : "Give your key a recognizable name and choose its scope."}
              </DialogDescription>
            </DialogHeader>

            {!created ? (
              <div className="space-y-3">
                <div>
                  <Label htmlFor="key-name" className="text-xs">Name</Label>
                  <Input id="key-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="CI deploy bot" />
                </div>
                <div>
                  <Label className="text-xs">Scope</Label>
                  <Select value={scope} onValueChange={(v) => setScope(v as "read" | "read_write")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">Read only</SelectItem>
                      <SelectItem value="read_write">Read &amp; write</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                  Store this secret in a password manager or your platform's secret store. RemoteDesk only keeps a one-way hash.
                </div>
                <div className="flex items-stretch gap-2">
                  <Input
                    readOnly
                    value={reveal ? created.full_key : created.full_key.replace(/^(.{12}).*$/, "$1••••••••••••••••••")}
                    className="font-mono text-xs"
                  />
                  <Button size="icon" variant="outline" onClick={() => setReveal((r) => !r)} title={reveal ? "Hide" : "Reveal"}>
                    {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="outline" onClick={async () => {
                    await navigator.clipboard.writeText(created.full_key);
                    toast.success("Copied");
                  }} title="Copy">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            <DialogFooter>
              {!created ? (
                <Button onClick={handleCreate} disabled={creating}>
                  {creating ? "Creating…" : "Create key"}
                </Button>
              ) : (
                <Button onClick={() => setOpen(false)}>Done</Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <PanelState loading={keys.isLoading} error={keys.error} empty={keys.data.length === 0} emptyText="No API keys yet. Create one to start calling the API.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Prefix</th>
                <th className="px-4 py-2 text-left font-medium">Scopes</th>
                <th className="px-4 py-2 text-left font-medium">Last used</th>
                <th className="px-4 py-2 text-left font-medium">Created</th>
                <th className="px-4 py-2 text-left font-medium">Status</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {keys.data.map((k) => {
                const revoked = !!k.revoked_at;
                const expired = !!k.expires_at && new Date(k.expires_at) < new Date();
                return (
                  <tr key={k.id} className="border-t border-border">
                    <td className="px-4 py-2 font-medium">{k.name}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{k.key_prefix}…</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-1">
                        {k.scopes.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">{k.last_used_at ? formatDistanceToNow(new Date(k.last_used_at), { addSuffix: true }) : "Never"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{formatDistanceToNow(new Date(k.created_at), { addSuffix: true })}</td>
                    <td className="px-4 py-2">
                      <StatusBadge variant={revoked ? "rejected" : expired ? "neutral" : "paid"}>
                        {revoked ? "revoked" : expired ? "expired" : "active"}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {!revoked && canManage && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive">
                              <Trash2 className="mr-1 h-3.5 w-3.5" /> Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke {k.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Any service using this key will immediately fail authentication. This cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleRevoke(k.id, k.name)}>Revoke</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PanelState>
    </div>
  );
}

function Snippet({ icon, title, code }: { icon: React.ReactNode; title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</div>
        <Button size="sm" variant="ghost" onClick={copy}><Copy className="mr-1 h-3.5 w-3.5" />{copied ? "Copied" : "Copy"}</Button>
      </div>
      <pre className="overflow-x-auto bg-muted/30 px-4 py-3 text-xs leading-relaxed text-foreground/90"><code>{code}</code></pre>
    </div>
  );
}
