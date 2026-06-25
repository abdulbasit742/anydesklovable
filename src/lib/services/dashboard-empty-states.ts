export type DashboardEmptyResource = "devices" | "sessions" | "auditEvents" | "securityEvents";

export type DashboardEmptyState = {
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string | null;
};

const EMPTY_STATES: Record<DashboardEmptyResource, DashboardEmptyState> = {
  devices: {
    title: "No devices yet",
    description: "Add a device to start managing secure remote sessions.",
    actionLabel: "Add device",
  },
  sessions: {
    title: "No sessions yet",
    description: "Remote sessions will appear here after a connection starts.",
    actionLabel: null,
  },
  auditEvents: {
    title: "No audit activity yet",
    description: "Security and team actions will appear here once activity begins.",
    actionLabel: null,
  },
  securityEvents: {
    title: "No security events",
    description: "Important security alerts will appear here when detected.",
    actionLabel: null,
  },
};

export function getDashboardEmptyState(resource: DashboardEmptyResource): DashboardEmptyState {
  return EMPTY_STATES[resource];
}
