import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AuthLayout, Field } from "./login";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — RemoteDesk" }, { name: "description", content: "Reset your RemoteDesk password." }] }),
  component: Forgot,
});

function Forgot() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Reset link sent");
  }

  return (
    <AuthLayout title="Reset your password" subtitle="We'll email you a secure reset link.">
      <form className="space-y-3" onSubmit={onSubmit}>
        <Field label="Email"><Input type="email" required placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending…" : "Send reset link"}</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Remembered it? <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
