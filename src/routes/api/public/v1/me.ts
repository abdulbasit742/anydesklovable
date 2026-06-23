import { createFileRoute } from "@tanstack/react-router";
import { withPublicApi, apiOk } from "@/lib/api/public-auth";

// GET /api/public/v1/me — validate a key and return identity + plan.
export const Route = createFileRoute("/api/public/v1/me")({
  server: {
    handlers: {
      GET: withPublicApi(null, async (ctx) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: team } = await supabaseAdmin
          .from("teams")
          .select("id, name, plan")
          .eq("id", ctx.teamId)
          .maybeSingle();
        return apiOk(
          {
            team_id: ctx.teamId,
            api_key_id: ctx.apiKeyId,
            scopes: ctx.scopes,
            team: team ?? null,
            plan: team?.plan ?? null,
          },
          ctx.requestId,
        );
      }),
    },
  },
});
