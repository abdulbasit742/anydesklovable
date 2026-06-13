import { Crown, Sparkles, Briefcase, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";

const META: Record<string, { label: string; tone: string; Icon: typeof Crown }> = {
  free:       { label: "Free",       tone: "border-border bg-muted text-foreground",            Icon: Sparkles },
  pro:        { label: "Pro",        tone: "border-primary/30 bg-primary/10 text-primary",       Icon: Rocket },
  business:   { label: "Business",   tone: "border-success/30 bg-success/10 text-success",       Icon: Briefcase },
  enterprise: { label: "Enterprise", tone: "border-amber-500/30 bg-amber-500/10 text-amber-600", Icon: Crown },
};

export function PlanBadge({ planKey, className }: { planKey: string; className?: string }) {
  const m = META[planKey.toLowerCase()] ?? META.free;
  const Icon = m.Icon;
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium", m.tone, className)}>
      <Icon className="h-3 w-3" /> {m.label}
    </span>
  );
}
