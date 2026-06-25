/**
 * IoT & Smart Device Remote Management — Dashboard PWA Service Layer
 */

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getHeaders() {
  const token = localStorage.getItem("token") || "";
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers: { ...getHeaders(), ...(options.headers || {}) } });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Sites ────────────────────────────────────────────────────────────────────
export const getSites = () => request<{ sites: any[] }>("/api/iot/sites");
export const createSite = (data: any) => request<{ site: any }>("/api/iot/sites", { method: "POST", body: JSON.stringify(data) });
export const updateSite = (id: string, data: any) => request<{ site: any }>(`/api/iot/sites/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteSite = (id: string) => request<void>(`/api/iot/sites/${id}`, { method: "DELETE" });

// ─── Devices ──────────────────────────────────────────────────────────────────
export const getDevices = (siteId?: string) => request<{ devices: any[] }>(`/api/iot/devices${siteId ? `?siteId=${siteId}` : ""}`);
export const createDevice = (data: any) => request<{ device: any }>("/api/iot/devices", { method: "POST", body: JSON.stringify(data) });
export const updateDevice = (id: string, data: any) => request<{ device: any }>(`/api/iot/devices/${id}`, { method: "PATCH", body: JSON.stringify(data) });
export const deleteDevice = (id: string) => request<void>(`/api/iot/devices/${id}`, { method: "DELETE" });
export const pingDevice = (id: string) => request<any>(`/api/iot/devices/${id}/ping`, { method: "POST" });
export const saveDiscoveredDevices = (siteId: string, devices: any[]) =>
  request<{ saved: number }>("/api/iot/discover/save", { method: "POST", body: JSON.stringify({ siteId, devices }) });

// ─── Topology ─────────────────────────────────────────────────────────────────
export const getTopology = (siteId: string) => request<{ nodes: any[]; edges: any[] }>(`/api/iot/topology/${siteId}`);

// ─── Smart Home ───────────────────────────────────────────────────────────────
export const getSmartEntities = (siteId: string) => request<{ entities: any[] }>(`/api/iot/smart-home/entities?siteId=${siteId}`);
export const controlEntity = (id: string, action: string, value?: any) =>
  request<any>(`/api/iot/smart-home/entities/${id}/control`, { method: "POST", body: JSON.stringify({ action, value }) });
export const syncHomeAssistant = (siteId: string) =>
  request<any>("/api/iot/smart-home/sync", { method: "POST", body: JSON.stringify({ siteId }) });

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const getAlerts = (acknowledged?: boolean) =>
  request<{ alerts: any[] }>(`/api/iot/alerts${acknowledged !== undefined ? `?acknowledged=${acknowledged}` : ""}`);
export const acknowledgeAlert = (id: string) => request<any>(`/api/iot/alerts/${id}/acknowledge`, { method: "POST" });
export const createAlertRule = (data: any) => request<{ rule: any }>("/api/iot/alerts/rules", { method: "POST", body: JSON.stringify(data) });

// ─── Tunnels ──────────────────────────────────────────────────────────────────
export const getTunnels = () => request<{ tunnels: any[] }>("/api/iot/tunnels");
export const createTunnel = (data: any) => request<{ tunnel: any }>("/api/iot/tunnels", { method: "POST", body: JSON.stringify(data) });
export const startTunnel = (id: string) => request<any>(`/api/iot/tunnels/${id}/start`, { method: "POST" });
export const stopTunnel = (id: string) => request<any>(`/api/iot/tunnels/${id}/stop`, { method: "POST" });
export const deleteTunnel = (id: string) => request<void>(`/api/iot/tunnels/${id}`, { method: "DELETE" });

// ─── Scheduled Tasks ──────────────────────────────────────────────────────────
export const getTasks = () => request<{ tasks: any[] }>("/api/iot/tasks");
export const createTask = (data: any) => request<{ task: any }>("/api/iot/tasks", { method: "POST", body: JSON.stringify(data) });
export const runTask = (id: string) => request<any>(`/api/iot/tasks/${id}/run`, { method: "POST" });
export const deleteTask = (id: string) => request<void>(`/api/iot/tasks/${id}`, { method: "DELETE" });

// ─── Server Monitoring ────────────────────────────────────────────────────────
export const getServerMetrics = (deviceId: string) => request<any>(`/api/iot/devices/${deviceId}/metrics`);

// ─── Stats ────────────────────────────────────────────────────────────────────
export const getIoTStats = () => request<any>("/api/iot/stats");
