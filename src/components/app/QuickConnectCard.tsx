import { useState } from "react";
import { ArrowRight, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export function QuickConnectCard() {
  const [id, setId] = useState("");
  const formatted = id.replace(/\D/g, "").slice(0, 9).replace(/(\d{3})(\d{0,3})(\d{0,3})/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "),
  );
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.replace(/\D/g, "").length !== 9) {
      toast.error("Enter a valid 9-digit RemoteDesk ID");
      return;
    }
    toast.success(`Requesting session with ${formatted}…`);
  };
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Monitor className="h-4 w-4 text-primary" /> Quick connect
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Enter a 9-digit RemoteDesk ID to start a secure session.
      </p>
      <form onSubmit={submit} className="mt-3 flex flex-col gap-2 sm:flex-row">
        <Input
          inputMode="numeric"
          placeholder="000 000 000"
          value={formatted}
          onChange={(e) => setId(e.target.value)}
          className="font-mono tracking-widest"
        />
        <Button type="submit" className="sm:w-auto">
          Connect <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
