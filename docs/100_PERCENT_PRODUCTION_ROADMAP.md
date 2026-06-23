# 100% Production Roadmap (Dashboard/Web)

This roadmap outlines the steps required to bring the `anydesklovable` web dashboard to a 100% production-ready state.

## Already Complete (75-90%)
*   **Public Website:** Home, pricing, and download pages are fully designed, responsive, and ready for content finalization.
*   **Auth Flow:** Login and signup pages are wired to Supabase Auth and function correctly.
*   **Dashboard UI Shell:** The main layout, sidebar, header, and routing structure are robust.

## Demo-Ready (50-75%)
*   **Core Dashboard Pages:** Devices, Sessions, Audit, and Team pages exist and look excellent, but they are populated with static `mock-data.ts` rather than live API calls.
*   **Operations Dashboard:** Health metrics and system status UI is built but relies on mock data.

## Partially Implemented (25-50%)
*   **Policies:** UI exists but needs wiring to the backend to actually enforce settings on devices.
*   **Billing & Support:** UI shells exist, but forms are placeholders lacking Stripe/Zendesk integration.

## Placeholder / Dry-Run (0-25%)
*   **Device Enrollment:** The flow to generate a pairing code and link a new device is not built.
*   **Active Session Viewer:** The actual WebRTC canvas to view a remote screen is a placeholder.

## Supabase Data Wiring
The most significant blocker for the dashboard is replacing the `mock-data.ts` imports with actual TanStack Query hooks that fetch data from the Supabase/Express API.

## Mock-to-Real Transitions
*   Implement `useDevices`, `useSessions`, `useAuditLogs` hooks.
*   Ensure the `DataSourceBadge` dynamically updates from "Mock" to "Live" as these hooks are implemented.

## Mobile & Accessibility
*   **Status:** The UI is generally responsive, but complex tables (like Audit Logs) need better mobile card views.
*   **Accessibility:** Needs a full ARIA audit, keyboard navigation testing, and contrast ratio verification.

## PWA Readiness
*   Add a Web App Manifest, service worker for offline fallback, and necessary icons to allow users to install the dashboard as a PWA.

## Production Readiness
*   Remove all mock data files from the production bundle.
*   Configure environment variables for production Supabase/API URLs.
*   Deploy to a CDN (e.g., Vercel, Netlify).
