import { Link } from "@tanstack/react-router";
import { MonitorDot } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5 font-display font-bold tracking-tight">
      <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-glow)] transition-transform group-hover:scale-105">
        <MonitorDot className="h-4 w-4" />
        <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
      </span>
      <span className={light ? "text-sidebar-foreground" : "text-foreground"}>
        RemoteDesk
      </span>
    </Link>
  );
}
