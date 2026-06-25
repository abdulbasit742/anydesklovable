export type DashboardQueryState = "disabled" | "loading" | "error" | "empty" | "ready";

export type DashboardQueryStateInput = {
  enabled: boolean;
  isLoading: boolean;
  isError: boolean;
  itemCount: number;
};

export function getDashboardQueryState(input: DashboardQueryStateInput): DashboardQueryState {
  if (!input.enabled) {
    return "disabled";
  }

  if (input.isLoading) {
    return "loading";
  }

  if (input.isError) {
    return "error";
  }

  if (input.itemCount === 0) {
    return "empty";
  }

  return "ready";
}

export function isDashboardQueryInteractive(state: DashboardQueryState): boolean {
  return state === "ready" || state === "empty";
}
