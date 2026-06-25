import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ShieldCheck, Zap, MonitorSmartphone, MessageSquare, Activity, Users,
  FileText, OctagonAlert, Check, ArrowRight, Lock, Globe, Server,
  Copy, Wifi, CircleDot, ChevronRight,
} from "lucide-react";
import { MarketingNav, MarketingFooter } from "@/components/marketing/MarketingNav";
import { Button } from "@/components/ui/button";
import { formatRemoteDeskId } from "@/lib/formatting/remote-desk-id";
import { usePlanLimits, type PlanLimit } from "@/lib/services";

function mapPlansForLanding(limits: PlanLimit[]) {
  return limits.map((p) => ({
    name: p.display_name,
    price: p.monthly_price === null ? "Custom" : p.monthly_price === 0 ? "$0" : `$${p.monthly_price}`,
    period: p.monthly_price === null ? "" : "/mo",
    tagline: p.plan_key === "free" ? "Personal use" : p.plan_key === "pro" ? "Power users" : p.plan_key === "business" ? "Teams & support" : "Large orgs",
    highlight: p.plan_key === "pro",
    features: [
      p.max_devices ? `${p.max_devices} device${p.max_devices > 1 ? "s" : ""}` : "Unlimited devices",
      p.max_monthly_session_minutes ? `${p.max_monthly_session_minutes} min session limit` : "Unlimited sessions",
      p.can_use_file_transfer ? "File transfer" : undefined,
      p.can_use_team_management ? "Team management" : undefined,
      p.can_use_priority_support ? "Priority support" : undefined,
    ].filter(Boolean) as string[],
    cta: p.plan_key === "enterprise" ? "Contact sales" : p.plan_key === "free" ? "Get started" : `Upgrade to ${p.display_name}`,
  }));
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "RemoteDesk — Secure remote desktop for teams" },
      { name: "description", content: "RemoteDesk is a secure, peer-to-peer remote desktop SaaS for IT support, distributed teams, and personal devices. AES-256 streaming over WebRTC." },
      { property: "og:title", content: "RemoteDesk — Secure remote desktop for teams" },
      { property: "og:description", content: "Peer-to-peer WebRTC remote sessions with host approval, emergency stop, and audit logs." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />
      <Hero />
      <LogosStrip />
      <Bento />
      <HowItWorks />
      <Security />
      <PricingPreview />
      <CtaFooter />
      <MarketingFooter />
    </div>
  );
}

/* ---------------- HERO ---------------- */

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 -z-10 bg-mesh" />
      <div className="absolute inset-0 -z-10 grid-pattern opacity-60 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]" />

      <div className="mx-auto grid max-w-7xl gap-14 px-4 pt-20 pb-24 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-10 lg:pt-28">
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            E2E encrypted · WebRTC P2P · SOC 2 ready
          </div>

          <h1 className="mt-6 font-display text-[clamp(2.75rem,6vw,4.75rem)] font-bold leading-[1.02] tracking-tight">
            Remote access,{" "}
            <span className="text-gradient">re-engineered</span> for the way
            teams actually work.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-muted-foreground">
            RemoteDesk gives you instant, encrypted access to any machine with a
            9-digit ID. Approve every session, monitor live quality, and stay in
            control — for solo engineers, MSPs, and global support teams.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:opacity-95">
              <Link to="/signup">Start free <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border/70 bg-card/40 backdrop-blur">
              <Link to="/download">Download client</Link>
            </Button>
          </div>

          <dl className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-border/60 pt-6">
            {[
              ["<60ms", "Median latency"],
              ["AES-256", "Stream encryption"],
              ["12k+", "Devices connected"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-display text-2xl font-bold">{k}</dt>
                <dd className="text-xs uppercase tracking-wider text-muted-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <HeroProduct />
      </div>
    </section>
  );
}

function HeroProduct() {
  return (
    <div className="relative">
      {/* glow */}
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-[image:var(--gradient-primary)] opacity-20 blur-3xl" />
      <div className="relative rounded-2xl border border-border/70 bg-card/80 p-2.5 shadow-[var(--shadow-elegant)] backdrop-blur">
        {/* window chrome */}
        <div className="flex items-center gap-1.5 border-b border-border/60 px-3 pb-2 pt-1">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
          <span className="ml-3 font-mono text-[11px] text-muted-foreground">app.remotedesk.io / session</span>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">
            <CircleDot className="h-3 w-3" /> Live
          </span>
        </div>

        {/* main */}
        <div className="grid grid-cols-1 gap-2.5 p-2.5 sm:grid-cols-[140px_1fr]">
          {/* sidebar */}
          <div className="hidden rounded-xl bg-sidebar p-3 text-sidebar-foreground sm:block">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">Workspace</div>
            <ul className="mt-3 space-y-0.5 text-xs">
              {[
                ["Overview", true], ["Devices", false], ["Sessions", false],
                ["Security", false], ["Team", false], ["Billing", false],
              ].map(([label, active]) => (
                <li key={label as string} className={`flex items-center gap-2 rounded-md px-2 py-1.5 ${active ? "bg-sidebar-accent text-white" : "text-sidebar-foreground/70"}`}>
                  <span className={`h-1 w-1 rounded-full ${active ? "bg-primary-glow" : "bg-sidebar-foreground/30"}`} />
                  {label as string}
                </li>
              ))}
            </ul>
          </div>

          {/* content */}
          <div className="space-y-2.5">
            {/* ID card */}
            <div className="relative overflow-hidden rounded-xl border border-border/60 bg-[image:var(--gradient-primary)] p-3.5 text-primary-foreground">
              <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wider opacity-80">
                <span>Your RemoteDesk ID</span>
                <Copy className="h-3 w-3" />
              </div>
              <div className="mt-1.5 font-mono text-2xl font-semibold tracking-[0.18em]">
                {formatRemoteDeskId("482913706")}
              </div>
              <div className="mt-1 text-[10px] opacity-80">Tap to copy · Rotates every 24h</div>
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl" />
            </div>

            {/* live session */}
            <div className="rounded-xl border border-border/60 bg-background/70 p-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/15 text-primary">
                    <MonitorSmartphone className="h-3 w-3" />
                  </span>
                  <span className="font-semibold">Abdul-PC</span>
                  <span className="text-muted-foreground">· Windows 11</span>
                </div>
                <span className="inline-flex items-center gap-1 text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> 18m
                </span>
              </div>
              <div className="relative mt-2 h-24 overflow-hidden rounded-lg bg-gradient-to-br from-primary/25 via-primary/10 to-transparent">
                <div className="absolute inset-0 grid-pattern opacity-50" />
                <div className="absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-md bg-background/70 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur">
                  <Wifi className="h-3 w-3 text-success" /> 42 ms · 8.2 Mbps
                </div>
              </div>
            </div>

            {/* metrics */}
            <div className="grid grid-cols-3 gap-2">
              {[["Devices", "3"], ["Sessions", "1"], ["Minutes", "248"]].map(([l, v]) => (
                <div key={l} className="rounded-lg border border-border/60 bg-background/70 p-2">
                  <div className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">{l}</div>
                  <div className="font-display text-lg font-semibold">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating chip */}
      <div className="absolute -bottom-4 -left-4 hidden items-center gap-2 rounded-xl border border-border/70 bg-card/90 px-3 py-2 text-xs shadow-[var(--shadow-elegant)] backdrop-blur sm:flex">
        <ShieldCheck className="h-4 w-4 text-success" />
        <div>
          <div className="font-semibold">Host approved</div>
          <div className="text-[10px] text-muted-foreground">Abdul Basit · just now</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- LOGOS ---------------- */

function LogosStrip() {
  const logos = ["NorthBank", "Helios IT", "Acme Support", "Voltic", "Kestrel MSP", "Lumen Health"];
  return (
    <div className="border-b border-border/60 bg-card/30">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-7 text-sm font-medium text-muted-foreground sm:px-6">
        <span className="text-[10px] uppercase tracking-[0.2em]">Trusted by IT teams at</span>
        {logos.map((l) => <span key={l} className="font-display font-semibold opacity-70 transition-opacity hover:opacity-100">{l}</span>)}
      </div>
    </div>
  );
}

/* ---------------- BENTO FEATURES ---------------- */

function Bento() {
  return (
    <section id="features" className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeader eyebrow="Capabilities" title="Everything a serious remote session needs." />

        <div className="mt-12 grid auto-rows-[160px] grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Big — Secure access */}
          <BentoCard className="sm:col-span-2 lg:row-span-2" icon={ShieldCheck} title="Zero-trust remote access" desc="Every session is encrypted end-to-end and gated by host approval — no silent takeovers, ever.">
            <div className="mt-4 space-y-1.5">
              {["Device password required", "Live host approval prompt", "Per-session permissions"].map((t) => (
                <div key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="h-3.5 w-3.5 text-success" /> {t}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* WebRTC */}
          <BentoCard icon={Zap} title="Peer-to-peer WebRTC" desc="Direct connections, low latency, no screen proxying." />

          {/* Emergency stop */}
          <BentoCard icon={OctagonAlert} title="Emergency stop" desc="Kill any session instantly with one keypress.">
            <div className="mt-3 flex items-center gap-1.5">
              {["Ctrl", "Shift", "."].map((k) => (
                <kbd key={k} className="rounded-md border border-border/70 bg-background/60 px-1.5 py-0.5 font-mono text-[10px]">{k}</kbd>
              ))}
            </div>
          </BentoCard>

          {/* Diagnostics — wide */}
          <BentoCard className="sm:col-span-2" icon={Activity} title="Quality diagnostics" desc="Live bitrate, latency, and packet-loss telemetry inside every session.">
            <div className="mt-3 flex h-10 items-end gap-1">
              {[40, 65, 55, 80, 70, 90, 75, 95, 82, 88, 72, 96].map((h, i) => (
                <span key={i} className="w-2 rounded-sm bg-[image:var(--gradient-primary)]" style={{ height: `${h}%` }} />
              ))}
            </div>
          </BentoCard>

          {/* Chat */}
          <BentoCard icon={MessageSquare} title="In-session chat" desc="Coordinate with the host without leaving the view." />

          {/* Audit */}
          <BentoCard icon={FileText} title="Tamper-evident audit logs" desc="Every connection, action, and policy change recorded." />

          {/* Team */}
          <BentoCard icon={Users} title="Org-wide policies" desc="Control who connects, what they do, and from where." />

          {/* Host approval */}
          <BentoCard icon={MonitorSmartphone} title="Always-on consent" desc="Hosts see who's requesting before anything happens." />
        </div>
      </div>
    </section>
  );
}

function BentoCard({
  icon: Icon, title, desc, className = "", children,
}: { icon: typeof ShieldCheck; title: string; desc: string; className?: string; children?: React.ReactNode }) {
  return (
    <div className={`group relative flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
        <Icon className="h-4 w-4" />
      </span>
      <div className="mt-4 font-display text-base font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      {children}
      <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-[image:var(--gradient-primary)] opacity-0 blur-3xl transition-opacity group-hover:opacity-20" />
    </div>
  );
}

/* ---------------- HOW IT WORKS ---------------- */

function HowItWorks() {
  const steps = [
    { n: "01", t: "Install desktop client", d: "Code-signed builds for Windows, macOS, and Linux. Under 30MB." },
    { n: "02", t: "Share your 9-digit ID", d: "Each device has a unique RemoteDesk ID. No account needed for the host." },
    { n: "03", t: "Host accepts the request", d: "Clear prompt with requester identity, device, and requested permissions." },
    { n: "04", t: "Control securely", d: "Stream over WebRTC. Revoke input or end the session instantly." },
  ];
  return (
    <section id="how" className="relative border-b border-border/60">
      <div className="absolute inset-0 -z-10 bg-mesh opacity-50" />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeader eyebrow="How it works" title="From install to first session in under a minute." />
        <ol className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.n} className="relative rounded-2xl border border-border/60 bg-card/60 p-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary">{s.n}</span>
                {i < steps.length - 1 && <ChevronRight className="hidden h-4 w-4 text-muted-foreground/50 lg:block" />}
              </div>
              <div className="mt-3 font-display text-base font-semibold">{s.t}</div>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ---------------- SECURITY ---------------- */

function Security() {
  const items = [
    { icon: Lock, t: "Zero-trust by default", d: "Every session needs ID, device password, and live host approval." },
    { icon: Globe, t: "Peer-to-peer streaming", d: "Your screen does not pass through our servers when a direct path exists." },
    { icon: Server, t: "TURN fallback", d: "Encrypted relay servers in multiple regions keep sessions reliable behind strict NATs." },
  ];
  return (
    <section id="security" className="border-b border-border/60">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <SectionHeader eyebrow="Security" title="Built so you stay in control of your machine." align="left" />
          <p className="mt-5 max-w-md text-muted-foreground">
            RemoteDesk treats host consent as the source of truth. We make it
            obvious who is connecting, easy to refuse, and impossible to
            silently take over.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" /> SOC 2 Type II controls in flight
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          {items.map((i) => (
            <div key={i.t} className="rounded-2xl border border-border/60 bg-card/60 p-5">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-inset ring-primary/20">
                  <i.icon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <div className="font-display text-base font-semibold">{i.t}</div>
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

/* ---------------- PRICING ---------------- */

function PricingPreview() {
  const { data: planLimits } = usePlanLimits();
  const plans = mapPlansForLanding(planLimits);

  return (
    <section className="border-b border-border/60 bg-card/20">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeader eyebrow="Pricing" title="Simple plans for solo users, support teams, and enterprises." />
        <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`relative flex flex-col rounded-2xl border bg-card/70 p-6 ${
                p.highlight
                  ? "border-primary/60 shadow-[var(--shadow-glow)]"
                  : "border-border/60"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[image:var(--gradient-primary)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow-[var(--shadow-glow)]">
                  Popular
                </span>
              )}
              <div className="font-display text-sm font-semibold">{p.name}</div>
              <div className="mt-3 flex items-baseline gap-1">
                <div className="font-display text-3xl font-bold">{p.price}</div>
                <div className="text-sm text-muted-foreground">{p.period}</div>
              </div>
              <div className="text-xs text-muted-foreground">{p.tagline}</div>
              <ul className="mt-5 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-success" />{f}</li>
                ))}
              </ul>
              <Button
                asChild
                className={`mt-6 w-full ${p.highlight ? "bg-[image:var(--gradient-primary)] hover:opacity-95" : ""}`}
                variant={p.highlight ? "default" : "outline"}
              >
                <Link to="/pricing">{p.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA ---------------- */

function CtaFooter() {
  return (
    <section className="border-b border-border/60">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-sidebar p-10 text-sidebar-foreground sm:p-14">
          <div className="absolute inset-0 -z-10 bg-mesh opacity-80" />
          <div className="absolute inset-0 -z-10 grid-pattern opacity-40" />
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-xl">
              <h3 className="font-display text-3xl font-bold text-white sm:text-4xl">
                Take control of your remote sessions today.
              </h3>
              <p className="mt-3 text-sm text-sidebar-foreground/70">
                Free for personal use. Upgrade when your team is ready.
              </p>
            </div>
            <div className="flex gap-3">
              <Button asChild size="lg" className="bg-[image:var(--gradient-primary)] shadow-[var(--shadow-glow)] hover:opacity-95">
                <Link to="/signup">Create account</Link>
              </Button>
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

/* ---------------- HEADER ---------------- */

function SectionHeader({ eyebrow, title, align = "center" }: { eyebrow: string; title: string; align?: "left" | "center" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : ""}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
    </div>
  );
}
