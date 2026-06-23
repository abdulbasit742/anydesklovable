import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageLoadingSkeleton } from "@/components/performance/LoadingSkeleton";
import { DataSourceBadge } from "@/components/performance/DataSourceBadge";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Gauge,
  Heart,
  Monitor,
  Radio,
  Server,
  Shield,
  Wifi,
  XCircle,
  Zap,
} from "lucide-react";

export const Route = createFileRoute("/dashboard/operations")({
  component: OperationsDashboard,
});

/**
 * Operations Dashboard — /dashboard/operations
 * RBAC: owner/admin/admin.securityReview only.
 * Viewer cannot access this page.
 * Shows safe metadata only — no secrets.
 */
function OperationsDashboard() {
  // Placeholder data — will be wired to /api/ops/metrics
  const metrics = {
    requestCount: 12847,
    averageLatencyMs: 45,
    p95LatencyMs: 180,
    errorRate: 0.012,
    activeSocketConnections: 34,
    activeSessions: 8,
    degradedSessions: 1,
    uptimeSec: 86400,
    deviceHeartbeatStatus: { healthy: 28, degraded: 3, disconnected: 2 },
    queueStatus: { pending: 0, running: 0, failed: 0 },
  };

  const alerts = [
    {
      id: "1",
      severity: "warning",
      category: "socket",
      message: "Elevated reconnect rate detected",
      affectedService: "socket.io",
      count: 5,
      lastSeen: "2 min ago",
      recommendedAction: "Check network stability",
    },
    {
      id: "2",
      severity: "info",
      category: "desktop_agent",
      message: "2 devices missed heartbeat",
      affectedService: "device-heartbeat",
      count: 2,
      lastSeen: "5 min ago",
      recommendedAction: "Verify device connectivity",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Operations</h1>
          <p className="text-muted-foreground">
            System health, performance metrics, and reliability monitoring
          </p>
        </div>
        <DataSourceBadge source="placeholder" />
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthCard
          title="API Health"
          icon={<Server className="h-4 w-4" />}
          status="healthy"
          detail={`${metrics.averageLatencyMs}ms avg latency`}
        />
        <HealthCard
          title="Database"
          icon={<Database className="h-4 w-4" />}
          status="healthy"
          detail="Connected"
        />
        <HealthCard
          title="Socket.IO"
          icon={<Wifi className="h-4 w-4" />}
          status="healthy"
          detail={`${metrics.activeSocketConnections} connections`}
        />
        <HealthCard
          title="WebRTC Quality"
          icon={<Radio className="h-4 w-4" />}
          status={metrics.degradedSessions > 0 ? "degraded" : "healthy"}
          detail={`${metrics.degradedSessions} degraded sessions`}
        />
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard title="Requests" value={metrics.requestCount.toLocaleString()} icon={<Activity className="h-4 w-4" />} />
        <MetricCard title="Avg Latency" value={`${metrics.averageLatencyMs}ms`} icon={<Clock className="h-4 w-4" />} />
        <MetricCard title="P95 Latency" value={`${metrics.p95LatencyMs}ms`} icon={<Gauge className="h-4 w-4" />} />
        <MetricCard title="Error Rate" value={`${(metrics.errorRate * 100).toFixed(1)}%`} icon={<XCircle className="h-4 w-4" />} />
        <MetricCard title="Active Sessions" value={String(metrics.activeSessions)} icon={<Monitor className="h-4 w-4" />} />
        <MetricCard title="Uptime" value={`${Math.floor(metrics.uptimeSec / 3600)}h`} icon={<Zap className="h-4 w-4" />} />
      </div>

      {/* Device Heartbeat Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Device Heartbeats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">{metrics.deviceHeartbeatStatus.healthy} Healthy</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">{metrics.deviceHeartbeatStatus.degraded} Degraded</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm">{metrics.deviceHeartbeatStatus.disconnected} Disconnected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Operational Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      alert.severity === "error"
                        ? "destructive"
                        : alert.severity === "warning"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {alert.severity}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {alert.affectedService} · {alert.lastSeen} · Count: {alert.count}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground max-w-48">
                  {alert.recommendedAction}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Queue Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Background Jobs (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Queue system not yet configured. Pending: {metrics.queueStatus.pending}, Running:{" "}
            {metrics.queueStatus.running}, Failed: {metrics.queueStatus.failed}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function HealthCard({
  title,
  icon,
  status,
  detail,
}: {
  title: string;
  icon: React.ReactNode;
  status: "healthy" | "degraded" | "unhealthy";
  detail: string;
}) {
  const statusColor =
    status === "healthy"
      ? "text-green-500"
      : status === "degraded"
        ? "text-yellow-500"
        : "text-red-500";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            {icon}
            {title}
          </div>
          <Badge
            variant={
              status === "healthy"
                ? "default"
                : status === "degraded"
                  ? "secondary"
                  : "destructive"
            }
          >
            {status}
          </Badge>
        </div>
        <p className={`text-xs ${statusColor}`}>{detail}</p>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          {icon}
          {title}
        </div>
        <p className="text-lg font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
