import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Copy, Code2, Terminal, KeyRound, BookOpen } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/developer")({
  head: () => ({ meta: [{ title: "Developer & SDK — RemoteDesk" }] }),
  component: DeveloperPage,
});

const SNIPPETS = {
  install: `# npm\nnpm install @remotedesk/sdk\n\n# pnpm\npnpm add @remotedesk/sdk\n\n# bun\nbun add @remotedesk/sdk`,
  init: `import { RemoteDeskAPI } from "@remotedesk/sdk";\n\nexport const rd = new RemoteDeskAPI({\n  apiKey: process.env.REMOTEDESK_API_KEY!,\n  baseUrl: "https://api.remotedesk.io/v1",\n});`,
  auth: `// Sign up\nconst { user, session } = await rd.auth.signUp({\n  email: "alex@example.com",\n  password: "••••••••",\n});\n\n// Login\nconst { session } = await rd.auth.signIn({\n  email: "alex@example.com",\n  password: "••••••••",\n});\n\n// Sign out\nawait rd.auth.signOut();`,
  sessions: `// List recent remote sessions for the current team\nconst { data: sessions } = await rd.sessions.list({\n  teamId: "<team-id>",\n  limit: 20,\n  order: "started_at.desc",\n});\n\n// Stream live session events\nconst stream = rd.sessions.subscribe({ teamId }, (event) => {\n  console.log(event.type, event.session_id);\n});`,
  devices: `// Lookup a device by RemoteDesk ID\nconst device = await rd.devices.getByRemoteDeskId("123 456 789");\n\n// Connect (returns a signed launch URL)\nconst launch = await rd.devices.connect({\n  remoteDeskId: device.remote_desk_id,\n  mode: "view-only",\n});\nwindow.location.href = launch.url;`,
};

function DeveloperPage() {
  return (
    <AppShell title="Developer & SDK">
      <div className="rounded-2xl border border-border bg-gradient-to-br from-card to-muted/40 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"><Code2 className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-semibold">Build with the RemoteDesk SDK</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
              Programmatic access to devices, sessions, contacts, and auth. Use the snippets below to get started in minutes.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline">TypeScript</Badge>
              <Badge variant="outline">Node 18+</Badge>
              <Badge variant="outline">Edge runtimes</Badge>
              <Badge variant="secondary">v1 stable</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Snippet icon={<Terminal className="h-4 w-4" />} title="1 · Install" code={SNIPPETS.install} />
          <Snippet icon={<KeyRound className="h-4 w-4" />} title="2 · Initialize" code={SNIPPETS.init} />
          <Snippet icon={<Code2 className="h-4 w-4" />} title="3 · Auth — sign up, login, sign out" code={SNIPPETS.auth} />
          <Snippet icon={<Code2 className="h-4 w-4" />} title="4 · Sessions history" code={SNIPPETS.sessions} />
          <Snippet icon={<Code2 className="h-4 w-4" />} title="5 · Device lookup & connect" code={SNIPPETS.devices} />
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold"><BookOpen className="h-4 w-4" /> Docs</div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>· REST API reference</li>
              <li>· SDK guides (Node, browser, Workers)</li>
              <li>· Webhooks &amp; events</li>
              <li>· Rate limits &amp; quotas</li>
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <div className="flex items-center gap-2 font-semibold"><KeyRound className="h-4 w-4" /> API keys</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Generate and rotate API keys from the Admin console. Keys are scoped to a single workspace and respect team RLS.
            </p>
          </div>
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
            The npm package <code className="font-mono">@remotedesk/sdk</code> is a planned wrapper around the public REST API. Until it ships, you can call the same endpoints directly with <code className="font-mono">fetch</code>.
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Snippet({ icon, title, code }: { icon: React.ReactNode; title: string; code: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Copied");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2 text-sm font-semibold">{icon}{title}</div>
        <Button size="sm" variant="ghost" onClick={copy}><Copy className="mr-1 h-3.5 w-3.5" />{copied ? "Copied" : "Copy"}</Button>
      </div>
      <pre className="overflow-x-auto bg-muted/30 px-4 py-3 text-xs leading-relaxed text-foreground/90"><code>{code}</code></pre>
    </div>
  );
}
