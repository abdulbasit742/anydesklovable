import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { KeyRound, OctagonAlert, Clipboard, FileUp, ShieldCheck, MonitorSmartphone, LogOut, Trash2, ShieldAlert, ShieldQuestion } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  useTrustedDevices, useActiveSessions, useSecurityEvents, useMfaStatus,
  revokeTrustedDevice, revokeActiveSession, createSecurityEvent,
  SECURITY_EVENT_TYPES, type SecurityEventSeverity,
} from "@/lib/services";
import { DemoBanner, PanelState } from "@/components/app/DataState";

export const Route = createFileRoute("/dashboard/security")({
  head: () => ({ meta: [{ title: "Security — RemoteDesk" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <AppShell title="Security">
      <div className="space-y-6">
        <MfaSection />
        <TrustedDevicesSection />
        <ActiveSessionsSection />
        <SecurityEventsSection />

        <div className="grid gap-4 lg:grid-cols-2">
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

          <ToggleCard icon={MonitorSmartphone} title="Remote input permission" desc="When disabled, viewers can see the screen but cannot move the mouse or type." defaultChecked />
          <ToggleCard icon={Clipboard} title="Clipboard sync" desc="Share copied text between host and viewer. Off by default — enable per session." />
          <ToggleCard icon={FileUp} title="File transfer consent" desc="Require the host to approve each incoming file transfer." defaultChecked />
        </div>
      </div>
    </AppShell>
  );
}

// ---------- MFA ----------
function MfaSection() {
  const mfa = useMfaStatus();
  const enabled = mfa.data?.enabled ?? false;
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start gap-3">
        <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-semibold">Two-factor authentication</div>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${enabled ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              {mfa.isLoading ? "Checking…" : enabled ? `Active · ${mfa.data?.factorCount} factor${mfa.data!.factorCount > 1 ? "s" : ""}` : "Not enabled"}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a TOTP second factor to your RemoteDesk account. Enrollment requires scanning a QR code — coming from the desktop app and account settings.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled title="Enrollment flow not wired in this preview">Enable 2FA</Button>
            <Button size="sm" variant="outline" disabled title="Disable requires verified enrollment">Disable</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Trusted devices ----------
function TrustedDevicesSection() {
  const qc = useQueryClient();
  const td = useTrustedDevices();
  async function revoke(id: string, name: string) {
    try {
      await revokeTrustedDevice(id);
      toast.success(`Revoked trust for ${name}`);
      qc.invalidateQueries({ queryKey: ["trusted-devices"] });
      qc.invalidateQueries({ queryKey: ["security-events"] });
    } catch (e) { toast.error((e as Error).message); }
  }
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="text-sm font-semibold">Trusted devices</div>
        <span className="text-xs text-muted-foreground">{td.data.length} active</span>
      </div>
      {td.isDemo && <div className="px-4 pt-3"><DemoBanner>No trusted devices yet — showing example.</DemoBanner></div>}
      <PanelState loading={td.isLoading} error={td.error} empty={td.data.length === 0} emptyText="No trusted devices yet.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Device</th>
                <th className="px-4 py-2 text-left font-medium">Browser / OS</th>
                <th className="px-4 py-2 text-left font-medium">IP</th>
                <th className="px-4 py-2 text-left font-medium">Trusted</th>
                <th className="px-4 py-2 text-left font-medium">Last seen</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {td.data.map((d) => (
                <tr key={d.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{d.device_name}</td>
                  <td className="px-4 py-2 text-muted-foreground">{[d.browser, d.os].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{d.ip_address ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{formatDistanceToNow(new Date(d.trusted_at), { addSuffix: true })}</td>
                  <td className="px-4 py-2 text-muted-foreground">{d.last_seen_at ? formatDistanceToNow(new Date(d.last_seen_at), { addSuffix: true }) : "—"}</td>
                  <td className="px-4 py-2 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="mr-1 h-3.5 w-3.5" /> Revoke</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Revoke trust for {d.device_name}?</AlertDialogTitle>
                          <AlertDialogDescription>The device will need to re-verify on next sign-in.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => revoke(d.id, d.device_name)}>Revoke</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelState>
    </div>
  );
}

// ---------- Active sessions ----------
function ActiveSessionsSection() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const sessions = useActiveSessions();
  const [signingOut, setSigningOut] = useState(false);

  async function revoke(id: string, label: string) {
    try {
      await revokeActiveSession(id);
      toast.success(`Signed out of ${label}`);
      qc.invalidateQueries({ queryKey: ["active-sessions"] });
      qc.invalidateQueries({ queryKey: ["security-events"] });
    } catch (e) { toast.error((e as Error).message); }
  }
  async function signOutEverywhere() {
    setSigningOut(true);
    await createSecurityEvent({ event_type: "global_signout", severity: "warning" }).catch(() => {});
    const { error } = await supabase.auth.signOut({ scope: "global" });
    setSigningOut(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed out of all sessions");
    navigate({ to: "/login" });
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <div className="text-sm font-semibold">Active sessions</div>
          <div className="text-xs text-muted-foreground">Web sessions currently signed in to your account.</div>
        </div>
        <Button size="sm" variant="destructive" disabled={signingOut} onClick={signOutEverywhere}>
          <LogOut className="mr-1.5 h-4 w-4" /> {signingOut ? "Signing out…" : "Sign out everywhere"}
        </Button>
      </div>
      {sessions.isDemo && <div className="px-4 pt-3"><DemoBanner>No tracked sessions yet — showing example.</DemoBanner></div>}
      <PanelState loading={sessions.isLoading} error={sessions.error} empty={sessions.data.length === 0} emptyText="No active sessions tracked.">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Session</th>
                <th className="px-4 py-2 text-left font-medium">Device</th>
                <th className="px-4 py-2 text-left font-medium">IP / location</th>
                <th className="px-4 py-2 text-left font-medium">Last active</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.data.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-4 py-2 font-medium">{s.session_label ?? "Browser session"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{[s.device_name, s.user_agent].filter(Boolean).join(" · ") || "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground"><span className="font-mono text-xs">{s.ip_address ?? "—"}</span>{s.location ? ` · ${s.location}` : ""}</td>
                  <td className="px-4 py-2 text-muted-foreground">{formatDistanceToNow(new Date(s.last_active_at), { addSuffix: true })}</td>
                  <td className="px-4 py-2 text-right">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => revoke(s.id, s.session_label ?? "session")}>
                      Revoke
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelState>
    </div>
  );
}

// ---------- Security events ----------
const SEV_TONE: Record<SecurityEventSeverity, string> = {
  info:     "bg-muted text-foreground",
  warning:  "bg-warning/15 text-warning",
  critical: "bg-destructive/15 text-destructive",
};
const SEV_ICON: Record<SecurityEventSeverity, typeof ShieldCheck> = {
  info: ShieldCheck, warning: ShieldQuestion, critical: ShieldAlert,
};

function SecurityEventsSection() {
  const [severity, setSeverity] = useState<SecurityEventSeverity | "all">("all");
  const [type, setType] = useState<string>("all");
  const events = useSecurityEvents({ severity, event_type: type });

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm font-semibold">Security events</div>
        <div className="flex gap-2">
          <Select value={severity} onValueChange={(v) => setSeverity(v as SecurityEventSeverity | "all")}>
            <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue placeholder="Severity" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue placeholder="Event type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {SECURITY_EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      {events.isDemo && <div className="px-4 pt-3"><DemoBanner>No security events yet — showing examples.</DemoBanner></div>}
      <PanelState loading={events.isLoading} error={events.error} empty={events.data.length === 0} emptyText="No security events match your filters.">
        <ul className="divide-y divide-border">
          {events.data.map((e) => {
            const Icon = SEV_ICON[e.severity];
            return (
              <li key={e.id} className="flex items-start gap-3 px-4 py-3">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${SEV_TONE[e.severity]}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium capitalize">{e.event_type.replace(/_/g, " ")}</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${SEV_TONE[e.severity]}`}>{e.severity}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {e.ip_address ? <span className="font-mono">{e.ip_address}</span> : "Unknown IP"} · {e.user_agent ?? "Unknown agent"}
                  </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">{formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}</div>
              </li>
            );
          })}
        </ul>
      </PanelState>
    </div>
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
