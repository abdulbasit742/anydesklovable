import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import {
  isLocalMode,
  getLocalSession,
  clearLocalSession,
  type LocalSession,
} from "@/lib/local-auth";

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ user: null, session: null, loading: true, signOut: async () => {} });

function localToUser(s: LocalSession): User {
  return {
    id: s.user.id,
    email: s.user.email,
    user_metadata: { full_name: s.user.fullName },
    app_metadata: {},
    aud: "authenticated",
    created_at: "",
    updated_at: "",
    role: "authenticated",
    phone: "",
    confirmed_at: new Date().toISOString(),
    email_confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    factors: [],
    identities: [],
  } as unknown as User;
}

function localToSession(s: LocalSession): Session {
  return {
    user: localToUser(s),
    access_token: s.accessToken,
    refresh_token: "",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
  } as unknown as Session;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supaSession, setSupaSession] = useState<Session | null>(null);
  const [localSess, setLocalSess] = useState<LocalSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLocalMode()) {
      setLocalSess(getLocalSession());
      setLoading(false);
      const handler = () => setLocalSess(getLocalSession());
      window.addEventListener("storage", handler);
      return () => window.removeEventListener("storage", handler);
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSupaSession(s);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSupaSession(data.session);
      setLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const user = isLocalMode()
    ? (localSess ? localToUser(localSess) : null)
    : supaSession?.user ?? null;

  const session = isLocalMode()
    ? (localSess ? localToSession(localSess) : null)
    : supaSession;

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        loading,
        signOut: async () => {
          if (isLocalMode()) {
            clearLocalSession();
            setLocalSess(null);
          } else {
            await supabase.auth.signOut();
          }
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
