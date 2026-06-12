import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <Link to="/" hash="features" className="hover:text-foreground">Features</Link>
            <Link to="/" hash="how" className="hover:text-foreground">How it works</Link>
            <Link to="/" hash="security" className="hover:text-foreground">Security</Link>
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/download" className="hover:text-foreground">Download</Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline">Sign in</Link>
          <Button asChild size="sm" variant="outline" className="hidden sm:inline-flex">
            <Link to="/download"><Download className="mr-1.5 h-4 w-4" />Download</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Secure remote desktop SaaS for teams, support, and personal devices.
          </p>
        </div>
        <FooterCol title="Product" links={[["Features", "/"], ["Pricing", "/pricing"], ["Download", "/download"]]} />
        <FooterCol title="Account" links={[["Sign in", "/login"], ["Sign up", "/signup"], ["Forgot password", "/forgot-password"]]} />
        <FooterCol title="Workspace" links={[["Dashboard", "/dashboard"], ["Devices", "/dashboard/devices"], ["Team", "/dashboard/team"]]} />
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:px-6">
          <span>© 2026 RemoteDesk. All rights reserved.</span>
          <span>End-to-end encrypted • SOC 2 ready</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link to={href} className="hover:text-foreground">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
