import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/automation/settings")({ component: SettingsPage });

const STORAGE_KEY = "automation.settings";
type Settings = {
  default_provider: string;
  max_concurrent_tasks: number;
  retry_attempts: number;
  cooldown_base_minutes: number;
  watchdog_timeout_minutes: number;
  resource_aware_scheduling: boolean;
  notifications_enabled: boolean;
};

const DEFAULTS: Settings = {
  default_provider: "manus",
  max_concurrent_tasks: 4,
  retry_attempts: 2,
  cooldown_base_minutes: 5,
  watchdog_timeout_minutes: 15,
  resource_aware_scheduling: true,
  notifications_enabled: true,
};

function load(): Settings {
  if (typeof window === "undefined") return DEFAULTS;
  try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") }; }
  catch { return DEFAULTS; }
}

function SettingsPage() {
  const [s, setS] = useState<Settings>(load());

  return (
    <AppShell title="Automation settings">
      <div className="mb-4 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
        <span className="font-semibold">Local preview.</span> These defaults are stored in your browser. To persist them across devices,
        add an <code className="font-mono">automation_settings</code> table (team_id, key, value jsonb) and wire writes in <code className="font-mono">automation/hooks.ts</code>.
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Runtime defaults</h2>
          <div className="space-y-3">
            <div>
              <Label>Default provider</Label>
              <Select value={s.default_provider} onValueChange={(v) => setS({ ...s, default_provider: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{["manus","openai","claude","kimi","lovable","custom"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Max concurrent tasks</Label><Input type="number" min={1} value={s.max_concurrent_tasks} onChange={(e) => setS({ ...s, max_concurrent_tasks: +e.target.value })} /></div>
              <div><Label>Retry attempts</Label><Input type="number" min={0} value={s.retry_attempts} onChange={(e) => setS({ ...s, retry_attempts: +e.target.value })} /></div>
              <div><Label>Cooldown base (min)</Label><Input type="number" min={0} value={s.cooldown_base_minutes} onChange={(e) => setS({ ...s, cooldown_base_minutes: +e.target.value })} /></div>
              <div><Label>Watchdog timeout (min)</Label><Input type="number" min={1} value={s.watchdog_timeout_minutes} onChange={(e) => setS({ ...s, watchdog_timeout_minutes: +e.target.value })} /></div>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-card p-4">
          <h2 className="mb-3 text-sm font-semibold">Scheduler & alerts</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div><div className="text-sm font-medium">Resource-aware scheduling</div><div className="text-xs text-muted-foreground">Pause heavy tasks when system load is high.</div></div>
              <Switch checked={s.resource_aware_scheduling} onCheckedChange={(v) => setS({ ...s, resource_aware_scheduling: v })} />
            </div>
            <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
              <div><div className="text-sm font-medium">Notifications enabled</div><div className="text-xs text-muted-foreground">Send alerts through configured routes.</div></div>
              <Switch checked={s.notifications_enabled} onCheckedChange={(v) => setS({ ...s, notifications_enabled: v })} />
            </div>
          </div>
        </section>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="outline" onClick={() => { setS(DEFAULTS); toast.success("Reset to defaults"); }}>Reset</Button>
        <Button onClick={() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); toast.success("Saved locally"); }}>Save</Button>
      </div>
    </AppShell>
  );
}
