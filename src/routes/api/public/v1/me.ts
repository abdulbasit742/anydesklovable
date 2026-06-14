import { createFileRoute } from "@tanstack/react-router";
import { createHash } from "crypto";

// Public REST endpoint used to validate an API key. Callers send
// `Authorization: Bearer rd_live_...`. Returns the owning team and scopes.
export const Route = createFileRoute("/api/public/v1/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = request.headers.get("authorization") ?? "";
        const token = auth.toLowerCase().startsWith("bearer ") ? auth.slice(7).trim() : "";
        if (!token) {
          return json({ error: "missing_bearer_token" }, 401);
        }

        const hash = createHash("sha256").update(token).digest("hex");
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data, error } = await (supabaseAdmin.rpc as unknown as (
          fn: string, args: Record<string, unknown>
        ) => Promise<{ data: Array<{ id: string; team_id: string; scopes: string[]; revoked: boolean; expired: boolean }> | null; error: unknown }>) (
          "verify_api_key_hash",
          { _key_hash: hash },
        );
        if (error) {
          return json({ error: "verification_failed" }, 500);
        }
        const row = data?.[0];
        if (!row) return json({ error: "invalid_key" }, 401);
        if (row.revoked) return json({ error: "key_revoked" }, 401);
        if (row.expired) return json({ error: "key_expired" }, 401);

        // Best-effort update of last_used_at (ignore failures).
        await supabaseAdmin
          .from("api_keys")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", row.id);

        return json({
          ok: true,
          key_id: row.id,
          team_id: row.team_id,
          scopes: row.scopes,
        });
      },
    },
  },
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
