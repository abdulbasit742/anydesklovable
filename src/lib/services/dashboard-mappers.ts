import type { DashboardAuditEvent, DashboardDevice, DashboardSession } from "./dashboard-contracts";

type AnyRecord = Record<string, unknown>;

function readString(row: AnyRecord, key: string, fallback = ""): string {
  const value = row[key];
  return typeof value === "string" ? value : fallback;
}

function readNullableString(row: AnyRecord, key: string): string | null {
  const value = row[key];
  return typeof value === "string" ? value : null;
}

function readNullableNumber(row: AnyRecord, key: string): number | null {
  const value = row[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function mapDashboardDevice(row: AnyRecord): DashboardDevice {
  return {
    id: readString(row, "id"),
    teamId: readString(row, "team_id"),
    name: readString(row, "name", "Unnamed device"),
    os: readString(row, "os", "Unknown"),
    status: readString(row, "status", "offline"),
    remoteDeskId: readString(row, "remote_desk_id"),
    lastSeenAt: readNullableString(row, "last_seen"),
    createdAt: readString(row, "created_at"),
  };
}

export function mapDashboardSession(row: AnyRecord): DashboardSession {
  return {
    id: readString(row, "id"),
    teamId: readString(row, "team_id"),
    deviceId: readNullableString(row, "device_id"),
    targetName: readString(row, "target_name", "Unknown target"),
    status: readString(row, "status", "pending"),
    startedAt: readString(row, "started_at"),
    endedAt: readNullableString(row, "ended_at"),
    durationSeconds: readNullableNumber(row, "duration_seconds"),
    quality: readNullableString(row, "quality"),
  };
}

export function mapDashboardAuditEvent(row: AnyRecord): DashboardAuditEvent {
  return {
    id: readString(row, "id"),
    teamId: readString(row, "team_id"),
    actorName: readNullableString(row, "actor_name"),
    action: readString(row, "action"),
    target: readNullableString(row, "target"),
    severity: readString(row, "severity", "info"),
    createdAt: readString(row, "created_at"),
  };
}
