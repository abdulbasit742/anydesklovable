import type { DashboardListOptions } from "./dashboard-contracts";

export const DASHBOARD_DEFAULT_LIST_LIMIT = 50;
export const DASHBOARD_MAX_LIST_LIMIT = 100;

function clampDashboardListLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    return DASHBOARD_DEFAULT_LIST_LIMIT;
  }

  const rounded = Math.trunc(limit);
  if (rounded < 1) {
    return 1;
  }

  return Math.min(rounded, DASHBOARD_MAX_LIST_LIMIT);
}

export function createDashboardListOptions(teamId: string, limit = DASHBOARD_DEFAULT_LIST_LIMIT): DashboardListOptions {
  return {
    teamId,
    limit: clampDashboardListLimit(limit),
  };
}

export function canLoadDashboardTeamData(teamId: string | null | undefined): teamId is string {
  return typeof teamId === "string" && teamId.trim().length > 0;
}
