# RemoteDesk Dashboard PWA — Agent Instructions

## Repo

`github.com/abdulbasit742/anydesklovable` — branch `manus/part1-10-full-project-ready`.

This is the RemoteDesk installable dashboard/PWA. It is not the host desktop service. The host machine still needs the Electron desktop app from `abdulbasit742/anydesk` for OS-level screen capture, unattended access, and input control.

## Related repos

| Repo | Purpose |
|---|---|
| `abdulbasit742/anydesk` | API + Socket.IO signaling + Electron desktop app |
| `abdulbasit742/remotedesk-mobile` | Expo/React Native mobile app |
| `abdulbasit742/anydesklovable` | Dashboard PWA / admin / viewer shell |

## Required env vars

```env
VITE_API_URL=http://localhost:5000
VITE_SIGNALING_URL=http://localhost:5000
VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=YOUR-PROJECT-REF
SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

For production, use HTTPS/WSS backend URLs, for example:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_SIGNALING_URL=https://api.yourdomain.com
```

## Backend beta gates

The API must have these enabled or signaling will be rejected/blocked:

```env
BETA_SOCKET_ENABLED=true
BETA_WEBRTC_SIGNALING_ENABLED=true
```

## Socket.IO contract

The dashboard signaling helper lives at:

`src/lib/signaling.ts`

Client to backend:

| Dashboard emits | Backend handler |
|---|---|
| `connect:request` | `ClientEvents.ConnectRequest` |
| `connect:response` | `ClientEvents.ConnectResponse` |
| `webrtc:offer` | `ClientEvents.WebrtcOffer` |
| `webrtc:answer` | `ClientEvents.WebrtcAnswer` |
| `webrtc:ice` | `ClientEvents.WebrtcIce` |
| `session:end` | `ClientEvents.SessionEnd` |

Backend to dashboard:

| Backend emits | Payload |
|---|---|
| `incoming:request` | `{ sessionId, requesterRemoteDeskId, requesterSocketId }` |
| `request:accepted` | `{ sessionId, hostSocketId }` |
| `request:rejected` | `{ sessionId? }` |
| `webrtc:offer` | `{ sessionId, signal, fromSocketId }` |
| `webrtc:answer` | `{ sessionId, signal, fromSocketId }` |
| `webrtc:ice` | `{ sessionId, signal, fromSocketId }` |
| `peer:disconnected` | `{ sessionId? }` |
| `error` | `{ message, code?, feature? }` |

Do not emit old unsupported events: `session:join`, `session:leave`, `session:request`, `session:accept`, `session:reject`, or `webrtc:ice-candidate`.

## Build commands

```bash
npm install
npm run build
npm run env:validate
```

## Rules for agents

- Do not rebuild the project from scratch.
- Do not touch unrelated repos such as SuperSender Pro.
- Do not hardcode backend URLs in components; use `VITE_API_URL` and `VITE_SIGNALING_URL`.
- Do not put service-role keys into frontend code.
- Keep this app as a dashboard/PWA; OS-level control belongs in the Electron app.
