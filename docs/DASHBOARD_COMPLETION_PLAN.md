# Dashboard Completion Plan

**Date:** June 23, 2026
**Project:** RemoteDesk Dashboard (`anydesklovable`)

## 1. Objective

The `anydesklovable` dashboard currently provides a comprehensive visual shell but lacks the underlying functionality to execute real remote desktop operations. This plan outlines the strategic steps required to transform the dashboard into a fully functional control center, securely integrated with the `anydesk` backend.

## 2. Phase 1: API Integration and Type Alignment

The foundational step is to ensure the dashboard and the backend communicate using identical data structures.

*   Replace local TypeScript interfaces with shared contracts imported directly from `anydesk/packages/shared`.
*   Implement a robust API client wrapper designed to handle authentication headers (specifically, attaching Supabase JWTs) and process standardized error responses (`ApiResult`).

## 3. Phase 2: Replacing Mock Data Services

The dashboard must be systematically updated to fetch live data from the new Express API endpoints, deprecating the static arrays returned from `mock-data.ts`.

The transition will prioritize read-only endpoints in the following order:
1.  Team Members and Roles (`/api/teams/:teamId/members`)
2.  Device Fleet Status (`/api/devices`)
3.  Active and Historical Sessions (`/api/sessions`)
4.  Security Policies (`/api/policies/*`)

## 4. Phase 3: Implementing Mutations and Actions

With read operations functioning, the UI must be wired to execute state-changing actions via the API, allowing administrators to manage their team and security posture.

*   **Device Revocation:** Wire the "Revoke Device" button to send a request to `/api/devices/:deviceId/revoke`.
*   **Policy Updates:** Connect the toggle switches in the Policies pages to their respective `PATCH` endpoints. The UI must be updated to handle loading states and gracefully display permission errors.
*   **Role Changes:** Wire the team member role dropdowns to the `/api/teams/:teamId/members/:memberId` endpoint.

## 5. Phase 4: Session Initiation and Real-Time Status

This phase connects the dashboard to the core signaling server, enabling the initiation and monitoring of remote sessions.

*   **Session Request:** Implement the session request flow. When a user initiates a connection, the dashboard must POST to `/api/sessions/request`.
*   **Real-Time Monitoring:** Integrate a Socket.IO client to listen for real-time events broadcast by the `anydesk` backend. The dashboard must handle events such as `device:online`, `session:accepted`, and `session:ended` to provide immediate visual feedback on session status and device availability.

## 6. Phase 5: Administrative and Support Features

The final phase completes the SaaS feature set required for user management and support.

*   **Support Interface:** Wire the Support page to allow users to create tickets and view responses via the API.
*   **Billing Integration:** Connect the Billing page to display real subscription data and invoice history, utilizing safe placeholders for actual payment processing until a provider is integrated.
*   **Admin Console:** Ensure the Admin console accurately aggregates data from the backend metrics endpoints.
