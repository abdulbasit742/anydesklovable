export interface DashboardFeatureFlags {
  betaEnabled: boolean;
  publicSignupEnabled: boolean;
  deviceClaimEnabled: boolean;
  sessionRequestEnabled: boolean;
  publicApiEnabled: boolean;
  supportDiagnosticsEnabled: boolean;
  releaseDownloadEnabled: boolean;
  adminReleaseUiEnabled: boolean;
}

export type DashboardFeatureFlagName = keyof DashboardFeatureFlags;

export interface FeatureGateResult {
  ok: boolean;
  status: 200 | 403;
  code?: 'feature_disabled';
  feature?: DashboardFeatureFlagName;
  message?: string;
}

const truthy = new Set(['1', 'true', 'yes', 'on', 'enabled']);
const falsy = new Set(['0', 'false', 'no', 'off', 'disabled']);

function readBoolean(name: string, fallback: boolean): boolean {
  const value = import.meta.env[name] ?? process.env[name];
  if (!value) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (truthy.has(normalized)) return true;
  if (falsy.has(normalized)) return false;
  return fallback;
}

export function getFeatureFlags(): DashboardFeatureFlags {
  return {
    betaEnabled: readBoolean('VITE_BETA_ENABLED', readBoolean('BETA_ENABLED', false)),
    publicSignupEnabled: readBoolean('VITE_BETA_PUBLIC_SIGNUP_ENABLED', readBoolean('BETA_PUBLIC_SIGNUP_ENABLED', false)),
    deviceClaimEnabled: readBoolean('VITE_BETA_DEVICE_CLAIM_ENABLED', readBoolean('BETA_DEVICE_CLAIM_ENABLED', false)),
    sessionRequestEnabled: readBoolean('VITE_BETA_SESSION_REQUEST_ENABLED', readBoolean('BETA_SESSION_REQUEST_ENABLED', false)),
    publicApiEnabled: readBoolean('VITE_BETA_PUBLIC_API_ENABLED', readBoolean('BETA_PUBLIC_API_ENABLED', false)),
    supportDiagnosticsEnabled: readBoolean('VITE_BETA_SUPPORT_DIAGNOSTICS_ENABLED', readBoolean('BETA_SUPPORT_DIAGNOSTICS_ENABLED', false)),
    releaseDownloadEnabled: readBoolean('VITE_BETA_RELEASE_DOWNLOAD_ENABLED', readBoolean('BETA_RELEASE_DOWNLOAD_ENABLED', false)),
    adminReleaseUiEnabled: readBoolean('VITE_BETA_ADMIN_RELEASE_UI_ENABLED', readBoolean('BETA_ADMIN_RELEASE_UI_ENABLED', false))
  };
}

export function isBetaEnabled(): boolean {
  return getFeatureFlags().betaEnabled;
}

export function isPublicApiEnabled(): boolean {
  return getFeatureFlags().publicApiEnabled;
}

export function isSessionRequestEnabled(): boolean {
  return getFeatureFlags().sessionRequestEnabled;
}

export function isSupportDiagnosticsEnabled(): boolean {
  return getFeatureFlags().supportDiagnosticsEnabled;
}

export function isReleaseDownloadEnabled(): boolean {
  return getFeatureFlags().releaseDownloadEnabled;
}

export function isFeatureEnabled(name: DashboardFeatureFlagName): boolean {
  return getFeatureFlags()[name];
}

export function checkFeatureGate(name: DashboardFeatureFlagName): FeatureGateResult {
  if (isFeatureEnabled(name)) return { ok: true, status: 200 };
  return {
    ok: false,
    status: 403,
    code: 'feature_disabled',
    feature: name,
    message: 'This RemoteDesk beta capability is currently disabled by policy.'
  };
}

export function assertFeatureEnabled(name: DashboardFeatureFlagName): void {
  const result = checkFeatureGate(name);
  if (!result.ok) {
    throw new Error(result.message);
  }
}

export function getSafeFeatureFlagStatus(): DashboardFeatureFlags {
  return getFeatureFlags();
}
