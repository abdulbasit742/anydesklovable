import { useEffect, useRef } from "react";
import { Monitor, WifiOff } from "lucide-react";

export type RemoteScreenProps = {
  stream: MediaStream | null;
  state: RTCPeerConnectionState | "idle" | "waiting" | "error";
  message?: string;
};

export function RemoteScreen({ stream, state, message }: RemoteScreenProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.srcObject = stream;
  }, [stream]);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Monitor className="h-4 w-4 text-primary" /> View-only remote screen
        </div>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] uppercase tracking-wide text-muted-foreground">
          {state}
        </span>
      </div>

      <div className="relative grid min-h-[360px] place-items-center bg-black">
        {stream ? (
          <video ref={videoRef} autoPlay playsInline muted className="h-full max-h-[72vh] w-full object-contain" />
        ) : (
          <div className="max-w-sm p-6 text-center text-sm text-muted-foreground">
            <WifiOff className="mx-auto mb-3 h-8 w-8" />
            <div className="font-medium text-foreground">Waiting for host screen</div>
            <p className="mt-1">{message ?? "The host must accept the session and start view-only sharing before video appears."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
