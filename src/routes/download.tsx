import { createFileRoute } from "@tanstack/react-router";
import { Apple, Download as DownloadIcon, ShieldCheck, AlertTriangle } from "lucide-react";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getFeatureFlags } from "@/lib/config/feature-flags";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download — RemoteDesk" },
      { name: "description", content: "Download the RemoteDesk desktop client when release downloads are enabled." },
    ],
  }),
  component: DownloadPage,
});

const platforms = [
  { name: "Windows", icon: WindowsIcon, file: "RemoteDesk-Setup-beta.exe", size: "Pending", arch: "x64 / ARM64" },
  { name: "macOS", icon: Apple, file: "RemoteDesk-beta.dmg", size: "Pending", arch: "Universal" },
  { name: "Linux", icon: LinuxIcon, file: "remotedesk_beta_amd64.deb", size: "Pending", arch: ".deb / .rpm / .AppImage" },
];

function DownloadPage() {
  const flags = getFeatureFlags();
  const downloadsEnabled = flags.releaseDownloadEnabled;

  const handleDownload = (file: string) => {
    if (!downloadsEnabled) {
      toast.error("Release downloads are currently disabled for this beta.");
      return;
    }
    toast.success(`Preparing ${file}. Verify checksum before installing.`);
  };

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Desktop client</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Download RemoteDesk</h1>
            <p className="mt-3 text-muted-foreground">
              Controlled beta downloads are shown only when release downloads are enabled and verified by the admin team.
            </p>
          </div>

          {!downloadsEnabled && (
            <div className="mx-auto mt-8 max-w-3xl rounded-lg border border-amber-300/70 bg-amber-50 p-4 text-amber-950">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <div className="font-medium">Downloads are currently gated</div>
                  <p className="mt-1 text-sm text-amber-900/80">
                    The desktop client is not publicly available from this page until beta release metadata, checksum verification, and rollout approval are complete.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-10 grid gap-3 md:grid-cols-3">
            {platforms.map((p) => (
              <div key={p.name} className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-md bg-primary/10 text-primary">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.arch}</div>
                  </div>
                </div>
                <div className="mt-4 rounded-md border border-border bg-muted/40 p-2 font-mono text-xs">
                  {p.file} · {p.size}
                </div>
                <Button className="mt-4 w-full" disabled={!downloadsEnabled} onClick={() => handleDownload(p.file)}>
                  <DownloadIcon className="mr-1.5 h-4 w-4" /> {downloadsEnabled ? `Download for ${p.name}` : "Download gated"}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold">Beta install checklist</div>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><span className="mr-2 font-mono text-xs text-primary">01</span> Confirm your team is approved for beta access.</li>
                <li><span className="mr-2 font-mono text-xs text-primary">02</span> Download only from a verified release record with checksum.</li>
                <li><span className="mr-2 font-mono text-xs text-primary">03</span> Use test or non-critical devices during beta.</li>
                <li><span className="mr-2 font-mono text-xs text-primary">04</span> Verify host consent and Emergency Stop before any test session.</li>
              </ol>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">Verification required</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Installers must have release metadata, checksum, and approval status before public download is enabled. Do not install unverified artifacts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold">Current beta limitations</div>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>• Downloads may remain gated until release metadata and checksums are verified.</li>
              <li>• Use only on test or non-critical machines during beta.</li>
              <li>• Host consent and Emergency Stop validation are required before session testing.</li>
              <li>• Report issues through Support without pasting passwords, tokens, or private keys.</li>
            </ul>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}

function WindowsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M3 5.5l8-1.1v7.4H3V5.5zM3 12.2h8v7.4l-8-1.1v-6.3zM12 4.3l9-1.3v9H12V4.3zM12 12.2h9v9l-9-1.3v-7.7z" />
    </svg>
  );
}
function LinuxIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c2 0 3 2 3 4 0 1.7-.9 2.7-1.6 3.6.7.7 2 2 2.8 3.7.7 1.6.8 3.3 1.6 4.3.8 1 1.5 1.2 1.5 1.7s-1 .7-1.8.7c-.7 0-1.3-.3-1.6-.6-.4 1-1.7 2.6-5 2.6s-4.6-1.6-5-2.6c-.3.3-.9.6-1.6.6-.8 0-1.8-.2-1.8-.7s.7-.7 1.5-1.7c.8-1 .9-2.7 1.6-4.3.8-1.7 2.1-3 2.8-3.7C9.9 8.7 9 7.7 9 6c0-2 1-4 3-4z" />
    </svg>
  );
}
