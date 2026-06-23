import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

const PatchSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  url: z.string().url().optional(),
  events: z.array(z.string().min(1).max(64)).min(1).max(64).optional(),
  status: z.enum(["active", "paused", "disabled"]).optional(),
}).strict();

export const Route = createFileRoute("/api/public/v1/webhooks/endpoints/$endpointId")({
  server: {
    handlers: {
      PATCH: withPublicApi("write:webhooks", async (ctx, req, params) => {
        let body: unknown;
        try { body = await req.json(); } catch { return apiError("invalid_request", "Body must be JSON.", 400, ctx.requestId); }
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) return apiError("invalid_request", parsed.error.message, 400, ctx.requestId);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: existing } = await supabaseAdmin.from("webhook_endpoints").select("team_id").eq("id", params.endpointId).maybeSingle();
        if (!existing || existing.team_id !== ctx.teamId) return apiError("not_found", "Endpoint not found.", 404, ctx.requestId);
        const { data, error } = await supabaseAdmin.from("webhook_endpoints")
          .update({ ...parsed.data, updated_at: new Date().toISOString() })
          .eq("id", params.endpointId)
          .select("id, name, url, events, status, last_delivery_at, last_success_at, last_failure_at, failure_count, created_at, updated_at")
          .maybeSingle();
        if (error) return apiError("update_failed", error.message, 500, ctx.requestId);
        return apiOk(data, ctx.requestId);
      }),
      DELETE: withPublicApi("write:webhooks", async (ctx, _req, params) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: existing } = await supabaseAdmin.from("webhook_endpoints").select("team_id").eq("id", params.endpointId).maybeSingle();
        if (!existing || existing.team_id !== ctx.teamId) return apiError("not_found", "Endpoint not found.", 404, ctx.requestId);
        const { error } = await supabaseAdmin.from("webhook_endpoints")
          .update({ status: "disabled", updated_at: new Date().toISOString() })
          .eq("id", params.endpointId);
        if (error) return apiError("update_failed", error.message, 500, ctx.requestId);
        return apiOk({ id: params.endpointId, status: "disabled" }, ctx.requestId);
      }),
    },
  },
});
