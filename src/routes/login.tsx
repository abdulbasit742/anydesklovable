import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — RemoteDesk" }, { name: "description", content: "Sign in to RemoteDesk." }] }),
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your RemoteDesk workspace.">
      <form
        className="space-y-3"
        onSubmit={(e) => { e.preventDefault(); toast.success("Signed in"); navigate({ to: "/dashboard" }); }}
      >
        <Field label="Work email"><Input type="email" required placeholder="you@company.com" /></Field>
        <Field label="Password" hint={<Link to="/forgot-password" className="text-primary hover:underline">Forgot?</Link>}>
          <Input type="password" required placeholder="••••••••" />
        </Field>
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        New to RemoteDesk? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
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
            Every session starts with the host’s consent.
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
