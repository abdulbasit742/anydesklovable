import { MonitorSmartphone } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
        <MonitorSmartphone className="h-4 w-4" />
      </span>
      <span className={light ? "text-sidebar-foreground" : "text-foreground"}>
        RemoteDesk
      </span>
    </Link>
  );
}
