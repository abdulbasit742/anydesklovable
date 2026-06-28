# RemoteDesk Dashboard

Browser-based control center for RemoteDesk. Installable as a PWA, works without Supabase in local mode.

## Stack

- TanStack Start v1 (React 19, Vite 7, file-based routing)
- Tailwind v4 + shadcn/ui components
- Socket.IO client for real-time signaling
- WebRTC for P2P screen sharing (browser ↔ browser, browser ↔ desktop)
- TanStack Query for data fetching
- Zustand-free — local state via React hooks + sessionStorage

## Quick start

### Requirements
- Node.js 20+
- npm 10+
- RemoteDesk API running on port 5000 (see [anydesk repo](https://github.com/abdulbasit742/anydesk))

### 1. Install

```bash
npm install
```

### 2. Configure

```bash
cp .env.example .env
```

`.env` for local dev:

```env
VITE_API_URL=http://localhost:5000
VITE_SIGNALING_URL=http://localhost:5000
# No VITE_SUPABASE_URL = local mode (no Supabase needed)
```

### 3. Run

```bash
npm run dev
```

Dashboard starts on `http://localhost:5173`.

### 4. Build

```bash
npm run build        # production build
npm run typecheck    # TypeScript check (zero errors)
```

## Local mode vs Supabase mode

The dashboard detects which mode to use automatically:

| Condition | Mode | Auth | Data |
|-----------|------|------|------|
| `VITE_SUPABASE_URL` not set | **Local** | Express API at `VITE_API_URL` | API responses + demo data |
| `VITE_SUPABASE_URL` set | **Supabase** | Supabase auth | Live Postgres via RLS |

In local mode: login/signup hit `POST /api/auth/login` and `POST /api/auth/register` on the Express API. Sessions are stored in `localStorage` as `rd_local_session`.

## PWA install

The dashboard is fully installable as a PWA:
- `public/manifest.webmanifest` — `display: standalone`, theme `#0b1220`
- `public/sw.js` — service worker with static asset caching
- Icons: `icon-192.png`, `icon-512.png`, `apple-touch-icon.png`

Serve over HTTPS or `localhost` → Chrome shows the install prompt.

## Remote Desktop (browser WebRTC)

Route: `/dashboard/remote-desktop`

- Each browser tab gets a 9-digit session ID (stored in `sessionStorage`)
- Viewer enters host's ID → `connect:request` emitted to signaling server
- Host approves → browser screen-picker → WebRTC P2P stream
- Viewer sees live screen in `<video>` element
- No server stores screen content — direct P2P

## Key routes

| Route | Description |
|-------|-------------|
| `/login` | Local or Supabase auth |
| `/signup` | Register + auto-login |
| `/dashboard` | Overview tiles |
| `/dashboard/remote-desktop` | Live WebRTC screen share |
| `/dashboard/devices` | Registered devices |
| `/dashboard/sessions` | Session history |
| `/dashboard/audit` | Audit log |
| `/dashboard/developer` | SDK, API keys, ICE config |

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Express API base URL |
| `VITE_SIGNALING_URL` | Yes | Socket.IO signaling URL (usually same as API) |
| `VITE_SUPABASE_URL` | No | Supabase project URL — enables Supabase mode |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | No | Supabase anon key |

## Project structure

```
src/
├── components/
│   ├── app/          # AppShell, ErrorBoundary, sidebar nav
│   └── ui/           # shadcn/ui primitives
├── hooks/
│   ├── use-auth.tsx          # Auth (local + Supabase)
│   └── use-remote-session.ts # WebRTC session lifecycle
├── lib/
│   ├── local-auth.ts  # Local mode auth helpers
│   └── signaling.ts   # Typed Socket.IO client
├── routes/
│   ├── __root.tsx                    # Root layout, PWA meta, SW registration
│   ├── dashboard.remote-desktop.tsx  # WebRTC screen share page
│   └── dashboard.*.tsx               # All dashboard routes
└── integrations/
    └── supabase/client.ts  # No-op stub when Supabase keys not set
```

## License

MIT
