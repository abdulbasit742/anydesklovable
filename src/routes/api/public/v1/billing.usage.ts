import { createFileRoute } from "@tanstack/react-router";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

export const Route = createFileRoute("/api/public/v1/billing/usage")({
  server: {
    handlers: {
      GET: withPublicApi("read:billing", async (ctx) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const [team, sub, usage] = await Promise.all([
          supabaseAdmin.from("teams").select("id, name, plan").eq("id", ctx.teamId).maybeSingle(),
          supabaseAdmin.from("subscriptions").select("*").eq("team_id", ctx.teamId).maybeSingle(),
          supabaseAdmin.from("usage_metrics").select("*").eq("team_id", ctx.teamId).order("period_start", { ascending: false }).limit(12),
        ]);
        if (team.error) return apiError("query_failed", team.error.message, 500, ctx.requestId);
        return apiOk({
          team: team.data,
          subscription: sub.data,
          usage: usage.data ?? [],
        }, ctx.requestId);
      }),
    },
  },
});
