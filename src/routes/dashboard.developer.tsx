import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Code2, Terminal, KeyRound, BookOpen, Plus, Trash2, Eye, EyeOff, Webhook, Activity, Gauge, FlaskConical, PlayCircle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  useDeveloperOverview, useApiRequestLogs, useApiRateLimitEvents,
  useWebhookEndpoints, useCreateWebhookEndpoint, useDisableWebhookEndpoint,
  useTestWebhookEndpoint, useWebhookDeliveries,
  API_SCOPES, WEBHOOK_EVENT_TYPES,
} from "@/lib/services/developer";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { PanelState } from "@/components/app/DataState";
import { StatusBadge } from "@/components/app/StatusBadge";
import { MetricCard } from "@/components/app/MetricCard";

export const Route = createFileRoute("/dashboard/developer")({
  head: () => ({ meta: [{ title: "Developer Platform — RemoteDesk" }] }),
  component: DeveloperPage,
});

const BASE_URL_PLACEHOLDER = "https://<your-remotedesk-domain>";

function DeveloperPage() {
  return (
    <AppShell title="Developer Platform">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Code2 className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-semibold">RemoteDesk Public API v1</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Programmatic access to devices, sessions, automation, support, audit logs, and webhooks.
              Manage API keys, inspect request logs, and configure outbound webhook endpoints.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">REST / JSON</Badge>
              <Badge variant="outline">Bearer auth</Badge>
              <Badge variant="outline">Scoped keys</Badge>
              <Badge variant="secondary">v1 stable</Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="mt-6">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview"><Activity className="mr-1.5 h-3.5 w-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="keys"><KeyRound className="mr-1.5 h-3.5 w-3.5" />API Keys</TabsTrigger>
          <TabsTrigger value="logs"><Terminal className="mr-1.5 h-3.5 w-3.5" />API Logs</TabsTrigger>
          <TabsTrigger value="rate-limits"><Gauge className="mr-1.5 h-3.5 w-3.5" />Rate Limits</TabsTrigger>
          <TabsTrigger value="webhooks"><Webhook className="mr-1.5 h-3.5 w-3.5" />Webhooks</TabsTrigger>
          <TabsTrigger value="docs"><BookOpen className="mr-1.5 h-3.5 w-3.5" />Docs</TabsTrigger>
          <TabsTrigger value="playground"><FlaskConical className="mr-1.5 h-3.5 w-3.5" />Playground</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4"><OverviewTab /></TabsContent>
        <TabsContent value="keys" className="mt-4"><ApiKeysSection /></TabsContent>
        <TabsContent value="logs" className="mt-4"><ApiLogsTab /></TabsContent>
        <TabsContent value="rate-limits" className="mt-4"><RateLimitsTab /></TabsContent>
        <TabsContent value="webhooks" className="mt-4"><WebhooksTab /></TabsContent>
        <TabsContent value="docs" className="mt-4"><DocsTab /></TabsContent>
        <TabsContent value="playground" className="mt-4"><PlaygroundTab /></TabsContent>
      </Tabs>
    </AppShell>
  );
}

// ---------- Overview ----------
function OverviewTab() {
  const overview = useDeveloperOverview();
  const o = overview.data;
  return (
    <PanelState loading={overview.isLoading} error={overview.error as Error | null} empty={!o} emptyText="No API activity yet.">
      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
        <MetricCard label="Active API keys" value={o?.active_keys ?? 0} />
        <MetricCard label="Requests (24h)" value={o?.requests_24h ?? 0} />
        <MetricCard label="Failed requests (24h)" value={o?.failed_requests_24h ?? 0} />
        <MetricCard label="Rate-limited (24h)" value={o?.rate_limited_24h ?? 0} />
        <MetricCard label="Webhook endpoints" value={o?.webhook_endpoints ?? 0} />
        <MetricCard label="Webhook deliveries (24h)" value={o?.webhook_deliveries_24h ?? 0} />
        <MetricCard label="Webhook success (24h)" value={o?.webhook_success_24h ?? 0} />
        <MetricCard label="Webhook failures (24h)" value={o?.webhook_failed_24h ?? 0} />
      </div>
      <div className="mt-4 rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        Base URL: <code className="font-mono">{BASE_URL_PLACEHOLDER}/api/public/v1</code>
      </div>
    </PanelState>
  );
}

// ---------- API Keys (existing flow, extended with scope selector) ----------
function ApiKeysSection() {
  const qc = useQueryClient();
  const { data: team } = useCurrentTeam();
  const keys = useApiKeys();
  const canManage = team?.role === "owner" || team?.role === "admin";

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [scopes, setScopes] = useState<string[]>(["read:team", "read:devices"]);
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<CreatedApiKey | null>(null);
  const [reveal, setReveal] = useState(false);

  async function handleCreate() {
    if (!team?.team_id) return;
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (scopes.length === 0) { toast.error("Pick at least one scope"); return; }
    setCreating(true);
    try {
      const result = await createApiKey({ teamId: team.team_id, name: name.trim(), scopes });
      setCreated(result); setReveal(true); setName("");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key created");
    } catch (e) { toast.error((e as Error).message); }
    finally { setCreating(false); }
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
          <div className="text-xs text-muted-foreground">Keys are scoped per workspace. Secrets are shown once.</div>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setCreated(null); setReveal(false); } }}>
          <DialogTrigger asChild>
            <Button size="sm" disabled={!canManage} title={canManage ? "" : "Owners and admins only"}>
              <Plus className="mr-1.5 h-4 w-4" /> New key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{created ? "Save your new API key" : "Create API key"}</DialogTitle>
              <DialogDescription>
                {created ? "Copy the secret now — it cannot be shown again." : "Name your key and pick its scopes."}
              </DialogDescription>
            </DialogHeader>

            {!created ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="key-name" className="text-xs">Name</Label>
                  <Input id="key-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="CI deploy bot" />
                </div>
                <div>
                  <Label className="text-xs">Scopes</Label>
                  <ScopeSelector value={scopes} onChange={setScopes} />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                  Copy this secret now and store it in your secret manager.
                </div>
                <div className="flex items-stretch gap-2">
                  <Input readOnly value={reveal ? created.full_key : created.full_key.replace(/^(.{12}).*$/, "$1••••••••••••••••••")} className="font-mono text-xs" />
                  <Button size="icon" variant="outline" onClick={() => setReveal((r) => !r)}>{reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
                  <Button size="icon" variant="outline" onClick={async () => { await navigator.clipboard.writeText(created.full_key); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button>
                </div>
              </div>
            )}

            <DialogFooter>
              {!created
                ? <Button onClick={handleCreate} disabled={creating}>{creating ? "Creating…" : "Create key"}</Button>
                : <Button onClick={() => setOpen(false)}>Done</Button>}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <PanelState loading={keys.isLoading} error={keys.error} empty={keys.data.length === 0} emptyText="No API keys yet.">
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
                      <StatusBadge variant={revoked ? "rejected" : expired ? "neutral" : "paid"}>{revoked ? "revoked" : expired ? "expired" : "active"}</StatusBadge>
                    </td>
                    <td className="px-4 py-2 text-right">
                      {!revoked && canManage && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive"><Trash2 className="mr-1 h-3.5 w-3.5" /> Revoke</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Revoke {k.name}?</AlertDialogTitle>
                              <AlertDialogDescription>Any service using this key will fail authentication immediately.</AlertDialogDescription>
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

function ScopeSelector({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const groups = Array.from(new Set(API_SCOPES.map((s) => s.group)));
  function toggle(scope: string) {
    onChange(value.includes(scope) ? value.filter((s) => s !== scope) : [...value, scope]);
  }
  return (
    <div className="mt-1 grid gap-2 rounded-md border border-border bg-background p-3 sm:grid-cols-2">
      {groups.map((group) => (
        <div key={group}>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</div>
          <div className="mt-1 space-y-1.5">
            {API_SCOPES.filter((s) => s.group === group).map((s) => (
              <label key={s.value} className="flex items-center gap-2 text-xs">
                <Checkbox checked={value.includes(s.value)} onCheckedChange={() => toggle(s.value)} />
                <span className="font-mono text-[11px]">{s.value}</span>
                <span className="text-muted-foreground">— {s.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------- API Logs ----------
function ApiLogsTab() {
  const [search, setSearch] = useState("");
  const [method, setMethod] = useState<string>("ALL");
  const logs = useApiRequestLogs({ search: search || undefined, method: method === "ALL" ? undefined : method });
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by path…" className="max-w-xs" />
        <Select value={method} onValueChange={setMethod}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            {["ALL", "GET", "POST", "PATCH", "DELETE"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <PanelState loading={logs.isLoading} error={logs.error as Error | null} empty={(logs.data ?? []).length === 0} emptyText="No API requests recorded yet.">
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Time</th>
                <th className="px-3 py-2 text-left font-medium">Method</th>
                <th className="px-3 py-2 text-left font-medium">Path</th>
                <th className="px-3 py-2 text-left font-medium">Status</th>
                <th className="px-3 py-2 text-left font-medium">Latency</th>
                <th className="px-3 py-2 text-left font-medium">Request ID</th>
              </tr>
            </thead>
            <tbody>
              {(logs.data ?? []).map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2 text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</td>
                  <td className="px-3 py-2"><Badge variant="outline" className="font-mono text-[10px]">{r.method}</Badge></td>
                  <td className="px-3 py-2 font-mono text-xs">{r.path}</td>
                  <td className="px-3 py-2"><Badge variant={r.status_code >= 400 ? "destructive" : "secondary"} className="text-[10px]">{r.status_code}</Badge></td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{r.latency_ms ?? "—"}ms</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{r.request_id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelState>
    </div>
  );
}

// ---------- Rate Limits ----------
function RateLimitsTab() {
  const events = useApiRateLimitEvents(100);
  return (
    <PanelState loading={events.isLoading} error={events.error as Error | null} empty={(events.data ?? []).length === 0} emptyText="No rate-limit events recorded.">
      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-3 py-2 text-left font-medium">Time</th>
              <th className="px-3 py-2 text-left font-medium">Scope</th>
              <th className="px-3 py-2 text-left font-medium">Limit key</th>
              <th className="px-3 py-2 text-left font-medium">Allowed</th>
              <th className="px-3 py-2 text-left font-medium">Remaining</th>
              <th className="px-3 py-2 text-left font-medium">Reset at</th>
              <th className="px-3 py-2 text-left font-medium">Reason</th>
            </tr>
          </thead>
          <tbody>
            {(events.data ?? []).map((e) => (
              <tr key={e.id} className="border-t border-border">
                <td className="px-3 py-2 text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</td>
                <td className="px-3 py-2 font-mono text-xs">{e.scope}</td>
                <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground">{e.limit_key}</td>
                <td className="px-3 py-2"><Badge variant={e.allowed ? "secondary" : "destructive"} className="text-[10px]">{e.allowed ? "allowed" : "blocked"}</Badge></td>
                <td className="px-3 py-2 text-xs">{e.remaining ?? "—"}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{e.reset_at ? new Date(e.reset_at).toLocaleTimeString() : "—"}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{e.reason ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelState>
  );
}

// ---------- Webhooks ----------
function WebhooksTab() {
  const endpoints = useWebhookEndpoints();
  const deliveries = useWebhookDeliveries();
  const create = useCreateWebhookEndpoint();
  const disable = useDisableWebhookEndpoint();
  const test = useTestWebhookEndpoint();
  const { data: team } = useCurrentTeam();
  const canManage = team?.role === "owner" || team?.role === "admin";

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["device.offline", "session.ended"]);
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  function toggleEvent(ev: string) {
    setEvents(events.includes(ev) ? events.filter((e) => e !== ev) : [...events, ev]);
  }
  async function handleCreate() {
    if (!name.trim() || !url.trim() || events.length === 0) {
      toast.error("Name, URL, and at least one event are required."); return;
    }
    try {
      const res = await create.mutateAsync({ name: name.trim(), url: url.trim(), events });
      setCreatedSecret(res.secret);
      setName(""); setUrl("");
      toast.success("Webhook endpoint created");
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
        Deliveries are <strong>queued</strong>. Connect a webhook worker that calls
        <code className="mx-1 font-mono">claim_next_webhook_delivery()</code> to send outbound HTTPS requests.
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold flex items-center gap-2"><Webhook className="h-4 w-4" /> Endpoints</div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCreatedSecret(null); }}>
            <DialogTrigger asChild>
              <Button size="sm" disabled={!canManage}><Plus className="mr-1.5 h-4 w-4" />New endpoint</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{createdSecret ? "Save your signing secret" : "Create webhook endpoint"}</DialogTitle>
                <DialogDescription>
                  {createdSecret ? "Copy this secret now — it will not be shown again." : "We will deliver events to this URL with a signed payload."}
                </DialogDescription>
              </DialogHeader>
              {!createdSecret ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Production alerts" />
                  </div>
                  <div>
                    <Label className="text-xs">URL</Label>
                    <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhooks/remotedesk" />
                  </div>
                  <div>
                    <Label className="text-xs">Events</Label>
                    <div className="mt-1 grid max-h-56 grid-cols-1 gap-1 overflow-y-auto rounded-md border border-border bg-background p-2 sm:grid-cols-2">
                      {WEBHOOK_EVENT_TYPES.map((ev) => (
                        <label key={ev} className="flex items-center gap-2 text-xs">
                          <Checkbox checked={events.includes(ev)} onCheckedChange={() => toggleEvent(ev)} />
                          <span className="font-mono text-[11px]">{ev}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
                    Use this secret to verify the <code className="font-mono">X-RemoteDesk-Signature</code> header on incoming deliveries.
                  </div>
                  <div className="flex items-stretch gap-2">
                    <Input readOnly value={createdSecret} className="font-mono text-xs" />
                    <Button size="icon" variant="outline" onClick={async () => { await navigator.clipboard.writeText(createdSecret); toast.success("Copied"); }}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
              )}
              <DialogFooter>
                {!createdSecret
                  ? <Button onClick={handleCreate} disabled={create.isPending}>{create.isPending ? "Creating…" : "Create endpoint"}</Button>
                  : <Button onClick={() => setOpen(false)}>Done</Button>}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <PanelState loading={endpoints.isLoading} error={endpoints.error as Error | null} empty={(endpoints.data ?? []).length === 0} emptyText="No webhook endpoints yet.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Name</th>
                  <th className="px-3 py-2 text-left font-medium">URL</th>
                  <th className="px-3 py-2 text-left font-medium">Events</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Last delivery</th>
                  <th className="px-3 py-2 text-left font-medium">Failures</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {(endpoints.data ?? []).map((e) => (
                  <tr key={e.id} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">{e.name}</td>
                    <td className="px-3 py-2 font-mono text-[11px] text-muted-foreground max-w-[280px] truncate" title={e.url}>{e.url}</td>
                    <td className="px-3 py-2">
                      <div className="flex flex-wrap gap-1">{e.events.slice(0, 3).map((ev) => <Badge key={ev} variant="outline" className="text-[10px]">{ev}</Badge>)}{e.events.length > 3 && <Badge variant="outline" className="text-[10px]">+{e.events.length - 3}</Badge>}</div>
                    </td>
                    <td className="px-3 py-2"><Badge variant={e.status === "active" ? "secondary" : "outline"} className="text-[10px]">{e.status}</Badge></td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{e.last_delivery_at ? formatDistanceToNow(new Date(e.last_delivery_at), { addSuffix: true }) : "Never"}</td>
                    <td className="px-3 py-2 text-xs">{e.failure_count}</td>
                    <td className="px-3 py-2 text-right">
                      <Button size="sm" variant="ghost" onClick={async () => { try { await test.mutateAsync(e.id); toast.success("Test delivery queued"); } catch (err) { toast.error((err as Error).message); } }}>Test</Button>
                      {canManage && e.status !== "disabled" && (
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={async () => { try { await disable.mutateAsync(e.id); toast.success("Disabled"); } catch (err) { toast.error((err as Error).message); } }}>Disable</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelState>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="border-b border-border px-4 py-3 text-sm font-semibold">Recent deliveries</div>
        <PanelState loading={deliveries.isLoading} error={deliveries.error as Error | null} empty={(deliveries.data ?? []).length === 0} emptyText="No deliveries yet.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left font-medium">Time</th>
                  <th className="px-3 py-2 text-left font-medium">Event</th>
                  <th className="px-3 py-2 text-left font-medium">Status</th>
                  <th className="px-3 py-2 text-left font-medium">Attempts</th>
                  <th className="px-3 py-2 text-left font-medium">Response</th>
                  <th className="px-3 py-2 text-left font-medium">Next retry</th>
                </tr>
              </thead>
              <tbody>
                {(deliveries.data ?? []).map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <td className="px-3 py-2 text-xs text-muted-foreground">{formatDistanceToNow(new Date(d.created_at), { addSuffix: true })}</td>
                    <td className="px-3 py-2 font-mono text-xs">{d.event_type}</td>
                    <td className="px-3 py-2"><Badge variant={d.status === "success" ? "secondary" : d.status === "failed" ? "destructive" : "outline"} className="text-[10px]">{d.status}</Badge></td>
                    <td className="px-3 py-2 text-xs">{d.attempt_count}/{d.max_attempts}</td>
                    <td className="px-3 py-2 text-xs">{d.response_status ?? "—"}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">{d.next_retry_at ? new Date(d.next_retry_at).toLocaleTimeString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelState>
      </div>
    </div>
  );
}

// ---------- Docs ----------
function DocsTab() {
  return (
    <div className="space-y-4">
      <DocSection title="Base URL">
        <CodeBlock code={`${BASE_URL_PLACEHOLDER}/api/public/v1`} />
      </DocSection>
      <DocSection title="Authentication">
        <p className="text-sm text-muted-foreground">All requests must include a bearer API key:</p>
        <CodeBlock code={`Authorization: Bearer rd_live_xxx`} />
      </DocSection>
      <DocSection title="Example — list devices">
        <CodeBlock code={`curl -H "Authorization: Bearer rd_live_xxx" \\\n  ${BASE_URL_PLACEHOLDER}/api/public/v1/devices`} />
        <CodeBlock language="ts" code={`const res = await fetch("${BASE_URL_PLACEHOLDER}/api/public/v1/devices", {\n  headers: { Authorization: \`Bearer \${process.env.REMOTEDESK_API_KEY}\` },\n});\nconst { data, pagination } = await res.json();`} />
      </DocSection>
      <DocSection title="Error format">
        <CodeBlock code={`{\n  "error": {\n    "code": "invalid_api_key",\n    "message": "The API key is missing, invalid, expired, or revoked.",\n    "request_id": "req_xxx"\n  }\n}`} />
      </DocSection>
      <DocSection title="Pagination">
        <CodeBlock code={`{\n  "data": [...],\n  "pagination": { "next_cursor": "...", "has_more": true }\n}`} />
      </DocSection>
      <DocSection title="Webhook payload">
        <CodeBlock code={`{\n  "id": "evt_xxx",\n  "type": "device.offline",\n  "created_at": "2026-01-01T00:00:00Z",\n  "data": { "device_id": "...", "status": "offline" }\n}`} />
      </DocSection>
      <DocSection title="Webhook signature verification">
        <p className="text-sm text-muted-foreground">
          Each delivery includes <code className="font-mono">X-RemoteDesk-Signature: t=&lt;timestamp&gt;,v1=&lt;hmac&gt;</code>.
          Compute <code className="font-mono">HMAC_SHA256(secret, t + "." + body)</code> and compare in constant time.
        </p>
        <CodeBlock language="ts" code={`import { createHmac, timingSafeEqual } from "crypto";\n\nfunction verify(body: string, header: string, secret: string) {\n  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));\n  const expected = createHmac("sha256", secret).update(\`\${parts.t}.\${body}\`).digest("hex");\n  return timingSafeEqual(Buffer.from(parts.v1), Buffer.from(expected));\n}`} />
      </DocSection>
      <DocSection title="Scope reference">
        <div className="grid gap-1 text-xs">
          {API_SCOPES.map((s) => (
            <div key={s.value} className="flex items-center gap-2"><code className="font-mono">{s.value}</code><span className="text-muted-foreground">— {s.label}</span></div>
          ))}
        </div>
      </DocSection>
      <DocSection title="Endpoint reference">
        <div className="grid gap-1 text-xs font-mono">
          {[
            "GET    /me",
            "GET    /devices",
            "GET    /devices/:id",
            "PATCH  /devices/:id",
            "GET    /devices/:id/presence",
            "GET    /sessions",
            "GET    /sessions/:id",
            "POST   /sessions/:id/end",
            "GET    /support/tickets",
            "POST   /support/tickets",
            "GET    /automation/pipelines",
            "POST   /automation/pipelines/:id/run",
            "GET    /automation/runs/:id",
            "GET    /notifications",
            "GET    /audit/logs",
            "GET    /billing/usage",
            "GET    /webhooks/endpoints",
            "POST   /webhooks/endpoints",
            "PATCH  /webhooks/endpoints/:id",
            "DELETE /webhooks/endpoints/:id",
            "POST   /webhooks/endpoints/:id/test",
          ].map((e) => <div key={e}>{e}</div>)}
        </div>
      </DocSection>
    </div>
  );
}

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 text-sm font-semibold">{title}</div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  return (
    <div className="overflow-hidden rounded-md border border-border bg-muted/30">
      <div className="flex items-center justify-between border-b border-border px-3 py-1.5">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{language ?? "shell"}</div>
        <Button size="sm" variant="ghost" onClick={async () => { await navigator.clipboard.writeText(code); toast.success("Copied"); }}>
          <Copy className="mr-1 h-3 w-3" />Copy
        </Button>
      </div>
      <pre className="overflow-x-auto px-3 py-2 text-xs leading-relaxed"><code>{code}</code></pre>
    </div>
  );
}

// ---------- Playground ----------
function PlaygroundTab() {
  const [method, setMethod] = useState("GET");
  const [path, setPath] = useState("/devices");
  const [body, setBody] = useState("");
  const curl = `curl -X ${method} \\\n  -H "Authorization: Bearer rd_live_xxx" \\\n  -H "Content-Type: application/json" \\\n  ${body ? `--data '${body.replace(/'/g, "'\\''")}' \\\n  ` : ""}${BASE_URL_PLACEHOLDER}/api/public/v1${path}`;
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="text-sm font-semibold flex items-center gap-2"><PlayCircle className="h-4 w-4" />Request</div>
        <div className="flex gap-2">
          <Select value={method} onValueChange={setMethod}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>{["GET", "POST", "PATCH", "DELETE"].map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
          </Select>
          <Input value={path} onChange={(e) => setPath(e.target.value)} placeholder="/devices" />
        </div>
        {(method === "POST" || method === "PATCH") && (
          <div>
            <Label className="text-xs">JSON body</Label>
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder='{"name":"example"}' rows={6} className="font-mono text-xs" />
          </div>
        )}
        <div className="rounded-md border border-dashed border-border bg-muted/30 p-3 text-[11px] text-muted-foreground">
          The playground generates a <code className="font-mono">curl</code> command — run it from your terminal with a real API key. We never log the key in the dashboard.
        </div>
      </div>
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <div className="text-sm font-semibold">Generated curl</div>
        <CodeBlock code={curl} />
      </div>
    </div>
  );
}
