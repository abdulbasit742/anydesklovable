import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Package, ExternalLink, Shield, FileText, BookOpen } from "lucide-react";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const supabasePublic = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

type ListingDetail = {
  id: string;
  listing_key: string;
  name: string;
  short_description: string | null;
  description: string | null;
  category: string;
  listing_type: string;
  pricing_model: string;
  base_price_cents: number;
  currency: string;
  icon_url: string | null;
  screenshots: unknown;
  tags: string[];
  version: string;
  published_at: string | null;
  documentation_url: string | null;
  privacy_policy_url: string | null;
  terms_url: string | null;
  publisher_id: string;
};

async function fetchListing(key: string): Promise<ListingDetail | null> {
  const { data, error } = await supabasePublic
    .from("marketplace_listings")
    .select(
      "id, listing_key, name, short_description, description, category, listing_type, pricing_model, base_price_cents, currency, icon_url, screenshots, tags, version, published_at, documentation_url, privacy_policy_url, terms_url, publisher_id",
    )
    .eq("listing_key", key)
    .eq("status", "published")
    .eq("visibility", "public_marketplace")
    .maybeSingle();
  if (error) throw error;
  return data as ListingDetail | null;
}

export const Route = createFileRoute("/marketplace/$listingKey")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.listingKey} — RemoteDesk Marketplace` },
      { name: "description", content: `${params.listingKey} on the RemoteDesk Marketplace.` },
    ],
  }),
  component: ListingDetailPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Link to="/marketplace" className="mt-4 inline-block">
          <Button variant="outline" size="sm">Back to Marketplace</Button>
        </Link>
      </div>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground" />
        <h1 className="mt-3 text-2xl font-semibold">Listing not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">This listing is unavailable or has not been published.</p>
        <Link to="/marketplace" className="mt-4 inline-block">
          <Button variant="outline" size="sm">Browse Marketplace</Button>
        </Link>
      </div>
    </div>
  ),
});

function priceLabel(l: ListingDetail) {
  if (l.pricing_model === "free") return "Free";
  if (l.base_price_cents <= 0) return l.pricing_model;
  const amount = (l.base_price_cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: (l.currency || "usd").toUpperCase(),
  });
  return `${amount} · ${l.pricing_model}`;
}

function ListingDetailPage() {
  const { listingKey } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-marketplace-listing", listingKey],
    queryFn: () => fetchListing(listingKey),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MarketingNav />
        <div className="mx-auto max-w-5xl px-4 py-12">
          <div className="h-32 animate-pulse rounded-lg border border-border bg-card" />
        </div>
      </div>
    );
  }
  if (error) throw error;
  if (!data) throw notFound();

  const screenshots = Array.isArray(data.screenshots) ? (data.screenshots as string[]) : [];

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link to="/marketplace" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to Marketplace
        </Link>

        <header className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/40">
            {data.icon_url ? (
              <img src={data.icon_url} alt="" className="h-12 w-12 rounded" />
            ) : (
              <Package className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl font-semibold tracking-tight">{data.name}</h1>
              <Badge variant="outline" className="capitalize">{data.listing_type}</Badge>
              <Badge variant="secondary" className="capitalize">{data.category.replace(/_/g, " ")}</Badge>
            </div>
            {data.short_description && (
              <p className="mt-2 text-muted-foreground">{data.short_description}</p>
            )}
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span>v{data.version}</span>
              {data.published_at && (
                <>
                  <span>·</span>
                  <span>Published {new Date(data.published_at).toLocaleDateString()}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-sm font-semibold">{priceLabel(data)}</div>
            <Link to="/login">
              <Button>Install</Button>
            </Link>
          </div>
        </header>

        {screenshots.length > 0 && (
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {screenshots.slice(0, 4).map((src, i) => (
              <img key={i} src={src} alt={`Screenshot ${i + 1}`} className="rounded-lg border border-border" />
            ))}
          </div>
        )}

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <article className="lg:col-span-2">
            <h2 className="text-lg font-semibold">About this listing</h2>
            <div className="prose prose-sm mt-3 max-w-none whitespace-pre-wrap text-sm text-foreground/90">
              {data.description || data.short_description || "No description provided."}
            </div>

            {data.tags.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {data.tags.map((t) => (
                    <span key={t} className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>

          <aside className="space-y-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="text-sm font-medium">Resources</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {data.documentation_url && (
                  <li>
                    <a href={data.documentation_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <BookOpen className="h-4 w-4" /> Documentation <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                )}
                {data.privacy_policy_url && (
                  <li>
                    <a href={data.privacy_policy_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <Shield className="h-4 w-4" /> Privacy policy <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                )}
                {data.terms_url && (
                  <li>
                    <a href={data.terms_url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
                      <FileText className="h-4 w-4" /> Terms <ExternalLink className="h-3 w-3" />
                    </a>
                  </li>
                )}
                {!data.documentation_url && !data.privacy_policy_url && !data.terms_url && (
                  <li className="text-xs text-muted-foreground">No external resources linked.</li>
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-dashed border-border bg-card p-4 text-xs text-muted-foreground">
              Install actions require a RemoteDesk account. Once signed in, you can install this listing into any of your teams.
            </div>
          </aside>
        </div>
      </div>
      <MarketingFooter />
    </div>
  );
}
