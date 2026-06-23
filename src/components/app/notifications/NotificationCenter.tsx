import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { CheckCheck, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead,
  type Severity,
} from "@/lib/services/presence";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const sevIcon = { info: Info, warning: AlertTriangle, critical: AlertCircle } as const;
const sevCls = { info: "text-primary", warning: "text-warning", critical: "text-destructive" } as const;

export function NotificationCenter() {
  const [severity, setSeverity] = useState<"all" | Severity>("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data: rows = [], isLoading, error } = useNotifications({ unreadOnly, limit: 100 });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const filtered = rows.filter((n) => severity === "all" || n.severity === severity);

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
        <Select value={severity} onValueChange={(v) => setSeverity(v as "all" | Severity)}>
          <SelectTrigger className="h-9 w-40"><SelectValue placeholder="Severity" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All severities</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Button variant={unreadOnly ? "default" : "outline"} size="sm" onClick={() => setUnreadOnly((v) => !v)}>
          Unread only
        </Button>
        <div className="ml-auto">
          <Button size="sm" variant="ghost" onClick={() => markAll.mutate()} disabled={markAll.isPending}>
            <CheckCheck className="mr-1.5 h-4 w-4" /> Mark all read
          </Button>
        </div>
      </div>
      <div className="divide-y divide-border">
        {isLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading…</div>}
        {error && <div className="p-8 text-center text-sm text-destructive">{(error as Error).message}</div>}
        {!isLoading && !error && filtered.length === 0 && (
          <div className="p-12 text-center text-sm text-muted-foreground">No notifications match these filters.</div>
        )}
        {filtered.map((n) => {
          const Icon = sevIcon[n.severity];
          const inner = (
            <div className={cn("flex items-start gap-3 p-4 hover:bg-muted/30", !n.read_at && "bg-primary/5")}>
              <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", sevCls[n.severity])} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-medium">{n.title}</div>
                  <span className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{n.type}</span>
                </div>
                <div className="mt-0.5 text-sm text-muted-foreground">{n.message}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}</div>
              </div>
              {!n.read_at && (
                <Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); markRead.mutate(n.id); }}>
                  Mark read
                </Button>
              )}
            </div>
          );
          return (
            <div key={n.id}>
              {n.action_url ? <Link to={n.action_url}>{inner}</Link> : inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}
