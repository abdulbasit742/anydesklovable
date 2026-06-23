import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { withPublicApi, apiOk, apiError, parsePagination } from "@/lib/api/public-auth";

const CreateSchema = z.object({
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(8000),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  category: z.string().min(1).max(80).default("api"),
}).strict();

export const Route = createFileRoute("/api/public/v1/support/tickets")({
  server: {
    handlers: {
      GET: withPublicApi("read:support", async (ctx, request) => {
        const url = new URL(request.url);
        const { limit, cursor } = parsePagination(url);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        let q = supabaseAdmin.from("support_tickets").select("*").eq("team_id", ctx.teamId)
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
      POST: withPublicApi("write:support", async (ctx, req) => {
        let body: unknown;
        try { body = await req.json(); } catch { return apiError("invalid_request", "Body must be JSON.", 400, ctx.requestId); }
        const parsed = CreateSchema.safeParse(body);
        if (!parsed.success) return apiError("invalid_request", parsed.error.message, 400, ctx.requestId);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        // user_id is required (NOT NULL); attribute API-created tickets to the team owner.
        const { data: team } = await supabaseAdmin.from("teams").select("owner_id").eq("id", ctx.teamId).maybeSingle();
        if (!team?.owner_id) return apiError("conflict", "Team has no owner to attribute the ticket to.", 409, ctx.requestId);
        const { data, error } = await supabaseAdmin.from("support_tickets").insert({
          team_id: ctx.teamId,
          user_id: team.owner_id,
          subject: parsed.data.subject,
          description: parsed.data.description,
          priority: parsed.data.priority,
          category: parsed.data.category,
          status: "open",
        }).select("*").maybeSingle();
        if (error) return apiError("create_failed", error.message, 500, ctx.requestId);
        return apiOk(data, ctx.requestId, 201);
      }),
    },
  },
});
