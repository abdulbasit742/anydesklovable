# ChatGPT Part 24 — Viewer Connect Test Pack

Branch: `chatgpt/24-viewer-test-pack`

## Purpose

This part adds small reusable viewer helpers so Manus/Max can wire device detail pages to the view-only viewer route without touching risky features.

## Files added

- `src/components/viewer/OpenViewerButton.tsx`
- `src/lib/viewer/viewerLinks.ts`
- `docs/CHATGPT_PART_24_VIEWER_CONNECT_TEST_PACK.md`

## How to use

Use `OpenViewerButton` in a device card/detail page:

```tsx
<OpenViewerButton deviceId={device.id} disabled={device.status !== "online"} />
```

Or use URL helpers:

```ts
buildViewerUrl(device.id)
buildViewerSessionUrl(session.id)
```

Viewer route already exists from Part 22:

- `/dashboard/viewer?deviceId=<DEVICE_ID>`
- `/dashboard/viewer?sessionId=<SESSION_ID>`

## Safety

This only opens the view-only viewer route.
It does not enable remote input, clipboard sync, file transfer, unattended access, silent access, or recording.

## Next step

Manus/Max should replace the old Connect button behavior with `OpenViewerButton` or `buildViewerUrl(device.id)`.
