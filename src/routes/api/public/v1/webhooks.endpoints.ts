import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

const CreateSchema = z.object({
  name: z.string().min(1).max(128),
  url: z.string().url().refine((u) => u.startsWith("https://") || u.startsWith("http://"), "URL must be http(s)"),
  events: z.array(z.string().min(1).max(64)).min(1).max(64),
  secret: z.string().min(16).max(256).optional(),
}).strict();

export const Route = createFileRoute("/api/public/v1/webhooks/endpoints")({
  server: {
    handlers: {
      GET: withPublicApi("read:webhooks", async (ctx) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("webhook_endpoints")
          .select("id, name, url, events, status, last_delivery_at, last_success_at, last_failure_at, failure_count, created_at, updated_at")
          .eq("team_id", ctx.teamId).order("created_at", { ascending: false });
        if (error) return apiError("query_failed", error.message, 500, ctx.requestId);
        return apiOk({ data: data ?? [] }, ctx.requestId);
      }),
      POST: withPublicApi("write:webhooks", async (ctx, req) => {
        let body: unknown;
        try { body = await req.json(); } catch { return apiError("invalid_request", "Body must be JSON.", 400, ctx.requestId); }
        const parsed = CreateSchema.safeParse(body);
        if (!parsed.success) return apiError("invalid_request", parsed.error.message, 400, ctx.requestId);
        const generated = !parsed.data.secret;
        const secret = parsed.data.secret ?? `whsec_${randomBytes(24).toString("hex")}`;
        const secretHash = createHash("sha256").update(secret).digest("hex");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.from("webhook_endpoints").insert({
          team_id: ctx.teamId,
          name: parsed.data.name,
          url: parsed.data.url,
          events: parsed.data.events,
          secret_hash: secretHash,
          status: "active",
        }).select("id, name, url, events, status, created_at").maybeSingle();
        if (error) return apiError("create_failed", error.message, 500, ctx.requestId);
        return apiOk({ ...data, secret: generated ? secret : null, secret_revealed_once: generated }, ctx.requestId, 201);
      }),
    },
  },
});
