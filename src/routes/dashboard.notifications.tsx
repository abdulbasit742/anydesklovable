import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { NotificationCenter } from "@/components/app/notifications/NotificationCenter";
import { NotificationRuleForm } from "@/components/app/notifications/NotificationRuleForm";
import { useCurrentTeam } from "@/hooks/use-current-team";

export const Route = createFileRoute("/dashboard/notifications")({
  head: () => ({ meta: [{ title: "Notifications — RemoteDesk" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  const { data: team } = useCurrentTeam();
  const role = team?.role;
  const canManage = role === "owner" || role === "admin";
  return (
    <AppShell title="Notifications">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><NotificationCenter /></div>
        <div>
          {canManage ? (
            <NotificationRuleForm />
          ) : (
            <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
              Ask a team owner or admin to configure notification rules.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
