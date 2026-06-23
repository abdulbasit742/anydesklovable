import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — RemoteDesk" }, { name: "description", content: "Sign in to RemoteDesk." }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Signed in");
    navigate({ to: "/dashboard" });
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return toast.error(result.error.message ?? "Google sign-in failed");
    if (result.redirected) return;
    // Wait for the session to be persisted, then hard-navigate so the
    // _authenticated gate re-reads the fresh session from localStorage.
    for (let i = 0; i < 20; i++) {
      const { data } = await supabase.auth.getSession();
      if (data.session) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    toast.success("Signed in");
    window.location.assign("/dashboard");
  }


  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your RemoteDesk workspace.">
      <Button type="button" variant="outline" className="w-full" onClick={onGoogle}>
        <GoogleIcon /> Continue with Google
      </Button>
      <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
      </div>
      <form className="space-y-3" onSubmit={onSubmit}>
        <Field label="Work email">
          <Input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" hint={<Link to="/forgot-password" className="text-primary hover:underline">Forgot?</Link>}>
          <Input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        New to RemoteDesk? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6.9 0 9.2-4.8 9.2-7.3 0-.5 0-.9-.1-1.3H12z"/>
    </svg>
  );
}

export function AuthLayout({
  title, subtitle, children,
}: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground lg:flex">
        <Logo light />
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sidebar-border px-3 py-1 text-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Zero-trust by default
          </div>
          <h2 className="mt-4 max-w-md text-3xl font-semibold text-white">
            Every session starts with the host's consent.
          </h2>
          <p className="mt-3 max-w-md text-sm text-sidebar-foreground/70">
            RemoteDesk uses end-to-end encrypted WebRTC, requires explicit approval, and lets you stop a session instantly.
          </p>
        </div>
        <div className="text-xs text-sidebar-foreground/60">© 2026 RemoteDesk</div>
      </div>
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden"><Logo /></div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function Field({
  label, hint, children,
}: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        {hint && <div className="text-xs">{hint}</div>}
      </div>
      {children}
    </div>
  );
}
