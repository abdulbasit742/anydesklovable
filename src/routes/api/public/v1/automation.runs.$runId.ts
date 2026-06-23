import { createFileRoute } from "@tanstack/react-router";
import { withPublicApi, apiOk, apiError } from "@/lib/api/public-auth";

export const Route = createFileRoute("/api/public/v1/automation/runs/$runId")({
  server: {
    handlers: {
      GET: withPublicApi("read:automation", async (ctx, _req, params) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin
          .from("automation_pipeline_runs").select("*").eq("team_id", ctx.teamId).eq("id", params.runId).maybeSingle();
        if (error) return apiError("query_failed", error.message, 500, ctx.requestId);
        if (!data) return apiError("not_found", "Run not found.", 404, ctx.requestId);
        const { data: tasks } = await supabaseAdmin
          .from("automation_tasks").select("id, status, attempts, max_attempts, error_message")
          .eq("run_id", params.runId);
        return apiOk({ run: data, tasks: tasks ?? [] }, ctx.requestId);
      }),
    },
  },
});
