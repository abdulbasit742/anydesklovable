import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import {
  Monitor, Copy, Check, ArrowRight, PhoneOff, Wifi, WifiOff,
  ScreenShare, ScreenShareOff, Loader2, ShieldCheck, X, AlertTriangle,
  Radio, Clock,
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatRemoteDeskId } from "@/lib/formatting/remote-desk-id";
import { useAuth } from "@/hooks/use-auth";
import { useRemoteSession } from "@/hooks/use-remote-session";

function useSessionTimer(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  const startRef = useRef<number | null>(null);
  useEffect(() => {
    if (active) {
      startRef.current = Date.now();
      setSeconds(0);
      const id = setInterval(() => {
        setSeconds(Math.floor((Date.now() - (startRef.current ?? Date.now())) / 1000));
      }, 1000);
      return () => clearInterval(id);
    } else {
      startRef.current = null;
      setSeconds(0);
    }
  }, [active]);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const Route = createFileRoute("/dashboard/remote-desktop")({
  head: () => ({ meta: [{ title: "Remote Desktop — RemoteDesk" }] }),
  component: RemoteDesktopPage,
});

function RemoteDesktopPage() {
  const { session: authSession } = useAuth();
  const {
    remoteDeskId,
    phase,
    connected,
    hasTurn,
    session,
    incomingReq,
    remoteStream,
    error,
    requestConnection,
    acceptIncoming,
    rejectIncoming,
    endSession,
    dismissEnded,
  } = useRemoteSession(authSession?.access_token);

  const [targetId, setTargetId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const isConnected = phase === "connected";
  const sessionTimer = useSessionTimer(isConnected);

  // Escape key ends active session
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape" && isConnected) endSession();
  }, [isConnected, endSession]);
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Attach remote stream to video element
  useEffect(() => {
    if (videoRef.current && remoteStream) {
      videoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formattedId = formatRemoteDeskId(remoteDeskId);

  const copyId = async () => {
    await navigator.clipboard.writeText(remoteDeskId);
    setCopied(true);
    toast.success("RemoteDesk ID copied");
    setTimeout(() => setCopied(false), 1500);
  };

  const formatInput = (v: string) =>
    v.replace(/\D/g, "").slice(0, 9).replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" ")
    );

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const digits = targetId.replace(/\D/g, "");
    if (digits.length !== 9) {
      toast.error("Enter a valid 9-digit RemoteDesk ID");
      return;
    }
    requestConnection(digits, password || undefined);
  };

  const isActive = phase === "connected" || phase === "waiting_answer" || phase === "waiting_offer" || phase === "screen_picking";

  return (
    <AppShell
      title="Remote Desktop"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`gap-1.5 ${hasTurn ? "border-primary/30 text-primary" : "border-muted-foreground/30 text-muted-foreground"}`}>
            <Radio className="h-3 w-3" /> {hasTurn ? "TURN relay" : "STUN only"}
          </Badge>
          {connected ? (
            <Badge variant="outline" className="gap-1.5 border-success/30 text-success">
              <Wifi className="h-3 w-3" /> Signaling connected
            </Badge>
          ) : (
            <Badge variant="outline" className="gap-1.5 border-destructive/30 text-destructive">
              <WifiOff className="h-3 w-3" /> Connecting…
            </Badge>
          )}
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">

        {/* ── Error / ended banner ─────────────────────────────────────────── */}
        {(error || phase === "ended") && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error ?? "The remote session has ended."}</span>
            <button onClick={dismissEnded} className="opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ── Incoming request modal ───────────────────────────────────────── */}
        {phase === "incoming" && incomingReq && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Monitor className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">Incoming connection request</div>
                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  From: {formatRemoteDeskId(incomingReq.requesterId.replace(/\D/g,"")) || incomingReq.requesterId}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Accepting will share your screen with this device.
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={acceptIncoming} className="gap-1.5">
                <ScreenShare className="h-4 w-4" /> Accept & share screen
              </Button>
              <Button size="sm" variant="outline" onClick={rejectIncoming}>
                Decline
              </Button>
            </div>
          </div>
        )}

        {/* ── Waiting states ───────────────────────────────────────────────── */}
        {(phase === "requesting" || phase === "waiting_answer" || phase === "waiting_offer" || phase === "screen_picking") && (
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            {phase === "requesting" && "Waiting for host to accept your request…"}
            {phase === "waiting_answer" && "Establishing encrypted connection…"}
            {phase === "waiting_offer" && "Waiting for viewer to connect…"}
            {phase === "screen_picking" && "Select a screen to share in the browser dialog…"}
            {isActive && phase !== "screen_picking" && (
              <Button size="sm" variant="ghost" className="ml-auto" onClick={endSession}>
                Cancel
              </Button>
            )}
          </div>
        )}

        {/* ── Active viewer session: remote video ──────────────────────────── */}
        {phase === "connected" && session?.role === "viewer" && (
          <div className="overflow-hidden rounded-lg border border-border bg-black">
            <div className="flex items-center justify-between border-b border-border/20 bg-background/5 px-4 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Viewing remote screen
                <span className="flex items-center gap-1 font-mono text-muted-foreground/70">
                  <Clock className="h-3 w-3" />{sessionTimer}
                </span>
                <span className="text-muted-foreground/50">· Press Esc to end</span>
              </span>
              <Button size="sm" variant="destructive" className="h-7 gap-1.5 text-xs" onClick={endSession}>
                <PhoneOff className="h-3.5 w-3.5" /> End session
              </Button>
            </div>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[70vh] bg-black object-contain"
              />
              {!remoteStream && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white/40" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Active host session: sharing indicator ───────────────────────── */}
        {phase === "connected" && session?.role === "host" && (
          <div className="rounded-lg border border-success/30 bg-success/5 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-success/10 p-2">
                <ScreenShare className="h-5 w-5 text-success" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-success">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Screen sharing active
                  <span className="flex items-center gap-1 font-mono text-xs font-normal text-success/70">
                    <Clock className="h-3 w-3" />{sessionTimer}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  A viewer is watching your screen. Press Esc to stop.
                </div>
              </div>
              <Button size="sm" variant="destructive" className="gap-1.5" onClick={endSession}>
                <ScreenShareOff className="h-4 w-4" /> Stop sharing
              </Button>
            </div>
          </div>
        )}

        {/* ── Idle: ID card + connect form ─────────────────────────────────── */}
        {!isActive && phase !== "incoming" && (
          <div className="grid gap-5 md:grid-cols-2">
            {/* Your ID */}
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Your browser session ID</span>
                <Badge variant="outline" className="gap-1 text-[10px]">
                  <ShieldCheck className="h-3 w-3" /> Browser
                </Badge>
              </div>
              <div className="mt-3 font-mono text-3xl font-bold tracking-[0.15em] text-foreground">
                {formattedId}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Share this ID so someone can connect to your browser session. They will need to wait for your approval before seeing your screen.
              </p>
              <Button size="sm" variant="outline" className="mt-3 gap-1.5" onClick={copyId}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy ID"}
              </Button>
            </div>

            {/* Connect to a device */}
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Connect to a device
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the 9-digit ID of the device you want to view. The host must accept your request.
              </p>
              <form onSubmit={handleConnect} className="mt-3 space-y-2">
                <Input
                  inputMode="numeric"
                  placeholder="000 000 000"
                  value={formatInput(targetId)}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="font-mono tracking-widest"
                  disabled={!connected}
                />
                {showPassword ? (
                  <Input
                    type="password"
                    placeholder="Unattended access password (optional)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="text-sm"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPassword(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    + Add password (unattended access)
                  </button>
                )}
                <Button type="submit" className="w-full gap-1.5" disabled={!connected}>
                  Connect <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* ── How it works ─────────────────────────────────────────────────── */}
        {phase === "idle" && (
          <div className="rounded-lg border border-border bg-card/50 p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              How remote desktop works
            </div>
            <div className="grid gap-3 sm:grid-cols-3 text-xs text-muted-foreground">
              <div className="flex gap-2">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">1</span>
                <span><strong className="text-foreground">Share your ID</strong> — Give your 9-digit ID to the person who needs to connect.</span>
              </div>
              <div className="flex gap-2">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">2</span>
                <span><strong className="text-foreground">Approve the request</strong> — You'll see a prompt to accept or decline. Screen sharing starts only after you approve.</span>
              </div>
              <div className="flex gap-2">
                <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">3</span>
                <span><strong className="text-foreground">Encrypted stream</strong> — WebRTC connects directly (P2P) or via TURN relay. Works across the internet, firewalls, and mobile data. No server stores your screen.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
