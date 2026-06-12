import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AuthLayout, Field } from "./login";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — RemoteDesk" }, { name: "description", content: "Reset your RemoteDesk password." }] }),
  component: Forgot,
});

function Forgot() {
  return (
    <AuthLayout title="Reset your password" subtitle="We’ll email you a secure reset link.">
      <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); toast.success("Reset link sent"); }}>
        <Field label="Email"><Input type="email" required placeholder="you@company.com" /></Field>
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        Remembered it? <Link to="/login" className="text-primary hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
