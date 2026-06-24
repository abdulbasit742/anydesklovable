import { io, type Socket } from "socket.io-client";
import { getApiBaseUrl, getStoredAccessToken } from "./backendApi";

export type SignalingConnectionState = "idle" | "connecting" | "connected" | "disconnected" | "error";
export type SessionRole = "host" | "viewer" | "observer";

export type SessionJoinOptions = {
  sessionId: string;
  role?: SessionRole;
  deviceId?: string;
};

export type SessionRequestOptions = {
  deviceId: string;
  reason?: string;
  permissions?: string[];
  mode?: "view-only";
};

export type WebRtcOfferPayload = {
  sessionId: string;
  sdp: RTCSessionDescriptionInit;
  targetSocketId?: string;
};

export type WebRtcAnswerPayload = {
  sessionId: string;
  sdp: RTCSessionDescriptionInit;
  targetSocketId?: string;
};

export type WebRtcIcePayload = {
  sessionId: string;
  candidate: RTCIceCandidateInit;
  targetSocketId?: string;
};

type EventHandler<T = unknown> = (payload: T) => void;

const EVENTS = {
  sessionRequest: "session:request",
  sessionRequested: "session:requested",
  sessionJoin: "session:join",
  sessionJoined: "session:joined",
  sessionLeave: "session:leave",
  sessionPeerJoined: "session:peer_joined",
  sessionPeerLeft: "session:peer_left",
  sessionAccepted: "session:accepted",
  sessionDenied: "session:denied",
  sessionEnded: "session:ended",
  sessionEmergencyStop: "session:emergency_stop",
  webrtcOffer: "webrtc:offer",
  webrtcAnswer: "webrtc:answer",
  webrtcIceCandidate: "webrtc:ice_candidate",
  webrtcConnectionState: "webrtc:connection_state",
  webrtcError: "webrtc:error",
  error: "error"
} as const;

export class WebRtcViewerSignalingService {
  private socket: Socket | null = null;
  private state: SignalingConnectionState = "idle";

  get connectionState() {
    return this.state;
  }

  get socketId() {
    return this.socket?.id ?? null;
  }

  connect(token = getStoredAccessToken()) {
    if (!token) throw new Error("Missing RemoteDesk API token. Login before opening a viewer session.");
    if (this.socket?.connected) return this.socket;

    this.state = "connecting";
    this.socket = io(getApiBaseUrl(), {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 500,
      timeout: 15_000
    });

    this.socket.on("connect", () => { this.state = "connected"; });
    this.socket.on("disconnect", () => { this.state = "disconnected"; });
    this.socket.on("connect_error", () => { this.state = "error"; });

    return this.socket;
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.state = "idle";
  }

  joinSession(options: SessionJoinOptions) {
    this.requireSocket().emit(EVENTS.sessionJoin, options);
  }

  leaveSession(sessionId: string) {
    this.requireSocket().emit(EVENTS.sessionLeave, { sessionId });
  }

  requestSession(options: SessionRequestOptions) {
    this.requireSocket().emit(EVENTS.sessionRequest, {
      ...options,
      permissions: options.permissions ?? ["view-only"],
      mode: options.mode ?? "view-only"
    });
  }

  acceptSession(sessionId: string) {
    this.requireSocket().emit(EVENTS.sessionAccepted, { sessionId });
  }

  denySession(sessionId: string, reason?: string) {
    this.requireSocket().emit(EVENTS.sessionDenied, { sessionId, reason });
  }

  endSession(sessionId: string, reason = "viewer_ended") {
    this.requireSocket().emit(EVENTS.sessionEnded, { sessionId, reason });
  }

  emergencyStop(sessionId: string, reason = "viewer_emergency_stop") {
    this.requireSocket().emit(EVENTS.sessionEmergencyStop, { sessionId, reason });
  }

  sendOffer(payload: WebRtcOfferPayload) {
    this.requireSocket().emit(EVENTS.webrtcOffer, payload);
  }

  sendAnswer(payload: WebRtcAnswerPayload) {
    this.requireSocket().emit(EVENTS.webrtcAnswer, payload);
  }

  sendIceCandidate(payload: WebRtcIcePayload) {
    this.requireSocket().emit(EVENTS.webrtcIceCandidate, payload);
  }

  sendConnectionState(sessionId: string, state: RTCPeerConnectionState, message?: string) {
    this.requireSocket().emit(EVENTS.webrtcConnectionState, { sessionId, state, message });
  }

  onSessionRequested(handler: EventHandler) { return this.on(EVENTS.sessionRequested, handler); }
  onSessionJoined(handler: EventHandler) { return this.on(EVENTS.sessionJoined, handler); }
  onPeerJoined(handler: EventHandler) { return this.on(EVENTS.sessionPeerJoined, handler); }
  onPeerLeft(handler: EventHandler) { return this.on(EVENTS.sessionPeerLeft, handler); }
  onSessionAccepted(handler: EventHandler) { return this.on(EVENTS.sessionAccepted, handler); }
  onSessionDenied(handler: EventHandler) { return this.on(EVENTS.sessionDenied, handler); }
  onSessionEnded(handler: EventHandler) { return this.on(EVENTS.sessionEnded, handler); }
  onEmergencyStop(handler: EventHandler) { return this.on(EVENTS.sessionEmergencyStop, handler); }
  onOffer(handler: EventHandler<WebRtcOfferPayload & { fromSocketId?: string }>) { return this.on(EVENTS.webrtcOffer, handler as EventHandler); }
  onAnswer(handler: EventHandler<WebRtcAnswerPayload & { fromSocketId?: string }>) { return this.on(EVENTS.webrtcAnswer, handler as EventHandler); }
  onIceCandidate(handler: EventHandler<WebRtcIcePayload & { fromSocketId?: string }>) { return this.on(EVENTS.webrtcIceCandidate, handler as EventHandler); }
  onWebRtcError(handler: EventHandler) { return this.on(EVENTS.webrtcError, handler); }

  private on(eventName: string, handler: EventHandler) {
    const socket = this.requireSocket();
    socket.on(eventName, handler);
    return () => socket.off(eventName, handler);
  }

  private requireSocket() {
    if (!this.socket) throw new Error("Socket is not connected. Call connect() first.");
    return this.socket;
  }
}

export function createWebRtcViewerSignalingService() {
  return new WebRtcViewerSignalingService();
}

export { EVENTS as RemoteDeskViewerSocketEvents };
