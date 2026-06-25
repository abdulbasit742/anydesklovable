import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useActivePolicyRules, useSavePolicyRules } from "@/lib/services/policies";

type RIRules = { default_mode: string; allow_keyboard: boolean; allow_mouse: boolean; block_uac: boolean; idle_lock: boolean; idle_minutes: number };
const RI_DEFAULTS: RIRules = { default_mode: "view-only", allow_keyboard: true, allow_mouse: true, block_uac: true, idle_lock: true, idle_minutes: 5 };

export const Route = createFileRoute("/dashboard/policies/remote-input")({
  head: () => ({ meta: [{ title: "Remote input policy — RemoteDesk" }] }),
  component: RemoteInputPolicy,
});

function RemoteInputPolicy() {
  const { rules, isLoading } = useActivePolicyRules<RIRules>("remote_input", RI_DEFAULTS);
  const saveMutation = useSavePolicyRules();
  const [defaultMode, setDefaultMode] = useState(RI_DEFAULTS.default_mode);
  const [allowKeyboard, setAllowKeyboard] = useState(RI_DEFAULTS.allow_keyboard);
  const [allowMouse, setAllowMouse] = useState(RI_DEFAULTS.allow_mouse);
  const [blockUac, setBlockUac] = useState(RI_DEFAULTS.block_uac);
  const [idleLock, setIdleLock] = useState(RI_DEFAULTS.idle_lock);
  const [idleMinutes, setIdleMinutes] = useState(String(RI_DEFAULTS.idle_minutes));
  useEffect(() => { if (!isLoading) { setDefaultMode(rules.default_mode); setAllowKeyboard(rules.allow_keyboard); setAllowMouse(rules.allow_mouse); setBlockUac(rules.block_uac); setIdleLock(rules.idle_lock); setIdleMinutes(String(rules.idle_minutes)); } }, [isLoading, rules]);
  const save = () => saveMutation.mutate({ policyType: "remote_input", name: "Remote input policy", rules: { default_mode: defaultMode, allow_keyboard: allowKeyboard, allow_mouse: allowMouse, block_uac: blockUac, idle_lock: idleLock, idle_minutes: Number(idleMinutes) }, enforcementMode: "block" }, { onSuccess: () => toast.success("Policy saved"), onError: (e) => toast.error(e.message) });

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
              <MousePointer2 className="h-5 w-5" />
            </span>
            <div>
              <div className="text-base font-semibold">Remote input</div>
              <p className="mt-0.5 text-sm text-muted-foreground">Decide what viewers can do once the host approves a session.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Default permission for new sessions</Label>
              <Select value={defaultMode} onValueChange={setDefaultMode}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="view-only">View only — viewer cannot control</SelectItem>
                  <SelectItem value="ask">Ask each time — host picks per session</SelectItem>
                  <SelectItem value="full">Full control — keyboard and mouse</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-2 text-xs text-muted-foreground">Hosts can always elevate or downgrade permission mid-session.</p>
            </div>

            <Toggle label="Allow keyboard input" desc="Disable to prevent any typed input from the viewer." checked={allowKeyboard} onChange={setAllowKeyboard} />
            <Toggle label="Allow mouse input" desc="Disable to make viewer cursor read-only (still visible to host)." checked={allowMouse} onChange={setAllowMouse} />
            <Toggle label="Block elevation prompts (UAC / sudo)" desc="Refuses viewer input to OS elevation dialogs even when input is allowed." checked={blockUac} onChange={setBlockUac} />

            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">Auto-revoke input when host is idle</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">If the host doesn't move the mouse or type for the configured minutes, viewer input is suspended.</div>
                </div>
                <Switch checked={idleLock} onCheckedChange={setIdleLock} />
              </div>
              {idleLock && (
                <div className="mt-3 flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Idle minutes</Label>
                  <Select value={idleMinutes} onValueChange={setIdleMinutes}>
                    <SelectTrigger className="h-8 w-24"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["1", "3", "5", "10", "15", "30"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-semibold">Emergency stop</div>
          <p className="mt-1 text-sm text-muted-foreground">Hosts can instantly revoke all viewer input with:</p>
          <div className="mt-2 flex items-center gap-1.5">
            <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">Ctrl</kbd>
            <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">Shift</kbd>
            <kbd className="rounded border border-border bg-muted px-2 py-0.5 font-mono text-xs">.</kbd>
          </div>
        </div>
        <Button className="w-full" onClick={save} disabled={saveMutation.isPending}>{saveMutation.isPending ? "Saving…" : "Save policy"}</Button>
      </div>
    </div>
  );
}

function Toggle({
  label, desc, checked, onChange,
}: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-md border border-border bg-background p-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
