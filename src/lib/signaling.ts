import { io, type Socket } from "socket.io-client";

export type SignalingError = {
  message?: string;
  code?: string;
  feature?: string;
  error?: string;
};

export type IncomingRequestPayload = {
  sessionId: string;
  requesterRemoteDeskId: string;
  requesterSocketId: string;
};

export type RequestAcceptedPayload = {
  sessionId: string;
  hostSocketId: string;
};

export type WebRtcRelayPayload<TSignal = unknown> = {
  sessionId: string;
  signal: TSignal;
  fromSocketId: string;
};

export type SignalPayload<TSignal = unknown> = {
  sessionId: string;
  targetSocketId: string;
  signal: TSignal;
};

type EventHandler<TPayload = unknown> = (payload: TPayload) => void;

const FALLBACK_SIGNALING_URL = "http://localhost:5000";

export function getSignalingUrl(): string {
  const env = import.meta.env as Record<string, string | undefined>;
  return env.VITE_SIGNALING_URL ?? env.VITE_API_URL ?? FALLBACK_SIGNALING_URL;
}

class RemoteDeskSignalingClient {
  private socket: Socket | null = null;
  private accessToken: string | null = null;

  connect(accessToken: string): Socket {
    if (this.socket?.connected && this.accessToken === accessToken) return this.socket;

    this.disconnect();
    this.accessToken = accessToken;
    this.socket = io(getSignalingUrl(), {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 10_000
    });

    this.socket.on("connect_error", (error) => {
      console.warn("[RemoteDesk signaling] connect_error", error.message);
    });

    return this.socket;
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.accessToken = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  on<TPayload = unknown>(event: string, handler: EventHandler<TPayload>): () => void {
    this.socket?.on(event, handler as EventHandler);
    return () => this.socket?.off(event, handler as EventHandler);
  }

  once<TPayload = unknown>(event: string, handler: EventHandler<TPayload>): void {
    this.socket?.once(event, handler as EventHandler);
  }

  emit(event: string, payload?: unknown): void {
    this.socket?.emit(event, payload);
  }

  requestSession(targetRemoteDeskId: string, devicePassword?: string): void {
    this.emit("connect:request", { targetRemoteDeskId, devicePassword });
  }

  acceptSessionRequest(sessionId: string, requesterSocketId: string): void {
    this.emit("connect:response", { sessionId, accepted: true, requesterSocketId });
  }

  rejectSessionRequest(sessionId: string, requesterSocketId: string): void {
    this.emit("connect:response", { sessionId, accepted: false, requesterSocketId });
  }

  sendOffer<TSignal = unknown>(payload: SignalPayload<TSignal>): void {
    this.emit("webrtc:offer", payload);
  }

  sendAnswer<TSignal = unknown>(payload: SignalPayload<TSignal>): void {
    this.emit("webrtc:answer", payload);
  }

  sendIce<TSignal = unknown>(payload: SignalPayload<TSignal>): void {
    this.emit("webrtc:ice", payload);
  }

  endSession(sessionId: string, peerSocketId?: string): void {
    this.emit("session:end", { sessionId, peerSocketId });
  }

  onIncomingRequest(handler: EventHandler<IncomingRequestPayload>): () => void {
    return this.on("incoming:request", handler);
  }

  onRequestAccepted(handler: EventHandler<RequestAcceptedPayload>): () => void {
    return this.on("request:accepted", handler);
  }

  onRequestRejected(handler: EventHandler<{ sessionId?: string }>): () => void {
    return this.on("request:rejected", handler);
  }

  onWebRtcOffer<TSignal = unknown>(handler: EventHandler<WebRtcRelayPayload<TSignal>>): () => void {
    return this.on("webrtc:offer", handler);
  }

  onWebRtcAnswer<TSignal = unknown>(handler: EventHandler<WebRtcRelayPayload<TSignal>>): () => void {
    return this.on("webrtc:answer", handler);
  }

  onWebRtcIce<TSignal = unknown>(handler: EventHandler<WebRtcRelayPayload<TSignal>>): () => void {
    return this.on("webrtc:ice", handler);
  }

  onPeerDisconnected(handler: EventHandler<{ sessionId?: string; remoteDeskId?: string }>): () => void {
    return this.on("peer:disconnected", handler);
  }

  onError(handler: EventHandler<SignalingError>): () => void {
    return this.on("error", handler);
  }
}

export const remoteDeskSignaling = new RemoteDeskSignalingClient();
