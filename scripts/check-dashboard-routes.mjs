#!/usr/bin/env node
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const routeRoot = join(root, "src", "routes");

const expectedRoutes = [
  ["/dashboard", ["dashboard.index.tsx", "dashboard.tsx"]],
  ["/dashboard/devices", ["dashboard.devices.tsx"]],
  ["/dashboard/sessions", ["dashboard.sessions.tsx"]],
  ["/dashboard/contacts", ["dashboard.contacts.tsx"]],
  ["/dashboard/mobile", ["dashboard.mobile.tsx"]],
  ["/dashboard/notifications", ["dashboard.notifications.tsx"]],
  ["/dashboard/audit", ["dashboard.audit.tsx"]],
  ["/dashboard/security", ["dashboard.security.tsx"]],
  ["/dashboard/support", ["dashboard.support.tsx"]],
  ["/dashboard/developer", ["dashboard.developer.tsx"]],
  ["/dashboard/engine-status", ["dashboard.engine-status.tsx"]],
  ["/dashboard/data-catalog", ["dashboard.data-catalog.tsx"]],
  ["/dashboard/admin", ["dashboard.admin.tsx"]]
];

const results = expectedRoutes.map(([route, files]) => {
  const existingFile = files.find((file) => existsSync(join(routeRoot, file))) ?? null;
  return { route, existingFile, fileExists: Boolean(existingFile) };
});

const missing = results.filter((item) => !item.fileExists);
const status = missing.length > 0 ? "FAIL" : "PASS";

mkdirSync("reports", { recursive: true });
writeFileSync("reports/dashboard-route-check.json", JSON.stringify({ status, results, generatedAt: new Date().toISOString() }, null, 2));
writeFileSync(
  "reports/dashboard-route-check.md",
  [
    "# Dashboard Route Check",
    "",
    `Status: **${status}**`,
    `Routes checked: **${results.length}**`,
    `Missing route files: **${missing.length}**`,
    "",
    "| Route | File Exists | Existing File |",
    "|---|---:|---|",
    ...results.map((item) => `| ${item.route} | ${item.fileExists ? "yes" : "no"} | ${item.existingFile ?? "—"} |`)
  ].join("\n")
);

console.log(`[routes:check] ${status} - ${results.length} routes checked, ${missing.length} missing`);
if (missing.length > 0) process.exit(1);
