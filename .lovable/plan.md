
# Task #10 — Public API v1 + Webhook Developer Platform

This is a large feature pack. I'll ship it in 4 phases so each phase is reviewable, builds cleanly, and doesn't break existing features (API keys, presence, MFA, automation).

## Phase 1 — Data model, RLS, RPCs (single migration)

Tables (new or extended):
- `api_keys` — already exists; add `status`, `expires_at`, `created_by`, `revoked_by` if missing (safe `ADD COLUMN IF NOT EXISTS`).
- `api_requests` — request log.
- `api_rate_limit_events` — rate-limit log.
- `webhook_endpoints` — outbound endpoints (secret stored hashed).
- `webhook_events` — normalized events.
- `webhook_deliveries` — queued deliveries with retry metadata.
- `developer_docs_feedback`.

For every new table: GRANT to authenticated + service_role, enable RLS, scope policies via `is_team_member` / `has_role`. Inserts into logs/deliveries only via security-definer RPCs.

Indexes per spec (team_id+created_at desc, key_prefix, next_retry_at+status, etc.).

RPCs (security definer):
- `log_api_request(...)`, `record_api_rate_limit_event(...)`
- `verify_api_key_for_request(_key_hash, _required_scope)` → returns team_id, api_key_id, scopes, status, expires_at; updates last_used_at; raises typed errors.
- `create_webhook_endpoint`, `update_webhook_endpoint`, `disable_webhook_endpoint`, `enqueue_test_webhook_delivery`
- `create_webhook_event` — inserts event + fan-out deliveries for matching active endpoints.
- `claim_next_webhook_delivery` (FOR UPDATE SKIP LOCKED), `mark_webhook_delivery_success`, `mark_webhook_delivery_failed` (schedules retry with backoff).
- Helper: `get_developer_overview()` — counts for dashboard.

## Phase 2 — Public API auth helper + endpoints

`src/lib/api/public-auth.ts` — server-only helper:
- Parses `Authorization: Bearer rd_live_...`
- SHA-256 hashes the key (Web Crypto), calls `verify_api_key_for_request` via service-role admin client (loaded inside handler).
- Checks scope, status, expiry.
- Token-bucket-ish rate limit using `api_rate_limit_events` count in window.
- Wraps handler: generates `request_id`, captures latency, logs `api_requests`, returns standard `{ error: { code, message, request_id } }` JSON.

Routes under `src/routes/api/public/v1/`:
- `me.ts` (extend existing)
- `devices.ts`, `devices.$deviceId.ts`, `devices.$deviceId.presence.ts`
- `sessions.ts`, `sessions.$sessionId.ts`, `sessions.$sessionId.end.ts`
- `support.tickets.ts`
- `automation.pipelines.ts`, `automation.pipelines.$pipelineId.run.ts`, `automation.runs.$runId.ts`
- `notifications.ts`, `audit.logs.ts`, `billing.usage.ts`
- `webhooks.endpoints.ts`, `webhooks.endpoints.$endpointId.ts`, `webhooks.endpoints.$endpointId.test.ts`

All validated with zod, paginated via cursor where lists.

## Phase 3 — Developer dashboard UI

Rebuild `src/routes/dashboard.developer.tsx` as tabbed shell (Tabs from shadcn):
1. **Overview** — `DeveloperOverviewCards` (req 24h, failures, rate-limited, webhook success/fail).
2. **API Keys** — keep existing CRUD + reveal dialog; add scopes via `ApiScopeSelector` (grouped).
3. **API Logs** — `ApiRequestLogsTable` with filters + detail drawer.
4. **Rate Limits** — `ApiRateLimitPanel`.
5. **Webhooks** — `WebhookEndpointsTable`, `WebhookEndpointForm`, `WebhookDeliveryTable`, test button.
6. **Docs** — `DeveloperDocsPanel` (auth, scopes, endpoints, pagination, errors, rate limits, webhook signing, curl + TS examples).
7. **Playground** — `ApiPlayground` (method/path/body → generated curl + safe response).

Shared: `CodeBlockWithCopy`.

Hooks/services in `src/lib/services/developer.ts`:
`useDeveloperOverview`, `useApiKeys`, `useCreateApiKey`, `useRevokeApiKey`, `useApiRequestLogs`, `useApiRateLimitEvents`, `useWebhookEndpoints`, `useCreateWebhookEndpoint`, `useUpdateWebhookEndpoint`, `useDisableWebhookEndpoint`, `useTestWebhookEndpoint`, `useWebhookDeliveries`, `useWebhookEvents`, `useDeveloperDocsFeedback`, `useSubmitDeveloperDocsFeedback`.

## Phase 4 — Cross-feature integration

- `dashboard.index` — small "API usage today" card.
- `dashboard.security` — API security posture panel (active/stale/broad-scope keys, failed auth attempts).
- `dashboard.automation.index` — show API-triggered runs count.
- Audit logs + notifications wired into RPCs (key created/revoked, webhook created/disabled, test triggered, repeated failures).
- Security events recorded for key lifecycle / suspicious activity.

## Honest webhook delivery messaging

Deliveries are **queued only**. UI banner on Webhooks tab and on test action: "Delivery queued. Connect a webhook worker to deliver outbound HTTPS requests." `claim_next_webhook_delivery` is ready for a future worker; signing format documented in Docs tab.

## Acceptance check before completion

- `GET /api/public/v1/me` still works (existing behavior preserved).
- Revoked/expired/no-scope keys → 401/403 with standard error JSON.
- RLS prevents cross-team access (verified by policy review).
- TypeScript builds clean; no duplicate routes; existing pages untouched except the three add-on cards in Phase 4.

---

### Confirm to start

Reply **go** to begin Phase 1 (migration). I'll pause after each phase for review so we don't ship 30+ files in one unreviewable blob.
