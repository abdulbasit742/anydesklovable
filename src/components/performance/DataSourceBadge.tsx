import { Badge } from "@/components/ui/badge";

/**
 * DataSourceBadge — shows where data is coming from.
 * Helps developers and admins understand data freshness.
 */

export type DataSource = "live_backend" | "supabase" | "mock" | "placeholder" | "dry_run";

const sourceConfig: Record<DataSource, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  live_backend: { label: "Live", variant: "default" },
  supabase: { label: "Supabase", variant: "secondary" },
  mock: { label: "Mock", variant: "outline" },
  placeholder: { label: "Placeholder", variant: "outline" },
  dry_run: { label: "Dry Run", variant: "destructive" },
};

interface DataSourceBadgeProps {
  source: DataSource;
  className?: string;
}

export function DataSourceBadge({ source, className }: DataSourceBadgeProps) {
  const config = sourceConfig[source];
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
}
