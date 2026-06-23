# Prompt 24 Safety Visibility Completion

This document tracks the implementation of safety visibility indicators across the `anydesklovable` web dashboard.

## Pages Checked
*   `/dashboard/devices`
*   `/dashboard/sessions`
*   `/dashboard/policies`
*   `/dashboard/operations`

## Safety Labels Added
*   **DataSourceBadge:** Implemented globally. Every page now clearly indicates if it is using `Live`, `Mock`, `Placeholder`, or `Supabase` data. This prevents users from mistaking demo UI for functional production controls.
*   **Error Boundaries:** Implemented globally to ensure failures fail safely without exposing stack traces.

## Remaining Missing Labels
*   **Active Session Viewer:** When implemented, the session viewer MUST display a persistent, un-hideable banner indicating that the session is active, whether remote input is enabled, and a prominent "Disconnect" button.
*   **Policy Editor:** The UI needs clearer warnings when an admin attempts to relax security policies (e.g., changing consent requirements from "Always Ask" to "Password Only").

## Risky Features Still Placeholder
The following features are currently placeholders in the UI and are not wired to backend logic. They must remain clearly labeled as placeholders until fully implemented and security reviewed:
*   Remote Input toggle.
*   Clipboard Sync toggle.
*   File Transfer interface.
*   Device Revocation action (currently a mock UI action).
