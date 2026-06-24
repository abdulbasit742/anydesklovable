import { apiRequest, clearStoredAccessToken, setStoredAccessToken } from "./backendApi";

export type ApiUser = {
  id: string;
  email: string;
  name?: string | null;
  full_name?: string | null;
  team_id?: string | null;
  role?: string | null;
};

export type AuthSession = {
  user: ApiUser;
  accessToken?: string;
  token?: string;
  expiresAt?: string | null;
};

export type RegisterInput = {
  email: string;
  password: string;
  name?: string;
  fullName?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

function extractToken(session: AuthSession) {
  return session.accessToken || session.token || null;
}

export async function registerWithBackend(input: RegisterInput) {
  const { data } = await apiRequest<AuthSession>("/api/auth/register", {
    method: "POST",
    body: input,
  });
  setStoredAccessToken(extractToken(data));
  return data;
}

export async function loginWithBackend(input: LoginInput) {
  const { data } = await apiRequest<AuthSession>("/api/auth/login", {
    method: "POST",
    body: input,
  });
  setStoredAccessToken(extractToken(data));
  return data;
}

export async function getBackendCurrentUser() {
  const { data } = await apiRequest<{ user: ApiUser } | ApiUser>("/api/auth/me");
  return "user" in data ? data.user : data;
}

export async function logoutBackend() {
  try {
    await apiRequest<{ ok: boolean }>("/api/auth/logout", { method: "POST" });
  } finally {
    clearStoredAccessToken();
  }
}
