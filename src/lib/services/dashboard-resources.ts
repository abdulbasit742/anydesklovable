export const DASHBOARD_RESOURCES = ["devices", "sessions", "auditEvents", "securityEvents"] as const;

export type DashboardResource = (typeof DASHBOARD_RESOURCES)[number];

export function isDashboardResource(value: string): value is DashboardResource {
  return DASHBOARD_RESOURCES.includes(value as DashboardResource);
}
