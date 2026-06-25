import type { DashboardResource } from "./dashboard-resources";

export type DashboardResourceLabel = {
  readonly singular: string;
  readonly plural: string;
  readonly navigationLabel: string;
};

const RESOURCE_LABELS: Record<DashboardResource, DashboardResourceLabel> = {
  devices: {
    singular: "Device",
    plural: "Devices",
    navigationLabel: "Devices",
  },
  sessions: {
    singular: "Session",
    plural: "Sessions",
    navigationLabel: "Sessions",
  },
  auditEvents: {
    singular: "Audit event",
    plural: "Audit events",
    navigationLabel: "Audit Log",
  },
  securityEvents: {
    singular: "Security event",
    plural: "Security events",
    navigationLabel: "Security",
  },
};

export function getDashboardResourceLabel(resource: DashboardResource): DashboardResourceLabel {
  return RESOURCE_LABELS[resource];
}
