# Dashboard Performance Guide

This guide details the strategies used to ensure the web dashboard remains fast, responsive, and reliable, even with large datasets or slow network conditions.

## Loading Skeletons

To prevent layout shift and provide immediate visual feedback, route-level loading skeletons are implemented.
*   The `PageLoadingSkeleton` component mimics the structure of the dashboard layout (header, metric cards, data table).
*   It should be used as the fallback state while TanStack Query is fetching the initial data for a route.

## Error Boundaries

Route-level error boundaries (`ErrorBoundaryFallback`) catch rendering errors and API failures.
*   They display a safe, user-friendly error message.
*   Internal stack traces are never exposed in the production UI.
*   A "Try Again" button allows the user to re-trigger the failed query without a full page reload.
*   If available, the `x-request-id` is displayed to assist support teams in tracing the failure.

## Data Fetching and Caching

We utilize TanStack Query for all data fetching. To optimize performance:
*   **Stale Time:** Set sensible `staleTime` values (e.g., 1-5 minutes for relatively static data like policies, 0 for real-time device status) to prevent unnecessary network requests.
*   **Pagination:** Large datasets (audit logs, sessions, devices) must use pagination. Virtualized tables should be considered if rendering hundreds of rows simultaneously.
*   **Invalidation:** Mutations (e.g., updating a policy, revoking a device) must explicitly invalidate the relevant query keys to ensure the UI reflects the latest state.

## DataSource Badge

The `DataSourceBadge` component is used to clearly indicate the origin of the data currently displayed (Live, Supabase, Mock, Placeholder). This ensures transparency during the migration phase and helps developers quickly identify areas that still require backend integration.
