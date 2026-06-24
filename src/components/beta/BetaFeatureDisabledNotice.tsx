import { Lock } from 'lucide-react';

interface BetaFeatureDisabledNoticeProps {
  title?: string;
  description?: string;
  flagName?: string;
}

export function BetaFeatureDisabledNotice({
  title = 'Feature disabled',
  description = 'This capability is currently gated for the controlled beta. Ask an admin to review the beta feature flags before using it.',
  flagName,
}: BetaFeatureDisabledNoticeProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-background p-2 text-muted-foreground">
          <Lock className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <div className="font-medium text-foreground">{title}</div>
          <p>{description}</p>
          {flagName && (
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Required flag: {flagName}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
