# Mock-to-Real Wiring Plan

**Date:** June 23, 2026
**Project:** RemoteDesk Dashboard (`anydesklovable`)

## 1. Objective

The `anydesklovable` dashboard currently utilizes a mock data fallback system (`src/lib/services/index.ts`) to populate the user interface when real data is unavailable. This document outlines the phased approach required to systematically replace this mock data with live data fetched securely from the `anydesk` Express API.

## 2. Phase 1: Core Entity Synchronization

Before wiring individual pages, the dashboard's data models must be synchronized with the backend API.

The dashboard currently relies on local TypeScript interfaces generated from Supabase schemas and mock data definitions. The immediate priority is to update the dashboard to import the shared TypeScript interfaces from `anydesk/packages/shared`. This ensures the frontend expects the exact data structures returned by the new API, preventing runtime errors and ensuring consistent data representation across the platform.

## 3. Phase 2: Read-Only Wiring Priority

The transition to real data will begin with read-only operations. The following pages will be updated to fetch data from the API, and their corresponding mock data services will be deprecated.

1.  **/dashboard/devices/$deviceId:** The `useDevice` hook will be updated to fetch detailed device metrics and policy configurations from the `/api/devices/:deviceId` endpoint.
2.  **/dashboard/sessions:** The `useSessions` hook will be updated to retrieve both active and historical session records from the `/api/sessions` endpoint.
3.  **/dashboard/team:** The `useTeamMembers` hook will be updated to fetch the member list and their respective roles from the `/api/teams/:teamId/members` endpoint.
4.  **/dashboard/security:** The `useSecurityOverview` hook will be updated to aggregate security metrics from the new API endpoints, replacing the current Supabase RPC call which may not have access to real-time session data.

## 4. Phase 3: Policy and Configuration Mutations

Once read operations are stable and verified, we will implement the mutations required to update team settings and security policies.

1.  **/dashboard/policies/remote-input:** The toggle switches controlling remote input will be wired to send a `PATCH` request to the `/api/policies/remote-input` endpoint.
2.  **/dashboard/policies/clipboard:** The toggle switches controlling clipboard sharing will be wired to send a `PATCH` request to the `/api/policies/clipboard` endpoint.
3.  **/dashboard/policies/file-transfer:** The toggle switches controlling file transfer capabilities will be wired to send a `PATCH` request to the `/api/policies/file-transfer` endpoint.

It is crucial that the UI correctly handles loading states during these operations and displays clear error messages if a policy update fails due to Role-Based Access Control (RBAC) restrictions enforced by the backend.

## 5. Phase 4: Session Lifecycle Actions

This phase connects the dashboard to the core signaling server, enabling the initiation and monitoring of remote sessions.

1.  **Quick Connect:** The connection flow will be updated to send a `POST` request to the `/api/sessions/request` endpoint. Upon successful request, the UI must transition to a "waiting for host approval" state.
2.  **Active Session View:** A real-time listener (utilizing Socket.IO) will be implemented to monitor the status of the requested session, allowing the dashboard to update immediately when a session is accepted, rejected, or terminated.

## 6. Phase 5: Administrative and Support Features

The final phase involves wiring the administrative and support interfaces to the backend API.

1.  **/dashboard/billing:** The subscription overview and invoice list will be wired to the `/api/billing/*` endpoints. Sensitive actions, such as plan upgrades, will utilize the `PermissionGate` component to ensure only authorized users can initiate them.
2.  **/dashboard/support:** The ticket list and ticket creation form will be wired to the `/api/support/tickets` endpoints.
3.  **/dashboard/admin:** The administrative overview metrics will be updated to aggregate data directly from the backend API's metrics endpoints.

## 7. Implementation Guidelines

As each service is successfully wired to the live API, the corresponding `withFallback` logic and references to `src/lib/mock-data.ts` must be permanently removed from the codebase. Robust error handling must be implemented for all API calls, ensuring the UI gracefully displays specific error messages returned by the API (e.g., `POLICY_BLOCKED`, `TEAM_ACCESS_REQUIRED`). Finally, the API client must be configured to automatically attach the user's authentication token (the Supabase JWT) to all requests to ensure proper authorization.
