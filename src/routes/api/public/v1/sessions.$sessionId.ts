import { createFileRoute } from "@tanstack/react-router";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

export const Route = createFileRoute("/api/public/v1/sessions/$sessionId")({
  server: {
    handlers: {
      GET: withPublicApi("read:sessions", async (ctx, _req, params) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("sessions").select("*").eq("team_id", ctx.teamId).eq("id", params.sessionId).maybeSingle();
        if (error) return apiError("query_failed", error.message, 500, ctx.requestId);
        if (!data) return apiError("not_found", "Session not found.", 404, ctx.requestId);
        return apiOk(data, ctx.requestId);
      }),
    },
  },
});
