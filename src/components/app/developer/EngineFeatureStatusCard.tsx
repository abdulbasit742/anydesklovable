import { useQuery } from '@tanstack/react-query';
import { Server, ShieldCheck, ShieldAlert } from 'lucide-react';
import { fetchEngineFeatureStatus, type EngineBetaFeatureName } from '@/lib/services/engine-feature-status';

const labels: Record<EngineBetaFeatureName, string> = {
  beta_engine: 'Beta engine',
  socket_access: 'Socket access',
  signaling_access: 'WebRTC signaling',
  desktop_consent: 'Desktop consent',
  support_diagnostics: 'Support diagnostics',
  release_manifest: 'Release manifest',
};

export function EngineFeatureStatusCard() {
  const query = useQuery({
    queryKey: ['engine-feature-status'],
    queryFn: ({ signal }) => fetchEngineFeatureStatus(signal),
    staleTime: 60_000,
    retry: 1,
  });

  const result = query.data;
  const unavailable = !result?.ok;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Server className="h-4 w-4" /> Engine feature status
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Read-only status from the engine beta feature endpoint. No secrets are shown here.
          </p>
        </div>
        {unavailable ? <ShieldAlert className="h-4 w-4 text-amber-500" /> : <ShieldCheck className="h-4 w-4 text-success" />}
      </div>

      {query.isLoading && <div className="mt-4 text-sm text-muted-foreground">Checking engine status…</div>}

      {!query.isLoading && unavailable && (
        <div className="mt-4 rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
          {result?.error ?? 'Engine feature status is unavailable.'}
        </div>
      )}

      {!query.isLoading && result?.ok && result.data && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {(Object.entries(result.data.features) as [EngineBetaFeatureName, boolean][]).map(([key, enabled]) => (
            <div key={key} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs">
              <span className="font-medium">{labels[key] ?? key}</span>
              <span className={enabled ? 'text-success' : 'text-muted-foreground'}>{enabled ? 'enabled' : 'disabled'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
