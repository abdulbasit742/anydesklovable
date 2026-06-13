import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { acceptTeamInvitation, lookupInvitationByToken } from "@/lib/services";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/invite/$token")({
  ssr: false,
  head: () => ({ meta: [{ title: "Accept invitation — RemoteDesk" }] }),
  component: () => (
    <AuthProvider>
      <InviteAccept />
    </AuthProvider>
  ),
});

type LookupState =
  | { kind: "loading" }
  | { kind: "not_found" }
  | { kind: "ready"; email: string; role: string; teamName: string; status: string; expiresAt: string }
  | { kind: "error"; message: string };

function InviteAccept() {
  const { token } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [lookup, setLookup] = useState<LookupState>({ kind: "loading" });
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    lookupInvitationByToken(token)
      .then((row) => {
        if (!live) return;
        if (!row) return setLookup({ kind: "not_found" });
        setLookup({
          kind: "ready",
          email: row.email,
          role: row.role,
          status: row.status,
          expiresAt: row.expires_at,
          teamName: (row.teams as { name?: string } | null)?.name ?? "this workspace",
        });
      })
      .catch((e) => live && setLookup({ kind: "error", message: (e as Error).message }));
    return () => { live = false; };
  }, [token]);

  const accept = async () => {
    setAccepting(true); setAcceptError(null);
    try {
      const res = await acceptTeamInvitation(token);
      setAccepted(true);
      setTimeout(() => navigate({ to: "/dashboard/team" }), 1200);
      return res;
    } catch (e) {
      setAcceptError((e as Error).message);
    } finally { setAccepting(false); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center px-4"><Logo /></div>
      </header>
      <main className="container mx-auto max-w-md px-4 py-12">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4" /> Team invitation
          </div>

          {lookup.kind === "loading" && (
            <div className="py-8 text-center text-sm text-muted-foreground">
              <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
              Checking invitation…
            </div>
          )}

          {lookup.kind === "not_found" && (
            <Status icon={AlertCircle} tone="destructive" title="Invitation not found">
              This invitation link is invalid or has already been used. Ask the workspace owner to send a new one.
            </Status>
          )}

          {lookup.kind === "error" && (
            <Status icon={AlertCircle} tone="destructive" title="Couldn't load invitation">
              {lookup.message}
            </Status>
          )}

          {lookup.kind === "ready" && (() => {
            const expired = new Date(lookup.expiresAt).getTime() < Date.now();
            if (lookup.status !== "pending") {
              return <Status icon={AlertCircle} tone="warning" title={`Invitation already ${lookup.status}`}>
                Ask your workspace admin to send a fresh invitation.
              </Status>;
            }
            if (expired) {
              return <Status icon={AlertCircle} tone="warning" title="Invitation expired">
                This invitation has expired. Ask your workspace admin to resend it.
              </Status>;
            }
            if (authLoading) {
              return <div className="py-6 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Loading session…</div>;
            }
            if (!user) {
              if (typeof window !== "undefined") {
                try { sessionStorage.setItem("pending_invite_token", token); } catch { /* ignore */ }
              }
              return (
                <div className="space-y-4">
                  <p className="text-sm">
                    You've been invited to join <strong>{lookup.teamName}</strong> as <strong className="capitalize">{lookup.role}</strong>.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Sign in with <strong>{lookup.email}</strong> to accept this invitation.
                  </p>
                  <div className="flex gap-2">
                    <Button asChild className="flex-1"><Link to="/login">Sign in</Link></Button>
                    <Button asChild variant="outline" className="flex-1"><Link to="/signup">Create account</Link></Button>
                  </div>
                  <p className="text-[11px] text-muted-foreground">You'll need to return to this link after signing in.</p>
                </div>
              );
            }
            const emailMismatch = (user.email ?? "").toLowerCase() !== lookup.email.toLowerCase();
            if (emailMismatch) {
              return (
                <Status icon={AlertCircle} tone="warning" title="Wrong account">
                  This invitation was sent to <strong>{lookup.email}</strong>, but you're signed in as <strong>{user.email}</strong>. Sign out and sign back in with the invited address.
                </Status>
              );
            }
            if (accepted) {
              return <Status icon={CheckCircle2} tone="success" title="You're in!">Redirecting to your team workspace…</Status>;
            }
            return (
              <div className="space-y-4">
                <p className="text-sm">
                  Join <strong>{lookup.teamName}</strong> as <strong className="capitalize">{lookup.role}</strong>?
                </p>
                {acceptError && (
                  <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">{acceptError}</div>
                )}
                <Button onClick={accept} disabled={accepting} className="w-full">
                  {accepting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Accepting…</> : "Accept invitation"}
                </Button>
                <Button asChild variant="ghost" className="w-full"><Link to="/dashboard">Skip for now</Link></Button>
              </div>
            );
          })()}
        </div>
      </main>
    </div>
  );
}

function Status({ icon: Icon, tone, title, children }: {
  icon: typeof AlertCircle; tone: "success" | "warning" | "destructive"; title: string; children: React.ReactNode;
}) {
  const toneCls = tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-destructive";
  return (
    <div className="py-2 text-center">
      <Icon className={`mx-auto mb-2 h-6 w-6 ${toneCls}`} />
      <div className={`text-base font-semibold ${toneCls}`}>{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      <div className="mt-4"><Button asChild variant="outline" size="sm"><Link to="/">Back to home</Link></Button></div>
    </div>
  );
}
