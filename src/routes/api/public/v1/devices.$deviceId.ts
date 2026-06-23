import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

const PatchSchema = z.object({
  name: z.string().min(1).max(128).optional(),
  tags: z.array(z.string().max(64)).max(32).optional(),
  notes: z.string().max(2000).optional(),
}).strict();

export const Route = createFileRoute("/api/public/v1/devices/$deviceId")({
  server: {
    handlers: {
      GET: withPublicApi("read:devices", async (ctx, _req, params) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("devices").select("*").eq("team_id", ctx.teamId).eq("id", params.deviceId).maybeSingle();
        if (error) return apiError("query_failed", error.message, 500, ctx.requestId);
        if (!data) return apiError("not_found", "Device not found.", 404, ctx.requestId);
        return apiOk(data, ctx.requestId);
      }),
      PATCH: withPublicApi("write:devices", async (ctx, req, params) => {
        let body: unknown;
        try { body = await req.json(); } catch { return apiError("invalid_request", "Body must be JSON.", 400, ctx.requestId); }
        const parsed = PatchSchema.safeParse(body);
        if (!parsed.success) return apiError("invalid_request", parsed.error.message, 400, ctx.requestId);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("devices")
          .update({ ...parsed.data, updated_at: new Date().toISOString() })
          .eq("team_id", ctx.teamId).eq("id", params.deviceId)
          .select("*").maybeSingle();
        if (error) return apiError("update_failed", error.message, 500, ctx.requestId);
        if (!data) return apiError("not_found", "Device not found.", 404, ctx.requestId);
        return apiOk(data, ctx.requestId);
      }),
    },
  },
});
