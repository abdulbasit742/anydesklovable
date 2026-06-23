# Supabase Schema and RLS Review

**Date:** June 23, 2026
**Project:** RemoteDesk (`anydesklovable`)

## 1. Current Schema State

The `anydesklovable` dashboard relies on Supabase for authentication and initial data storage. Based on an analysis of the application code, the following tables are expected to exist and are actively utilized:

*   `users` (managed internally by Supabase Auth)
*   `teams`
*   `team_members`
*   `devices`
*   `audit_logs`

The user interface code also references data structures that imply the existence, or planned existence, of tables for `sessions`, `support_tickets`, `invoices`, `subscriptions`, and `security_policies`.

## 2. Row Level Security (RLS) Evaluation

The current security model of the dashboard relies heavily on the assumption that Row Level Security (RLS) is correctly configured on every table. The primary isolation boundary for data access is the `team_id`.

### Current Assumptions
The frontend codebase operates under the assumption that a query such as `supabase.from('devices').select('*')` will be automatically filtered by the database engine to return only devices belonging to the team currently selected by the user. This implies an underlying RLS policy similar to: `auth.uid() IN (SELECT user_id FROM team_members WHERE team_id = devices.team_id)`.

### Identified Risks
1.  **Complexity of RLS:** Implementing complex Role-Based Access Control (RBAC)—such as distinguishing between a 'viewer' and an 'admin' within the same team—using only PostgreSQL RLS policies can become increasingly difficult to maintain and audit as the application grows.
2.  **Missing Policies:** If any table, particularly sensitive tables like `audit_logs`, lacks a strict RLS policy, a compromised client could potentially query data across all teams, leading to a significant data breach.
3.  **Bypass via Service Role:** The Supabase `service_role` key bypasses all RLS policies. It is critical that this key is never exposed to the frontend application or committed to version control.

## 3. Architectural Shift: Moving Away from Direct Supabase Queries

To resolve the architectural split between the dashboard and the `anydesk` signaling server, and to enforce a more robust security model, the reliance on direct Supabase queries from the frontend must be phased out.

### The New Model
1.  **Supabase Auth Remains:** Supabase will continue to handle user authentication, providing secure JSON Web Tokens (JWTs) to the frontend.
2.  **Express API as the Gatekeeper:** The dashboard will transition to sending REST requests (bearing the Supabase JWT) to the `anydesk` Express API, rather than querying the database directly.
3.  **Prisma Handles the Database:** The Express API will utilize Prisma ORM to interact with the database (which may still be hosted on Supabase).
4.  **Backend Authorization:** The Express API will decode the JWT, determine the user's identity and team roles, and enforce all authorization logic *before* executing any Prisma query.

### Benefits of the Shift
*   **Unified Logic:** All security policies, RBAC rules, and complex business logic are centralized in the Express API, ensuring consistent enforcement.
*   **Simplified RLS:** The database RLS policies can be simplified, as the Express API (acting as a trusted service) handles the complex authorization checks before interacting with the database.
*   **Signaling Integration:** The API can seamlessly coordinate database updates with real-time Socket.IO events, such as updating a device's status in the database and simultaneously broadcasting an `offline` event to the dashboard.

## 4. Immediate Action Items

1.  **Halt Schema Expansion:** Cease the creation of new tables or complex RLS policies directly in Supabase for features like billing or support tickets.
2.  **Define Prisma Schema:** Replicate the required data structures (Teams, Devices, Sessions, Policies) within the `anydesk/apps/api/prisma/schema.prisma` file.
3.  **Implement API Endpoints:** Build the corresponding Express API endpoints to serve this data to the dashboard, ensuring rigorous authorization checks are implemented at the API layer.
