import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Smartphone, Tablet, ShieldCheck, ShieldOff, Trash2, RefreshCw, AlertCircle, QrCode, Copy, Plus } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/mobile")({
  head: () => ({ meta: [{ title: "Mobile access — RemoteDesk" }] }),
  component: MobilePage,
});

type MobileDevice = {
  id: string;
  user_id: string;
  device_label: string;
  platform: "ios" | "android" | "ipados" | "other";
  app_version: string | null;
  last_seen_at: string | null;
  trusted: boolean;
  trusted_at: string | null;
  revoked_at: string | null;
  pairing_code: string | null;
  pairing_expires_at: string | null;
  created_at: string;
};

function useMobileDevices() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["mobile_devices", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<MobileDevice[]> => {
      const { data, error } = await supabase
        .from("mobile_devices")
        .select("*")
        .order("trusted", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as MobileDevice[]) ?? [];
    },
  });
}

function fmt(d?: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleString();
}

function platformIcon(p: MobileDevice["platform"]) {
  if (p === "ipados") return <Tablet className="h-4 w-4" />;
  return <Smartphone className="h-4 w-4" />;
}

function genPairingCode() {
  const a = Math.floor(100 + Math.random() * 900);
  const b = Math.floor(100 + Math.random() * 900);
  const c = Math.floor(100 + Math.random() * 900);
  return `${a}-${b}-${c}`;
}

function MobilePage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const devices = useMobileDevices();
  const [pairing, setPairing] = useState<{ code: string; expires: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["mobile_devices"] });

  const startPairing = async () => {
    if (!user) return toast.error("Sign in first.");
    setBusy(true);
    const code = genPairingCode();
    const expires = new Date(Date.now() + 10 * 60_000).toISOString();
    const { error } = await supabase.from("mobile_devices").insert({
      user_id: user.id,
      device_label: "Pending mobile device",
      platform: "other",
      pairing_code: code,
      pairing_expires_at: expires,
      trusted: false,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setPairing({ code, expires });
    invalidate();
  };

  const setTrusted = async (d: MobileDevice, trusted: boolean) => {
    const { error } = await supabase.from("mobile_devices").update({
      trusted, trusted_at: trusted ? new Date().toISOString() : null,
      revoked_at: trusted ? null : new Date().toISOString(),
    }).eq("id", d.id);
    if (error) return toast.error(error.message);
    toast.success(trusted ? "Device trusted" : "Trust revoked");
    invalidate();
  };

  const remove = async (d: MobileDevice) => {
    if (!confirm(`Remove "${d.device_label}"?`)) return;
    const { error } = await supabase.from("mobile_devices").delete().eq("id", d.id);
    if (error) return toast.error(error.message);
    toast.success("Device removed");
    invalidate();
  };

  const list = devices.data ?? [];

  return (
    <AppShell title="Mobile access">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Paired mobile devices</div>
              <div className="text-xs text-muted-foreground">Phones and tablets that can sign in to your RemoteDesk account.</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => devices.refetch()} disabled={devices.isLoading}>
              <RefreshCw className={`h-3.5 w-3.5 ${devices.isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {devices.isLoading && (
            <div className="space-y-2 p-4">
              {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          )}
          {!devices.isLoading && devices.error && (
            <div className="px-4 py-10 text-center text-sm text-destructive">
              <AlertCircle className="mx-auto mb-2 h-5 w-5" />{(devices.error as Error).message}
            </div>
          )}
          {!devices.isLoading && !devices.error && list.length === 0 && (
            <div className="px-4 py-14 text-center text-sm text-muted-foreground">
              <Smartphone className="mx-auto mb-2 h-6 w-6 opacity-60" />
              No mobile devices paired yet. Use the panel on the right to set one up.
            </div>
          )}
          {!devices.isLoading && !devices.error && list.length > 0 && (
            <div className="divide-y divide-border">
              {list.map((d) => (
                <div key={d.id} className="flex flex-wrap items-center gap-3 p-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted">{platformIcon(d.platform)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      {d.device_label}
                      {d.trusted ? (
                        <Badge variant="default" className="text-[10px]"><ShieldCheck className="mr-1 h-3 w-3" />Trusted</Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">Pending</Badge>
                      )}
                      {d.pairing_code && !d.trusted && (
                        <Badge variant="secondary" className="font-mono text-[10px]">{d.pairing_code}</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {d.platform.toUpperCase()} · v{d.app_version ?? "—"} · last seen {fmt(d.last_seen_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {d.trusted ? (
                      <Button size="sm" variant="outline" onClick={() => setTrusted(d, false)}>
                        <ShieldOff className="mr-1 h-3.5 w-3.5" />Revoke trust
                      </Button>
                    ) : (
                      <Button size="sm" onClick={() => setTrusted(d, true)}>
                        <ShieldCheck className="mr-1 h-3.5 w-3.5" />Trust
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => remove(d)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-center gap-2 text-sm font-semibold"><QrCode className="h-4 w-4" /> Pair a new device</div>
            <p className="mt-1 text-xs text-muted-foreground">Open the RemoteDesk mobile app and enter the pairing code below. Codes expire after 10 minutes.</p>
            <Button className="mt-3 w-full" onClick={startPairing} disabled={busy || !user}>
              <Plus className="mr-1 h-4 w-4" />{busy ? "Generating…" : "Generate pairing code"}
            </Button>
            {pairing && (
              <div className="mt-4 rounded-md border border-dashed border-primary/40 bg-primary/5 p-4 text-center">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Pairing code</div>
                <div className="my-2 font-mono text-2xl font-semibold tracking-widest">{pairing.code}</div>
                <div className="text-[11px] text-muted-foreground">Expires {new Date(pairing.expires).toLocaleTimeString()}</div>
                <Button size="sm" variant="outline" className="mt-3" onClick={() => { navigator.clipboard.writeText(pairing.code); toast.success("Copied"); }}>
                  <Copy className="mr-1 h-3.5 w-3.5" />Copy
                </Button>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="font-semibold">Install the app</div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>· iOS / iPadOS: App Store — "RemoteDesk"</li>
              <li>· Android: Google Play — "RemoteDesk"</li>
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">After install, sign in with your account and enter the pairing code above.</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
