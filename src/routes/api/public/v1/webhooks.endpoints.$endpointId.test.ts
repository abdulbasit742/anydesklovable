import { createFileRoute } from "@tanstack/react-router";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

export const Route = createFileRoute("/api/public/v1/webhooks/endpoints/$endpointId/test")({
  server: {
    handlers: {
      POST: withPublicApi("write:webhooks", async (ctx, _req, params) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: ep } = await supabaseAdmin.from("webhook_endpoints").select("team_id, id, name").eq("id", params.endpointId).maybeSingle();
        if (!ep || ep.team_id !== ctx.teamId) return apiError("not_found", "Endpoint not found.", 404, ctx.requestId);
        // Insert event + queued delivery directly (RPC requires auth.uid()).
        const { data: evt } = await supabaseAdmin.from("webhook_events").insert({
          team_id: ctx.teamId, event_type: "webhook.test", source: "api",
          payload: { message: "API test webhook" },
        }).select("id").maybeSingle();
        const { data: del, error } = await supabaseAdmin.from("webhook_deliveries").insert({
          team_id: ctx.teamId,
          endpoint_id: ep.id,
          event_id: evt?.id ?? null,
          event_type: "webhook.test",
          payload: { id: evt?.id, type: "webhook.test", created_at: new Date().toISOString(), data: { message: "test" } },
          status: "pending",
          next_retry_at: new Date().toISOString(),
        }).select("*").maybeSingle();
        if (error) return apiError("create_failed", error.message, 500, ctx.requestId);
        return apiOk({
          delivery: del,
          message: "Delivery queued. Connect a webhook worker to send outbound HTTP requests.",
        }, ctx.requestId, 202);
      }),
    },
  },
});
