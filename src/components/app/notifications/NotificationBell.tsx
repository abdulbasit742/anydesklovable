
import { Bell, CheckCheck, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useNotifications, useUnreadNotificationCount, useMarkNotificationRead, useMarkAllNotificationsRead,
  type Notification,
} from "@/lib/services/presence";
import { cn } from "@/lib/utils";

const sevIcon = { info: Info, warning: AlertTriangle, critical: AlertCircle } as const;
const sevCls = {
  info: "text-primary",
  warning: "text-warning",
  critical: "text-destructive",
} as const;

function Row({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  const Icon = sevIcon[n.severity] ?? Info;
  const body = (
    <div className={cn("flex items-start gap-3 px-4 py-3 hover:bg-muted/40", !n.read_at && "bg-primary/5")}>
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", sevCls[n.severity])} />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{n.title}</div>
        <div className="line-clamp-2 text-xs text-muted-foreground">{n.message}</div>
        <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
        </div>
      </div>
      {!n.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}
    </div>
  );
  return (
    <button
      onClick={() => { if (!n.read_at) onRead(n.id); }}
      className="block w-full text-left"
    >
      {n.action_url ? <a href={n.action_url}>{body}</a> : body}
    </button>
  );
}

export function NotificationBell() {
  const { data: count = 0 } = useUnreadNotificationCount();
  const { data: notifications = [], isLoading } = useNotifications({ limit: 10 });
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-4 w-4" />
          {count > 0 && (
            <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-2">
          <div className="text-sm font-semibold">Notifications</div>
          <Button
            variant="ghost" size="sm" className="h-7 px-2 text-xs"
            disabled={count === 0 || markAll.isPending}
            onClick={() => markAll.mutate()}
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" /> Mark all read
          </Button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading && <div className="p-6 text-center text-xs text-muted-foreground">Loading…</div>}
          {!isLoading && notifications.length === 0 && (
            <div className="p-6 text-center text-xs text-muted-foreground">You're all caught up.</div>
          )}
          {notifications.map((n) => <Row key={n.id} n={n} onRead={(id) => markRead.mutate(id)} />)}
        </div>
        <div className="border-t border-border px-4 py-2 text-center">
          <a href="/dashboard/notifications" className="text-xs font-medium text-primary hover:underline">
            View all notifications
          </a>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
