export type DashboardErrorResource = "devices" | "sessions" | "auditEvents" | "securityEvents";

export type DashboardErrorState = {
  readonly title: string;
  readonly description: string;
  readonly retryLabel: string;
};

const ERROR_STATES: Record<DashboardErrorResource, DashboardErrorState> = {
  devices: {
    title: "Could not load devices",
    description: "Check your connection and try loading your devices again.",
    retryLabel: "Retry devices",
  },
  sessions: {
    title: "Could not load sessions",
    description: "Check your connection and try loading session history again.",
    retryLabel: "Retry sessions",
  },
  auditEvents: {
    title: "Could not load audit activity",
    description: "Check your connection and try loading audit activity again.",
    retryLabel: "Retry audit activity",
  },
  securityEvents: {
    title: "Could not load security events",
    description: "Check your connection and try loading security events again.",
    retryLabel: "Retry security events",
  },
};

export function getDashboardErrorState(resource: DashboardErrorResource): DashboardErrorState {
  return ERROR_STATES[resource];
}
