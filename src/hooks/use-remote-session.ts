import { useState, useEffect, useRef, useCallback } from "react";
import { io, type Socket } from "socket.io-client";
import { getSignalingUrl } from "@/lib/signaling";

export type SessionPhase =
  | "idle"
  | "requesting"
  | "incoming"
  | "waiting_answer"   // viewer: sent offer, waiting for host answer
  | "waiting_offer"    // host: accepted, waiting for viewer offer
  | "screen_picking"   // host: getDisplayMedia dialog is open
  | "connected"
  | "ended";

export interface ActiveSession {
  sessionId: string;
  peerSocketId: string;
  role: "host" | "viewer";
}

export interface IncomingRequest {
  sessionId: string;
  requesterId: string;
  requesterSocketId: string;
}

function generateBrowserId(): string {
  return String(Math.floor(100_000_000 + Math.random() * 900_000_000));
}

function getBrowserDeviceId(): string {
  const key = "rd_browser_device_id";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = generateBrowserId();
  sessionStorage.setItem(key, id);
  return id;
}

// Free public TURN (Open Relay) — fallback used before API responds or if fetch fails.
// The API /api/ice/config endpoint also returns these, so they're always present.
const DEFAULT_ICE: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
  { urls: "turn:openrelay.metered.ca:80",               username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:443",              username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turns:openrelay.metered.ca:443",             username: "openrelayproject", credential: "openrelayproject" },
  { urls: "turn:openrelay.metered.ca:80?transport=tcp", username: "openrelayproject", credential: "openrelayproject" },
];

export function useRemoteSession(accessToken?: string) {
  const [phase, setPhase] = useState<SessionPhase>("idle");
  const [connected, setConnected] = useState(false);
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [incomingReq, setIncomingReq] = useState<IncomingRequest | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [remoteDeskId] = useState(() => getBrowserDeviceId());
  const [hasTurn, setHasTurn] = useState(true); // true by default — we always include Open Relay

  const socketRef = useRef<Socket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const iceServersRef = useRef<RTCIceServer[]>(DEFAULT_ICE);

  // Stable refs for mutable state accessed inside event handlers
  const phaseRef = useRef<SessionPhase>("idle");
  const sessionRef = useRef<ActiveSession | null>(null);
  const incomingRef = useRef<IncomingRequest | null>(null);

  const updatePhase = useCallback((p: SessionPhase) => {
    phaseRef.current = p;
    setPhase(p);
  }, []);

  const updateSession = useCallback((s: ActiveSession | null) => {
    sessionRef.current = s;
    setSession(s);
  }, []);

  const updateIncoming = useCallback((r: IncomingRequest | null) => {
    incomingRef.current = r;
    setIncomingReq(r);
  }, []);

  // ── ICE config ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const base = getSignalingUrl();
    fetch(`${base}/api/ice/config`)
      .then((r) => r.json())
      .then((d: { data?: { iceServers?: RTCIceServer[]; hasTurn?: boolean } }) => {
        if (d.data?.iceServers?.length) iceServersRef.current = d.data.iceServers;
        if (d.data?.hasTurn !== undefined) setHasTurn(d.data.hasTurn);
      })
      .catch(() => {});
  }, []);

  // ── PC factory ─────────────────────────────────────────────────────────────
  const createPC = useCallback((targetSocketId: string, sessionId: string): RTCPeerConnection => {
    pcRef.current?.close();
    const pc = new RTCPeerConnection({ iceServers: iceServersRef.current });
    pcRef.current = pc;

    pc.onicecandidate = (e) => {
      if (e.candidate && socketRef.current) {
        socketRef.current.emit("webrtc:ice", {
          targetSocketId,
          candidate: e.candidate,
          sessionId,
        });
      }
    };

    pc.ontrack = (e) => {
      if (e.streams[0]) setRemoteStream(e.streams[0]);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") updatePhase("connected");
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        if (phaseRef.current !== "idle") updatePhase("ended");
      }
    };

    return pc;
  }, [updatePhase]);

  // ── Socket lifecycle ────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(getSignalingUrl(), {
      auth: { remoteDeskId, token: accessToken ?? "" },
      transports: ["websocket", "polling"],
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    // ── Viewer: request was accepted ──────────────────────────────────────────
    socket.on("request:accepted", async ({ sessionId, hostSocketId }: { sessionId: string; hostSocketId: string }) => {
      const sess: ActiveSession = { sessionId, peerSocketId: hostSocketId, role: "viewer" };
      updateSession(sess);
      updatePhase("waiting_answer");

      try {
        const pc = createPC(hostSocketId, sessionId);
        // Signal we want to receive the host's stream
        pc.addTransceiver("video", { direction: "recvonly" });
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit("webrtc:offer", { targetSocketId: hostSocketId, offer, sessionId });
      } catch (err) {
        setError("Failed to create connection offer.");
        updatePhase("idle");
      }
    });

    socket.on("request:rejected", () => {
      setError("The host declined your connection request.");
      updatePhase("idle");
    });

    // ── Host: incoming request from viewer ────────────────────────────────────
    socket.on("incoming:request", (data: { sessionId: string; requesterId: string; requesterSocketId: string }) => {
      updateIncoming({
        sessionId: data.sessionId,
        requesterId: data.requesterId ?? data.requesterSocketId,
        requesterSocketId: data.requesterSocketId,
      });
      updatePhase("incoming");
    });

    // ── Host: viewer's offer arrived ──────────────────────────────────────────
    socket.on("webrtc:offer", async ({ offer, from, sessionId }: { offer: RTCSessionDescriptionInit; from: string; sessionId: string }) => {
      if (phaseRef.current !== "waiting_offer" && phaseRef.current !== "screen_picking") return;
      updatePhase("screen_picking");

      const sess = sessionRef.current ?? { sessionId, peerSocketId: from, role: "host" as const };
      updateSession({ ...sess, peerSocketId: from });

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: { ideal: 15, max: 30 } },
          audio: false,
        });
        localStreamRef.current = stream;
      } catch {
        setError("Screen share was cancelled. Session ended.");
        socket.emit("session:end", { sessionId });
        updatePhase("idle");
        return;
      }

      try {
        const pc = createPC(from, sessionId);
        stream.getTracks().forEach((t) => pc.addTrack(t, stream));
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit("webrtc:answer", { targetSocketId: from, answer, sessionId });
        updatePhase("connected");
      } catch {
        setError("Failed to start screen share session.");
        updatePhase("idle");
      }
    });

    // ── Viewer: host's answer arrived ─────────────────────────────────────────
    socket.on("webrtc:answer", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      try {
        await pcRef.current?.setRemoteDescription(answer);
      } catch {
        // Ignore: connection might already be closed
      }
    });

    socket.on("webrtc:ice", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      try {
        if (pcRef.current?.remoteDescription) {
          await pcRef.current.addIceCandidate(candidate);
        }
      } catch {
        // Ignore stale candidates
      }
    });

    socket.on("peer:disconnected", () => {
      if (phaseRef.current !== "idle") {
        updatePhase("ended");
        setRemoteStream(null);
      }
    });

    socket.on("error", ({ message }: { message?: string }) => {
      setError(message ?? "An error occurred.");
      if (phaseRef.current === "requesting") updatePhase("idle");
    });

    return () => {
      pcRef.current?.close();
      pcRef.current = null;
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
      socket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteDeskId]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const requestConnection = useCallback((targetId: string, password?: string) => {
    setError(null);
    updatePhase("requesting");
    socketRef.current?.emit("connect:request", {
      targetRemoteDeskId: targetId.replace(/\s/g, ""),
      devicePassword: password,
    });
  }, [updatePhase]);

  const acceptIncoming = useCallback(() => {
    const req = incomingRef.current;
    if (!req) return;
    socketRef.current?.emit("connect:response", { sessionId: req.sessionId, accepted: true });
    updateSession({ sessionId: req.sessionId, peerSocketId: req.requesterSocketId, role: "host" });
    updateIncoming(null);
    updatePhase("waiting_offer");
  }, [updatePhase, updateSession, updateIncoming]);

  const rejectIncoming = useCallback(() => {
    const req = incomingRef.current;
    if (!req) return;
    socketRef.current?.emit("connect:response", { sessionId: req.sessionId, accepted: false });
    updateIncoming(null);
    updatePhase("idle");
  }, [updatePhase, updateIncoming]);

  const endSession = useCallback(() => {
    const sess = sessionRef.current;
    if (sess) {
      socketRef.current?.emit("session:end", { sessionId: sess.sessionId });
    }
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setRemoteStream(null);
    updateSession(null);
    updateIncoming(null);
    updatePhase("idle");
  }, [updatePhase, updateSession, updateIncoming]);

  const dismissEnded = useCallback(() => {
    updatePhase("idle");
    setError(null);
    setRemoteStream(null);
  }, [updatePhase]);

  return {
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
  };
}
