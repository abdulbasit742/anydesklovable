import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, OctagonAlert, Clipboard, FileUp, ShieldCheck, MonitorSmartphone, LogOut } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/dashboard/security")({
  head: () => ({ meta: [{ title: "Security — RemoteDesk" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  const navigate = useNavigate();
  const [signingOut, setSigningOut] = useState(false);
  async function signOutEverywhere() {
    setSigningOut(true);
    const { error } = await supabase.auth.signOut({ scope: "global" });
    setSigningOut(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed out of all sessions");
    navigate({ to: "/login" });
  }
  return (
    <AppShell title="Security">
      <div className="grid gap-4 lg:grid-cols-2">
        <SecurityCard
          icon={LogOut}
          title="Sign out of all sessions"
          desc="Revoke every active RemoteDesk web session for your account, including this browser. You will need to sign back in."
        >
          <Button size="sm" variant="destructive" disabled={signingOut} onClick={signOutEverywhere}>
            {signingOut ? "Signing out…" : "Sign out everywhere"}
          </Button>
        </SecurityCard>

        <SecurityCard
          icon={KeyRound}
          title="Device password"
          desc="A device password is required from anyone attempting to connect, in addition to host approval."
        >
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/40 p-3 text-sm">
            <span>Status: <span className="font-semibold text-success">Set</span></span>
            <Button size="sm" variant="outline" onClick={() => toast("Password rotated")}>Rotate</Button>
          </div>
        </SecurityCard>

        <ToggleCard
          icon={MonitorSmartphone}
          title="Remote input permission"
          desc="When disabled, viewers can see the screen but cannot move the mouse or type."
          defaultChecked
        />

        <SecurityCard
          icon={OctagonAlert}
          title="Emergency stop"
          desc="Press Ctrl + Shift + . at any time during a session to terminate the connection instantly and revoke any granted input."
        >
          <div className="flex items-center gap-2">
            <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">Ctrl</kbd>
            <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">Shift</kbd>
            <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">.</kbd>
          </div>
        </SecurityCard>

        <ToggleCard
          icon={Clipboard}
          title="Clipboard sync"
          desc="Share copied text between host and viewer. Off by default — enable per session."
        />

        <ToggleCard
          icon={FileUp}
          title="File transfer consent"
          desc="Require the host to approve each incoming file transfer."
          defaultChecked
        />

        <ToggleCard
          icon={ShieldCheck}
          title="Two-factor authentication"
          desc="Add a TOTP second factor to your RemoteDesk account."
        />
      </div>
    </AppShell>
  );
}

function SecurityCard({
  icon: Icon, title, desc, children,
}: { icon: typeof KeyRound; title: string; desc: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold">{title}</div>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function ToggleCard({
  icon: Icon, title, desc, defaultChecked,
}: { icon: typeof KeyRound; title: string; desc: string; defaultChecked?: boolean }) {
  const [on, setOn] = useState(!!defaultChecked);
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-semibold">{title}</div>
            <Switch checked={on} onCheckedChange={(v) => { setOn(v); toast(`${title}: ${v ? "enabled" : "disabled"}`); }} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
    </div>
  );
}
