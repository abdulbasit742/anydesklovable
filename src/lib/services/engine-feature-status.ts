export type EngineBetaFeatureName =
  | 'beta_engine'
  | 'socket_access'
  | 'signaling_access'
  | 'desktop_consent'
  | 'support_diagnostics'
  | 'release_manifest';

export interface EngineFeatureStatusResponse {
  service: string;
  status: string;
  features: Record<EngineBetaFeatureName, boolean>;
}

export interface EngineFeatureStatusResult {
  ok: boolean;
  configured: boolean;
  data?: EngineFeatureStatusResponse;
  error?: string;
}

function readEnv(name: string): string | undefined {
  const viteValue = import.meta.env[name] as string | undefined;
  if (viteValue) return viteValue;
  if (typeof process !== 'undefined') return process.env[name];
  return undefined;
}

export function getEngineApiBaseUrl(): string | null {
  const value = readEnv('VITE_ENGINE_API_BASE_URL') ?? readEnv('ENGINE_API_BASE_URL');
  if (!value) return null;
  return value.replace(/\/$/, '');
}

export async function fetchEngineFeatureStatus(signal?: AbortSignal): Promise<EngineFeatureStatusResult> {
  const baseUrl = getEngineApiBaseUrl();
  if (!baseUrl) {
    return {
      ok: false,
      configured: false,
      error: 'ENGINE_API_BASE_URL is not configured for dashboard-to-engine status checks.',
    };
  }

  try {
    const res = await fetch(`${baseUrl}/api/beta/features`, {
      method: 'GET',
      headers: { accept: 'application/json' },
      signal,
    });

    if (!res.ok) {
      return {
        ok: false,
        configured: true,
        error: `Engine feature status request failed with HTTP ${res.status}.`,
      };
    }

    const data = (await res.json()) as EngineFeatureStatusResponse;
    return { ok: true, configured: true, data };
  } catch (error) {
    return {
      ok: false,
      configured: true,
      error: error instanceof Error ? error.message : 'Unknown engine feature status error.',
    };
  }
}
