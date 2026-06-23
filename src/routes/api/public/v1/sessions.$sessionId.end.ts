import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

const BodySchema = z.object({ reason: z.string().max(200).optional() }).strict().optional();

export const Route = createFileRoute("/api/public/v1/sessions/$sessionId/end")({
  server: {
    handlers: {
      POST: withPublicApi("write:sessions", async (ctx, req, params) => {
        let body: unknown = undefined;
        try { body = await req.json(); } catch { /* empty body OK */ }
        const parsed = BodySchema.safeParse(body);
        const reason = parsed.success ? parsed.data?.reason ?? null : null;
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // Confirm the session belongs to the team before calling RPC (RPC uses auth.uid()).
        const { data: s } = await supabaseAdmin.from("sessions").select("team_id").eq("id", params.sessionId).maybeSingle();
        if (!s || s.team_id !== ctx.teamId) return apiError("not_found", "Session not found.", 404, ctx.requestId);
        const { error } = await supabaseAdmin.from("sessions")
          .update({ status: "ended", ended_at: new Date().toISOString(), end_reason: reason ?? "api_request", token_hash: null })
          .eq("id", params.sessionId).eq("status", "connected");
        if (error) return apiError("update_failed", error.message, 500, ctx.requestId);
        return apiOk({ session_id: params.sessionId, status: "ended" }, ctx.requestId);
      }),
    },
  },
});
