import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode, useState } from "react";
import {
  LayoutDashboard, MonitorSmartphone, Activity, ShieldCheck,
  CreditCard, Users, Download, LogOut, Menu, X, Bell, Search,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { currentUser } from "@/lib/mock-data";

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/devices", label: "Devices", icon: MonitorSmartphone },
  { to: "/dashboard/sessions", label: "Sessions", icon: Activity },
  { to: "/dashboard/security", label: "Security", icon: ShieldCheck },
  { to: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { to: "/dashboard/team", label: "Team", icon: Users },
];

export function AppShell({
  children, title, actions,
}: { children: ReactNode; title: string; actions?: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 transform border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform md:relative md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-sidebar-border px-4">
          <Logo light />
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-0.5 p-3 text-sm">
          {nav.map((n) => {
            const active = pathname === n.to || (n.to !== "/dashboard" && pathname.startsWith(n.to));
            const exactActive = n.to === "/dashboard" ? pathname === "/dashboard" : active;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-2 transition-colors ${
                  exactActive
                    ? "bg-sidebar-accent text-white"
                    : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
                }`}
              >
                <n.icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-3 space-y-2">
          <Link
            to="/download"
            className="flex items-center gap-2 rounded-md border border-sidebar-border px-2.5 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-white"
          >
            <Download className="h-4 w-4" /> Desktop client
          </Link>
          <div className="flex items-center justify-between rounded-md bg-sidebar-accent px-2.5 py-2">
            <div className="min-w-0">
              <div className="truncate text-xs font-medium text-white">{currentUser.name}</div>
              <div className="truncate text-[11px] text-sidebar-foreground/60">{currentUser.email}</div>
            </div>
            <Link to="/login" aria-label="Sign out" className="text-sidebar-foreground/60 hover:text-white">
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
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
          <Button variant="ghost" size="icon" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </Button>
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
