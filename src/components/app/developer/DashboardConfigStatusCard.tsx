import { Settings, CheckCircle2, AlertTriangle } from 'lucide-react';
import { getFeatureFlags } from '@/lib/config/feature-flags';
import { getEngineApiBaseUrl } from '@/lib/services/engine-feature-status';

export function DashboardConfigStatusCard() {
  const flags = getFeatureFlags();
  const engineBaseUrl = getEngineApiBaseUrl();

  const rows = [
    { label: 'Beta mode', value: flags.betaEnabled ? 'enabled' : 'disabled', ok: flags.betaEnabled },
    { label: 'Public signup', value: flags.publicSignupEnabled ? 'enabled' : 'disabled', ok: !flags.publicSignupEnabled },
    { label: 'Session request gate', value: flags.sessionRequestEnabled ? 'enabled' : 'disabled', ok: true },
    { label: 'Support diagnostics gate', value: flags.supportDiagnosticsEnabled ? 'enabled' : 'disabled', ok: true },
    { label: 'Release downloads', value: flags.releaseDownloadEnabled ? 'enabled' : 'disabled', ok: true },
    { label: 'Engine status URL', value: engineBaseUrl ? 'configured' : 'missing', ok: Boolean(engineBaseUrl) },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Settings className="h-4 w-4" /> Dashboard beta configuration
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Public beta flags and read-only engine status configuration. Secret values are never shown.
          </p>
        </div>
        {engineBaseUrl ? <CheckCircle2 className="h-4 w-4 text-success" /> : <AlertTriangle className="h-4 w-4 text-amber-500" />}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-xs">
            <span className="font-medium">{row.label}</span>
            <span className={row.ok ? 'text-success' : 'text-muted-foreground'}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
