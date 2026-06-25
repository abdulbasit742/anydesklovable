#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const basePath = join(root, "src", "lib", "services");
const contractsPath = join(basePath, "dashboard-contracts.ts");
const mappersPath = join(basePath, "dashboard-mappers.ts");
const queryKeysPath = join(basePath, "dashboard-query-keys.ts");
const listOptionsPath = join(basePath, "dashboard-list-options.ts");
const queryOptionsPath = join(basePath, "dashboard-query-options.ts");
const queryStatePath = join(basePath, "dashboard-query-state.ts");
const emptyStatesPath = join(basePath, "dashboard-empty-states.ts");
const errorStatesPath = join(basePath, "dashboard-error-states.ts");
const loadingStatesPath = join(basePath, "dashboard-loading-states.ts");
const resourcesPath = join(basePath, "dashboard-resources.ts");
const resourceLabelsPath = join(basePath, "dashboard-resource-labels.ts");
const barrelPath = join(basePath, "dashboard-data.ts");

function read(path) {
  return existsSync(path) ? readFileSync(path, "utf8") : "";
}

const contracts = read(contractsPath);
const mappers = read(mappersPath);
const queryKeys = read(queryKeysPath);
const listOptions = read(listOptionsPath);
const queryOptions = read(queryOptionsPath);
const queryState = read(queryStatePath);
const emptyStates = read(emptyStatesPath);
const errorStates = read(errorStatesPath);
const loadingStates = read(loadingStatesPath);
const resources = read(resourcesPath);
const resourceLabels = read(resourceLabelsPath);
const barrel = read(barrelPath);

const checks = {
  contractsFileExists: existsSync(contractsPath),
  mappersFileExists: existsSync(mappersPath),
  queryKeysFileExists: existsSync(queryKeysPath),
  listOptionsFileExists: existsSync(listOptionsPath),
  queryOptionsFileExists: existsSync(queryOptionsPath),
  queryStateFileExists: existsSync(queryStatePath),
  emptyStatesFileExists: existsSync(emptyStatesPath),
  errorStatesFileExists: existsSync(errorStatesPath),
  loadingStatesFileExists: existsSync(loadingStatesPath),
  resourcesFileExists: existsSync(resourcesPath),
  resourceLabelsFileExists: existsSync(resourceLabelsPath),
  barrelFileExists: existsSync(barrelPath),
  exportsDeviceContract: contracts.includes("DashboardDevice"),
  exportsSessionContract: contracts.includes("DashboardSession"),
  exportsAuditContract: contracts.includes("DashboardAuditEvent"),
  exportsServiceContract: contracts.includes("DashboardDataService"),
  mapsDevices: mappers.includes("mapDashboardDevice"),
  mapsSessions: mappers.includes("mapDashboardSession"),
  mapsAuditEvents: mappers.includes("mapDashboardAuditEvent"),
  hasTeamQueryKey: queryKeys.includes("team:") && queryKeys.includes("teamId"),
  hasDeviceQueryKeys: queryKeys.includes("devices:") && queryKeys.includes("device:"),
  hasSessionQueryKeys: queryKeys.includes("sessions:") && queryKeys.includes("session:"),
  hasAuditQueryKeys: queryKeys.includes("auditEvents:") && queryKeys.includes("securityEvents:"),
  hasDefaultListLimit: listOptions.includes("DASHBOARD_DEFAULT_LIST_LIMIT"),
  hasMaxListLimit: listOptions.includes("DASHBOARD_MAX_LIST_LIMIT"),
  clampsListLimit: listOptions.includes("Math.min") && listOptions.includes("Math.trunc"),
  guardsMissingTeam: listOptions.includes("canLoadDashboardTeamData"),
  createsResourceQueryOptions: queryOptions.includes("createDashboardResourceQueryOptions"),
  disablesMissingTeamQueries: queryOptions.includes("enabled: false") && queryOptions.includes("listOptions: null"),
  supportsQueryStates: queryState.includes("disabled") && queryState.includes("loading") && queryState.includes("ready"),
  exposesInteractiveState: queryState.includes("isDashboardQueryInteractive"),
  exportsEmptyStateHelper: emptyStates.includes("getDashboardEmptyState"),
  supportsDeviceEmptyState: emptyStates.includes("devices") && emptyStates.includes("No devices yet"),
  supportsSessionEmptyState: emptyStates.includes("sessions") && emptyStates.includes("No sessions yet"),
  supportsAuditEmptyState: emptyStates.includes("auditEvents") && emptyStates.includes("No audit activity yet"),
  supportsSecurityEmptyState: emptyStates.includes("securityEvents") && emptyStates.includes("No security events"),
  exportsErrorStateHelper: errorStates.includes("getDashboardErrorState"),
  supportsDeviceErrorState: errorStates.includes("devices") && errorStates.includes("Could not load devices"),
  supportsSessionErrorState: errorStates.includes("sessions") && errorStates.includes("Could not load sessions"),
  supportsAuditErrorState: errorStates.includes("auditEvents") && errorStates.includes("Could not load audit activity"),
  supportsSecurityErrorState: errorStates.includes("securityEvents") && errorStates.includes("Could not load security events"),
  exportsLoadingStateHelper: loadingStates.includes("getDashboardLoadingState"),
  supportsDeviceLoadingState: loadingStates.includes("devices") && loadingStates.includes("Loading devices"),
  supportsSessionLoadingState: loadingStates.includes("sessions") && loadingStates.includes("Loading sessions"),
  supportsAuditLoadingState: loadingStates.includes("auditEvents") && loadingStates.includes("Loading audit activity"),
  supportsSecurityLoadingState: loadingStates.includes("securityEvents") && loadingStates.includes("Loading security events"),
  exportsResourceRegistry: resources.includes("DASHBOARD_RESOURCES") && resources.includes("isDashboardResource"),
  resourceRegistryCoversDevices: resources.includes("devices"),
  resourceRegistryCoversSessions: resources.includes("sessions"),
  resourceRegistryCoversAuditEvents: resources.includes("auditEvents"),
  resourceRegistryCoversSecurityEvents: resources.includes("securityEvents"),
  exportsResourceLabels: resourceLabels.includes("getDashboardResourceLabel") && resourceLabels.includes("DashboardResourceLabel"),
  resourceLabelsCoverDevices: resourceLabels.includes("Device") && resourceLabels.includes("Devices"),
  resourceLabelsCoverSessions: resourceLabels.includes("Session") && resourceLabels.includes("Sessions"),
  resourceLabelsCoverAuditEvents: resourceLabels.includes("Audit event") && resourceLabels.includes("Audit Log"),
  resourceLabelsCoverSecurityEvents: resourceLabels.includes("Security event") && resourceLabels.includes("Security"),
  barrelExportsContracts: barrel.includes("./dashboard-contracts"),
  barrelExportsMappers: barrel.includes("./dashboard-mappers"),
  barrelExportsQueryKeys: barrel.includes("./dashboard-query-keys"),
  barrelExportsListOptions: barrel.includes("./dashboard-list-options"),
  barrelExportsQueryOptions: barrel.includes("./dashboard-query-options"),
  barrelExportsQueryState: barrel.includes("./dashboard-query-state"),
  barrelExportsEmptyStates: barrel.includes("./dashboard-empty-states"),
  barrelExportsErrorStates: barrel.includes("./dashboard-error-states"),
  barrelExportsLoadingStates: barrel.includes("./dashboard-loading-states"),
  barrelExportsResources: barrel.includes("./dashboard-resources"),
  barrelExportsResourceLabels: barrel.includes("./dashboard-resource-labels"),
};

const failures = Object.entries(checks)
  .filter(([, ok]) => !ok)
  .map(([name]) => name);

const status = failures.length > 0 ? "FAIL" : "PASS";
const report = {
  repo: "abdulbasit742/anydesklovable",
  generatedAt: new Date().toISOString(),
  status,
  checks,
  failures,
};

mkdirSync("reports", { recursive: true });
writeFileSync("reports/dashboard-data-layer-check.json", JSON.stringify(report, null, 2));
writeFileSync(
  "reports/dashboard-data-layer-check.md",
  [
    "# Dashboard Data Layer Check",
    "",
    `Status: **${status}**`,
    `Failures: **${failures.length}**`,
    "",
    "| Check | Passed |",
    "|---|---:|",
    ...Object.entries(checks).map(([name, ok]) => `| ${name} | ${ok ? "yes" : "no"} |`),
    "",
    failures.length ? "## Failures" : "",
    ...failures.map((name) => `- ${name}`),
  ].filter(Boolean).join("\n")
);

console.log(`[dashboard-data-layer:check] ${status} - ${failures.length} failures`);
if (failures.length > 0) process.exit(1);
