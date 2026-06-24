#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const publicApiRoot = join(root, "src", "routes", "api", "public", "v1");
const wrapperPath = join(root, "src", "lib", "api", "public-auth.ts");
const developerRoutePath = join(root, "src", "routes", "dashboard.developer.tsx");

function walk(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walk(path, files);
    else if (entry.isFile() && (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx"))) files.push(path);
  }
  return files;
}

function read(path) {
  return readFileSync(path, "utf8");
}

const routeFiles = walk(publicApiRoot).sort();
const routeResults = routeFiles.map((path) => {
  const source = read(path);
  return {
    path: relative(root, path).replaceAll("\\", "/"),
    usesWithPublicApi: source.includes("withPublicApi"),
    importsPublicAuth: source.includes("@/lib/api/public-auth"),
    hasServerHandler: source.includes("server:") && source.includes("handlers"),
  };
});

const wrapperSource = existsSync(wrapperPath) ? read(wrapperPath) : "";
const developerSource = existsSync(developerRoutePath) ? read(developerRoutePath) : "";

const wrapperChecks = {
  exists: existsSync(wrapperPath),
  checksPublicApiFlag: wrapperSource.includes('checkFeatureGate("publicApiEnabled")') || wrapperSource.includes("checkFeatureGate('publicApiEnabled')"),
  returnsFeatureDisabled: wrapperSource.includes("feature_disabled"),
};

const developerChecks = {
  exists: existsSync(developerRoutePath),
  hasPublicApiGate: developerSource.includes('flag="publicApiEnabled"') || developerSource.includes("flag='publicApiEnabled'"),
};

const missingWrappers = routeResults.filter((item) => !item.usesWithPublicApi || !item.importsPublicAuth);
const missingHandlers = routeResults.filter((item) => !item.hasServerHandler);
const failures = [
  ...missingWrappers.map((item) => `${item.path} does not use withPublicApi`),
  ...missingHandlers.map((item) => `${item.path} does not expose a server handler`),
  ...(!wrapperChecks.exists ? ["src/lib/api/public-auth.ts is missing"] : []),
  ...(wrapperChecks.exists && !wrapperChecks.checksPublicApiFlag ? ["public-auth wrapper does not check publicApiEnabled"] : []),
  ...(wrapperChecks.exists && !wrapperChecks.returnsFeatureDisabled ? ["public-auth wrapper does not return feature_disabled"] : []),
  ...(!developerChecks.exists ? ["dashboard.developer.tsx is missing"] : []),
  ...(developerChecks.exists && !developerChecks.hasPublicApiGate ? ["developer dashboard is not gated by publicApiEnabled"] : []),
];

const status = failures.length > 0 ? "FAIL" : "PASS";
const report = {
  repo: "abdulbasit742/anydesklovable",
  generatedAt: new Date().toISOString(),
  status,
  routeCount: routeResults.length,
  wrapperChecks,
  developerChecks,
  routeResults,
  failures,
};

mkdirSync("reports", { recursive: true });
writeFileSync("reports/public-api-gate-check.json", JSON.stringify(report, null, 2));
writeFileSync(
  "reports/public-api-gate-check.md",
  [
    "# Public API Gate Check",
    "",
    `Status: **${status}**`,
    `Routes checked: **${routeResults.length}**`,
    `Failures: **${failures.length}**`,
    "",
    "## Wrapper checks",
    "",
    `- Public auth wrapper exists: **${wrapperChecks.exists ? "yes" : "no"}**`,
    `- Checks publicApiEnabled: **${wrapperChecks.checksPublicApiFlag ? "yes" : "no"}**`,
    `- Returns feature_disabled: **${wrapperChecks.returnsFeatureDisabled ? "yes" : "no"}**`,
    `- Developer dashboard gated: **${developerChecks.hasPublicApiGate ? "yes" : "no"}**`,
    "",
    "## Route checks",
    "",
    "| Route file | Uses withPublicApi | Imports public-auth | Has server handler |",
    "|---|---:|---:|---:|",
    ...routeResults.map((item) => `| ${item.path} | ${item.usesWithPublicApi ? "yes" : "no"} | ${item.importsPublicAuth ? "yes" : "no"} | ${item.hasServerHandler ? "yes" : "no"} |`),
    "",
    failures.length ? "## Failures" : "",
    ...failures.map((item) => `- ${item}`),
  ].filter(Boolean).join("\n")
);

console.log(`[public-api:check] ${status} - ${routeResults.length} routes checked, ${failures.length} failures`);
if (failures.length > 0) process.exit(1);
