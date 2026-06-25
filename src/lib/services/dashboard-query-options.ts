import type { DashboardListOptions } from "./dashboard-contracts";
import { canLoadDashboardTeamData, createDashboardListOptions } from "./dashboard-list-options";
import { dashboardQueryKeys } from "./dashboard-query-keys";

export type DashboardResourceName = "devices" | "sessions" | "auditEvents" | "securityEvents";

export type DashboardResourceQueryOptions = {
  enabled: boolean;
  listOptions: DashboardListOptions | null;
  queryKey: readonly unknown[];
};

function createDisabledDashboardQuery(resource: DashboardResourceName): DashboardResourceQueryOptions {
  return {
    enabled: false,
    listOptions: null,
    queryKey: [...dashboardQueryKeys.all, resource, "disabled"] as const,
  };
}

function createResourceKey(resource: DashboardResourceName, teamId: string): readonly unknown[] {
  switch (resource) {
    case "devices":
      return dashboardQueryKeys.devices(teamId);
    case "sessions":
      return dashboardQueryKeys.sessions(teamId);
    case "auditEvents":
      return dashboardQueryKeys.auditEvents(teamId);
    case "securityEvents":
      return dashboardQueryKeys.securityEvents(teamId);
  }
}

export function createDashboardResourceQueryOptions(
  resource: DashboardResourceName,
  teamId: string | null | undefined,
  limit?: number,
): DashboardResourceQueryOptions {
  if (!canLoadDashboardTeamData(teamId)) {
    return createDisabledDashboardQuery(resource);
  }

  return {
    enabled: true,
    listOptions: createDashboardListOptions(teamId, limit),
    queryKey: createResourceKey(resource, teamId),
  };
}
