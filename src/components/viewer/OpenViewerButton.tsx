import { Link } from "@tanstack/react-router";
import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";

type OpenViewerButtonProps = {
  deviceId: string;
  disabled?: boolean;
  label?: string;
  className?: string;
};

export function OpenViewerButton({ deviceId, disabled, label = "View screen", className }: OpenViewerButtonProps) {
  const search = { deviceId } as Record<string, string>;

  if (disabled) {
    return (
      <Button size="sm" disabled className={className}>
        <Power className="mr-1.5 h-4 w-4" />{label}
      </Button>
    );
  }

  return (
    <Button size="sm" asChild className={className}>
      <Link to="/dashboard/viewer" search={search}>
        <Power className="mr-1.5 h-4 w-4" />{label}
      </Link>
    </Button>
  );
}
