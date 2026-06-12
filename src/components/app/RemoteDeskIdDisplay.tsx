import { useState } from "react";
import { Copy, Check, RefreshCw, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRemoteDeskId, currentUser } from "@/lib/mock-data";
import { toast } from "sonner";

export function RemoteDeskIdDisplay() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(currentUser.remoteDeskId);
    setCopied(true);
    toast.success("RemoteDesk ID copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Your RemoteDesk ID
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-xs text-success">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Ready
        </span>
      </div>
      <div className="mt-3 font-mono text-3xl font-semibold tracking-[0.15em] text-foreground">
        {formatRemoteDeskId(currentUser.remoteDeskId)}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={copy}>
          {copied ? <Check className="mr-1.5 h-4 w-4" /> : <Copy className="mr-1.5 h-4 w-4" />}
          {copied ? "Copied" : "Copy ID"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => toast("New ID requested")}>
          <RefreshCw className="mr-1.5 h-4 w-4" /> Rotate
        </Button>
        <Button size="sm" variant="ghost">
          <KeyRound className="mr-1.5 h-4 w-4" /> Device password
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Share this ID with a trusted technician. They will still need your device password and your approval to connect.
      </p>
    </div>
  );
}
