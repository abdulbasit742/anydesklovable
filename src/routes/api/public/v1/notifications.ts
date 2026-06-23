import { createFileRoute } from "@tanstack/react-router";
import { withPublicApi, apiOk, apiError, parsePagination } from "@/lib/api/public-auth";

export const Route = createFileRoute("/api/public/v1/notifications")({
  server: {
    handlers: {
      GET: withPublicApi("read:notifications", async (ctx, request) => {
        const url = new URL(request.url);
        const { limit, cursor } = parsePagination(url);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let q = supabaseAdmin.from("notifications").select("*").eq("team_id", ctx.teamId)
          .order("created_at", { ascending: false }).limit(limit + 1);
        if (cursor) q = q.lt("created_at", cursor);
        const { data, error } = await q;
        if (error) return apiError("query_failed", error.message, 500, ctx.requestId);
        const rows = data ?? [];
        const hasMore = rows.length > limit;
        const page = rows.slice(0, limit);
        const next = hasMore ? (page[page.length - 1] as { created_at: string }).created_at : null;
        return apiOk({ data: page, pagination: { next_cursor: next, has_more: hasMore } }, ctx.requestId);
      }),
    },
  },
});
