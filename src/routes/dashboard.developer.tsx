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
import { BetaFeatureGate } from "@/components/beta/BetaFeatureGate";
import { EngineFeatureStatusCard } from "@/components/app/developer/EngineFeatureStatusCard";

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
              <Badge variant="secondary">Beta gated</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <EngineFeatureStatusCard />
      </div>

      <BetaFeatureGate
        flag="publicApiEnabled"
        title="Public API disabled"
        description="API key management, request logs, webhooks, and playground are disabled until the public API beta gate is enabled."
      >
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
      </BetaFeatureGate>
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
        <MetricCard icon={KeyRound} label="Active API keys" value={String(o?.active_keys ?? 0)} />
        <MetricCard icon={Activity} label="Requests (24h)" value={String(o?.requests_24h ?? 0)} />
        <MetricCard icon={Activity} label="Failed requests (24h)" value={String(o?.failed_requests_24h ?? 0)} />
        <MetricCard icon={Gauge} label="Rate-limited (24h)" value={String(o?.rate_limited_24h ?? 0)} />
        <MetricCard icon={Webhook} label="Webhook endpoints" value={String(o?.webhook_endpoints ?? 0)} />
        <MetricCard icon={Webhook} label="Webhook deliveries (24h)" value={String(o?.webhook_deliveries_24h ?? 0)} />
        <MetricCard icon={Webhook} label="Webhook success (24h)" value={String(o?.webhook_success_24h ?? 0)} />
        <MetricCard icon={Webhook} label="Webhook failures (24h)" value={String(o?.webhook_failed_24h ?? 0)} />
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
                    <td className="px-4 py-2 font-mono text-xs">{k.prefix}</td>
                    <td className="px-4 py-2"><div className="flex flex-wrap gap-1">{(k.scopes ?? []).map((s) => <Badge key={s} variant="outline">{s}</Badge>)}</div></td>
                    <td className="px-4 py-2 text-muted-foreground">{k.last_used_at ? formatDistanceToNow(new Date(k.last_used_at), { addSuffix: true }) : "Never"}</td>
                    <td className="px-4 py-2 text-muted-foreground">{formatDistanceToNow(new Date(k.created_at), { addSuffix: true })}</td>
                    <td className="px-4 py-2"><StatusBadge variant={revoked ? "danger" : expired ? "warning" : "connected"}>{revoked ? "revoked" : expired ? "expired" : "active"}</StatusBadge></td>
                    <td className="px-4 py-2 text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon" variant="ghost" disabled={revoked || !canManage}><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader><AlertDialogTitle>Revoke API key?</AlertDialogTitle><AlertDialogDescription>This cannot be undone. Integrations using {k.name} will stop working.</AlertDialogDescription></AlertDialogHeader>
                          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleRevoke(k.id, k.name)}>Revoke</AlertDialogAction></AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
  function toggle(s: string) { onChange(value.includes(s) ? value.filter((x) => x !== s) : [...value, s]); }
  return <div className="grid gap-2 sm:grid-cols-2">{API_SCOPES.map((s) => <label key={s} className="flex items-center gap-2 rounded-md border border-border p-2 text-xs"><Checkbox checked={value.includes(s)} onCheckedChange={() => toggle(s)} />{s}</label>)}</div>;
}

// ---------- API Logs ----------
function ApiLogsTab() { return <SimplePanel title="API request logs" hook={useApiRequestLogs} columns={["method","path","status_code","latency_ms","created_at","error_code"]} />; }
function RateLimitsTab() { return <SimplePanel title="Rate limit events" hook={useApiRateLimitEvents} columns={["scope","limit_key","allowed","remaining","reset_at","created_at"]} />; }

function SimplePanel({ title, hook, columns }: { title: string; hook: () => { data: any[]; isLoading: boolean; error: Error | null }; columns: string[] }) {
  const q = hook();
  return <div className="rounded-lg border border-border bg-card"><div className="border-b border-border px-4 py-3 text-sm font-semibold">{title}</div><PanelState loading={q.isLoading} error={q.error} empty={q.data.length === 0} emptyText="No records yet."><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-muted/40 uppercase text-muted-foreground"><tr>{columns.map((c) => <th key={c} className="px-3 py-2 text-left font-medium">{c}</th>)}</tr></thead><tbody>{q.data.map((r, i) => <tr key={r.id ?? i} className="border-t border-border">{columns.map((c) => <td key={c} className="px-3 py-2">{String(r[c] ?? "—")}</td>)}</tr>)}</tbody></table></div></PanelState></div>;
}

// ---------- Webhooks ----------
function WebhooksTab() {
  const endpoints = useWebhookEndpoints();
  const deliveries = useWebhookDeliveries();
  const create = useCreateWebhookEndpoint();
  const disable = useDisableWebhookEndpoint();
  const test = useTestWebhookEndpoint();
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [events, setEvents] = useState<string[]>([WEBHOOK_EVENT_TYPES[0]]);

  async function submit() {
    if (!url.trim()) { toast.error("Endpoint URL is required"); return; }
    await create.mutateAsync({ url: url.trim(), secret: secret.trim() || undefined, events });
    toast.success("Webhook endpoint created"); setOpen(false); setUrl(""); setSecret("");
  }

  return <div className="grid gap-4 lg:grid-cols-2">
    <div className="rounded-lg border border-border bg-card"><div className="flex items-center justify-between border-b border-border px-4 py-3"><div className="text-sm font-semibold flex items-center gap-2"><Webhook className="h-4 w-4" />Webhook endpoints</div><Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm"><Plus className="mr-1.5 h-4 w-4" />Add</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>New webhook endpoint</DialogTitle><DialogDescription>RemoteDesk will sign each delivery with your secret.</DialogDescription></DialogHeader><div className="space-y-3"><div><Label className="text-xs">URL</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/webhooks/remotedesk" /></div><div><Label className="text-xs">Secret</Label><Input value={secret} onChange={(e) => setSecret(e.target.value)} placeholder="optional" /></div><div><Label className="text-xs">Events</Label><Select value={events[0]} onValueChange={(v) => setEvents([v])}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{WEBHOOK_EVENT_TYPES.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button onClick={submit} disabled={create.isPending}>Create</Button></DialogFooter></DialogContent></Dialog></div><PanelState loading={endpoints.isLoading} error={endpoints.error} empty={endpoints.data.length === 0} emptyText="No endpoints."><div className="divide-y divide-border">{endpoints.data.map((e) => <div key={e.id} className="flex items-center justify-between gap-3 p-4"><div><div className="font-mono text-xs">{e.url}</div><div className="text-xs text-muted-foreground">{e.events?.join(", ")}</div></div><div className="flex items-center gap-2"><Button size="sm" variant="outline" onClick={() => test.mutate(e.id)}><PlayCircle className="mr-1 h-4 w-4" />Test</Button><Button size="sm" variant="ghost" onClick={() => disable.mutate(e.id)}>Disable</Button></div></div>)}</div></PanelState></div>
    <SimplePanel title="Webhook deliveries" hook={() => deliveries} columns={["event_type","status","attempt_count","created_at","next_retry_at"]} />
  </div>;
}

// ---------- Docs & Playground ----------
function DocsTab() {
  const curl = `curl -H "Authorization: Bearer rd_live_..." \\\n  ${BASE_URL_PLACEHOLDER}/api/public/v1/devices`;
  return <div className="grid gap-4 lg:grid-cols-2"><div className="rounded-lg border border-border bg-card p-4"><div className="text-sm font-semibold">Quick start</div><pre className="mt-3 overflow-x-auto rounded-md bg-muted p-3 text-xs"><code>{curl}</code></pre><Button className="mt-3" size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(curl); toast.success("Copied"); }}><Copy className="mr-1.5 h-4 w-4" />Copy cURL</Button></div><div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground"><div className="font-semibold text-foreground">Scopes</div><ul className="mt-2 columns-2 list-disc pl-4 text-xs">{API_SCOPES.map((s) => <li key={s}>{s}</li>)}</ul></div></div>;
}
function PlaygroundTab() { const [path, setPath] = useState("/devices"); return <div className="rounded-lg border border-border bg-card p-4"><div className="text-sm font-semibold">API Playground</div><div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]"><Select defaultValue="GET"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="GET">GET</SelectItem><SelectItem value="POST">POST</SelectItem></SelectContent></Select><Input value={path} onChange={(e) => setPath(e.target.value)} /></div><Textarea className="mt-3 font-mono text-xs" placeholder="JSON body" /><Button className="mt-3" onClick={() => toast.info("Playground sends requests using your selected API key in the next release.")}>Run</Button></div>; }
