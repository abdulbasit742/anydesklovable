# ChatGPT Part 19 — Dashboard API Service Wiring

Branch: `chatgpt/19-dashboard-api-service-wiring-2026`

## Purpose

This part adds a direct backend API service layer for the RemoteDesk dashboard so Manus/Max can start replacing mock/Supabase-only device and session calls with the real API.

## Files added

- `src/lib/services/backendApi.ts`
- `src/lib/services/authService.ts`
- `src/lib/services/deviceService.ts`
- `src/lib/services/sessionService.ts`

## Default API URL

The service layer reads:

1. `VITE_REMOTEDESK_API_URL`
2. `VITE_API_BASE_URL`
3. fallback: `http://localhost:5000`

No secrets are stored in these files.

## Minimum backend endpoints expected

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- optional `POST /api/auth/logout`

Devices:

- `GET /api/devices`
- `GET /api/devices/:id`
- `POST /api/devices/enroll`
- `POST /api/devices/:id/heartbeat`
- `POST /api/devices/:id/revoke`

Sessions:

- `GET /api/sessions`
- `GET /api/sessions/:id`
- `POST /api/sessions`
- `POST /api/sessions/:id/accept`
- `POST /api/sessions/:id/deny`
- `POST /api/sessions/:id/end`
- `POST /api/sessions/:id/emergency-stop`

## Next step for Manus/Max

1. Pull this branch.
2. Run `npm install` or `bun install` according to the repo.
3. Run `npm run build` or `bun run build`.
4. Wire the devices page to `useBackendDevices()` only after backend device routes are implemented.
5. Wire session buttons to `useCreateBackendSession()` only after backend session routes are implemented.

## Safety notes

- This does not enable silent access.
- This does not enable unattended access.
- This does not enable remote input.
- This does not enable clipboard or file transfer.
- It only creates dashboard-to-backend service clients.
