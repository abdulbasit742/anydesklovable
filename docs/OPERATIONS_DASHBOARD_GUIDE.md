# Operations Dashboard Guide

The Operations Dashboard (`/dashboard/operations`) provides a high-level overview of system health, API performance, and real-time reliability metrics.

## Access Control (RBAC)

Access to the Operations Dashboard is strictly limited.
*   **Allowed Roles:** `owner`, `admin`, `admin.securityReview`.
*   **Denied Roles:** `viewer`, standard users.
Attempting to access the route without the required permissions will result in a 403 Forbidden error or a redirect to the main dashboard.

## Dashboard Components

### System Health Cards
Visual indicators for the core infrastructure components:
*   **API Health:** Displays current average latency.
*   **Database:** Connectivity status.
*   **Socket.IO:** Number of active connections.
*   **WebRTC Quality:** Highlights if any sessions are currently degraded.

### Metrics Overview
Key performance indicators sourced from the `/api/ops/metrics` endpoint:
*   Total Requests
*   Average and P95 Latency
*   Error Rate
*   Active Sessions
*   System Uptime

### Device Heartbeats
A summary of the fleet's connectivity status, categorized into Healthy, Degraded (missed recent heartbeats), and Disconnected.

### Operational Alerts
A list of active reliability incidents (e.g., "Elevated reconnect rate detected"). Each alert includes the severity, affected service, last seen timestamp, and a recommended action for the operator.

## Data Safety

The Operations Dashboard is designed to be completely safe. It displays **metadata only**. It does not expose:
*   Raw request payloads.
*   User passwords or authentication tokens.
*   Session contents (screen, audio, clipboard).
*   Infrastructure secrets (database passwords, TURN credentials).
