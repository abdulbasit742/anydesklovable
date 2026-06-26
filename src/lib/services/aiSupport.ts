/**
 * AI IT Support service layer for the Dashboard PWA.
 * Communicates with the RemoteDesk backend /api/ai-support/* endpoints.
 */

import { supabase } from "@/integrations/supabase/client";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

async function getToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function apiFetch<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API error");
  return json.data;
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SupportTicket {
  id: string;
  title: string;
  description?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  deviceId: string;
  userId: string;
  aiSummary?: string;
  aiResolution?: string;
  createdAt: string;
  updatedAt: string;
  device?: { id: string; name: string; platform: string };
}

export interface DiagnosticReport {
  id: string;
  deviceId: string;
  ticketId?: string;
  cpuStatus: string;
  memoryStatus: string;
  diskStatus: string;
  networkStatus: string;
  securityStatus: string;
  aiAnalysis: string;
  recommendedActions: string;
  createdAt: string;
}

export interface SessionReplay {
  id: string;
  sessionId: string;
  eventsJson: string;
  aiSummary?: string;
  createdAt: string;
}

export interface PredictiveAlert {
  id: string;
  deviceId: string;
  component: string;
  predictedFailureDate?: string;
  confidenceScore: number;
  reasoning: string;
  isResolved: boolean;
  createdAt: string;
}

export interface ParsedAction {
  type: string;
  payload?: Record<string, unknown>;
  explanation: string;
}

export interface AutoFixScript {
  script: string;
  explanation: string;
  requiresReboot: boolean;
}

// ─── Diagnostics ──────────────────────────────────────────────────────────────

export async function analyzeDevice(deviceId: string, systemState: {
  cpuUsage: number;
  memoryUsage: number;
  totalMemory: number;
  diskUsage: number;
  totalDisk: number;
  activeProcesses: string[];
  recentErrors: string[];
  osVersion: string;
}): Promise<DiagnosticReport> {
  return apiFetch("/api/ai-support/diagnostics/analyze", "POST", { deviceId, systemState });
}

export async function getDeviceDiagnostics(deviceId: string): Promise<DiagnosticReport[]> {
  return apiFetch(`/api/ai-support/diagnostics/device/${deviceId}`);
}

// ─── Commands ─────────────────────────────────────────────────────────────────

export async function parseNLCommand(deviceId: string, command: string): Promise<ParsedAction> {
  return apiFetch("/api/ai-support/commands/parse", "POST", { deviceId, command });
}

export async function generateAutoFixScript(deviceId: string, issue: string): Promise<AutoFixScript> {
  return apiFetch("/api/ai-support/commands/generate-script", "POST", { deviceId, issue });
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export async function getTickets(): Promise<SupportTicket[]> {
  return apiFetch("/api/ai-support/tickets");
}

export async function createTicket(data: {
  deviceId: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high" | "critical";
}): Promise<SupportTicket> {
  return apiFetch("/api/ai-support/tickets", "POST", data);
}

export async function resolveTicket(id: string, resolution: string): Promise<SupportTicket> {
  return apiFetch(`/api/ai-support/tickets/${id}/resolve`, "PATCH", { resolution });
}

// ─── Session Replay ───────────────────────────────────────────────────────────

export async function saveSessionReplay(sessionId: string, eventsJson: string): Promise<SessionReplay> {
  return apiFetch("/api/ai-support/replays", "POST", { sessionId, eventsJson });
}

export async function getSessionReplay(sessionId: string): Promise<SessionReplay> {
  return apiFetch(`/api/ai-support/replays/${sessionId}`);
}

// ─── Predictive Alerts ────────────────────────────────────────────────────────

export async function getPredictiveAlerts(deviceId: string): Promise<PredictiveAlert[]> {
  return apiFetch(`/api/ai-support/predictive-alerts/device/${deviceId}`);
}
