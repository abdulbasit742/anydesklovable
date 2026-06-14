import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

// Stripe webhook handler. Verifies the `Stripe-Signature` header against
// STRIPE_WEBHOOK_SECRET, then updates subscriptions and invoices via
// service-role RPCs. The Stripe customer/subscription must carry the
// RemoteDesk team id in `metadata.team_id`.
export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) {
          return new Response("Stripe webhook secret not configured", { status: 503 });
        }
        const sigHeader = request.headers.get("stripe-signature") ?? "";
        const raw = await request.text();

        if (!verifyStripeSignature(raw, sigHeader, secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        let event: StripeEvent;
        try {
          event = JSON.parse(raw) as StripeEvent;
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        try {
          switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated":
            case "customer.subscription.deleted": {
              const sub = event.data.object as StripeSubscription;
              const teamId = sub.metadata?.team_id;
              if (!teamId) break;
              const item = sub.items?.data?.[0];
              const plan = (sub.metadata?.plan || item?.price?.lookup_key || item?.price?.nickname || "free").toLowerCase();
              await (supabaseAdmin.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>) (
                "apply_subscription_from_webhook",
                {
                  _team_id: teamId,
                  _plan: plan,
                  _seats: item?.quantity ?? sub.quantity ?? 1,
                  _status: event.type === "customer.subscription.deleted" ? "canceled" : sub.status,
                  _interval: item?.price?.recurring?.interval === "year" ? "yearly" : "monthly",
                  _stripe_customer_id: typeof sub.customer === "string" ? sub.customer : null,
                  _stripe_subscription_id: sub.id,
                  _current_period_end: sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : null,
                  _cancel_at_period_end: !!sub.cancel_at_period_end,
                },
              );
              break;
            }
            case "invoice.paid":
            case "invoice.payment_failed":
            case "invoice.finalized": {
              const inv = event.data.object as StripeInvoice;
              const teamId = inv.metadata?.team_id || inv.subscription_details?.metadata?.team_id;
              if (!teamId) break;
              await (supabaseAdmin.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ error: unknown }>) (
                "upsert_invoice_from_webhook",
                {
                  _team_id: teamId,
                  _number: inv.number || inv.id,
                  _amount_cents: inv.amount_paid ?? inv.amount_due ?? 0,
                  _currency: (inv.currency || "usd").toLowerCase(),
                  _status: inv.status || (event.type === "invoice.paid" ? "paid" : "open"),
                  _issued_at: inv.created ? new Date(inv.created * 1000).toISOString() : new Date().toISOString(),
                  _pdf_url: inv.invoice_pdf || inv.hosted_invoice_url || null,
                },
              );
              break;
            }
            default:
              // Ignore unhandled event types but acknowledge.
              break;
          }
        } catch (err) {
          console.error("stripe webhook handler error", err);
          return new Response("Handler error", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },
    },
  },
});

// --- Stripe signature verification (no SDK; matches Stripe's scheme) ---
function verifyStripeSignature(payload: string, header: string, secret: string): boolean {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=") as [string, string]));
  const t = parts.t;
  const v1 = parts.v1;
  if (!t || !v1) return false;
  const signed = `${t}.${payload}`;
  const expected = createHmac("sha256", secret).update(signed).digest("hex");
  const a = Buffer.from(v1);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

type StripeEvent = {
  id: string;
  type: string;
  data: { object: unknown };
};
type StripeSubscription = {
  id: string;
  status: string;
  customer: string | { id: string };
  quantity?: number;
  current_period_end?: number;
  cancel_at_period_end?: boolean;
  metadata?: Record<string, string>;
  items?: {
    data: Array<{
      quantity?: number;
      price?: {
        lookup_key?: string;
        nickname?: string;
        recurring?: { interval?: string };
      };
    }>;
  };
};
type StripeInvoice = {
  id: string;
  number?: string;
  status?: string;
  currency?: string;
  amount_paid?: number;
  amount_due?: number;
  created?: number;
  invoice_pdf?: string | null;
  hosted_invoice_url?: string | null;
  metadata?: Record<string, string>;
  subscription_details?: { metadata?: Record<string, string> };
};
