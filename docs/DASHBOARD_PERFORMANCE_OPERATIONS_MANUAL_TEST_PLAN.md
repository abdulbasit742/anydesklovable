# Dashboard Performance & Operations - Manual Test Plan

This document outlines the manual testing procedures to verify the performance improvements and the new Operations Dashboard.

## 1. Operations Dashboard Access Control

*   **Test:** Log in as a user with the `viewer` role. Attempt to navigate to `/dashboard/operations`.
*   **Expected Result:** Access is denied. The user is redirected or shown an unauthorized message.
*   **Test:** Log in as an `owner` or `admin`. Navigate to `/dashboard/operations`.
*   **Expected Result:** The Operations Dashboard loads successfully.

## 2. Operations Dashboard Rendering

*   **Test:** View the Operations Dashboard as an admin.
*   **Expected Result:** All health cards (API, DB, Socket, WebRTC) render correctly. The metrics overview, device heartbeats, and operational alerts sections display data (or placeholders if the backend is not fully wired).
*   **Test:** Inspect the network requests and the rendered UI.
*   **Expected Result:** Verify that absolutely no secrets, tokens, or raw user data are exposed on this page.

## 3. Loading Skeletons

*   **Test:** Throttle the network connection to "Slow 3G" using browser developer tools. Navigate to the Devices or Sessions page.
*   **Expected Result:** The `PageLoadingSkeleton` is immediately visible, providing a layout structure before the data arrives. There should be no harsh layout shifts when the data finally renders.

## 4. Error Boundaries

*   **Test:** Temporarily modify a component (e.g., the Devices list) to throw a deliberate JavaScript error during rendering.
*   **Expected Result:** The `ErrorBoundaryFallback` component catches the error. The UI displays a safe "Something went wrong" message. No stack traces are visible to the user. The "Go to Dashboard" button functions correctly.

## 5. Pagination and Large Data Handling

*   **Test:** Ensure the mock data or backend returns a large dataset (e.g., 500+ audit logs). Navigate to the Audit page.
*   **Expected Result:** The page does not freeze. The data is paginated (e.g., 25 rows per page), and the pagination controls allow navigation between pages smoothly.
