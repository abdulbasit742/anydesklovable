import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AuthLayout, Field } from "./login";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { isLocalMode, apiSignup, setLocalSession } from "@/lib/local-auth";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — RemoteDesk" }, { name: "description", content: "Create your RemoteDesk account." }] }),
  component: Signup,
});

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.4-1.6 4-5.5 4-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.9 3.4 14.7 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6.9 0 9.2-4.8 9.2-7.3 0-.5 0-.9-.1-1.3H12z"/>
    </svg>
  );
}

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLocalMode()) {
        const sess = await apiSignup(name, email, password);
        setLocalSession(sess);
        toast.success("Account created");
        navigate({ to: "/dashboard" });
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) { toast.error(error.message); return; }
      toast.success("Account created");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  async function onGoogle() {
    if (isLocalMode()) {
      toast.error("Google sign-up requires Supabase. Use email/password in local mode.");
      return;
    }
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) return toast.error(result.error.message ?? "Google sign-up failed");
    if (result.redirected) return;
    for (let i = 0; i < 20; i++) {
      const { data } = await supabase.auth.getSession();
      if (data.session) break;
      await new Promise((r) => setTimeout(r, 100));
    }
    toast.success("Account created");
    window.location.assign("/dashboard");
  }


  return (
    <AuthLayout title="Create your account" subtitle="Free for personal use. No credit card required.">
      {!isLocalMode() && (
        <>
          <Button type="button" variant="outline" className="w-full" onClick={onGoogle}>
            <GoogleIcon /> Sign up with Google
          </Button>
          <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>
        </>
      )}
      <form className="space-y-3" onSubmit={onSubmit}>
        <Field label="Full name"><Input required placeholder="Abdul Basit" value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Work email"><Input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><Input type="password" required placeholder="At least 8 characters" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {["End-to-end encrypted sessions", "Host approval is always required", "Cancel anytime"].map((t) => (
            <li key={t} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" />{t}</li>
          ))}
        </ul>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Creating…" : "Create account"}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
