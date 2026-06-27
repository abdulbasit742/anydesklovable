/**
 * RemoteDesk Signaling Service
 *
 * Connects the dashboard PWA to the Node.js Socket.IO signaling server.
 * The URL is driven by VITE_SIGNALING_URL so the same dashboard build can
 * target local dev (Cloudflare Tunnel), staging, or production without
 * any code changes.
 *
 * Usage:
 *   import { signalingService } from "@/lib/signaling";
 *   signalingService.connect(jwtToken);
 */

import { io, type Socket } from "socket.io-client";

const SIGNALING_URL = import.meta.env.VITE_SIGNALING_URL as string | undefined;

type Handler = (...args: unknown[]) => void;

class SignalingService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Handler>> = new Map();

  connect(jwtToken: string): void {
    if (!SIGNALING_URL) {
      console.warn("[Signaling] VITE_SIGNALING_URL is not set — signaling disabled.");
      return;
    }
    if (this.socket?.connected) return;

    this.socket = io(SIGNALING_URL, {
      auth: { token: jwtToken },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1500,
    });

    this.socket.on("connect", () => {
      console.info("[Signaling] Connected to", SIGNALING_URL);
      this.reattachListeners();
    });
    this.socket.on("disconnect", (reason) => {
      console.info("[Signaling] Disconnected:", reason);
    });
    this.socket.on("connect_error", (err) => {
      console.warn("[Signaling] Error:", err.message);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  on(event: string, handler: Handler): void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(handler);
    this.socket?.on(event, handler as never);
  }

  off(event: string, handler: Handler): void {
    this.listeners.get(event)?.delete(handler);
    this.socket?.off(event, handler as never);
  }

  emit(event: string, payload: unknown): void {
    if (!this.socket?.connected) {
      console.warn("[Signaling] emit called but socket not connected");
      return;
    }
    this.socket.emit(event, payload);
  }

  // ---- Convenience wrappers matching backend ClientEvents ----

  requestConnection(targetRemoteDeskId: string, devicePassword: string): void {
    this.emit("connect:request", { targetRemoteDeskId, devicePassword });
  }

  respondToRequest(sessionId: string, accepted: boolean, requesterSocketId: string): void {
    this.emit("connect:response", { sessionId, accepted, requesterSocketId });
  }

  sendOffer(sessionId: string, targetSocketId: string, sdp: RTCSessionDescriptionInit): void {
    this.emit("webrtc:offer", { sessionId, targetSocketId, signal: sdp });
  }

  sendAnswer(sessionId: string, targetSocketId: string, sdp: RTCSessionDescriptionInit): void {
    this.emit("webrtc:answer", { sessionId, targetSocketId, signal: sdp });
  }

  sendIce(sessionId: string, targetSocketId: string, candidate: RTCIceCandidateInit): void {
    this.emit("webrtc:ice", { sessionId, targetSocketId, signal: candidate });
  }

  endSession(sessionId: string, peerSocketId?: string): void {
    this.emit("session:end", { sessionId, peerSocketId });
  }

  private reattachListeners(): void {
    if (!this.socket) return;
    for (const [event, handlers] of this.listeners) {
      for (const h of handlers) this.socket.on(event, h as never);
    }
  }
}

export const signalingService = new SignalingService();
