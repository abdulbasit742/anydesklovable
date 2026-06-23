# Production Blockers (Dashboard/Web)

The following items strictly block the `anydesklovable` repository from being considered production-ready.

## 1. Mock Data Dependency
The dashboard relies almost entirely on `src/lib/mock-data.ts`. It does not fetch real devices, sessions, or audit logs from the backend API. This must be replaced with real data fetching hooks.

## 2. Missing Session Viewer
The core feature of the web client—viewing a remote desktop session—is not implemented. The WebRTC canvas and signaling logic to connect to a remote device do not exist in the UI.

## 3. Missing Device Enrollment
Users cannot currently add a new device to their account via the dashboard. The UI flow to generate a pairing code and display instructions is missing.

## 4. Unenforced Policies
The Policies dashboard allows users to toggle settings (e.g., "Require Host Consent"), but these changes are not saved to a backend and do not affect actual device behavior.

## 5. Formatting Errors
While not a functional blocker, the 26,488 ESLint/Prettier formatting errors indicate that the codebase has not been properly standardized, which will hinder future development and code reviews.
