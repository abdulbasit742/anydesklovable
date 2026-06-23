import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { Search, Package, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const supabasePublic = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

type Listing = {
  id: string;
  listing_key: string;
  name: string;
  short_description: string | null;
  category: string;
  listing_type: string;
  pricing_model: string;
  base_price_cents: number;
  currency: string;
  icon_url: string | null;
  tags: string[];
  version: string;
  published_at: string | null;
};

async function fetchPublishedListings(): Promise<Listing[]> {
  const { data, error } = await supabasePublic
    .from("marketplace_listings")
    .select(
      "id, listing_key, name, short_description, category, listing_type, pricing_model, base_price_cents, currency, icon_url, tags, version, published_at",
    )
    .eq("status", "published")
    .eq("visibility", "public_marketplace")
    .order("published_at", { ascending: false })
    .limit(60);
  if (error) throw error;
  return (data ?? []) as Listing[];
}

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Marketplace — RemoteDesk" },
      { name: "description", content: "Discover apps, integrations, and automations for RemoteDesk." },
      { property: "og:title", content: "RemoteDesk Marketplace" },
      { property: "og:description", content: "Browse vetted apps, integrations and automations for your remote support workflow." },
    ],
  }),
  component: MarketplacePage,
});

function priceLabel(l: Listing) {
  if (l.pricing_model === "free") return "Free";
  if (l.base_price_cents <= 0) return l.pricing_model;
  const amount = (l.base_price_cents / 100).toLocaleString(undefined, {
    style: "currency",
    currency: (l.currency || "usd").toUpperCase(),
  });
  return `${amount} · ${l.pricing_model}`;
}

function MarketplacePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["public-marketplace-listings"],
    queryFn: fetchPublishedListings,
  });
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    data?.forEach((l) => set.add(l.category));
    return Array.from(set).sort();
  }, [data]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter((l) => {
      if (cat && l.category !== cat) return false;
      if (!term) return true;
      return (
        l.name.toLowerCase().includes(term) ||
        l.short_description?.toLowerCase().includes(term) ||
        l.tags.some((t) => t.toLowerCase().includes(term))
      );
    });
  }, [data, q, cat]);

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <section className="border-b border-border bg-gradient-to-b from-muted/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> RemoteDesk Marketplace
            </div>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
              Extend RemoteDesk with vetted apps
            </h1>
            <p className="mt-3 text-muted-foreground">
              Integrations, automation packs, and tools built by trusted publishers. Install with one click from your dashboard.
            </p>
          </div>
          <div className="mx-auto mt-8 flex max-w-xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search apps, integrations, tags…"
                className="pl-9"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
          {categories.length > 0 && (
            <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-2">
              <Button
                size="sm"
                variant={cat === null ? "default" : "outline"}
                onClick={() => setCat(null)}
              >
                All
              </Button>
              {categories.map((c) => (
                <Button
                  key={c}
                  size="sm"
                  variant={cat === c ? "default" : "outline"}
                  onClick={() => setCat(c)}
                  className="capitalize"
                >
                  {c.replace(/_/g, " ")}
                </Button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-44 animate-pulse rounded-lg border border-border bg-card" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
            Failed to load marketplace listings. Please try again later.
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-12 text-center">
            <Package className="mx-auto h-10 w-10 text-muted-foreground" />
            <h3 className="mt-3 text-base font-medium">No listings yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Published apps will appear here. Publishers can submit their apps from the dashboard.
            </p>
            <Link to="/dashboard/marketplace" className="mt-4 inline-block">
              <Button size="sm" variant="outline">Become a publisher</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((l) => (
              <Link
                key={l.id}
                to="/marketplace/$listingKey"
                params={{ listingKey: l.listing_key }}
                className="group flex flex-col rounded-lg border border-border bg-card p-5 transition hover:border-primary/50 hover:shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">
                    {l.icon_url ? (
                      <img src={l.icon_url} alt="" className="h-8 w-8 rounded" />
                    ) : (
                      <Package className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-medium group-hover:text-primary">{l.name}</h3>
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {l.listing_type}
                      </Badge>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {l.short_description || "No description provided."}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{l.category.replace(/_/g, " ")}</span>
                  <span className="font-medium text-foreground">{priceLabel(l)}</span>
                </div>
                {l.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {l.tags.slice(0, 4).map((t) => (
                      <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <MarketingFooter />
    </div>
  );
}
