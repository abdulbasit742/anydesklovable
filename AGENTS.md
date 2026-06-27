# RemoteDesk Dashboard — Agent Instructions

## This repo
**github.com/abdulbasit742/anydesklovable** — branch `manus/part1-10-full-project-ready`

Part of the RemoteDesk platform. See root `AGENTS.md` for full project context.

## What this repo contains
A **PWA dashboard** and admin panel for RemoteDesk.  
Hosted on Lovable / Vercel. Connects to Supabase (data/auth) and the Node.js backend (signaling).

## Key files
| File | Purpose |
|------|---------|
| `src/lib/services/index.ts` | All Supabase queries (devices, sessions, billing, security) |
| `src/lib/signaling.ts` | Socket.IO signaling service — use `VITE_SIGNALING_URL` |
| `src/integrations/supabase/client.ts` | Supabase client init |
| `public/manifest.webmanifest` | PWA manifest |
| `public/sw.js` | Service worker (caching) |
| `.env.example` | All required env vars |

## Start
```bash
npm install
cp .env.example .env.local   # fill in Supabase + backend URLs
npm run dev
# → http://localhost:5173
```

## Deploy
```bash
npm run build
npx vercel --prod
```

## Env vars required
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SIGNALING_URL=http://localhost:5000    # or Cloudflare Tunnel URL
VITE_API_URL=http://localhost:5000
```

## Rules
- Data goes through Supabase (devices, sessions, billing, team, security events).
- WebRTC signaling goes through `signalingService` from `src/lib/signaling.ts`.
- All UI must be responsive (TailwindCSS).
- Never import from `anydesklovable/` into other repos — this is a standalone frontend.
