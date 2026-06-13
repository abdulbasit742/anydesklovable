import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard")({
  ssr: false,
  component: () => (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  ),
});

function Gate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);
  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  return <Outlet />;
}
