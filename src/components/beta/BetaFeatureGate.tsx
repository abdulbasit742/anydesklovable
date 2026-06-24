import type { ReactNode } from 'react';
import { getFeatureFlags, type DashboardFeatureFlagName } from '@/lib/config/feature-flags';
import { BetaFeatureDisabledNotice } from './BetaFeatureDisabledNotice';

interface BetaFeatureGateProps {
  flag: DashboardFeatureFlagName;
  children: ReactNode;
  fallback?: ReactNode;
  title?: string;
  description?: string;
}

export function BetaFeatureGate({
  flag,
  children,
  fallback,
  title,
  description,
}: BetaFeatureGateProps) {
  const flags = getFeatureFlags();
  if (flags[flag]) return <>{children}</>;

  return (
    <>
      {fallback ?? (
        <BetaFeatureDisabledNotice
          title={title}
          description={description}
          flagName={flag}
        />
      )}
    </>
  );
}
