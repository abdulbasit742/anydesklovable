import { AlertTriangle } from 'lucide-react';
import { getFeatureFlags } from '@/lib/config/feature-flags';

export function BetaBanner() {
  const flags = getFeatureFlags();
  if (!flags.betaEnabled) return null;

  const disabledItems = [
    !flags.publicSignupEnabled ? 'public signup disabled' : null,
    !flags.sessionRequestEnabled ? 'session requests gated' : null,
    !flags.supportDiagnosticsEnabled ? 'support diagnostics gated' : null,
    !flags.releaseDownloadEnabled ? 'release downloads gated' : null,
  ].filter(Boolean);

  return (
    <div className="border-b border-amber-300/60 bg-amber-50 px-4 py-2 text-amber-950 sm:px-6">
      <div className="flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 font-medium">
          <AlertTriangle className="h-4 w-4" />
          RemoteDesk Beta: use only on test or non-critical devices. Host consent and Emergency Stop checks are required.
        </div>
        {disabledItems.length > 0 && (
          <div className="text-xs text-amber-900/80">
            Safety gates: {disabledItems.join(' · ')}
          </div>
        )}
      </div>
    </div>
  );
}
