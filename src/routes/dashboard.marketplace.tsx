import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Package, Store, Rocket, DollarSign, Download } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app/AppShell";
import { MetricCard } from "@/components/app/MetricCard";
import { PanelState } from "@/components/app/DataState";
import { StatusBadge } from "@/components/app/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentTeam } from "@/hooks/use-current-team";

export const Route = createFileRoute("/dashboard/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace — RemoteDesk" }] }),
  component: MarketplacePage,
});

function fmtMoney(cents: number, currency = "usd") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency.toUpperCase() })
    .format((cents || 0) / 100);
}

function statusVariant(s: string): "online" | "neutral" | "rejected" | "fair" {
  if (s === "published" || s === "approved" || s === "installed") return "online";
  if (s === "rejected") return "rejected";
  if (s === "pending_review" || s === "changes_requested" || s === "worker_required" || s === "provider_required") return "fair";
  return "neutral";
}


function MarketplacePage() {
  const { data: team } = useCurrentTeam();
  const teamId = team?.team_id;
  const qc = useQueryClient();

  const summaryQ = useQuery({
    queryKey: ["mkt-summary", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_marketplace_summary", { _team_id: teamId! });
      if (error) throw error;
      return data as Record<string, number>;
    },
  });

  const publishersQ = useQuery({
    queryKey: ["mkt-publishers", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_publishers").select("*")
        .eq("team_id", teamId!).order("created_at", { ascending: false }).limit(20);
      if (error) throw error;
      return data;
    },
  });

  const listingsQ = useQuery({
    queryKey: ["mkt-listings", teamId],
    enabled: !!teamId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketplace_listings").select("*")
        .eq("team_id", teamId!).order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
  });

  const createPublisher = useMutation({
    mutationFn: async (vars: { name: string; website?: string; support_email?: string }) => {
      const { data, error } = await supabase.rpc("create_marketplace_publisher", {
        _team_id: teamId!, _name: vars.name,
        _website_url: vars.website || undefined, _support_email: vars.support_email || undefined,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Publisher created");
      qc.invalidateQueries({ queryKey: ["mkt-publishers", teamId] });
      qc.invalidateQueries({ queryKey: ["mkt-summary", teamId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const submitListing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("submit_marketplace_listing_for_review", { _listing_id: id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Submitted for review"); qc.invalidateQueries({ queryKey: ["mkt-listings", teamId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const reviewListing = useMutation({
    mutationFn: async (vars: { id: string; decision: "approved" | "changes_requested" | "rejected" }) => {
      const { error } = await supabase.rpc("review_marketplace_listing", {
        _listing_id: vars.id, _decision: vars.decision,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Reviewed"); qc.invalidateQueries({ queryKey: ["mkt-listings", teamId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishListing = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc("publish_marketplace_listing", { _listing_id: id });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Listing published"); qc.invalidateQueries({ queryKey: ["mkt-listings", teamId] }); qc.invalidateQueries({ queryKey: ["mkt-summary", teamId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const summary = summaryQ.data ?? {};

  return (
    <AppShell title="Marketplace" actions={<NewPublisherDialog onSubmit={(v) => createPublisher.mutate(v)} loading={createPublisher.isPending} />}>
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard icon={Store} label="Publishers" value={String(summary.publishers ?? 0)} />
        <MetricCard icon={Package} label="Listings" value={`${summary.listings_published ?? 0}/${summary.listings_total ?? 0}`} hint="published / total" />
        <MetricCard icon={Download} label="Active installs" value={String(summary.installations_active ?? 0)} />
        <MetricCard icon={DollarSign} label="Pending payout" value={fmtMoney(Number(summary.pending_payout_cents ?? 0))} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Publishers</CardTitle></CardHeader>
        <CardContent>
          <PanelState loading={publishersQ.isLoading} error={publishersQ.error as Error | null}
            empty={!publishersQ.data?.length} emptyText="No publishers yet. Create one to start listing apps.">
            <div className="divide-y rounded-md border">
              {publishersQ.data?.map((p) => (
                <div key={p.id} className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.publisher_key} · {p.publisher_type}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={statusVariant(p.status)}>{p.status.replace(/_/g," ")}</StatusBadge>
                    {p.status === "draft" && (
                      <Button size="sm" variant="outline"
                        onClick={async () => {
                          const { error } = await supabase.rpc("submit_marketplace_publisher_for_review", { _publisher_id: p.id });
                          if (error) toast.error(error.message);
                          else { toast.success("Submitted"); qc.invalidateQueries({ queryKey: ["mkt-publishers", teamId] }); }
                        }}>Submit</Button>
                    )}
                    {p.status === "pending_review" && (
                      <Button size="sm"
                        onClick={async () => {
                          const { error } = await supabase.rpc("approve_marketplace_publisher", { _publisher_id: p.id });
                          if (error) toast.error(error.message);
                          else { toast.success("Approved"); qc.invalidateQueries({ queryKey: ["mkt-publishers", teamId] }); }
                        }}>Approve</Button>
                    )}
                    {p.status === "approved" && (
                      <NewListingDialog publisherId={p.id} onCreated={() => qc.invalidateQueries({ queryKey: ["mkt-listings", teamId] })} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PanelState>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Listings</CardTitle></CardHeader>
        <CardContent>
          <PanelState loading={listingsQ.isLoading} error={listingsQ.error as Error | null}
            empty={!listingsQ.data?.length} emptyText="Create a publisher and add your first listing.">
            <div className="divide-y rounded-md border">
              {listingsQ.data?.map((l) => (
                <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <div className="font-medium">{l.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {l.category} · {l.pricing_model}
                      {l.pricing_model !== "free" && ` · ${fmtMoney(l.base_price_cents, l.currency)}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge variant={statusVariant(l.status)}>{l.status.replace(/_/g," ")}</StatusBadge>
                    {l.status === "draft" && (
                      <Button size="sm" variant="outline" disabled={submitListing.isPending}
                        onClick={() => submitListing.mutate(l.id)}>
                        <Rocket className="mr-1 h-3 w-3" /> Submit
                      </Button>
                    )}
                    {l.status === "pending_review" && (
                      <>
                        <Button size="sm" variant="outline"
                          onClick={() => reviewListing.mutate({ id: l.id, decision: "changes_requested" })}>
                          Request changes
                        </Button>
                        <Button size="sm"
                          onClick={() => reviewListing.mutate({ id: l.id, decision: "approved" })}>
                          Approve
                        </Button>
                      </>
                    )}
                    {l.status === "approved" && (
                      <Button size="sm" disabled={publishListing.isPending}
                        onClick={() => publishListing.mutate(l.id)}>Publish</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </PanelState>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function NewPublisherDialog({ onSubmit, loading }: { onSubmit: (v: { name: string; website?: string; support_email?: string }) => void; loading: boolean }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [email, setEmail] = useState("");
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button><Plus className="mr-1 h-4 w-4" /> New publisher</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create publisher</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Website</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" /></div>
          <div><Label>Support email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!name || loading} onClick={() => { onSubmit({ name, website, support_email: email }); setOpen(false); setName(""); setWebsite(""); setEmail(""); }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewListingDialog({ publisherId, onCreated }: { publisherId: string; onCreated: () => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [pricing, setPricing] = useState<"free" | "one_time" | "subscription">("free");
  const [price, setPrice] = useState("0");
  const [loading, setLoading] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm" variant="outline"><Plus className="mr-1 h-3 w-3" /> Add listing</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>New listing</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Pricing model</Label>
            <select className="mt-1 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm"
              value={pricing} onChange={(e) => setPricing(e.target.value as typeof pricing)}>
              <option value="free">Free</option>
              <option value="one_time">One-time</option>
              <option value="subscription">Subscription</option>
            </select>
          </div>
          {pricing !== "free" && (
            <div><Label>Price (USD)</Label><Input type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button disabled={!name || loading}
            onClick={async () => {
              setLoading(true);
              const { error } = await supabase.rpc("create_marketplace_listing", {
                _publisher_id: publisherId, _name: name,
                _pricing_model: pricing,
                _base_price_cents: pricing === "free" ? 0 : Math.round(Number(price) * 100),
              });
              setLoading(false);
              if (error) toast.error(error.message);
              else { toast.success("Listing created"); onCreated(); setOpen(false); setName(""); setPrice("0"); setPricing("free"); }
            }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
