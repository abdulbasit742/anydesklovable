# ChatGPT Part 22 — Viewer Route + Remote Screen Component

Branch: `chatgpt/21-webrtc-viewer-signaling-service-v2`

## Purpose

Adds a dashboard/PWA-side view-only viewer route for the PC-to-PC MVP.

## Files added

- `src/components/viewer/RemoteScreen.tsx`
- `src/routes/dashboard.viewer.tsx`

## How to open

Viewer route:

- `/dashboard/viewer?sessionId=SESSION_ID`
- `/dashboard/viewer?deviceId=DEVICE_ID`

With `sessionId`, the page joins the existing session room.

With `deviceId`, the page can request a new view-only session from the target host device, then join that session.

## Behavior

The viewer page:

1. connects to the Socket.IO signaling server with the stored API token
2. joins the `session:{sessionId}` room
3. waits for a host `webrtc:offer`
4. creates a browser RTCPeerConnection
5. sends `webrtc:answer`
6. exchanges `webrtc:ice_candidate`
7. renders the remote MediaStream in a video element
8. supports end-session and emergency-stop actions

## Safety scope

This page is view-only.

It does not enable:

- keyboard control
- mouse control
- clipboard sync
- file transfer
- unattended access
- recording

## Next part

Part 23 should wire the device detail Connect button to this viewer route and wire the desktop host helper into the desktop app UI.
