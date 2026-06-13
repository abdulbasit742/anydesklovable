import { createFileRoute, Outlet, Link, useRouterState } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { FileUp, Clipboard, MousePointer2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/policies")({
  head: () => ({ meta: [{ title: "Policies — RemoteDesk" }] }),
  component: PoliciesLayout,
});

const tabs = [
  { to: "/dashboard/policies/file-transfer", label: "File transfer", icon: FileUp },
  { to: "/dashboard/policies/clipboard", label: "Clipboard", icon: Clipboard },
  { to: "/dashboard/policies/remote-input", label: "Remote input", icon: MousePointer2 },
];

function PoliciesLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <AppShell title="Policies">
      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-border bg-card p-1">
        {tabs.map((t) => {
          const active = pathname.startsWith(t.to);
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors ${
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </AppShell>
  );
}
