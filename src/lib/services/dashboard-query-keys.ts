export const dashboardQueryKeys = {
  all: ["dashboard"] as const,
  team: (teamId: string) => [...dashboardQueryKeys.all, "team", teamId] as const,
  devices: (teamId: string) => [...dashboardQueryKeys.team(teamId), "devices"] as const,
  device: (teamId: string, deviceId: string) => [...dashboardQueryKeys.devices(teamId), deviceId] as const,
  sessions: (teamId: string) => [...dashboardQueryKeys.team(teamId), "sessions"] as const,
  session: (teamId: string, sessionId: string) => [...dashboardQueryKeys.sessions(teamId), sessionId] as const,
  auditEvents: (teamId: string) => [...dashboardQueryKeys.team(teamId), "audit-events"] as const,
  securityEvents: (teamId: string) => [...dashboardQueryKeys.team(teamId), "security-events"] as const,
};

export type DashboardQueryKeyFactory = typeof dashboardQueryKeys;
