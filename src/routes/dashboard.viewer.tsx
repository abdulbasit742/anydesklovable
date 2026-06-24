import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { AlertTriangle, PhoneOff, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { RemoteScreen } from "@/components/viewer/RemoteScreen";
import { createWebRtcViewerSignalingService, type WebRtcViewerSignalingService } from "@/lib/services/webrtcViewerService";
import { createBackendSession, emergencyStopBackendSession, endBackendSession } from "@/lib/services/sessionService";

export const Route = createFileRoute("/dashboard/viewer")({
  head: () => ({ meta: [{ title: "Viewer — RemoteDesk" }] }),
  component: ViewerPage,
});

type LogItem = { id: string; message: string; at: string };

function pushLog(setLog: Dispatch<SetStateAction<LogItem[]>>, message: string) {
  setLog((items) => [{ id: crypto.randomUUID(), message, at: new Date().toLocaleTimeString() }, ...items].slice(0, 12));
}

function ViewerPage() {
  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const initialSessionId = params.get("sessionId") ?? "";
  const deviceId = params.get("deviceId") ?? "";

  const [sessionId, setSessionId] = useState(initialSessionId);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [state, setState] = useState<RTCPeerConnectionState | "idle" | "waiting" | "error">("idle");
  const [message, setMessage] = useState("Open this page after requesting a session from a device page, or pass ?sessionId=...");
  const [log, setLog] = useState<LogItem[]>([]);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const serviceRef = useRef<WebRtcViewerSignalingService | null>(null);
  const pendingIceRef = useRef<RTCIceCandidateInit[]>([]);

  const service = useMemo(() => createWebRtcViewerSignalingService(), []);

  useEffect(() => {
    serviceRef.current = service;
    return () => {
      service.disconnect();
      peerRef.current?.close();
      peerRef.current = null;
    };
  }, [service]);

  async function flushPendingIce() {
    const peer = peerRef.current;
    if (!peer) return;
    const candidates = pendingIceRef.current.splice(0);
    for (const candidate of candidates) {
      await peer.addIceCandidate(candidate).catch(() => undefined);
    }
  }

  function ensurePeer(currentSessionId: string) {
    if (peerRef.current) return peerRef.current;
    const peer = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    peerRef.current = peer;

    peer.ontrack = (event) => {
      setStream(event.streams[0] ?? null);
      setState("connected");
      pushLog(setLog, "Remote stream received.");
    };

    peer.onicecandidate = (event) => {
      if (event.candidate) service.sendIceCandidate({ sessionId: currentSessionId, candidate: event.candidate.toJSON() });
    };

    peer.onconnectionstatechange = () => {
      setState(peer.connectionState);
      service.sendConnectionState(currentSessionId, peer.connectionState);
      pushLog(setLog, `WebRTC state: ${peer.connectionState}`);
    };

    return peer;
  }

  function connectSocket(targetSessionId = sessionId) {
    if (!targetSessionId) {
      setMessage("Missing session ID. Request a session from a device first.");
      setState("error");
      return;
    }

    const socket = service.connect();
    pushLog(setLog, "Connecting to signaling server...");

    service.onSessionJoined(() => pushLog(setLog, "Joined session room."));
    service.onPeerJoined(() => pushLog(setLog, "Host peer joined."));
    service.onOffer(async (payload) => {
      if (payload.sessionId !== targetSessionId || !payload.sdp) return;
      const peer = ensurePeer(targetSessionId);
      await peer.setRemoteDescription(payload.sdp);
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      service.sendAnswer({ sessionId: targetSessionId, sdp: answer, targetSocketId: payload.fromSocketId });
      await flushPendingIce();
      setState("connecting");
      setMessage("Answer sent. Waiting for the media stream...");
      pushLog(setLog, "WebRTC answer sent.");
    });
    service.onIceCandidate(async (payload) => {
      if (payload.sessionId !== targetSessionId || !payload.candidate) return;
      const peer = peerRef.current;
      if (!peer || !peer.remoteDescription) {
        pendingIceRef.current.push(payload.candidate);
        return;
      }
      await peer.addIceCandidate(payload.candidate).catch(() => pendingIceRef.current.push(payload.candidate));
    });
    service.onSessionEnded(() => stopLocal("Session ended by peer."));
    service.onEmergencyStop(() => stopLocal("Emergency stop received."));
    service.onWebRtcError((payload) => {
      setState("error");
      setMessage(typeof payload === "object" && payload && "message" in payload ? String((payload as { message?: string }).message) : "WebRTC signaling error");
    });

    socket.on("connect", () => {
      service.joinSession({ sessionId: targetSessionId, role: "viewer" });
      setState("waiting");
      setMessage("Joined session. Waiting for host offer...");
      pushLog(setLog, "Socket connected and session join sent.");
    });
  }

  async function requestFromDevice() {
    if (!deviceId) {
      setMessage("Missing deviceId query parameter.");
      setState("error");
      return;
    }
    setState("waiting");
    setMessage("Requesting view-only session from host device...");
    const created = await createBackendSession({ deviceId, permissions: ["view-only"], reason: "dashboard_viewer_request", mode: "view-only" });
    setSessionId(created.id);
    pushLog(setLog, `Session requested: ${created.id}`);
    connectSocket(created.id);
  }

  function stopLocal(reason = "Viewer stopped locally.") {
    peerRef.current?.close();
    peerRef.current = null;
    setStream(null);
    setState("idle");
    setMessage(reason);
    pushLog(setLog, reason);
  }

  async function endSession() {
    if (sessionId) await endBackendSession(sessionId, { reason: "viewer_ended" }).catch(() => undefined);
    if (sessionId) serviceRef.current?.endSession(sessionId);
    stopLocal("Session ended.");
  }

  async function emergencyStop() {
    if (sessionId) await emergencyStopBackendSession(sessionId).catch(() => undefined);
    if (sessionId) serviceRef.current?.emergencyStop(sessionId);
    stopLocal("Emergency stop sent. The remote stream has been stopped locally.");
  }

  return (
    <AppShell title="View-only session">
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-900 dark:text-amber-100">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 h-4 w-4" />
          <div>
            <div className="font-medium">Safety mode: view-only</div>
            <p className="mt-1 text-xs opacity-90">This page only renders a consented remote video stream. Keyboard, mouse, clipboard, file transfer, recording, and unattended access are not enabled here.</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Button onClick={() => connectSocket()} disabled={!sessionId}>Join session</Button>
        <Button variant="outline" onClick={requestFromDevice} disabled={!deviceId}>Request from device</Button>
        <Button variant="outline" onClick={endSession} disabled={!sessionId}><PhoneOff className="mr-1.5 h-4 w-4" />End</Button>
        <Button variant="destructive" onClick={emergencyStop} disabled={!sessionId}><AlertTriangle className="mr-1.5 h-4 w-4" />Emergency stop</Button>
      </div>

      <RemoteScreen stream={stream} state={state} message={message} />

      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-semibold">Viewer details</div>
        <div className="mt-2 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
          <div>Session ID: <span className="font-mono">{sessionId || "—"}</span></div>
          <div>Device ID: <span className="font-mono">{deviceId || "—"}</span></div>
          <div>Connection: <span className="font-mono">{state}</span></div>
          <div>Mode: <span className="font-mono">view-only</span></div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <div className="text-sm font-semibold">Event log</div>
        <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
          {log.length === 0 ? <li>No events yet.</li> : log.map((item) => <li key={item.id}><span className="font-mono">{item.at}</span> — {item.message}</li>)}
        </ul>
      </div>
    </AppShell>
  );
}
