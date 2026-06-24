# ChatGPT Part 21 — Dashboard Viewer Signaling Service

Branch: `chatgpt/21-webrtc-viewer-signaling-service-v2`

## Purpose

Adds a dashboard/PWA Socket.IO signaling client for the view-only screen sharing MVP.

## Files changed

- `package.json`
- `src/lib/services/webrtcViewerService.ts`

## Added dependency

- `socket.io-client`

## Supported actions

- connect using stored API token
- request a view-only session
- join and leave a session room
- send end-session and emergency-stop events
- send and receive WebRTC offer, answer, ICE candidate, and connection-state events

## Safety notes

This service is only a signaling transport. It does not implement OS input control, clipboard sync, file transfer, unattended access, or recording.

## Next required part

Part 22 should add the viewer component/page with RTCPeerConnection and video rendering.
