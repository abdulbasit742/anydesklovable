import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AuthLayout, Field } from "./login";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — RemoteDesk" }, { name: "description", content: "Create your RemoteDesk account." }] }),
  component: Signup,
});

function Signup() {
  const navigate = useNavigate();
  return (
    <AuthLayout title="Create your account" subtitle="Free for personal use. No credit card required.">
      <form
        className="space-y-3"
        onSubmit={(e) => { e.preventDefault(); toast.success("Account created"); navigate({ to: "/dashboard" }); }}
      >
        <Field label="Full name"><Input required placeholder="Abdul Basit" /></Field>
        <Field label="Work email"><Input type="email" required placeholder="you@company.com" /></Field>
        <Field label="Password"><Input type="password" required placeholder="At least 10 characters" minLength={10} /></Field>
        <ul className="space-y-1 text-xs text-muted-foreground">
          {["End-to-end encrypted sessions", "Host approval is always required", "Cancel anytime"].map((t) => (
            <li key={t} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" />{t}</li>
          ))}
        </ul>
        <Button type="submit" className="w-full">Create account</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
