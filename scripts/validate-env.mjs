#!/usr/bin/env node
import { writeFileSync, mkdirSync } from "node:fs";

const strict = process.argv.includes("--strict") || process.env.VALIDATE_ENV_STRICT === "1" || process.env.CI === "true";

const envSpec = [
  { name: "VITE_SUPABASE_URL", required: true, serverOnly: false, description: "Public Supabase URL for browser client" },
  { name: "VITE_SUPABASE_PUBLISHABLE_KEY", required: true, serverOnly: false, description: "Public Supabase anon/publishable key" },
  { name: "SUPABASE_URL", required: false, serverOnly: true, description: "Server-side Supabase URL fallback" },
  { name: "SUPABASE_SERVICE_ROLE_KEY", required: false, serverOnly: true, description: "Server-only Supabase service role key for trusted server routes only" },
  { name: "ENGINE_API_BASE_URL", required: false, serverOnly: true, description: "RemoteDesk engine API base URL" },
  { name: "DASHBOARD_ENGINE_SIGNING_SECRET", required: false, serverOnly: true, description: "HMAC secret for dashboard-to-engine signed requests" },
  { name: "ENGINE_WEBHOOK_SIGNING_SECRET", required: false, serverOnly: true, description: "HMAC secret for engine-to-dashboard webhooks" },
  { name: "PUBLIC_APP_URL", required: false, serverOnly: false, description: "Public dashboard/app URL" },
  { name: "DIAGNOSTICS_STORAGE_BUCKET", required: false, serverOnly: true, description: "Private support diagnostics bucket" },
  { name: "RELEASE_STORAGE_BUCKET", required: false, serverOnly: true, description: "Release artifact storage bucket" },
  { name: "API_KEY_HASH_PEPPER", required: false, serverOnly: true, description: "Optional server-side pepper for API-key hashing" }
];

const publicPrefixes = ["VITE_", "NEXT_PUBLIC_", "PUBLIC_"];
const secretNamePattern = /(SECRET|SERVICE_ROLE|PRIVATE|TOKEN|PEPPER|CREDENTIAL|PASSWORD|SIGNING)/i;

const results = envSpec.map((item) => {
  const present = Boolean(process.env[item.name]);
  const publicLike = publicPrefixes.some((prefix) => item.name.startsWith(prefix));
  const invalidPublicSecret = publicLike && secretNamePattern.test(item.name) && item.serverOnly;
  const status = item.required && !present ? "missing" : invalidPublicSecret ? "invalid_public_secret_name" : "ok";
  return { ...item, present, status };
});

const missing = results.filter((item) => item.status === "missing");
const invalid = results.filter((item) => item.status === "invalid_public_secret_name");
const status = strict && (missing.length > 0 || invalid.length > 0) ? "FAIL" : missing.length > 0 || invalid.length > 0 ? "WARN" : "PASS";

const report = {
  repo: "abdulbasit742/anydesklovable",
  generatedAt: new Date().toISOString(),
  strict,
  status,
  results: results.map(({ name, required, serverOnly, description, present, status }) => ({
    name,
    required,
    serverOnly,
    description,
    present,
    status
  }))
};

mkdirSync("reports", { recursive: true });
writeFileSync("reports/env-validation.json", JSON.stringify(report, null, 2));
writeFileSync(
  "reports/env-validation.md",
  [
    "# RemoteDesk Dashboard Environment Validation",
    "",
    `Status: **${status}**`,
    `Strict mode: **${strict ? "yes" : "no"}**`,
    "",
    "| Variable | Required | Server-only | Present | Status |",
    "|---|---:|---:|---:|---|",
    ...report.results.map((item) => `| ${item.name} | ${item.required ? "yes" : "no"} | ${item.serverOnly ? "yes" : "no"} | ${item.present ? "yes" : "no"} | ${item.status} |`),
    "",
    "No environment values are printed by this report."
  ].join("\n")
);

console.log(`[env:validate] ${status} - ${missing.length} missing, ${invalid.length} invalid public-secret names`);
if (status === "FAIL") process.exit(1);
