/**
 * Cloud Gaming Service — Dashboard PWA
 * Communicates with the /api/cloud-gaming backend endpoints.
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || "Request failed");
  }
  return res.json();
}

// ─── Streaming Profiles ───────────────────────────────────────────────────────

export interface StreamingProfile {
  id: string;
  name: string;
  codec: string;
  resolution: string;
  framerate: number;
  bitrate: number;
  latencyMode: string;
  hdrEnabled: boolean;
  adaptiveBitrate: boolean;
  audioChannels: number;
  isDefault: boolean;
  createdAt: string;
}

export async function listStreamingProfiles(token: string): Promise<StreamingProfile[]> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/profiles`, { headers: authHeaders(token) });
  const data = await handleResponse<{ profiles: StreamingProfile[] }>(res);
  return data.profiles;
}

export async function createStreamingProfile(token: string, profile: Omit<StreamingProfile, "id" | "createdAt">): Promise<StreamingProfile> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/profiles`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(profile)
  });
  const data = await handleResponse<{ profile: StreamingProfile }>(res);
  return data.profile;
}

export async function updateStreamingProfile(token: string, id: string, updates: Partial<StreamingProfile>): Promise<StreamingProfile> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/profiles/${id}`, {
    method: "PATCH", headers: authHeaders(token), body: JSON.stringify(updates)
  });
  const data = await handleResponse<{ profile: StreamingProfile }>(res);
  return data.profile;
}

export async function deleteStreamingProfile(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/profiles/${id}`, {
    method: "DELETE", headers: authHeaders(token)
  });
  await handleResponse<{ success: boolean }>(res);
}

// ─── Gaming Sessions ──────────────────────────────────────────────────────────

export interface GamingSession {
  id: string;
  deviceId: string;
  deviceName?: string;
  profileId?: string;
  profileName?: string;
  encoderType: string;
  codec: string;
  resolution: string;
  framerate: number;
  avgBitrateKbps: number;
  avgLatencyMs: number;
  avgFps: number;
  peakFps: number;
  packetLossPercent: number;
  totalFrames: number;
  droppedFrames: number;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  status: "active" | "ended" | "failed";
}

export async function listGamingSessions(token: string, limit = 20): Promise<GamingSession[]> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/sessions?limit=${limit}`, { headers: authHeaders(token) });
  const data = await handleResponse<{ sessions: GamingSession[] }>(res);
  return data.sessions;
}

export async function startGamingSession(token: string, deviceId: string, profileId?: string): Promise<GamingSession> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/sessions`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify({ deviceId, profileId })
  });
  const data = await handleResponse<{ session: GamingSession }>(res);
  return data.session;
}

export async function endGamingSession(token: string, sessionId: string, stats: Partial<GamingSession>): Promise<GamingSession> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/sessions/${sessionId}/end`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(stats)
  });
  const data = await handleResponse<{ session: GamingSession }>(res);
  return data.session;
}

// ─── Game Library ─────────────────────────────────────────────────────────────

export interface GameEntry {
  id: string;
  name: string;
  processName: string;
  platform: string;
  coverUrl?: string;
  recommendedProfileId?: string;
  recommendedProfileName?: string;
  lastPlayedAt?: string;
  totalPlaytimeSeconds: number;
}

export async function listGames(token: string): Promise<GameEntry[]> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/games`, { headers: authHeaders(token) });
  const data = await handleResponse<{ games: GameEntry[] }>(res);
  return data.games;
}

export async function addGame(token: string, game: Omit<GameEntry, "id" | "totalPlaytimeSeconds" | "lastPlayedAt">): Promise<GameEntry> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/games`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(game)
  });
  const data = await handleResponse<{ game: GameEntry }>(res);
  return data.game;
}

export async function deleteGame(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/games/${id}`, {
    method: "DELETE", headers: authHeaders(token)
  });
  await handleResponse<{ success: boolean }>(res);
}

// ─── Wake-on-LAN ──────────────────────────────────────────────────────────────

export interface WolTarget {
  id: string;
  name: string;
  macAddress: string;
  broadcastIp: string;
  deviceId?: string;
  lastWokenAt?: string;
}

export async function listWolTargets(token: string): Promise<WolTarget[]> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/wol`, { headers: authHeaders(token) });
  const data = await handleResponse<{ targets: WolTarget[] }>(res);
  return data.targets;
}

export async function sendWakeOnLan(token: string, targetId: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/wol/${targetId}/wake`, {
    method: "POST", headers: authHeaders(token)
  });
  return handleResponse<{ success: boolean; message: string }>(res);
}

export async function addWolTarget(token: string, target: Omit<WolTarget, "id" | "lastWokenAt">): Promise<WolTarget> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/wol`, {
    method: "POST", headers: authHeaders(token), body: JSON.stringify(target)
  });
  const data = await handleResponse<{ target: WolTarget }>(res);
  return data.target;
}

export async function deleteWolTarget(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/wol/${id}`, {
    method: "DELETE", headers: authHeaders(token)
  });
  await handleResponse<{ success: boolean }>(res);
}

// ─── Stats ────────────────────────────────────────────────────────────────────

export interface CloudGamingStats {
  totalSessions: number;
  activeSessions: number;
  totalPlaytimeHours: number;
  avgLatencyMs: number;
  avgFps: number;
  avgBitrateMbps: number;
  topGames: Array<{ name: string; playtimeHours: number }>;
  sessionsByDay: Array<{ date: string; count: number }>;
}

export async function getCloudGamingStats(token: string): Promise<CloudGamingStats> {
  const res = await fetch(`${API_BASE}/api/cloud-gaming/stats`, { headers: authHeaders(token) });
  return handleResponse<CloudGamingStats>(res);
}
