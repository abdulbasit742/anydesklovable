import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/policies/clipboard")({
  head: () => ({ meta: [{ title: "Clipboard policy — RemoteDesk" }] }),
  component: ClipboardPolicy,
});

function ClipboardPolicy() {
  const [enabled, setEnabled] = useState(false);
  const [direction, setDirection] = useState("both");
  const [allowImages, setAllowImages] = useState(false);
  const [maxChars, setMaxChars] = useState("100000");
  const [redactSecrets, setRedactSecrets] = useState(true);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
              <Clipboard className="h-5 w-5" />
            </span>
            <div>
              <div className="text-base font-semibold">Clipboard sync</div>
              <p className="mt-0.5 text-sm text-muted-foreground">Share copied content between host and viewer. Off by default for privacy.</p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            <Toggle label="Allow clipboard sync" desc="Master switch for copy/paste between participants." checked={enabled} onChange={setEnabled} />
            <Toggle label="Allow image clipboard" desc="Includes screenshots and copied bitmaps." checked={allowImages} onChange={setAllowImages} disabled={!enabled} />
            <Toggle label="Redact secrets" desc="Detect API keys, passwords, and credit-card numbers and replace them with [REDACTED]." checked={redactSecrets} onChange={setRedactSecrets} disabled={!enabled} />

            <div className="grid gap-4 pt-2 sm:grid-cols-2">
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Direction</Label>
                <Select value={direction} onValueChange={setDirection} disabled={!enabled}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both directions</SelectItem>
                    <SelectItem value="to-host">Viewer → Host only</SelectItem>
                    <SelectItem value="to-viewer">Host → Viewer only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Max characters per paste</Label>
                <Input type="number" className="mt-1.5" value={maxChars} onChange={(e) => setMaxChars(e.target.value)} disabled={!enabled} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-semibold">Why off by default?</div>
          <p className="mt-1 text-sm text-muted-foreground">Clipboards often hold sensitive data — passwords, tokens, PII. RemoteDesk requires an explicit opt-in.</p>
        </div>
        <Button className="w-full" onClick={() => toast.success("Policy saved")}>Save policy</Button>
      </div>
    </div>
  );
}

function Toggle({
  label, desc, checked, onChange, disabled,
}: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 rounded-md border border-border bg-background p-3 ${disabled ? "opacity-50" : ""}`}>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
