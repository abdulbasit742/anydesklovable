#!/usr/bin/env node
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", "dist", "build", ".output", ".vinxi", "coverage", "reports"]);
const allowedContextPatterns = [/\.md$/i, /test/i, /fixture/i, /\.server\.(ts|tsx)$/i, /client\.server\.ts$/i];

const safetyPatterns = [
  { id: "service-role-in-client", severity: "P0", regex: /SUPABASE_SERVICE_ROLE_KEY|service_role/i, clientOnly: true },
  { id: "server-client-import-in-client", severity: "P0", regex: /from\s+["'][^"']*client\.server["']/i, clientOnly: true },
  { id: "raw-key-hash-display", severity: "P1", regex: /key_hash|api_key_hash/i, clientOnly: true },
  { id: "private-storage-path-display", severity: "P1", regex: /storage_path|storagePath/i, clientOnly: true },
  { id: "hardcoded-dashboard-count", severity: "P2", regex: /\b(?:totalDevices|activeSessions|onlineDevices|openTickets)\s*[:=]\s*\d+\b/i, clientOnly: true },
  { id: "mock-dashboard-import", severity: "P1", regex: /from\s+["'][^"']*(?:mock|fake|demo|sample)[^"']*["']/i, clientOnly: true }
];

function walk(dir, files = []) {
  for (const entry of readdirSync(dir)) {
    if (ignoredDirs.has(entry)) continue;
    const path = join(dir, entry);
    const st = statSync(path);
    if (st.isDirectory()) walk(path, files);
    else if (st.isFile()) files.push(path);
  }
  return files;
}

function rel(path) {
  return relative(root, path).replaceAll("\\", "/");
}

function isClientFile(filePath) {
  const file = rel(filePath);
  return file.startsWith("src/") && !file.includes("/api/") && !file.includes("/server/") && !/\.server\.(ts|tsx)$/.test(file) && !/client\.server\.ts$/.test(file);
}

function isAllowedContext(filePath) {
  const file = rel(filePath);
  return allowedContextPatterns.some((pattern) => pattern.test(file));
}

const findings = [];
for (const file of walk(root)) {
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    continue;
  }
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    for (const pattern of safetyPatterns) {
      if (pattern.clientOnly && !isClientFile(file)) continue;
      if (pattern.regex.test(lines[i])) {
        findings.push({
          id: pattern.id,
          severity: pattern.severity,
          file: rel(file),
          line: i + 1,
          allowed: isAllowedContext(file),
          preview: lines[i].slice(0, 160).replace(/([A-Za-z0-9._~+\/-]{12})[A-Za-z0-9._~+\/-]{8,}/g, "$1...[REDACTED]")
        });
      }
    }
  }
}

const blocking = findings.filter((finding) => !finding.allowed && finding.severity === "P0");
const status = blocking.length > 0 ? "FAIL" : "PASS";
const report = { repo: "abdulbasit742/anydesklovable", generatedAt: new Date().toISOString(), status, findings };

mkdirSync("reports", { recursive: true });
writeFileSync("reports/safety-scan.json", JSON.stringify(report, null, 2));
writeFileSync(
  "reports/safety-scan.md",
  [
    "# RemoteDesk Dashboard Safety Scan",
    "",
    `Status: **${status}**`,
    `Findings: **${findings.length}**`,
    `Blocking P0 findings: **${blocking.length}**`,
    "",
    "| Severity | Pattern | File | Line | Allowed | Preview |",
    "|---|---|---|---:|---:|---|",
    ...findings.map((f) => `| ${f.severity} | ${f.id} | ${f.file} | ${f.line} | ${f.allowed ? "yes" : "no"} | ${f.preview.replaceAll("|", "\\|")} |`),
    "",
    "This scan checks browser-facing code for server-only Supabase usage, secret leakage, private storage path exposure, and mock dashboard data imports."
  ].join("\n")
);

console.log(`[safety:scan] ${status} - ${findings.length} findings, ${blocking.length} blocking P0`);
if (status === "FAIL") process.exit(1);
