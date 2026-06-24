import { createFileRoute } from "@tanstack/react-router";
import { Server, ShieldCheck, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { EngineFeatureStatusCard } from "@/components/app/developer/EngineFeatureStatusCard";
import { DashboardConfigStatusCard } from "@/components/app/developer/DashboardConfigStatusCard";
import { getEngineApiBaseUrl } from "@/lib/services/engine-feature-status";

export const Route = createFileRoute("/dashboard/engine-status")({
  head: () => ({ meta: [{ title: "Engine Status — RemoteDesk" }] }),
  component: EngineStatusPage,
});

function EngineStatusPage() {
  const engineBaseUrl = getEngineApiBaseUrl();

  return (
    <AppShell title="Engine Status">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">RemoteDesk Engine Status</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Read-only beta feature status from the engine API. This page does not display secrets, tokens, private URLs, or signed links.
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-border bg-background px-2.5 py-1">Read-only</span>
                <span className="rounded-full border border-border bg-background px-2.5 py-1">Beta gates</span>
                <span className="rounded-full border border-border bg-background px-2.5 py-1">No secrets</span>
              </div>
            </div>
          </div>
        </div>

        {!engineBaseUrl && (
          <div className="rounded-lg border border-amber-300/70 bg-amber-50 p-4 text-amber-950">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <div>
                <div className="font-medium">Engine API URL is not configured</div>
                <p className="mt-1 text-sm text-amber-900/80">
                  Set <code className="font-mono">VITE_ENGINE_API_BASE_URL</code> for browser-visible read-only status checks, or configure a server-side proxy later for private engine access.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardConfigStatusCard />
          <EngineFeatureStatusCard />
        </div>

        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 text-success" />
            <div>
              <div className="text-sm font-semibold">Safety rules</div>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                <li>Use this page for status only; do not paste or expose engine secrets.</li>
                <li>Disabled engine features must fail closed in API routes and desktop clients.</li>
                <li>Host consent and Emergency Stop checks remain mandatory during beta testing.</li>
                <li>Manus should verify this page through <code className="font-mono">npm run ci:local</code>.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
