import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
  LayoutDashboard, MonitorSmartphone, Activity, ShieldCheck,
  CreditCard, Users, Download, LogOut, Menu, X, Search,
  FileText, LifeBuoy, Crown, SlidersHorizontal,
  Bot, Workflow, ListChecks, KeyRound, Gauge, CalendarClock, BellRing, ScrollText, Package, Settings,
  BookUser, Smartphone, Code2,
  Database,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useCurrentTeam } from "@/hooks/use-current-team";
import { NotificationBell } from "@/components/app/notifications/NotificationBell";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; badge?: string };
type NavGroup = { label?: string; items: NavItem[] };

const groups: NavGroup[] = [
  {
    items: [
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
      { to: "/dashboard/devices", label: "Devices", icon: MonitorSmartphone },
      { to: "/dashboard/sessions", label: "Sessions", icon: Activity },
      { to: "/dashboard/contacts", label: "Address book", icon: BookUser },
      { to: "/dashboard/mobile", label: "Mobile access", icon: Smartphone },
      { to: "/dashboard/notifications", label: "Notifications", icon: BellRing },
      { to: "/dashboard/audit", label: "Audit logs", icon: FileText },
    ],
  },
  {
    label: "Policies",
    items: [
      { to: "/dashboard/policies/file-transfer", label: "File transfer", icon: SlidersHorizontal },
      { to: "/dashboard/policies/clipboard", label: "Clipboard", icon: SlidersHorizontal },
      { to: "/dashboard/policies/remote-input", label: "Remote input", icon: SlidersHorizontal },
    ],
  },
  {
    label: "Organization",
    items: [
      { to: "/dashboard/team", label: "Team", icon: Users },
      { to: "/dashboard/security", label: "Security", icon: ShieldCheck },
      { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { to: "/dashboard/support", label: "Support", icon: LifeBuoy },
    ],
  },
  {
    label: "Automation",
    items: [
      { to: "/dashboard/automation", label: "Overview", icon: Bot },
      { to: "/dashboard/automation/pipelines", label: "Pipelines", icon: Workflow },
      { to: "/dashboard/automation/tasks", label: "Tasks", icon: ListChecks },
      { to: "/dashboard/automation/accounts", label: "Accounts", icon: KeyRound },
      { to: "/dashboard/automation/rate-limits", label: "Rate limits", icon: Gauge },
      { to: "/dashboard/automation/scheduler", label: "Scheduler", icon: CalendarClock },
      { to: "/dashboard/automation/alerts", label: "Alerts", icon: BellRing },
      { to: "/dashboard/automation/logs", label: "Logs", icon: ScrollText },
      { to: "/dashboard/automation/artifacts", label: "Artifacts", icon: Package },
      { to: "/dashboard/automation/settings", label: "Settings", icon: Settings },
    ],
  },
  {
    label: "Developers",
    items: [
      { to: "/dashboard/developer", label: "Developer & SDK", icon: Code2 },
      { to: "/dashboard/marketplace", label: "Marketplace", icon: Package },
      { to: "/dashboard/data-catalog", label: "Data catalog", icon: Database },
    ],
  },

  {
    label: "Admin",
    items: [
      { to: "/dashboard/admin", label: "Admin console", icon: Crown, badge: "owner" },
    ],
  },
];

export function AppShell({
  children, title, actions,
}: { children: ReactNode; title: string; actions?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: membership } = useCurrentTeam();
  const displayName = (user?.user_metadata?.full_name as string | undefined) || user?.email?.split("@")[0] || "Account";
  const planLabel = membership?.teams?.plan ?? "free";
  const roleLabel = membership?.role ?? "member";

  const isActive = (to: string) =>
    to === "/dashboard" ? pathname === "/dashboard" : pathname === to || pathname.startsWith(to + "/");

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:relative md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Logo light />
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-3 text-sm">
          {groups
            .filter((g) => g.label !== "Admin" || roleLabel === "owner" || roleLabel === "admin")
            .map((g, gi) => (
            <div key={gi} className={gi > 0 ? "mt-4" : ""}>
              {g.label && (
                <div className="mb-1 px-2.5 text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                  {g.label}
                </div>
              )}
              <div className="flex flex-col gap-0.5">
                {g.items.map((n) => {
                  const active = isActive(n.to);
                  return (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between gap-2.5 rounded-md px-2.5 py-2 transition-colors ${
                        active
                          ? "bg-sidebar-accent text-white"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <n.icon className="h-4 w-4" />
                        {n.label}
                      </span>
                      {n.badge && (
                        <span className="rounded-sm bg-primary/20 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-primary">
                          {n.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="space-y-2 border-t border-sidebar-border p-3">
          <Link
            to="/download"
            className="flex items-center gap-2 rounded-md border border-sidebar-border px-2.5 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
          >
            <Download className="h-4 w-4" /> Desktop client
          </Link>
          <div className="flex items-center justify-between rounded-md bg-sidebar-accent px-2.5 py-2">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white">{displayName}</div>
              <div className="truncate text-[11px] text-sidebar-foreground/60">{roleLabel} · {planLabel}</div>
            </div>
            <button
              onClick={async () => { await signOut(); navigate({ to: "/login" }); }}
              aria-label="Sign out"
              className="text-sidebar-foreground/60 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
          <button className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex flex-1 items-center gap-3">
            <h1 className="truncate text-base font-semibold sm:text-lg">{title}</h1>
          </div>
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="h-9 w-64 pl-8" placeholder="Search devices, sessions…" />
          </div>
          <NotificationBell />
          {actions}
        </header>
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
