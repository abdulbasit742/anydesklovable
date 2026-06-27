const LOCAL_SESSION_KEY = "rd_local_session";

// Normalise: strip trailing /api so we can append /api/auth/...
function getApiBase(): string {
  const raw = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000/api";
  return raw.replace(/\/api\/?$/, "") + "/api";
}

export interface LocalUser {
  id: string;
  email: string;
  fullName: string;
  remoteDeskId: string;
}

export interface LocalSession {
  user: LocalUser;
  accessToken: string;
}

/** True when Supabase env vars are absent — full local/demo mode. */
export function isLocalMode(): boolean {
  return !(import.meta.env.VITE_SUPABASE_URL as string | undefined);
}

export function getLocalSession(): LocalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? (JSON.parse(raw) as LocalSession) : null;
  } catch {
    return null;
  }
}

export function setLocalSession(session: LocalSession): void {
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
}

export function clearLocalSession(): void {
  localStorage.removeItem(LOCAL_SESSION_KEY);
}

export async function apiLogin(email: string, password: string): Promise<LocalSession> {
  const res = await fetch(`${getApiBase()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message ?? "Login failed");
  const { user, tokens } = (body as { data: { user: LocalUser & { remoteDeskId: string }; tokens: { accessToken: string } } }).data;
  return {
    user: { id: user.id, email: user.email, fullName: user.fullName, remoteDeskId: user.remoteDeskId },
    accessToken: tokens.accessToken,
  };
}

export async function apiSignup(fullName: string, email: string, password: string): Promise<LocalSession> {
  const res = await fetch(`${getApiBase()}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fullName, email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((body as { message?: string }).message ?? "Signup failed");
  const { user, tokens } = (body as { data: { user: LocalUser & { remoteDeskId: string }; tokens: { accessToken: string } } }).data;
  return {
    user: { id: user.id, email: user.email, fullName: user.fullName, remoteDeskId: user.remoteDeskId },
    accessToken: tokens.accessToken,
  };
}
