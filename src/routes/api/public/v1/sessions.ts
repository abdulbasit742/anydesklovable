import { createFileRoute } from "@tanstack/react-router";
import { withPublicApi, apiOk, apiError, parsePagination } from "@/lib/api/public-auth";

export const Route = createFileRoute("/api/public/v1/sessions")({
  server: {
    handlers: {
      GET: withPublicApi("read:sessions", async (ctx, request) => {
        const url = new URL(request.url);
        const { limit, cursor } = parsePagination(url);
        const active = url.searchParams.get("active");
        const deviceId = url.searchParams.get("device_id");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let q = supabaseAdmin.from("sessions").select("*").eq("team_id", ctx.teamId).order("started_at", { ascending: false }).limit(limit + 1);
        if (active === "true") q = q.eq("status", "connected");
        if (active === "false") q = q.neq("status", "connected");
        if (deviceId) q = q.eq("device_id", deviceId);
        if (cursor) q = q.lt("started_at", cursor);
        const { data, error } = await q;
        if (error) return apiError("query_failed", error.message, 500, ctx.requestId);
        const rows = data ?? [];
        const hasMore = rows.length > limit;
        const page = rows.slice(0, limit);
        const next = hasMore ? (page[page.length - 1] as unknown as { started_at: string | null }).started_at : null;
        return apiOk({ data: page, pagination: { next_cursor: next, has_more: hasMore } }, ctx.requestId);
      }),
    },
  },
});
