import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Database, FolderTree, Table2, Columns3, ShieldAlert, GitBranch, Activity,
  Sparkles, FileSearch, KeyRound, Crown, BadgeCheck, BookText, FileWarning,
  Link2, History, ClipboardList,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { MetricCard } from "@/components/app/MetricCard";
import { PanelState } from "@/components/app/DataState";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTeam } from "@/hooks/use-current-team";

export const Route = createFileRoute("/dashboard/data-catalog")({
  head: () => ({
    meta: [
      { title: "Data Catalog — RemoteDesk" },
      { name: "description", content: "Enterprise data catalog, metadata governance, and lineage." },
    ],
  }),
  component: DataCatalogPage,
});

const SENSITIVITY = ["public", "internal", "confidential", "restricted"] as const;
const ASSET_TYPES = ["table", "view", "api_endpoint", "report", "dashboard", "metric", "event_stream", "file_bucket", "dataset"] as const;
const DOMAIN_TYPES = ["business", "technical", "compliance", "privacy", "security", "financial", "customer", "product", "operational"] as const;

function severity(s: string): "online" | "neutral" | "rejected" | "fair" {
  if (s === "active" || s === "approved" || s === "passed" || s === "success") return "online";
  if (s === "failed" || s === "rejected" || s === "revoked" || s === "expired" || s === "critical") return "rejected";
  if (s === "worker_required" || s === "warning" || s === "needs_review" || s === "submitted" || s === "queued" || s === "draft") return "fair";
  return "neutral";
}

function DataCatalogPage() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const qc = useQueryClient();

  const summaryQ = useQuery({
    queryKey: ["dc-summary", teamId], enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_data_catalog_summary");
      if (error) throw error;
      return (data || {}) as Record<string, number | string>;
    },
  });

  const list = <T,>(table: string, key: string, opts?: { order?: string; limit?: number }) =>
    useQuery({
      queryKey: [key, teamId], enabled: !!teamId,
      queryFn: async () => {
        const { data, error } = await supabase
          .from(table as never).select("*")
          .eq("team_id", teamId!)
          .order(opts?.order ?? "created_at", { ascending: false })
          .limit(opts?.limit ?? 100);
        if (error) throw error;
        return (data as unknown) as T[];
      },
    });

  const workspacesQ = list<any>("data_catalog_workspaces", "dc-workspaces");
  const domainsQ = list<any>("data_domains", "dc-domains", { order: "name" });
  const assetsQ = list<any>("data_assets", "dc-assets");
  const rulesQ = list<any>("data_classification_rules", "dc-rules", { order: "name" });
  const findingsQ = list<any>("data_classification_findings", "dc-findings");
  const lineageQ = list<any>("data_lineage_edges", "dc-lineage");
  const qrulesQ = list<any>("data_quality_rule_registry", "dc-qrules", { order: "name" });
  const qrunsQ = list<any>("data_quality_check_runs", "dc-qruns", { order: "started_at" });
  const scansQ = list<any>("metadata_scan_jobs", "dc-scans");
  const accessQ = list<any>("data_access_requests", "dc-access");
  const certsQ = list<any>("data_asset_certifications", "dc-certs");
  const collectionsQ = list<any>("business_glossary_collections", "dc-gloss-cols", { order: "name" });
  const termsQ = list<any>("business_glossary_terms", "dc-gloss-terms", { order: "name" });
  const schemaQ = list<any>("schema_change_events", "dc-schema");
  const linksQ = list<any>("data_governance_policy_links", "dc-policy-links");
  const activityQ = list<any>("data_catalog_activity_events", "dc-activity", { limit: 50 });
  const reportsQ = list<any>("data_catalog_reports", "dc-reports");

  const invalidateAll = () => {
    ["dc-summary","dc-workspaces","dc-domains","dc-assets","dc-rules","dc-findings","dc-lineage",
     "dc-qrules","dc-qruns","dc-scans","dc-access","dc-certs","dc-gloss-cols","dc-gloss-terms",
     "dc-schema","dc-policy-links","dc-activity","dc-reports"].forEach((k) =>
      qc.invalidateQueries({ queryKey: [k, teamId] }),
    );
  };

  const callRpc = async <T,>(name: string, params: Record<string, unknown>): Promise<T> => {
    const { data, error } = await supabase.rpc(name as never, params as never);
    if (error) throw new Error(error.message);
    return data as T;
  };

  const summary = (summaryQ.data ?? {}) as Record<string, number>;
  const assetById = useMemo(() => Object.fromEntries((assetsQ.data ?? []).map((a) => [a.id, a])), [assetsQ.data]);

  return (
    <AppShell title="Data Catalog">
      <div className="space-y-6">
        <p className="text-xs text-muted-foreground">
          This catalog shows metadata only, not raw data. Sample values are redacted. Access approvals never bypass source-module permissions.
        </p>

        <div className="grid gap-3 md:grid-cols-4">
          <MetricCard label="Total assets" value={String(summary.total_assets ?? 0)} icon={Table2} />
          <MetricCard label="Unclassified" value={String(summary.unclassified_assets ?? 0)} icon={ShieldAlert} />
          <MetricCard label="Restricted" value={String(summary.restricted_assets ?? 0)} icon={KeyRound} />
          <MetricCard label="PII fields" value={String(summary.pii_fields ?? 0)} icon={Columns3} />
          <MetricCard label="Lineage edges" value={String(summary.lineage_edges ?? 0)} icon={GitBranch} />
          <MetricCard label="Failed quality checks (7d)" value={String(summary.quality_checks_failed_7d ?? 0)} icon={FileWarning} />
          <MetricCard label="Access requests pending" value={String(summary.access_requests_pending ?? 0)} icon={ClipboardList} />
          <MetricCard label="Scans worker-required" value={String(summary.metadata_scan_worker_required ?? 0)} icon={FileSearch} />
        </div>

        <Tabs defaultValue="assets" className="w-full">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="assets"><Table2 className="mr-1 h-3 w-3"/>Assets</TabsTrigger>
            <TabsTrigger value="domains"><FolderTree className="mr-1 h-3 w-3"/>Domains</TabsTrigger>
            <TabsTrigger value="workspaces"><Database className="mr-1 h-3 w-3"/>Workspaces</TabsTrigger>
            <TabsTrigger value="rules"><Sparkles className="mr-1 h-3 w-3"/>Classification</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="lineage"><GitBranch className="mr-1 h-3 w-3"/>Lineage</TabsTrigger>
            <TabsTrigger value="quality">Quality</TabsTrigger>
            <TabsTrigger value="scans"><FileSearch className="mr-1 h-3 w-3"/>Scans</TabsTrigger>
            <TabsTrigger value="access">Access</TabsTrigger>
            <TabsTrigger value="certs"><BadgeCheck className="mr-1 h-3 w-3"/>Certs</TabsTrigger>
            <TabsTrigger value="glossary"><BookText className="mr-1 h-3 w-3"/>Glossary</TabsTrigger>
            <TabsTrigger value="schema">Schema</TabsTrigger>
            <TabsTrigger value="policies"><Link2 className="mr-1 h-3 w-3"/>Policies</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="activity"><Activity className="mr-1 h-3 w-3"/>Activity</TabsTrigger>
          </TabsList>

          {/* ASSETS */}
          <TabsContent value="assets" className="mt-4">
            <SectionCard
              title="Data assets"
              action={
                <RegisterAssetDialog
                  domains={domainsQ.data ?? []}
                  workspaces={workspacesQ.data ?? []}
                  onSubmit={async (vars) => {
                    await callRpc("register_data_asset", {
                      p_asset_key: vars.asset_key, p_name: vars.name, p_asset_type: vars.asset_type,
                      p_source_system: "remotedesk", p_source_module: vars.source_module || null,
                      p_domain_id: vars.domain_id || null, p_workspace_id: vars.workspace_id || null,
                      p_description: vars.description || null, p_sensitivity_level: vars.sensitivity,
                    });
                    toast.success("Asset registered"); invalidateAll();
                  }}
                />
              }
            >
              <PanelState loading={assetsQ.isLoading} error={assetsQ.error as Error | null} empty={!assetsQ.data?.length}>
                <Tbl headers={["Name", "Type", "Source", "Domain", "Sensitivity", "Status"]}>
                  {(assetsQ.data ?? []).map((a) => (
                    <tr key={a.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{a.name}<div className="text-xs text-muted-foreground">{a.asset_key}</div></td>
                      <td className="px-3 py-2 text-sm">{a.asset_type}</td>
                      <td className="px-3 py-2 text-sm">{a.source_module || a.source_system}</td>
                      <td className="px-3 py-2 text-sm">{(domainsQ.data ?? []).find((d) => d.id === a.domain_id)?.name ?? "—"}</td>
                      <td className="px-3 py-2"><StatusBadge variant={a.sensitivity_level === "restricted" ? "rejected" : a.sensitivity_level === "confidential" ? "fair" : "neutral"}>{a.sensitivity_level}</StatusBadge></td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(a.classification_status)}>{a.classification_status}</StatusBadge></td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* DOMAINS */}
          <TabsContent value="domains" className="mt-4">
            <SectionCard
              title="Data domains"
              action={
                <SimpleCreateDialog
                  label="New domain"
                  fields={[
                    { name: "p_domain_key", label: "Key", required: true },
                    { name: "p_name", label: "Name", required: true },
                    { name: "p_domain_type", label: "Type", kind: "select", options: [...DOMAIN_TYPES] },
                    { name: "p_description", label: "Description", kind: "textarea" },
                  ]}
                  rpc="create_data_domain"
                  onDone={() => { toast.success("Domain created"); invalidateAll(); }}
                />
              }
            >
              <PanelState loading={domainsQ.isLoading} error={domainsQ.error as Error | null} empty={!domainsQ.data?.length}>
                <Tbl headers={["Domain", "Type", "Status"]}>
                  {(domainsQ.data ?? []).map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{d.name}<div className="text-xs text-muted-foreground">{d.domain_key}</div></td>
                      <td className="px-3 py-2 text-sm">{d.domain_type}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(d.status)}>{d.status}</StatusBadge></td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* WORKSPACES */}
          <TabsContent value="workspaces" className="mt-4">
            <SectionCard
              title="Catalog workspaces"
              action={
                <SimpleCreateDialog
                  label="New workspace"
                  fields={[
                    { name: "p_workspace_key", label: "Key", required: true },
                    { name: "p_name", label: "Name", required: true },
                    { name: "p_description", label: "Description", kind: "textarea" },
                  ]}
                  rpc="create_data_catalog_workspace"
                  onDone={() => { toast.success("Workspace created"); invalidateAll(); }}
                />
              }
            >
              <PanelState loading={workspacesQ.isLoading} error={workspacesQ.error as Error | null} empty={!workspacesQ.data?.length}>
                <Tbl headers={["Name", "Type", "Sensitivity", "Status"]}>
                  {(workspacesQ.data ?? []).map((w) => (
                    <tr key={w.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{w.name}<div className="text-xs text-muted-foreground">{w.workspace_key}</div></td>
                      <td className="px-3 py-2 text-sm">{w.workspace_type}</td>
                      <td className="px-3 py-2 text-sm">{w.default_sensitivity}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(w.status)}>{w.status}</StatusBadge></td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* CLASSIFICATION RULES */}
          <TabsContent value="rules" className="mt-4">
            <SectionCard
              title="Classification rules"
              action={
                <Button size="sm" onClick={async () => {
                  await callRpc("run_data_classification_rules", { p_asset_id: null });
                  toast.success("Classification run queued"); invalidateAll();
                }}>Run rules</Button>
              }
            >
              <PanelState loading={rulesQ.isLoading} error={rulesQ.error as Error | null} empty={!rulesQ.data?.length}>
                <Tbl headers={["Name", "Type", "Pattern", "Sensitivity", "PII", "Mode"]}>
                  {(rulesQ.data ?? []).map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2 font-medium">{r.name}<div className="text-xs text-muted-foreground">{r.rule_key}</div></td>
                      <td className="px-3 py-2 text-sm">{r.rule_type}</td>
                      <td className="px-3 py-2 font-mono text-xs">{r.pattern}</td>
                      <td className="px-3 py-2 text-sm">{r.sensitivity_level}</td>
                      <td className="px-3 py-2 text-sm">{r.pii_type}</td>
                      <td className="px-3 py-2 text-sm">{r.enforcement_mode}</td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* FINDINGS */}
          <TabsContent value="findings" className="mt-4">
            <SectionCard title="Classification findings">
              <PanelState loading={findingsQ.isLoading} error={findingsQ.error as Error | null} empty={!findingsQ.data?.length}>
                <Tbl headers={["Asset", "Type", "Sensitivity", "PII", "Confidence", "Status", ""]}>
                  {(findingsQ.data ?? []).map((f) => (
                    <tr key={f.id} className="border-t">
                      <td className="px-3 py-2 text-sm">{assetById[f.asset_id]?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-sm">{f.finding_type}</td>
                      <td className="px-3 py-2 text-sm">{f.sensitivity_level ?? "—"}</td>
                      <td className="px-3 py-2 text-sm">{f.pii_type ?? "—"}</td>
                      <td className="px-3 py-2 text-sm">{f.confidence}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(f.status)}>{f.status}</StatusBadge></td>
                      <td className="px-3 py-2 text-right">
                        {f.status === "open" && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={async () => {
                              await callRpc("review_classification_finding", { p_finding_id: f.id, p_status: "accepted" });
                              toast.success("Accepted"); invalidateAll();
                            }}>Accept</Button>
                            <Button size="sm" variant="ghost" onClick={async () => {
                              await callRpc("review_classification_finding", { p_finding_id: f.id, p_status: "rejected" });
                              invalidateAll();
                            }}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* LINEAGE */}
          <TabsContent value="lineage" className="mt-4">
            <SectionCard title="Lineage edges">
              <p className="px-1 pb-2 text-xs text-muted-foreground">Lineage is based on registered relationships and available integration metadata.</p>
              <PanelState loading={lineageQ.isLoading} error={lineageQ.error as Error | null} empty={!lineageQ.data?.length}>
                <Tbl headers={["Source", "→", "Target", "Type", "Confidence", "Status"]}>
                  {(lineageQ.data ?? []).map((e) => (
                    <tr key={e.id} className="border-t">
                      <td className="px-3 py-2 text-sm">{assetById[e.source_asset_id]?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">→</td>
                      <td className="px-3 py-2 text-sm">{assetById[e.target_asset_id]?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-sm">{e.lineage_type}</td>
                      <td className="px-3 py-2 text-sm">{e.confidence}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(e.status)}>{e.status}</StatusBadge></td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* QUALITY */}
          <TabsContent value="quality" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard title="Quality rules">
                <PanelState loading={qrulesQ.isLoading} error={qrulesQ.error as Error | null} empty={!qrulesQ.data?.length}>
                  <Tbl headers={["Name", "Type", "Severity", "Status"]}>
                    {(qrulesQ.data ?? []).map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="px-3 py-2 text-sm">{r.name}</td>
                        <td className="px-3 py-2 text-sm">{r.rule_type}</td>
                        <td className="px-3 py-2 text-sm">{r.severity}</td>
                        <td className="px-3 py-2"><StatusBadge variant={severity(r.status)}>{r.status}</StatusBadge></td>
                      </tr>
                    ))}
                  </Tbl>
                </PanelState>
              </SectionCard>
              <SectionCard title="Quality runs">
                <p className="px-1 pb-2 text-xs text-muted-foreground">Data quality checks require configured rules and available records. Worker-required for unsupported checks.</p>
                <PanelState loading={qrunsQ.isLoading} error={qrunsQ.error as Error | null} empty={!qrunsQ.data?.length}>
                  <Tbl headers={["Started", "Status", "Score", "Failed/Checked"]}>
                    {(qrunsQ.data ?? []).map((r) => (
                      <tr key={r.id} className="border-t">
                        <td className="px-3 py-2 text-xs">{new Date(r.started_at).toLocaleString()}</td>
                        <td className="px-3 py-2"><StatusBadge variant={severity(r.status)}>{r.status}</StatusBadge></td>
                        <td className="px-3 py-2 text-sm">{r.quality_score ?? "—"}</td>
                        <td className="px-3 py-2 text-sm">{(r.failed_count ?? "—") + "/" + (r.checked_count ?? "—")}</td>
                      </tr>
                    ))}
                  </Tbl>
                </PanelState>
              </SectionCard>
            </div>
          </TabsContent>

          {/* SCANS */}
          <TabsContent value="scans" className="mt-4">
            <SectionCard title="Metadata scan jobs">
              <p className="px-1 pb-2 text-xs text-muted-foreground">Automatic schema discovery requires a metadata worker. External catalog or warehouse sync requires an integration worker.</p>
              <PanelState loading={scansQ.isLoading} error={scansQ.error as Error | null} empty={!scansQ.data?.length}>
                <Tbl headers={["Scan type", "Provider", "Status", "Created"]}>
                  {(scansQ.data ?? []).map((j) => (
                    <tr key={j.id} className="border-t">
                      <td className="px-3 py-2 text-sm">{j.scan_type}</td>
                      <td className="px-3 py-2 text-sm">{j.provider}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(j.status)}>{j.status}</StatusBadge></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(j.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* ACCESS REQUESTS */}
          <TabsContent value="access" className="mt-4">
            <SectionCard title="Data access requests">
              <p className="px-1 pb-2 text-xs text-muted-foreground">Data access approval does not bypass source-module permissions. Approving here records a governance decision only.</p>
              <PanelState loading={accessQ.isLoading} error={accessQ.error as Error | null} empty={!accessQ.data?.length}>
                <Tbl headers={["Asset", "Type", "Requester", "Purpose", "Status", ""]}>
                  {(accessQ.data ?? []).map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2 text-sm">{assetById[r.asset_id]?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-sm">{r.request_type}</td>
                      <td className="px-3 py-2 text-xs">{r.requester_user_id?.slice(0, 8)}</td>
                      <td className="px-3 py-2 text-sm">{r.purpose ?? "—"}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(r.status)}>{r.status}</StatusBadge></td>
                      <td className="px-3 py-2 text-right">
                        {(r.status === "submitted" || r.status === "pending_approval") && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="outline" onClick={async () => {
                              await callRpc("decide_data_access_request", { p_request_id: r.id, p_status: "approved" });
                              toast.success("Approved"); invalidateAll();
                            }}>Approve</Button>
                            <Button size="sm" variant="ghost" onClick={async () => {
                              await callRpc("decide_data_access_request", { p_request_id: r.id, p_status: "rejected" });
                              invalidateAll();
                            }}>Reject</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* CERTS */}
          <TabsContent value="certs" className="mt-4">
            <SectionCard title="Asset certifications">
              <PanelState loading={certsQ.isLoading} error={certsQ.error as Error | null} empty={!certsQ.data?.length}>
                <Tbl headers={["Asset", "Type", "Status", "Expires"]}>
                  {(certsQ.data ?? []).map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="px-3 py-2 text-sm">{assetById[c.asset_id]?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-sm">{c.certification_type}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(c.status)}>{c.status}</StatusBadge></td>
                      <td className="px-3 py-2 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* GLOSSARY */}
          <TabsContent value="glossary" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <SectionCard title="Glossary collections">
                <PanelState loading={collectionsQ.isLoading} error={collectionsQ.error as Error | null} empty={!collectionsQ.data?.length}>
                  <ul className="divide-y">
                    {(collectionsQ.data ?? []).map((c) => (
                      <li key={c.id} className="px-3 py-2 text-sm">
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.collection_key}</div>
                      </li>
                    ))}
                  </ul>
                </PanelState>
              </SectionCard>
              <SectionCard title="Glossary terms">
                <PanelState loading={termsQ.isLoading} error={termsQ.error as Error | null} empty={!termsQ.data?.length}>
                  <Tbl headers={["Term", "Type", "Status", ""]}>
                    {(termsQ.data ?? []).map((t) => (
                      <tr key={t.id} className="border-t">
                        <td className="px-3 py-2"><div className="font-medium text-sm">{t.name}</div><div className="text-xs text-muted-foreground line-clamp-1">{t.definition}</div></td>
                        <td className="px-3 py-2 text-sm">{t.term_type}</td>
                        <td className="px-3 py-2"><StatusBadge variant={severity(t.status)}>{t.status}</StatusBadge></td>
                        <td className="px-3 py-2 text-right">
                          {t.status === "draft" && (
                            <Button size="sm" variant="outline" onClick={async () => {
                              await callRpc("approve_business_glossary_term", { p_term_id: t.id });
                              toast.success("Approved"); invalidateAll();
                            }}>Approve</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </Tbl>
                </PanelState>
              </SectionCard>
            </div>
          </TabsContent>

          {/* SCHEMA */}
          <TabsContent value="schema" className="mt-4">
            <SectionCard title="Schema change events">
              <PanelState loading={schemaQ.isLoading} error={schemaQ.error as Error | null} empty={!schemaQ.data?.length}>
                <Tbl headers={["Title", "Asset", "Type", "Severity", "Reviewed"]}>
                  {(schemaQ.data ?? []).map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="px-3 py-2 text-sm">{s.title}</td>
                      <td className="px-3 py-2 text-sm">{assetById[s.asset_id]?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-sm">{s.change_type}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(s.severity)}>{s.severity}</StatusBadge></td>
                      <td className="px-3 py-2 text-xs">
                        {s.reviewed ? "Yes" : (
                          <Button size="sm" variant="outline" onClick={async () => {
                            await callRpc("review_schema_change_event", { p_schema_change_event_id: s.id });
                            invalidateAll();
                          }}>Mark reviewed</Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* POLICY LINKS */}
          <TabsContent value="policies" className="mt-4">
            <SectionCard title="Governance policy links">
              <PanelState loading={linksQ.isLoading} error={linksQ.error as Error | null} empty={!linksQ.data?.length}>
                <Tbl headers={["Asset", "Policy type", "Status", "Notes"]}>
                  {(linksQ.data ?? []).map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="px-3 py-2 text-sm">{assetById[l.asset_id]?.name ?? "—"}</td>
                      <td className="px-3 py-2 text-sm">{l.policy_type}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(l.status)}>{l.status}</StatusBadge></td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">{l.notes ?? "—"}</td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* REPORTS */}
          <TabsContent value="reports" className="mt-4">
            <SectionCard
              title="Catalog reports"
              action={
                <Button size="sm" onClick={async () => {
                  const row = await callRpc<any>("create_data_catalog_report", {
                    p_report_type: "catalog_overview", p_title: "Catalog overview " + new Date().toLocaleDateString(),
                  });
                  await callRpc("process_data_catalog_report", { p_report_id: row.id });
                  toast.success("Report generated"); invalidateAll();
                }}>Generate overview</Button>
              }
            >
              <PanelState loading={reportsQ.isLoading} error={reportsQ.error as Error | null} empty={!reportsQ.data?.length}>
                <Tbl headers={["Title", "Type", "Status", "Created"]}>
                  {(reportsQ.data ?? []).map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2 text-sm">{r.title}</td>
                      <td className="px-3 py-2 text-sm">{r.report_type}</td>
                      <td className="px-3 py-2"><StatusBadge variant={severity(r.status)}>{r.status}</StatusBadge></td>
                      <td className="px-3 py-2 text-xs">{new Date(r.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </Tbl>
              </PanelState>
            </SectionCard>
          </TabsContent>

          {/* ACTIVITY */}
          <TabsContent value="activity" className="mt-4">
            <SectionCard title="Activity timeline">
              <PanelState loading={activityQ.isLoading} error={activityQ.error as Error | null} empty={!activityQ.data?.length}>
                <ul className="divide-y">
                  {(activityQ.data ?? []).map((e) => (
                    <li key={e.id} className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <History className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm font-medium">{e.title}</span>
                        <StatusBadge variant={severity(e.severity)}>{e.event_type}</StatusBadge>
                      </div>
                      {e.description && <div className="ml-5 text-xs text-muted-foreground">{e.description}</div>}
                      <div className="ml-5 text-[10px] text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
                    </li>
                  ))}
                </ul>
              </PanelState>
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}

/* -------- helpers -------- */

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 py-3">
        <CardTitle className="text-sm">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  );
}

function Tbl({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>{headers.map((h) => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

type AssetVars = {
  asset_key: string; name: string; asset_type: string; source_module?: string;
  domain_id?: string; workspace_id?: string; description?: string; sensitivity: string;
};

function RegisterAssetDialog({ domains, workspaces, onSubmit }: {
  domains: any[]; workspaces: any[]; onSubmit: (v: AssetVars) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState<AssetVars>({ asset_key: "", name: "", asset_type: "table", sensitivity: "internal" });
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">Register asset</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Register data asset</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Asset key</Label><Input value={v.asset_key} onChange={(e) => setV({ ...v, asset_key: e.target.value })} placeholder="customer_accounts" /></div>
          <div><Label>Name</Label><Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={v.asset_type} onValueChange={(x) => setV({ ...v, asset_type: x })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ASSET_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sensitivity</Label>
              <Select value={v.sensitivity} onValueChange={(x) => setV({ ...v, sensitivity: x })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SENSITIVITY.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Domain</Label>
              <Select value={v.domain_id ?? ""} onValueChange={(x) => setV({ ...v, domain_id: x || undefined })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>{domains.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Workspace</Label>
              <Select value={v.workspace_id ?? ""} onValueChange={(x) => setV({ ...v, workspace_id: x || undefined })}>
                <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                <SelectContent>{workspaces.map((w) => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div><Label>Source module</Label><Input value={v.source_module ?? ""} onChange={(e) => setV({ ...v, source_module: e.target.value })} placeholder="billing, devices, …" /></div>
          <div><Label>Description</Label><Textarea value={v.description ?? ""} onChange={(e) => setV({ ...v, description: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button disabled={saving || !v.asset_key || !v.name} onClick={async () => {
            setSaving(true);
            try { await onSubmit(v); setOpen(false); setV({ asset_key: "", name: "", asset_type: "table", sensitivity: "internal" }); }
            catch (e) { toast.error((e as Error).message); }
            finally { setSaving(false); }
          }}>{saving ? "Saving…" : "Register"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type FieldSpec = { name: string; label: string; required?: boolean; kind?: "input" | "textarea" | "select"; options?: string[] };

function SimpleCreateDialog({ label, fields, rpc, onDone }: {
  label: string; fields: FieldSpec[]; rpc: string; onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [vals, setVals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm">{label}</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>{label}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {fields.map((f) => (
            <div key={f.name}>
              <Label>{f.label}{f.required && " *"}</Label>
              {f.kind === "textarea" ? (
                <Textarea value={vals[f.name] ?? ""} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} />
              ) : f.kind === "select" ? (
                <Select value={vals[f.name] ?? ""} onValueChange={(x) => setVals({ ...vals, [f.name]: x })}>
                  <SelectTrigger><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>{(f.options ?? []).map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              ) : (
                <Input value={vals[f.name] ?? ""} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} />
              )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button disabled={saving || fields.some((f) => f.required && !vals[f.name])} onClick={async () => {
            setSaving(true);
            try {
              const params: Record<string, unknown> = {};
              for (const f of fields) {
                const v = vals[f.name];
                params[f.name] = v && v.length ? v : null;
              }
              const { error } = await supabase.rpc(rpc as never, params as never);
              if (error) throw new Error(error.message);
              setOpen(false); setVals({}); onDone();
            } catch (e) { toast.error((e as Error).message); }
            finally { setSaving(false); }
          }}>{saving ? "Saving…" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
