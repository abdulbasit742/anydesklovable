// Security Center components for the MFA / Trusted Devices / Sessions / Events / Team tabs.
import { useState, useMemo } from "react";
import { Copy, Download, KeyRound, ShieldAlert, ShieldCheck, ShieldQuestion, Trash2, LogOut, Smartphone, RefreshCw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { PanelState, DemoBanner } from "@/components/app/DataState";
import { supabase } from "@/integrations/supabase/client";
import {
  useSecurityOverview, useMfaFactors, useDisableMfa, useGenerateRecoveryCodes,
  startMfaEnrollment, verifyMfaEnrollment, cancelMfaEnrollment,
  useTeamSecurityPosture,
  type SecurityOverview,
} from "@/lib/services/security";
import {
  useTrustedDevices, useActiveSessions, useSecurityEvents,
  revokeTrustedDevice, revokeActiveSession, createSecurityEvent,
  SECURITY_EVENT_TYPES, type SecurityEventSeverity,
} from "@/lib/services";

// ============================================================
// Security score card
// ============================================================
export function SecurityScoreCard({ overview }: { overview: SecurityOverview | null | undefined }) {
  const score = overview?.security_score ?? 0;
  const tone =
    score >= 80 ? "text-success" :
    score >= 50 ? "text-warning" :
    "text-destructive";
  const label =
    score >= 80 ? "Strong" :
    score >= 50 ? "Improving" :
    "At risk";
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Security score</CardTitle>
        <CardDescription>How well your account is protected.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-3">
          <div className={`text-4xl font-semibold ${tone}`}>{score}</div>
          <div className="pb-1 text-sm text-muted-foreground">/ 100 · {label}</div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className={`h-full ${score >= 80 ? "bg-success" : score >= 50 ? "bg-warning" : "bg-destructive"}`} style={{ width: `${score}%` }} />
        </div>
        <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
          <li>• MFA enabled (+40)</li>
          <li>• Recovery codes saved (+20)</li>
          <li>• No stale trusted devices (+15)</li>
          <li>• No risky recent events (+15)</li>
          <li>• Active sessions reviewed (+10)</li>
        </ul>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MFA status card
// ============================================================
export function MfaStatusCard({
  overview, onEnable, onDisable, onGenerateCodes,
}: {
  overview: SecurityOverview | null | undefined;
  onEnable: () => void;
  onDisable: () => void;
  onGenerateCodes: () => void;
}) {
  const enabled = overview?.mfa_enabled ?? false;
  const remaining = overview?.recovery_codes_remaining ?? 0;
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="h-4 w-4 text-primary" /> Two-factor authentication
            </CardTitle>
            <CardDescription>
              Add a TOTP code from Google Authenticator, 1Password, Authy or similar.
            </CardDescription>
          </div>
          <Badge variant={enabled ? "default" : "secondary"} className={enabled ? "bg-success text-success-foreground" : ""}>
            {enabled ? "Active" : "Off"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-md border border-border bg-muted/40 p-2">
            <div className="text-xs text-muted-foreground">TOTP enrolled</div>
            <div className="font-medium">{overview?.totp_enrolled ? "Yes" : "No"}</div>
          </div>
          <div className="rounded-md border border-border bg-muted/40 p-2">
            <div className="text-xs text-muted-foreground">Recovery codes left</div>
            <div className={`font-medium ${remaining > 0 && remaining < 3 ? "text-warning" : ""}`}>{remaining}</div>
          </div>
          <div className="rounded-md border border-border bg-muted/40 p-2 sm:col-span-2">
            <div className="text-xs text-muted-foreground">Last verified</div>
            <div className="font-medium">
              {overview?.last_mfa_verified_at
                ? formatDistanceToNow(new Date(overview.last_mfa_verified_at), { addSuffix: true })
                : "Never"}
            </div>
          </div>
        </div>
        {remaining > 0 && remaining < 3 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Few recovery codes left</AlertTitle>
            <AlertDescription>Generate new codes to avoid losing account access.</AlertDescription>
          </Alert>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {!enabled ? (
            <Button size="sm" onClick={onEnable}><Smartphone className="mr-1.5 h-4 w-4" /> Enable 2FA</Button>
          ) : (
            <>
              <Button size="sm" variant="outline" onClick={onGenerateCodes}>
                <RefreshCw className="mr-1.5 h-4 w-4" /> Regenerate recovery codes
              </Button>
              <Button size="sm" variant="destructive" onClick={onDisable}>Disable 2FA</Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// MFA Enrollment Wizard
// ============================================================
type WizardStep = "intro" | "qr" | "verify" | "codes" | "done";

export function MfaEnrollmentWizard({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const qc = useQueryClient();
  const [step, setStep] = useState<WizardStep>("intro");
  const [enroll, setEnroll] = useState<Awaited<ReturnType<typeof startMfaEnrollment>> | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [codes, setCodes] = useState<string[]>([]);
  const generate = useGenerateRecoveryCodes();

  function reset() {
    setStep("intro");
    setCode("");
    setEnroll(null);
    setCodes([]);
  }

  async function close(v: boolean) {
    if (!v && enroll && step !== "done") {
      await cancelMfaEnrollment(enroll.factorId);
    }
    onOpenChange(v);
    if (!v) setTimeout(reset, 200);
  }

  async function startEnroll() {
    setBusy(true);
    try {
      const r = await startMfaEnrollment("RemoteDesk");
      setEnroll(r);
      setStep("qr");
    } catch (e) {
      toast.error((e as Error).message || "Could not start MFA enrollment");
    } finally {
      setBusy(false);
    }
  }

  async function doVerify() {
    if (!enroll) return;
    if (!/^\d{6}$/.test(code)) {
      toast.error("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    try {
      await verifyMfaEnrollment(enroll.factorId, code);
      const fresh = await generate.mutateAsync();
      setCodes(fresh);
      qc.invalidateQueries({ queryKey: ["security-overview"] });
      qc.invalidateQueries({ queryKey: ["mfa-factors"] });
      setStep("codes");
    } catch (e) {
      toast.error((e as Error).message || "The code was not valid. Check your authenticator app and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-lg">
        {step === "intro" && (
          <>
            <DialogHeader>
              <DialogTitle>Enable two-factor authentication</DialogTitle>
              <DialogDescription>
                You will scan a QR code with an authenticator app, enter a 6-digit code to verify,
                and save one-time recovery codes.
              </DialogDescription>
            </DialogHeader>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>1. Open Google Authenticator, 1Password, Authy or Microsoft Authenticator.</li>
              <li>2. Scan the QR code we generate next.</li>
              <li>3. Enter the 6-digit code to confirm.</li>
              <li>4. Save your recovery codes — they appear only once.</li>
            </ul>
            <DialogFooter>
              <Button variant="outline" onClick={() => close(false)}>Cancel</Button>
              <Button onClick={startEnroll} disabled={busy}>{busy ? "Starting…" : "Begin"}</Button>
            </DialogFooter>
          </>
        )}

        {step === "qr" && enroll && (
          <>
            <DialogHeader>
              <DialogTitle>Scan the QR code</DialogTitle>
              <DialogDescription>Use your authenticator app to scan this code.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3">
              {/* Supabase returns an SVG XML string or data URL */}
              {enroll.qr.startsWith("data:") ? (
                <img src={enroll.qr} alt="MFA QR code" className="h-48 w-48 rounded-md bg-white p-2" />
              ) : (
                <div className="h-48 w-48 rounded-md bg-white p-2" dangerouslySetInnerHTML={{ __html: enroll.qr }} />
              )}
              <div className="w-full">
                <Label className="text-xs text-muted-foreground">Or enter the secret manually</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input readOnly value={enroll.secret} className="font-mono text-xs" />
                  <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(enroll.secret); toast.success("Secret copied"); }}>
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => close(false)}>Cancel</Button>
              <Button onClick={() => setStep("verify")}>Next</Button>
            </DialogFooter>
          </>
        )}

        {step === "verify" && (
          <>
            <DialogHeader>
              <DialogTitle>Enter your 6-digit code</DialogTitle>
              <DialogDescription>From your authenticator app.</DialogDescription>
            </DialogHeader>
            <Input
              autoFocus
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              className="text-center font-mono text-2xl tracking-widest"
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("qr")}>Back</Button>
              <Button onClick={doVerify} disabled={busy || code.length !== 6}>{busy ? "Verifying…" : "Verify & enable"}</Button>
            </DialogFooter>
          </>
        )}

        {step === "codes" && (
          <>
            <DialogHeader>
              <DialogTitle>Save your recovery codes</DialogTitle>
              <DialogDescription>
                These codes will <strong>only be shown once</strong>. Each can be used to sign in if you lose your authenticator.
              </DialogDescription>
            </DialogHeader>
            <RecoveryCodeList codes={codes} />
            <DialogFooter>
              <Button onClick={() => { setStep("done"); }}>I have saved my codes</Button>
            </DialogFooter>
          </>
        )}

        {step === "done" && (
          <>
            <DialogHeader>
              <DialogTitle>MFA is now active</DialogTitle>
              <DialogDescription>Your RemoteDesk account is protected by two-factor authentication.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => close(false)}>Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function RecoveryCodeList({ codes }: { codes: string[] }) {
  function copyAll() {
    navigator.clipboard.writeText(codes.join("\n"));
    toast.success("Copied all recovery codes");
  }
  function download() {
    const blob = new Blob([`RemoteDesk recovery codes\nGenerated ${new Date().toISOString()}\n\n${codes.join("\n")}\n`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "remotedesk-recovery-codes.txt"; a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 rounded-md border border-border bg-muted/40 p-3 font-mono text-sm">
        {codes.map((c) => <div key={c}>{c}</div>)}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={copyAll}><Copy className="mr-1.5 h-3.5 w-3.5" /> Copy all</Button>
        <Button size="sm" variant="outline" onClick={download}><Download className="mr-1.5 h-3.5 w-3.5" /> Download .txt</Button>
      </div>
    </div>
  );
}

// ============================================================
// Recovery Codes panel
// ============================================================
export function RecoveryCodesPanel({ overview }: { overview: SecurityOverview | null | undefined }) {
  const gen = useGenerateRecoveryCodes();
  const [codes, setCodes] = useState<string[] | null>(null);
  const remaining = overview?.recovery_codes_remaining ?? 0;
  const enabled = overview?.mfa_enabled ?? false;

  async function regenerate() {
    try {
      const fresh = await gen.mutateAsync();
      setCodes(fresh);
      toast.success("New recovery codes generated. Old codes no longer work.");
    } catch { /* toast already shown */ }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <KeyRound className="h-4 w-4 text-primary" /> Recovery codes
        </CardTitle>
        <CardDescription>
          Single-use codes that let you sign in if you lose your authenticator.
          {enabled ? "" : " Enable 2FA first."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm">
          Remaining unused codes: <span className={`font-semibold ${remaining < 3 ? "text-warning" : ""}`}>{remaining}</span>
        </div>
        {codes && (
          <>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Save these codes now</AlertTitle>
              <AlertDescription>They will not be shown again.</AlertDescription>
            </Alert>
            <RecoveryCodeList codes={codes} />
          </>
        )}
        <Button size="sm" variant="outline" disabled={!enabled || gen.isPending} onClick={regenerate}>
          {gen.isPending ? "Generating…" : "Generate new codes"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Disable MFA dialog
// ============================================================
export function DisableMfaDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [confirm, setConfirm] = useState("");
  const [reason, setReason] = useState("");
  const disable = useDisableMfa();
  const ok = confirm === "DISABLE";

  async function submit() {
    if (!ok) return;
    await disable.mutateAsync({ reason: reason || undefined });
    setConfirm(""); setReason("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disable two-factor authentication?</DialogTitle>
          <DialogDescription>
            Your account will be less secure. Trusted devices and recovery codes will be invalidated and a security event will be logged.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="text-xs">Type <span className="font-mono">DISABLE</span> to confirm</Label>
            <Input value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="DISABLE" />
          </div>
          <div>
            <Label className="text-xs">Reason (optional)</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lost device, switching app, etc." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button variant="destructive" disabled={!ok || disable.isPending} onClick={submit}>
            {disable.isPending ? "Disabling…" : "Disable 2FA"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Trusted devices table
// ============================================================
export function TrustedDevicesTable() {
  const qc = useQueryClient();
  const td = useTrustedDevices();
  async function revoke(id: string, name: string) {
    try {
      await revokeTrustedDevice(id);
      toast.success(`Revoked trust for ${name}`);
      qc.invalidateQueries({ queryKey: ["trusted-devices"] });
      qc.invalidateQueries({ queryKey: ["security-overview"] });
    } catch (e) { toast.error((e as Error).message); }
  }
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold">Trusted devices</CardTitle>
          <CardDescription>Devices that can sign in without the second factor.</CardDescription>
        </div>
        <Badge variant="secondary">{td.data.length} active</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {td.isDemo && <div className="px-4 pt-3"><DemoBanner>No trusted devices yet — showing example.</DemoBanner></div>}
        <PanelState loading={td.isLoading} error={td.error} empty={td.data.length === 0} emptyText="No trusted devices yet.">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Device</th>
                  <th className="px-4 py-2 text-left font-medium">Browser / OS</th>
                  <th className="px-4 py-2 text-left font-medium">IP</th>
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
                    <td className="px-4 py-2 text-muted-foreground">
                      {d.last_seen_at ? formatDistanceToNow(new Date(d.last_seen_at), { addSuffix: true }) : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => revoke(d.id, d.device_name ?? "device")}>
                        <Trash2 className="mr-1 h-3.5 w-3.5" /> Revoke
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelState>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Active sessions
// ============================================================
export function ActiveSessionsPanel() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const sessions = useActiveSessions();
  const [signingOut, setSigningOut] = useState(false);
  const [confirmAll, setConfirmAll] = useState(false);

  async function revoke(id: string, label: string) {
    try {
      await revokeActiveSession(id);
      toast.success(`Marked ${label} as revoked`);
      qc.invalidateQueries({ queryKey: ["active-sessions"] });
      qc.invalidateQueries({ queryKey: ["security-overview"] });
    } catch (e) { toast.error((e as Error).message); }
  }

  async function signOutEverywhere() {
    setSigningOut(true);
    try {
      await createSecurityEvent({ event_type: "global_signout", severity: "warning" });
    } catch { /* non-fatal */ }
    const { error } = await supabase.auth.signOut({ scope: "global" });
    setSigningOut(false);
    setConfirmAll(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Signed out everywhere");
    navigate({ to: "/login" });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold">Active sessions</CardTitle>
          <CardDescription>Web sessions currently signed in to your account.</CardDescription>
        </div>
        <Button size="sm" variant="destructive" disabled={signingOut} onClick={() => setConfirmAll(true)}>
          <LogOut className="mr-1.5 h-4 w-4" /> Sign out everywhere
        </Button>
      </CardHeader>
      <CardContent className="p-0">
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
                    <td className="px-4 py-2 text-muted-foreground">
                      <span className="font-mono text-xs">{s.ip_address ?? "—"}</span>
                      {s.location ? ` · ${s.location}` : ""}
                    </td>
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
      </CardContent>

      <Dialog open={confirmAll} onOpenChange={setConfirmAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign out of every session?</DialogTitle>
            <DialogDescription>
              You will be signed out on every browser and device — including the one you are using right now.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmAll(false)}>Cancel</Button>
            <Button variant="destructive" onClick={signOutEverywhere} disabled={signingOut}>
              {signingOut ? "Signing out…" : "Sign out everywhere"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

// ============================================================
// Security events timeline
// ============================================================
const SEV_TONE: Record<SecurityEventSeverity, string> = {
  info: "bg-muted text-foreground",
  warning: "bg-warning/15 text-warning",
  critical: "bg-destructive/15 text-destructive",
};
const SEV_ICON: Record<SecurityEventSeverity, typeof ShieldCheck> = {
  info: ShieldCheck, warning: ShieldQuestion, critical: ShieldAlert,
};

const EXTRA_EVENT_TYPES = [
  "mfa_enrollment_started", "mfa_failed_verification",
  "recovery_codes_generated", "recovery_code_used",
  "suspicious_login_detected", "password_reset_requested",
];

export function SecurityEventsTimeline() {
  const [severity, setSeverity] = useState<SecurityEventSeverity | "all">("all");
  const [type, setType] = useState<string>("all");
  const events = useSecurityEvents({ severity, event_type: type });

  const allTypes = useMemo(
    () => Array.from(new Set([...SECURITY_EVENT_TYPES, ...EXTRA_EVENT_TYPES])),
    []
  );

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-sm font-semibold">Security events</CardTitle>
          <CardDescription>Sign-ins, MFA actions, and risky activity.</CardDescription>
        </div>
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
            <SelectTrigger className="h-8 w-[200px] text-xs"><SelectValue placeholder="Event type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All events</SelectItem>
              {allTypes.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
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
                  <div className="text-right text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true })}
                  </div>
                </li>
              );
            })}
          </ul>
        </PanelState>
      </CardContent>
    </Card>
  );
}

// ============================================================
// Team security posture card
// ============================================================
export function TeamSecurityPostureCard({ teamId }: { teamId: string | null | undefined }) {
  const q = useTeamSecurityPosture(teamId);
  const p = q.data;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Team security posture</CardTitle>
        <CardDescription>How protected your workspace is.</CardDescription>
      </CardHeader>
      <CardContent>
        {q.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : q.error ? (
          <Alert variant="destructive">
            <AlertDescription>{(q.error as Error).message}</AlertDescription>
          </Alert>
        ) : p ? (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <Metric label="Members" value={p.total_members} />
              <Metric label="With MFA" value={p.members_with_mfa} tone="success" />
              <Metric label="Without MFA" value={p.members_without_mfa} tone={p.members_without_mfa > 0 ? "warning" : "default"} />
              <Metric label="Stale trusted devices" value={p.stale_trusted_devices} tone={p.stale_trusted_devices > 0 ? "warning" : "default"} />
              <Metric label="Risky sessions" value={p.risky_sessions} tone={p.risky_sessions > 0 ? "warning" : "default"} />
              <Metric label="Recent risky events (7d)" value={p.recent_security_events} tone={p.recent_security_events > 0 ? "warning" : "default"} />
            </div>
            <Separator className="my-4" />
            <div className="text-xs text-muted-foreground">
              Notification routing for member reminders is coming soon.
            </div>
          </>
        ) : (
          <div className="text-sm text-muted-foreground">No data.</div>
        )}
      </CardContent>
    </Card>
  );
}

function Metric({ label, value, tone = "default" }: { label: string; value: number; tone?: "default" | "success" | "warning" }) {
  const cls =
    tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning" :
    "";
  return (
    <div className="rounded-md border border-border bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</div>
    </div>
  );
}

export { useSecurityOverview };
