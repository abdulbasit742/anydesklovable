import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck, Zap, MonitorSmartphone, MessageSquare, Activity, Users,
  FileText, OctagonAlert, Check, ArrowRight, Lock, Globe, Server,
} from "lucide-react";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { plans, formatRemoteDeskId } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RemoteDesk — Secure remote desktop for teams" },
      { name: "description", content: "RemoteDesk is a secure, fast, peer-to-peer remote desktop SaaS for IT support, distributed teams, and personal devices." },
      { property: "og:title", content: "RemoteDesk — Secure remote desktop for teams" },
      { property: "og:description", content: "Peer-to-peer WebRTC remote sessions with host approval, emergency stop, and audit logs." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <Hero />
      <LogosStrip />
      <Features />
      <HowItWorks />
      <Security />
      <PricingPreview />
      <CtaFooter />
      <MarketingFooter />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)/0.08,_transparent_60%)]" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success" /> End-to-end encrypted · WebRTC P2P
          </div>
          <h1 className="mt-5 text-5xl font-semibold tracking-tight sm:text-6xl">
            RemoteDesk
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Secure remote desktop SaaS for teams, support engineers, and personal devices.
            Connect to any machine with a 9-digit ID, approve every session, and stay in control.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/signup">Start free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/download">Download client</Link>
            </Button>
          </div>
          <dl className="mt-8 grid max-w-md grid-cols-3 gap-6 text-sm">
            {[
              ["P2P", "WebRTC sessions"],
              ["AES-256", "Stream encryption"],
              ["<60ms", "Median latency"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-semibold text-foreground">{k}</dt>
                <dd className="text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <ProductPreview />
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="rounded-xl border border-border bg-card p-2 shadow-xl shadow-primary/5">
      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
        <span className="ml-3 text-xs text-muted-foreground">app.remotedesk.io / dashboard</span>
      </div>
      <div className="grid grid-cols-[160px_1fr] gap-3 p-3">
        <div className="hidden rounded-md bg-sidebar p-3 text-sidebar-foreground sm:block">
          <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/50">Workspace</div>
          <ul className="mt-2 space-y-1 text-xs">
            <li className="rounded bg-sidebar-accent px-2 py-1.5 text-white">Overview</li>
            <li className="px-2 py-1.5">Devices</li>
            <li className="px-2 py-1.5">Sessions</li>
            <li className="px-2 py-1.5">Security</li>
            <li className="px-2 py-1.5">Team</li>
          </ul>
        </div>
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[["Devices", "3"], ["Sessions", "1"], ["Minutes", "248"]].map(([l, v]) => (
              <div key={l} className="rounded-md border border-border bg-background p-2">
                <div className="text-[10px] uppercase text-muted-foreground">{l}</div>
                <div className="text-lg font-semibold">{v}</div>
              </div>
            ))}
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="text-[10px] uppercase text-muted-foreground">Your RemoteDesk ID</div>
            <div className="mt-1 font-mono text-xl tracking-[0.2em]">{formatRemoteDeskId("482913706")}</div>
          </div>
          <div className="rounded-md border border-border bg-background p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">Abdul-PC</span>
              <span className="inline-flex items-center gap-1 text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> Connected · 18m
              </span>
            </div>
            <div className="mt-2 h-20 rounded bg-gradient-to-br from-primary/20 to-primary/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LogosStrip() {
  const logos = ["NorthBank", "Helios IT", "Acme Support", "Voltic", "Kestrel MSP", "Lumen Health"];
  return (
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 text-sm font-medium text-muted-foreground sm:px-6">
        <span className="text-xs uppercase tracking-wider">Trusted by IT teams at</span>
        {logos.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

function Features() {
  const items = [
    { icon: ShieldCheck, title: "Secure remote access", desc: "Every session is encrypted end-to-end and gated by host approval." },
    { icon: Zap, title: "Peer-to-peer WebRTC", desc: "Direct connections deliver low-latency video without proxying your screen." },
    { icon: MonitorSmartphone, title: "Host approval prompts", desc: "Connections require explicit accept from the device owner each time." },
    { icon: OctagonAlert, title: "Emergency stop", desc: "Kill any session instantly with a single keypress or panic button." },
    { icon: MessageSquare, title: "In-session chat", desc: "Coordinate with the host without leaving the remote view." },
    { icon: Activity, title: "Quality diagnostics", desc: "Live bitrate, latency, and packet-loss telemetry inside every session." },
    { icon: Users, title: "Team policies", desc: "Org-wide controls for who can connect, what they can do, and from where." },
    { icon: FileText, title: "Audit logs", desc: "Tamper-evident record of every connection, action, and policy change." },
  ];
  return (
    <section id="features" className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="Capabilities" title="Everything a serious remote session needs" />
        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((f) => (
            <div key={f.title} className="rounded-lg border border-border bg-card p-4">
              <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                <f.icon className="h-4 w-4" />
              </span>
              <div className="mt-3 text-sm font-semibold">{f.title}</div>
              <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Install desktop client", d: "Download RemoteDesk for Windows, macOS, or Linux. Code-signed and lightweight." },
    { n: "02", t: "Share your RemoteDesk ID", d: "A unique 9-digit ID identifies your device. No accounts required for the host." },
    { n: "03", t: "Accept the session request", d: "The host gets a clear prompt with the requester’s identity before anything starts." },
    { n: "04", t: "Control securely", d: "Stream the screen over WebRTC. Revoke input or end the session at any time." },
  ];
  return (
    <section id="how" className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="How it works" title="From install to first session in under a minute" />
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <li key={s.n} className="rounded-lg border border-border bg-card p-4">
              <div className="font-mono text-xs text-primary">{s.n}</div>
              <div className="mt-2 text-sm font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Security() {
  const items = [
    { icon: Lock, t: "Zero-trust by default", d: "Every session needs ID, device password, and live host approval." },
    { icon: Globe, t: "Peer-to-peer streaming", d: "Your screen does not pass through our servers when a direct path exists." },
    { icon: Server, t: "TURN fallback", d: "Encrypted relay servers in multiple regions keep sessions reliable behind strict NATs." },
  ];
  return (
    <section id="security" className="border-b border-border">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeader eyebrow="Security" title="Built so you stay in control of your machine" align="left" />
          <p className="mt-4 max-w-md text-muted-foreground">
            RemoteDesk treats the host’s consent as the source of truth. We make it obvious who is connecting,
            easy to refuse, and impossible to silently take over.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {items.map((i) => (
            <div key={i.t} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-md bg-primary/10 text-primary">
                  <i.icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold">{i.t}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{i.d}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionHeader eyebrow="Pricing" title="Simple plans for solo users, support teams, and enterprises" />
        <div className="mt-10 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`rounded-lg border bg-card p-5 ${p.highlight ? "border-primary ring-1 ring-primary" : "border-border"}`}
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{p.name}</div>
                {p.highlight && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Popular</span>
                )}
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <div className="text-2xl font-semibold">{p.price}</div>
                <div className="text-sm text-muted-foreground">{p.period}</div>
              </div>
              <div className="text-xs text-muted-foreground">{p.tagline}</div>
              <ul className="mt-4 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-success" />{f}</li>
                ))}
              </ul>
              <Button asChild className="mt-5 w-full" variant={p.highlight ? "default" : "outline"}>
                <Link to="/pricing">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaFooter() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-xl border border-border bg-sidebar p-8 text-sidebar-foreground sm:p-12">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                Take control of your remote sessions today.
              </h3>
              <p className="mt-2 text-sm text-sidebar-foreground/70">
                Free for personal use. Upgrade when your team is ready.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg"><Link to="/signup">Create account</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-sidebar-border bg-transparent text-white hover:bg-sidebar-accent">
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      <div className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
    </div>
  );
}
