# RemoteDesk — Web SaaS Control Center

The web dashboard for **RemoteDesk**, an AnyDesk-style remote-desktop SaaS.
This repo only contains the **web app + backend schema** — the Electron
desktop client and WebRTC engine live in separate repos.

## Stack

- TanStack Start v1 (React 19, Vite 7)
- Tailwind v4 + shadcn/ui
- TanStack Query for data fetching
- Lovable Cloud (Supabase) for auth + Postgres + storage

## Setup

### 1. Install

```bash
bun install
```

### 2. Backend

This project is wired to **Lovable Cloud**, which provisions a Supabase
project automatically. The required env vars (`VITE_SUPABASE_URL`,
`VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) are
auto-injected — no manual setup needed.

If you self-host on a different Supabase project, copy `.env.example` to
`.env.local`, fill in your values, and apply the schema in
`docs/schema.sql` (or replay the migrations under `supabase/migrations/`).

### 3. Run

```bash
bun dev
```

## Pages wired to Supabase

| Route | Backend status |
| --- | --- |
| `/signup` `/login` `/forgot-password` `/reset-password` | Real Supabase auth (email + password) |
| `/dashboard/*` | Auth-gated client-side; redirects to `/login` if no session |
| `/dashboard/devices` | Live query against `public.devices` (RLS) + revoke mutation |
| `/dashboard/audit` | Live query against `public.audit_logs` (RLS, filter by severity) |
| `AppShell` sidebar (user info, sign-out) | Reads current user + team from Supabase |

## Pages still using mock/demo data (UI only, pending wiring)

These render real screens but read from `src/lib/mock-data.ts`. Each page
already exposes loading/error/empty-state slots, so swap-in is a small,
mechanical change:

- `/dashboard` (overview tiles)
- `/dashboard/devices/$deviceId`
- `/dashboard/sessions`
- `/dashboard/team`
- `/dashboard/billing`
- `/dashboard/security`
- `/dashboard/policies/*` (file-transfer, clipboard, remote-input)
- `/dashboard/admin`
- `/dashboard/support`

## Schema

Source of truth: **the migrations** applied to Lovable Cloud (see
`supabase/migrations/`). `docs/schema.sql` is a human-readable snapshot.

Tables: `profiles`, `teams`, `team_members`, `devices`, `sessions`,
`subscriptions`, `invoices`, `security_policies`, `file_transfer_policies`,
`clipboard_policies`, `remote_input_policies`, `audit_logs`.

RLS pattern:
- Members can read everything scoped to teams they belong to
  (via `public.is_team_member`).
- Only `owner` / `admin` can write policies and team membership
  (via `public.has_role`).
- Helper functions are `security definer` with `EXECUTE` revoked from
  `anon` / `authenticated` (RLS-only callers).

Auto-provisioned on signup (`handle_new_user` trigger on `auth.users`):
- profile row
- personal `teams` row (owner = new user)
- `team_members` row with role `owner`
- default rows in all four policy tables + `subscriptions` (`free` plan)

## What is intentionally NOT in this repo

- Electron desktop client
- WebRTC streaming engine
- Native OS input control / TURN server / desktop IPC

## Files changed in this integration pass

- `src/hooks/use-auth.tsx` (new)
- `src/hooks/use-current-team.ts` (new)
- `src/routes/login.tsx`
- `src/routes/signup.tsx`
- `src/routes/forgot-password.tsx`
- `src/routes/reset-password.tsx` (new)
- `src/routes/dashboard.tsx` (auth gate)
- `src/routes/dashboard.devices.tsx` (live query + mutation)
- `src/routes/dashboard.audit.tsx` (live query)
- `src/components/app/AppShell.tsx` (real user + sign-out)
- `.env.example` (new)
- `supabase/migrations/*` (schema)
