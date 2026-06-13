import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/policies/file-transfer")({
  head: () => ({ meta: [{ title: "File transfer policy — RemoteDesk" }] }),
  component: FileTransferPolicy,
});

function FileTransferPolicy() {
  const [enabled, setEnabled] = useState(true);
  const [requireApproval, setRequireApproval] = useState(true);
  const [maxSize, setMaxSize] = useState("100");
  const [direction, setDirection] = useState("both");
  const [extensions, setExtensions] = useState<string[]>(["exe", "bat", "ps1", "sh"]);
  const [newExt, setNewExt] = useState("");

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <PolicyCard
          icon={FileUp}
          title="File transfer"
          desc="Control when and how files can move between host and viewer during a remote session."
        >
          <Toggle label="Allow file transfer" desc="Master switch for all file transfer features." checked={enabled} onChange={setEnabled} />
          <Toggle label="Require host approval per transfer" desc="Each transfer prompts the host with file details before starting." checked={requireApproval} onChange={setRequireApproval} disabled={!enabled} />

          <div className="grid gap-4 pt-2 sm:grid-cols-2">
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Direction</Label>
              <Select value={direction} onValueChange={setDirection} disabled={!enabled}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="both">Both directions</SelectItem>
                  <SelectItem value="upload">Viewer → Host only</SelectItem>
                  <SelectItem value="download">Host → Viewer only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Max file size (MB)</Label>
              <Input type="number" min={1} className="mt-1.5" value={maxSize} onChange={(e) => setMaxSize(e.target.value)} disabled={!enabled} />
            </div>
          </div>
        </PolicyCard>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="text-sm font-semibold">Blocked file extensions</div>
          <p className="mt-1 text-sm text-muted-foreground">Transfers with these extensions are rejected automatically.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {extensions.map((e) => (
              <span key={e} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-mono">
                .{e}
                <button onClick={() => setExtensions(extensions.filter((x) => x !== e))} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </span>
            ))}
            {extensions.length === 0 && <span className="text-xs text-muted-foreground">No extensions blocked.</span>}
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              const v = newExt.trim().replace(/^\./, "").toLowerCase();
              if (!v) return;
              if (extensions.includes(v)) return toast.error("Already in list");
              setExtensions([...extensions, v]);
              setNewExt("");
            }}
          >
            <Input placeholder="e.g. dmg" value={newExt} onChange={(e) => setNewExt(e.target.value)} className="max-w-xs" />
            <Button type="submit" size="sm"><Plus className="mr-1.5 h-4 w-4" />Block</Button>
          </form>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="text-sm font-semibold">Scope</div>
          <p className="mt-1 text-sm text-muted-foreground">This policy applies organization-wide. Per-team overrides are available on Business and Enterprise plans.</p>
        </div>
        <Button className="w-full" onClick={() => toast.success("Policy saved")}>Save policy</Button>
      </div>
    </div>
  );
}

function PolicyCard({
  icon: Icon, title, desc, children,
}: { icon: typeof FileUp; title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <div className="text-base font-semibold">{title}</div>
          <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </div>
  );
}

function Toggle({
  label, desc, checked, onChange, disabled,
}: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div className={`flex items-start justify-between gap-4 rounded-md border border-border bg-background p-3 ${disabled ? "opacity-50" : ""}`}>
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
