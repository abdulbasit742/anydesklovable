export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiEnvelope<T> = {
  data: T;
  ok: boolean;
  status: number;
};

export type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: unknown;
};

export class RemoteDeskApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "RemoteDeskApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const DEFAULT_API_BASE_URL = "http://localhost:5000";
const ACCESS_TOKEN_STORAGE_KEY = "remotedesk.api.accessToken";

export function getApiBaseUrl() {
  const fromEnv = import.meta.env.VITE_REMOTEDESK_API_URL || import.meta.env.VITE_API_BASE_URL;
  return String(fromEnv || DEFAULT_API_BASE_URL).replace(/\/$/, "");
}

export function setStoredAccessToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (!token) {
    window.localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
}

export function clearStoredAccessToken() {
  setStoredAccessToken(null);
}

type RequestOptions = {
  method?: HttpMethod;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function parseResponseBody(response: Response) {
  const text = await response.text();
  if (!text) return null;
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return text;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function buildError(response: Response, body: unknown) {
  if (isPlainObject(body)) {
    const message = typeof body.message === "string" ? body.message : `RemoteDesk API request failed with ${response.status}`;
    const code = typeof body.code === "string" ? body.code : undefined;
    return new RemoteDeskApiError(message, response.status, code, body.details);
  }
  return new RemoteDeskApiError(`RemoteDesk API request failed with ${response.status}`, response.status);
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<ApiEnvelope<T>> {
  const method = options.method ?? "GET";
  const token = options.token ?? getStoredAccessToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options.headers,
  };

  let body: BodyInit | undefined;
  if (options.body !== undefined) {
    headers["Content-Type"] = headers["Content-Type"] || "application/json";
    body = headers["Content-Type"].includes("application/json") ? JSON.stringify(options.body) : (options.body as BodyInit);
  }

  if (token) headers.Authorization = `Bearer ${token}`;

  const url = path.startsWith("http") ? path : `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
  const response = await fetch(url, { method, headers, body, signal: options.signal, credentials: "omit" });
  const parsed = await parseResponseBody(response);

  if (!response.ok) throw buildError(response, parsed);

  return {
    data: parsed as T,
    ok: response.ok,
    status: response.status,
  };
}

export async function getApiHealth() {
  return apiRequest<{ status?: string; ok?: boolean; service?: string }>("/health");
}

export async function getApiReady() {
  return apiRequest<{ status?: string; ok?: boolean; database?: string }>("/health/ready");
}
