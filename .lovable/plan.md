This is a large request that bundles two independent features. I'll ship both, scoped tight so we don't balloon the codebase. Confirm and I'll execute end-to-end.

## Part A — Security backend

**Migration 1** adds three tables, all owner-scoped via `auth.uid()`:
- `trusted_devices` — name, fingerprint, browser, os, ip, trusted_at, last_seen_at, revoked_at
- `active_sessions` — label, ip, user_agent, device_name, location, last_active_at, revoked_at
- `security_events` — event_type, severity (`info|warning|critical`), ip, user_agent, metadata jsonb

RLS: users SELECT/UPDATE own rows (revoke = `update revoked_at`); users INSERT own `security_events`; no cross-user reads. GRANTs to `authenticated` + `service_role`. Indexes per spec.

**Service layer** (`src/lib/services/index.ts`): `useTrustedDevices`, `useActiveSessions`, `useSecurityEvents(filters)`, `revokeTrustedDevice`, `revokeActiveSession`, `createSecurityEvent`, `getMfaStatus()` (reads `supabase.auth.mfa.listFactors()` — real read, no fake writes).

**Security page** (`dashboard.security.tsx`) — upgrade in place, keep existing cards:
- MFA card: real status from `listFactors()`; enable/disable buttons disabled with "Requires desktop app enrollment" helper text (since TOTP enroll needs QR flow we're not building this turn).
- Trusted devices table: list + revoke + empty/loading/error.
- Active sessions table: list + revoke + "Sign out everywhere" (already wired).
- Security events timeline: severity + event_type filters, badges, states.
- All log `createSecurityEvent` on revoke/global signout.
- Demo banner when tables empty.

## Part B — Billing / usage

**Migration 2** adds:
- `plan_limits` (seeded: free/pro/business/enterprise with device/seat/minute caps + feature flags). Public read to authenticated; no client writes.
- `usage_metrics` (user_id XOR team_id, metric_key, metric_value, period_start/end, source, metadata). RLS: own user rows + team rows via `is_team_member`. No client INSERT (schema comment: server-side only).
- `billing_invoices` (extends concept of existing `invoices` — keep existing table, add this richer one only if needed). **Decision: reuse existing `invoices` table; skip `billing_invoices`** to avoid duplication.
- `account_subscriptions` — **skip; existing `subscriptions` table covers this.** Add missing columns via ALTER if needed (`billing_interval`, `cancel_at_period_end`, `provider`).

**Service layer**: `useCurrentSubscription`, `usePlanLimits`, `useUsageSummary` (computes from `devices`/`sessions`/`team_members`/`support_tickets` when `usage_metrics` empty — fallback banner shown), `useBillingInvoices` (already exists).

**Billing page** upgrade in place:
- Current plan card (existing) — add status + period + interval.
- Usage meters (existing) — expand to: devices, active devices, session minutes, team members, support tickets. Color thresholds 70/90/100. "Unlimited" when null.
- Over-limit warning card when any meter ≥90%.
- Plan comparison table (free/pro/business/enterprise) with current-plan badge.
- Invoice table (existing) — keep.
- Upgrade modal: target plan + price + CTA → `src/lib/config/checkout.ts` placeholder URLs (clearly marked).

**Reusable components** (`src/components/app/billing/`): `UsageMeter`, `PlanBadge`, `PlanComparisonTable`, `UsageWarningCard`, `UpgradePrompt`.

**Dashboard snapshot**: small "Plan & usage" card on `dashboard.index.tsx` (plan badge + devices/sessions meters + upgrade warning if near limit).

**Team page**: plan badge + seat usage meter; upgrade CTA disabled for non-owner/admin.

**Admin page**: accounts-by-plan + over-limit accounts rollup with graceful empty state.

## What I'm explicitly NOT doing
- No Stripe wiring (placeholder checkout URLs in config only).
- No MFA enroll flow (status read only — clearly labeled).
- No new `billing_invoices`/`account_subscriptions` tables — reuse existing `invoices`/`subscriptions` to avoid schema duplication. I'll ALTER `subscriptions` to add `billing_interval`, `cancel_at_period_end`, `provider` if missing.
- No server-side usage rollup jobs (computed client-side from existing tables with banner).
- No redesign — every change is in-place on existing routes/components.

## Order of execution
1. Migration 1 (security tables) → wait for approval.
2. Migration 2 (plan_limits + usage_metrics + subscriptions ALTER + seed) → wait for approval.
3. Service layer additions.
4. Security page upgrade.
5. Billing components + page upgrade.
6. Dashboard/team/admin touch-ups.

Approve and I'll start with Migration 1.