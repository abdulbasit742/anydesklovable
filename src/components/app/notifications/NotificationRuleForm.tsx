import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useNotificationRules, useCreateNotificationRule, useUpdateNotificationRule, useDeleteNotificationRule,
  PRESENCE_EVENT_TYPES,
} from "@/lib/services/presence";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  event_type: z.enum(PRESENCE_EVENT_TYPES),
  severity: z.enum(["info", "warning", "critical"]),
});
type FormVals = z.infer<typeof schema>;

export function NotificationRuleForm() {
  const { data: rules = [], isLoading } = useNotificationRules();
  const create = useCreateNotificationRule();
  const update = useUpdateNotificationRule();
  const del = useDeleteNotificationRule();

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", event_type: "device.offline", severity: "warning" },
  });
  const eventType = watch("event_type");
  const severity = watch("severity");

  const onSubmit = (vals: FormVals) => {
    create.mutate(vals, {
      onSuccess: () => { reset(); toast.success("Notification rule created"); },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border px-4 py-3">
        <div className="text-sm font-semibold">Notification rules</div>
        <div className="text-xs text-muted-foreground">Decide which device events generate in-app notifications.</div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Label htmlFor="rn">Rule name</Label>
          <Input id="rn" placeholder="Notify on device offline" className="mt-1.5" {...register("name")} />
          {errors.name && <div className="mt-1 text-xs text-destructive">{errors.name.message}</div>}
        </div>
        <div>
          <Label>Event</Label>
          <Select value={eventType} onValueChange={(v) => setValue("event_type", v as FormVals["event_type"])}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              {PRESENCE_EVENT_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Severity</Label>
          <Select value={severity} onValueChange={(v) => setValue("severity", v as FormVals["severity"])}>
            <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2 lg:col-span-4">
          <Button type="submit" size="sm" disabled={create.isPending}>
            <Plus className="mr-1.5 h-4 w-4" /> Add rule
          </Button>
          <span className="ml-3 text-[11px] text-muted-foreground">Channels: in-app · email/webhook coming soon</span>
        </div>
      </form>

      <div className="divide-y divide-border">
        {isLoading && <div className="p-6 text-center text-sm text-muted-foreground">Loading…</div>}
        {!isLoading && rules.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No notification rules yet.</div>
        )}
        {rules.map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.event_type} · {r.severity}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs">
                <Switch
                  checked={r.enabled}
                  onCheckedChange={(v) => update.mutate({ id: r.id, patch: { enabled: v } })}
                />
                <span className="text-muted-foreground">{r.enabled ? "Enabled" : "Paused"}</span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => del.mutate(r.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
