import { createFileRoute } from "@tanstack/react-router";
import { Apple, Download as DownloadIcon, ShieldCheck } from "lucide-react";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download — RemoteDesk" },
      { name: "description", content: "Download the RemoteDesk desktop client for Windows, macOS, or Linux." },
    ],
  }),
  component: DownloadPage,
});

const platforms = [
  { name: "Windows", icon: WindowsIcon, file: "RemoteDesk-Setup-2.4.1.exe", size: "38.2 MB", arch: "x64 / ARM64" },
  { name: "macOS", icon: Apple, file: "RemoteDesk-2.4.1.dmg", size: "42.7 MB", arch: "Universal" },
  { name: "Linux", icon: LinuxIcon, file: "remotedesk_2.4.1_amd64.deb", size: "36.8 MB", arch: ".deb / .rpm / .AppImage" },
];

function DownloadPage() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">Desktop client</div>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Download RemoteDesk</h1>
            <p className="mt-3 text-muted-foreground">
              Code-signed installers for every major operating system. Version 2.4.1 · Released Jun 8, 2026.
            </p>
          </div>

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
                <Button className="mt-4 w-full" onClick={() => toast.success(`Downloading ${p.file}`)}>
                  <DownloadIcon className="mr-1.5 h-4 w-4" /> Download for {p.name}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="text-sm font-semibold">Install steps</div>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><span className="mr-2 font-mono text-xs text-primary">01</span> Download and run the installer for your OS.</li>
                <li><span className="mr-2 font-mono text-xs text-primary">02</span> Approve the system prompts (admin / accessibility).</li>
                <li><span className="mr-2 font-mono text-xs text-primary">03</span> Sign in or paste your account device token.</li>
                <li><span className="mr-2 font-mono text-xs text-primary">04</span> Set a device password and share your 9-digit ID.</li>
              </ol>
            </div>
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">Verified & code-signed</div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    All installers are signed by <span className="font-mono text-xs">RemoteDesk Technologies Inc.</span>
                    Verify the SHA-256 checksum on the release notes page before installing.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 rounded-lg border border-border bg-card p-5">
            <div className="text-sm font-semibold">Release notes — v2.4.1</div>
            <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <li>• New: in-session chat with file attachments</li>
              <li>• New: WebRTC quality diagnostics overlay</li>
              <li>• Improved: faster TURN failover on flaky networks</li>
              <li>• Fixed: clipboard sync race condition on macOS Sonoma</li>
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
