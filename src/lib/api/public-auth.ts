// Public API v1 auth + rate limit + request logging wrapper.
// Server-only — relies on @/integrations/supabase/client.server which uses
// the service role key. Never import this file from the client bundle.
import { createHash, randomBytes } from "crypto";
import { checkFeatureGate } from "@/lib/config/feature-flags";

type Json = unknown;

export type AuthedContext = {
  apiKeyId: string;
  teamId: string;
  scopes: string[];
  requestId: string;
};

export type ScopeRule =
  | "read:team" | "read:devices" | "write:devices" | "read:presence"
  | "read:sessions" | "write:sessions" | "read:support" | "write:support"
  | "read:billing" | "read:automation" | "write:automation" | "read:audit"
  | "read:notifications" | "write:webhooks" | "read:webhooks";

const WINDOW_MS = 60_000;
const LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/me":                    { limit: 120, windowMs: WINDOW_MS },
  "read":                   { limit: 300, windowMs: WINDOW_MS },
  "write":                  { limit: 60,  windowMs: WINDOW_MS },
  "automation:trigger":     { limit: 20,  windowMs: 10 * WINDOW_MS },
  "webhooks:manage":        { limit: 60,  windowMs: WINDOW_MS },
};

function newRequestId(): string {
  return "req_" + randomBytes(12).toString("hex");
}

function json(body: Json, status: number, requestId: string, extraHeaders: Record<string,string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "x-request-id": requestId,
      ...extraHeaders,
    },
  });
}

function errorBody(code: string, message: string, requestId: string) {
  return { error: { code, message, request_id: requestId } };
}

export function apiError(code: string, message: string, status: number, requestId: string, extra?: Record<string,string>) {
  return json(errorBody(code, message, requestId), status, requestId, extra);
}

export function apiOk(data: Json, requestId: string, status = 200, extra?: Record<string,string>) {
  return json(data, status, requestId, extra);
}

function classifyBucket(path: string, method: string, requiredScope: ScopeRule | null): keyof typeof LIMITS {
  if (path.endsWith("/v1/me")) return "/me";
  if (path.includes("/automation/pipelines/") && path.endsWith("/run")) return "automation:trigger";
  if (path.includes("/webhooks/")) return "webhooks:manage";
  if (method === "GET" || requiredScope?.startsWith("read:")) return "read";
  return "write";
}

type AdminClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message: string } | null }>;
};

async function checkRateLimit(
  admin: AdminClient,
  teamId: string,
  apiKeyId: string,
  bucket: keyof typeof LIMITS,
  path: string,
): Promise<{ allowed: boolean; remaining: number; resetAt: string }> {
  const cfg = LIMITS[bucket];
  const windowStart = new Date(Date.now() - cfg.windowMs).toISOString();
  // Best-effort count from api_requests within window for this key + bucket.
  // We use api_requests count as the proxy — service-role bypasses RLS.
  const res = await (admin as unknown as { from: (t: string) => { select: (s: string, o: { count: string; head: boolean }) => { eq: (c: string, v: unknown) => { gte: (c: string, v: unknown) => Promise<{ count: number | null; error: unknown }> } } } }).from("api_requests")
    .select("id", { count: "exact", head: true })
    .eq("api_key_id", apiKeyId)
    .gte("created_at", windowStart);
  const used = res.count ?? 0;
  const remaining = Math.max(0, cfg.limit - used);
  const resetAt = new Date(Date.now() + cfg.windowMs).toISOString();
  const allowed = used < cfg.limit;
  await admin.rpc("record_api_rate_limit_event", {
    p_team_id: teamId,
    p_api_key_id: apiKeyId,
    p_scope: bucket,
    p_limit_key: `${bucket}:${path}`,
    p_allowed: allowed,
    p_limit_count: cfg.limit,
    p_remaining: remaining,
    p_reset_at: resetAt,
    p_reason: allowed ? null : "limit_exceeded",
    p_metadata: {},
  });
  return { allowed, remaining, resetAt };
}

export type PublicHandler = (ctx: AuthedContext, request: Request, params: Record<string,string>) => Promise<Response>;

export function withPublicApi(scope: ScopeRule | null, handler: PublicHandler) {
  return async ({ request, params }: { request: Request; params: Record<string, string> }) => {
    const requestId = newRequestId();
    const startedAt = Date.now();
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    const ua = request.headers.get("user-agent");

    const gate = checkFeatureGate("publicApiEnabled");
    if (!gate.ok) {
      return apiError("feature_disabled", gate.message ?? "Public API is disabled by policy.", gate.status, requestId, {
        "x-feature-disabled": gate.feature ?? "publicApiEnabled",
      });
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const admin = supabaseAdmin as unknown as AdminClient;

    const logRequest = async (teamId: string | null, apiKeyId: string | null, status: number, errorCode?: string, errorMessage?: string) => {
      try {
        await admin.rpc("log_api_request", {
          p_team_id: teamId,
          p_api_key_id: apiKeyId,
          p_method: method,
          p_path: path,
          p_status_code: status,
          p_request_id: requestId,
          p_ip: null,
          p_user_agent: ua,
          p_latency_ms: Date.now() - startedAt,
          p_error_code: errorCode ?? null,
          p_error_message: errorMessage ?? null,
          p_metadata: {},
        });
      } catch { /* swallow logging errors */ }
    };

    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.toLowerCase().startsWith("bearer ") ? authHeader.slice(7).trim() : "";
    if (!token) {
      await logRequest(null, null, 401, "missing_bearer_token", "Authorization header missing");
      return apiError("invalid_api_key", "The API key is missing, invalid, expired, or revoked.", 401, requestId);
    }

    const hash = createHash("sha256").update(token).digest("hex");

    let verified: { api_key_id: string; team_id: string; scopes: string[]; status: string } | null = null;
    try {
      const { data, error } = await admin.rpc("verify_api_key_for_request", {
        _key_hash: hash,
        _required_scope: scope,
      });
      if (error) {
        const msg = error.message || "";
        // Map PG raised exceptions to API errors.
        if (msg.includes("missing_scope")) {
          await logRequest(null, null, 403, "insufficient_scope", msg);
          return apiError("insufficient_scope", `This API key is missing the required scope: ${scope}.`, 403, requestId);
        }
        if (msg.includes("key_revoked")) {
          await logRequest(null, null, 401, "key_revoked", msg);
          return apiError("invalid_api_key", "The API key has been revoked.", 401, requestId);
        }
        if (msg.includes("key_expired")) {
          await logRequest(null, null, 401, "key_expired", msg);
          return apiError("invalid_api_key", "The API key has expired.", 401, requestId);
        }
        await logRequest(null, null, 401, "invalid_api_key", msg);
        return apiError("invalid_api_key", "The API key is missing, invalid, expired, or revoked.", 401, requestId);
      }
      const rows = data as Array<{ api_key_id: string; team_id: string; scopes: string[]; status: string }> | null;
      verified = rows?.[0] ?? null;
    } catch (e) {
      await logRequest(null, null, 500, "internal_error", (e as Error).message);
      return apiError("internal_error", "Internal error verifying API key.", 500, requestId);
    }

    if (!verified) {
      await logRequest(null, null, 401, "invalid_api_key", "no row");
      return apiError("invalid_api_key", "The API key is missing, invalid, expired, or revoked.", 401, requestId);
    }

    const bucket = classifyBucket(path, method, scope);
    const rl = await checkRateLimit(admin, verified.team_id, verified.api_key_id, bucket, path);
    const rlHeaders = {
      "x-ratelimit-limit": String(LIMITS[bucket].limit),
      "x-ratelimit-remaining": String(rl.remaining),
      "x-ratelimit-reset": rl.resetAt,
    };
    if (!rl.allowed) {
      await logRequest(verified.team_id, verified.api_key_id, 429, "rate_limit_exceeded", `bucket=${bucket}`);
      return apiError("rate_limit_exceeded", "Rate limit exceeded. Slow down and retry after the reset time.", 429, requestId, rlHeaders);
    }

    let resp: Response;
    try {
      resp = await handler(
        { apiKeyId: verified.api_key_id, teamId: verified.team_id, scopes: verified.scopes, requestId },
        request,
        params ?? {},
      );
    } catch (e) {
      await logRequest(verified.team_id, verified.api_key_id, 500, "internal_error", (e as Error).message);
      return apiError("internal_error", "An unexpected error occurred.", 500, requestId, rlHeaders);
    }

    // attach rate-limit headers + request id
    const newHeaders = new Headers(resp.headers);
    newHeaders.set("x-request-id", requestId);
    for (const [k, v] of Object.entries(rlHeaders)) newHeaders.set(k, v);
    await logRequest(verified.team_id, verified.api_key_id, resp.status);
    return new Response(resp.body, { status: resp.status, headers: newHeaders });
  };
}

export function parsePagination(url: URL): { limit: number; cursor: string | null } {
  const raw = Number(url.searchParams.get("limit") ?? 50);
  const limit = Math.min(Math.max(Number.isFinite(raw) ? raw : 50, 1), 200);
  const cursor = url.searchParams.get("cursor");
  return { limit, cursor };
}

export function encodeCursor(value: string | null): string | null {
  return value ? Buffer.from(value).toString("base64url") : null;
}

export function decodeCursor(cursor: string | null): string | null {
  if (!cursor) return null;
  try { return Buffer.from(cursor, "base64url").toString("utf8"); } catch { return null; }
}
