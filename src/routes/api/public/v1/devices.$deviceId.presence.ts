import { createFileRoute } from "@tanstack/react-router";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

export const Route = createFileRoute("/api/public/v1/devices/$deviceId/presence")({
  server: {
    handlers: {
      GET: withPublicApi("read:presence", async (ctx, _req, params) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("device_presence")
          .select("device_id, status, last_seen_at, heartbeat_at, connection_quality, latency_ms, packet_loss, active_session_id, updated_at")
          .eq("team_id", ctx.teamId).eq("device_id", params.deviceId).maybeSingle();
        if (error) return apiError("query_failed", error.message, 500, ctx.requestId);
        if (!data) return apiError("not_found", "No presence data for this device.", 404, ctx.requestId);
        return apiOk(data, ctx.requestId);
      }),
    },
  },
});
