export type DashboardDeviceStatus = "online" | "offline" | "pending" | "revoked";

export type DashboardDevice = {
  id: string;
  teamId: string;
  name: string;
  os: string;
  status: DashboardDeviceStatus | string;
  remoteDeskId: string;
  lastSeenAt: string | null;
  createdAt: string;
};

export type DashboardSessionStatus = "connected" | "ended" | "rejected" | "pending";

export type DashboardSession = {
  id: string;
  teamId: string;
  deviceId: string | null;
  targetName: string;
  status: DashboardSessionStatus | string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  quality: "good" | "fair" | "poor" | string | null;
};

export type DashboardAuditEvent = {
  id: string;
  teamId: string;
  actorName: string | null;
  action: string;
  target: string | null;
  severity: "info" | "warn" | "critical" | string;
  createdAt: string;
};

export type DashboardListOptions = {
  teamId: string;
  limit?: number;
};

export type DashboardDataService = {
  listDevices(options: DashboardListOptions): Promise<DashboardDevice[]>;
  listSessions(options: DashboardListOptions): Promise<DashboardSession[]>;
  listAuditEvents(options: DashboardListOptions): Promise<DashboardAuditEvent[]>;
};
