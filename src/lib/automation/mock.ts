// Mock fallback data for the Automation Center.
// Used when no rows exist for the current team — pages show a demo banner.

export type AutomationStatus = "idle" | "running" | "paused" | "degraded" | "failed";
export type TaskStatus = "queued" | "running" | "waiting" | "completed" | "failed" | "cancelled";
export type TaskPriority = "low" | "normal" | "high" | "urgent";
export type AccountStatus = "available" | "active" | "cooldown" | "limited" | "banned" | "disabled";
export type Severity = "low" | "medium" | "high" | "critical";
export type LogLevel = "debug" | "info" | "warning" | "error" | "critical";

const now = Date.now();
const ago = (m: number) => new Date(now - m * 60_000).toISOString();

export const mockSystems = [
  { id: "sys-1", name: "Core Orchestrator", slug: "core", description: "Main task router", status: "running" as AutomationStatus, health_score: 96, last_heartbeat_at: ago(1), team_id: null, created_at: ago(60 * 24 * 5), updated_at: ago(2) },
  { id: "sys-2", name: "Verification Worker", slug: "verification", description: "Quality checks", status: "degraded" as AutomationStatus, health_score: 71, last_heartbeat_at: ago(8), team_id: null, created_at: ago(60 * 24 * 3), updated_at: ago(8) },
  { id: "sys-3", name: "Formatter Service", slug: "formatter", description: "Output post-processing", status: "idle" as AutomationStatus, health_score: 100, last_heartbeat_at: ago(15), team_id: null, created_at: ago(60 * 24 * 7), updated_at: ago(15) },
];

export const mockPipelines = [
  { id: "p1", name: "Smoke Test Sweep", description: "Run sanity checks across regions", mode: "sequential", status: "active", stages: [{ name: "Boot" }, { name: "Test" }, { name: "Report" }], created_at: ago(60 * 24 * 4), updated_at: ago(60) },
  { id: "p2", name: "Nightly Verification", description: "QA verification of new builds", mode: "verification", status: "active", stages: [{ name: "Pull" }, { name: "Verify" }], created_at: ago(60 * 24 * 2), updated_at: ago(120) },
  { id: "p3", name: "Release Formatter", description: "Polish release notes", mode: "formatting", status: "draft", stages: [{ name: "Draft" }, { name: "Format" }, { name: "Publish" }], created_at: ago(60 * 24), updated_at: ago(180) },
];

export const mockTasks = [
  { id: "t1", title: "Build verification — v4.3.1", prompt: "Run full verification pipeline against build v4.3.1", status: "running" as TaskStatus, priority: "high" as TaskPriority, current_stage: 1, progress: 62, pipeline_id: "p2", error_message: null, created_at: ago(30), started_at: ago(28), finished_at: null, scheduled_for: null },
  { id: "t2", title: "Daily smoke test", prompt: "Daily smoke across primary regions", status: "queued" as TaskStatus, priority: "normal" as TaskPriority, current_stage: 0, progress: 0, pipeline_id: "p1", error_message: null, created_at: ago(5), started_at: null, finished_at: null, scheduled_for: ago(-10) },
  { id: "t3", title: "Format release notes v4.3", prompt: "Polish and publish release notes", status: "completed" as TaskStatus, priority: "low" as TaskPriority, current_stage: 3, progress: 100, pipeline_id: "p3", error_message: null, created_at: ago(240), started_at: ago(235), finished_at: ago(220) },
  { id: "t4", title: "Backfill audit reports", prompt: "Backfill missing audit reports", status: "failed" as TaskStatus, priority: "urgent" as TaskPriority, current_stage: 2, progress: 45, pipeline_id: "p1", error_message: "Rate limit hit on provider openai", created_at: ago(120), started_at: ago(118), finished_at: ago(110) },
  { id: "t5", title: "Cooldown verification", prompt: "Verify cooldown logic", status: "waiting" as TaskStatus, priority: "normal" as TaskPriority, current_stage: 1, progress: 20, pipeline_id: "p2", error_message: null, created_at: ago(50), started_at: ago(48), finished_at: null },
];

export const mockAccounts = [
  { id: "a1", label: "manus-primary", provider: "manus", status: "active" as AccountStatus, daily_task_count: 142, success_rate: 0.94, last_used_at: ago(2), cooldown_until: null, health_score: 92, masked_label: "mns_••••3a7f", notes: null, created_at: ago(60 * 24 * 30) },
  { id: "a2", label: "openai-fallback", provider: "openai", status: "cooldown" as AccountStatus, daily_task_count: 320, success_rate: 0.88, last_used_at: ago(20), cooldown_until: new Date(now + 15 * 60_000).toISOString(), health_score: 64, masked_label: "sk-••••de12", notes: "Rate limited 11:42 UTC", created_at: ago(60 * 24 * 60) },
  { id: "a3", label: "claude-bulk", provider: "claude", status: "available" as AccountStatus, daily_task_count: 80, success_rate: 0.97, last_used_at: ago(120), cooldown_until: null, health_score: 100, masked_label: "ant_••••91xa", notes: null, created_at: ago(60 * 24 * 10) },
  { id: "a4", label: "kimi-cheap", provider: "kimi", status: "limited" as AccountStatus, daily_task_count: 18, success_rate: 0.71, last_used_at: ago(300), cooldown_until: null, health_score: 48, masked_label: "km_••••aa01", notes: "Tier capped", created_at: ago(60 * 24 * 20) },
];

export const mockRateLimits = [
  { id: "r1", account_id: "a2", provider: "openai", signal: "429", severity: "high" as Severity, message: "Too many requests (gpt-4)", cooldown_seconds: 900, detected_at: ago(20), resolved_at: null },
  { id: "r2", account_id: "a4", provider: "kimi", signal: "tier_cap", severity: "medium" as Severity, message: "Daily tier cap reached", cooldown_seconds: 3600, detected_at: ago(120), resolved_at: null },
  { id: "r3", account_id: "a1", provider: "manus", signal: "throttle", severity: "low" as Severity, message: "Soft throttle observed", cooldown_seconds: 60, detected_at: ago(180), resolved_at: ago(170) },
];

export const mockScheduler = [
  { id: "sc1", name: "Daily smoke", pipeline_id: "p1", enabled: true, schedule_type: "cron", cron_expression: "0 6 * * *", interval_minutes: null, timezone: "UTC", heavy_task_window: { start: "01:00", end: "05:00" }, light_task_window: { start: "09:00", end: "21:00" }, created_at: ago(60 * 24) },
  { id: "sc2", name: "Hourly verification", pipeline_id: "p2", enabled: true, schedule_type: "interval", cron_expression: null, interval_minutes: 60, timezone: "UTC", heavy_task_window: null, light_task_window: null, created_at: ago(60 * 24 * 2) },
  { id: "sc3", name: "Manual release", pipeline_id: "p3", enabled: false, schedule_type: "manual", cron_expression: null, interval_minutes: null, timezone: "UTC", heavy_task_window: null, light_task_window: null, created_at: ago(60 * 24 * 5) },
];

export const mockAlertRoutes = [
  { id: "ar1", name: "On-call email", channel: "email", enabled: true, config: { to: "ops@remotedesk.io" }, created_at: ago(60 * 24 * 30) },
  { id: "ar2", name: "Ops Telegram", channel: "telegram", enabled: true, config: { chat_id: "-100123456" }, created_at: ago(60 * 24 * 20) },
  { id: "ar3", name: "Status webhook", channel: "webhook", enabled: false, config: { url: "https://hooks.example/automation" }, created_at: ago(60 * 24 * 10) },
  { id: "ar4", name: "Dashboard banner", channel: "in_app", enabled: true, config: {}, created_at: ago(60 * 24 * 5) },
];

export const mockLogs = [
  { id: "l1", level: "info" as LogLevel, category: "scheduler", message: "Pipeline run started: Smoke Test Sweep", metadata: { task_id: "t1" }, system_id: "sys-1", task_id: "t1", created_at: ago(2) },
  { id: "l2", level: "warning" as LogLevel, category: "rate_limit", message: "openai-fallback entered cooldown (15m)", metadata: { account: "a2" }, system_id: "sys-1", task_id: null, created_at: ago(20) },
  { id: "l3", level: "error" as LogLevel, category: "task", message: "Task failed: Backfill audit reports", metadata: { task_id: "t4" }, system_id: "sys-2", task_id: "t4", created_at: ago(110) },
  { id: "l4", level: "info" as LogLevel, category: "task", message: "Task completed: Format release notes v4.3", metadata: { task_id: "t3" }, system_id: "sys-3", task_id: "t3", created_at: ago(220) },
  { id: "l5", level: "debug" as LogLevel, category: "heartbeat", message: "Heartbeat OK for Core Orchestrator", metadata: {}, system_id: "sys-1", task_id: null, created_at: ago(1) },
  { id: "l6", level: "critical" as LogLevel, category: "system", message: "Verification Worker health degraded (71%)", metadata: {}, system_id: "sys-2", task_id: null, created_at: ago(45) },
];

export const mockArtifacts = [
  { id: "af1", name: "release-notes-v4.3.md", type: "markdown", task_id: "t3", storage_path: null, preview: "# RemoteDesk v4.3\n\n- New verification engine\n- Improved cooldown logic\n", size_bytes: 1840, created_at: ago(220) },
  { id: "af2", name: "smoke-results.json", type: "json", task_id: "t2", storage_path: null, preview: JSON.stringify({ region: "eu", pass: 28, fail: 2 }, null, 2), size_bytes: 512, created_at: ago(5) },
  { id: "af3", name: "audit-report.zip", type: "zip", task_id: "t4", storage_path: null, preview: null, size_bytes: 204800, created_at: ago(110) },
];
