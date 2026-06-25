export type DashboardLoadingResource = "devices" | "sessions" | "auditEvents" | "securityEvents";

export type DashboardLoadingState = {
  readonly title: string;
  readonly description: string;
  readonly skeletonRows: number;
};

const LOADING_STATES: Record<DashboardLoadingResource, DashboardLoadingState> = {
  devices: {
    title: "Loading devices",
    description: "Fetching your team devices and connection status.",
    skeletonRows: 6,
  },
  sessions: {
    title: "Loading sessions",
    description: "Fetching recent remote session activity.",
    skeletonRows: 5,
  },
  auditEvents: {
    title: "Loading audit activity",
    description: "Fetching recent team and security activity.",
    skeletonRows: 8,
  },
  securityEvents: {
    title: "Loading security events",
    description: "Fetching recent security alerts and policy events.",
    skeletonRows: 4,
  },
};

export function getDashboardLoadingState(resource: DashboardLoadingResource): DashboardLoadingState {
  return LOADING_STATES[resource];
}
