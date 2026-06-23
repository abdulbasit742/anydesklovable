# Security and RLS Checklist

**Date:** June 23, 2026
**Project:** RemoteDesk (`anydesklovable`)

This checklist ensures that the transition from a direct Supabase client architecture to an API-driven architecture maintains and enhances the strict security posture required for a remote desktop platform.

## 1. Authentication and Token Management

The secure handling of authentication tokens is paramount to preventing unauthorized access.

*   **Supabase JWTs:** Verify that the frontend correctly retrieves and attaches the Supabase JSON Web Token (JWT) to the Authorization header of all requests sent to the `anydesk` Express API.
*   **Token Expiration:** Implement robust logic to handle token expiration gracefully. The application should either prompt the user to re-authenticate or silently refresh the token using the Supabase client if a valid session exists.
*   **No Service Role Exposure:** Conduct a thorough review to guarantee that the Supabase `service_role` key is never present in the frontend environment variables (`.env.local`, `.env.production`) or bundled within the client-side code.

## 2. API Authorization (Backend Enforcement)

Security controls must be enforced at the API layer, not just hidden in the UI.

*   **JWT Verification:** The Express API must cryptographically verify the signature of the incoming Supabase JWT on every protected route before processing the request.
*   **Team Scoping:** The API must extract the user's ID from the validated JWT and verify their active membership in the requested `team_id` before returning any data or executing mutations.
*   **Role-Based Access Control (RBAC):** The API must strictly enforce specific roles (owner, admin, technician, viewer) for sensitive actions. For example, only an `owner` or `admin` should be permitted to update security policies or revoke devices.

## 3. Frontend Security Posture

The frontend must present a secure interface and protect against common web vulnerabilities.

*   **Cosmetic Hiding vs. True Security:** Ensure that UI elements hidden based on client-side role checks (e.g., using a `canManageTeam` helper) are also strictly protected at the API level. A malicious user modifying the local React state must not be able to bypass authorization to execute an action.
*   **Cross-Site Scripting (XSS):** Verify that all user-supplied data (e.g., device names, support ticket descriptions) is properly sanitized by React before rendering to prevent XSS attacks.
*   **Sensitive Data Display:** Ensure the UI redacts or masks sensitive information appropriately. For instance, the UI should display only the last 4 digits of a pairing code or mask email addresses where appropriate for privacy.

## 4. Supabase RLS Transition

As the architecture shifts, the role of Supabase RLS will change.

*   **Audit Current Policies:** Review any existing Row Level Security (RLS) policies in Supabase to fully understand the current access rules and assumptions.
*   **Replicate Logic in API:** Ensure that the authorization logic implemented in the Express API is at least as strict as the original RLS policies it replaces.
*   **Lock Down Direct Access:** Once the API is fully integrated and handles all data access, tighten the Supabase RLS policies to restrict direct client access from the browser, forcing all traffic to route through the secure Express API.

## 5. Audit Logging

Immutable audit logging is a core requirement of the security model.

*   **Backend Driven:** All audit logs must be generated exclusively by the backend API in response to verified actions. The frontend client must not have permission to write directly to the `audit_logs` table.
*   **Comprehensive Coverage:** Ensure every sensitive action—including login, device registration, session requests, policy changes, and role updates—generates an immutable audit record containing the actor's ID, team ID, timestamp, and relevant metadata.
