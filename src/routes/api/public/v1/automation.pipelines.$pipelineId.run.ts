import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

const Body = z.object({ input: z.record(z.string(), z.unknown()).optional() }).strict().optional();

export const Route = createFileRoute("/api/public/v1/automation/pipelines/$pipelineId/run")({
  server: {
    handlers: {
      POST: withPublicApi("write:automation", async (ctx, req, params) => {
        let body: unknown = undefined;
        try { body = await req.json(); } catch { /* empty OK */ }
        const parsed = Body.safeParse(body);
        if (body !== undefined && !parsed.success) return apiError("invalid_request", parsed.error.message, 400, ctx.requestId);
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: pipe } = await supabaseAdmin.from("automation_pipelines")
          .select("team_id, status").eq("id", params.pipelineId).maybeSingle();
        if (!pipe || pipe.team_id !== ctx.teamId) return apiError("not_found", "Pipeline not found.", 404, ctx.requestId);
        if (pipe.status !== "active") return apiError("conflict", `Pipeline is ${pipe.status}.`, 409, ctx.requestId);
        const inputJson = (parsed.success ? parsed.data?.input ?? {} : {}) as unknown as Record<string, never>;
        const { data, error } = await supabaseAdmin.from("automation_pipeline_runs").insert({
          team_id: ctx.teamId,
          pipeline_id: params.pipelineId,
          status: "queued",
          trigger_source: "api",
          input: inputJson,
        }).select("id, status, created_at").maybeSingle();
        if (error) return apiError("create_failed", error.message, 500, ctx.requestId);
        return apiOk({ run_id: data?.id, status: data?.status, message: "Run queued. A worker will execute the pipeline steps." }, ctx.requestId, 201);
      }),
    },
  },
});
