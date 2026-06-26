import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Globe, Copy, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/dashboard/customer-portal")({
  head: () => ({ meta: [{ title: "Customer Portal Settings — RemoteDesk" }] }),
  component: CustomerPortal,
});

function CustomerPortal() {
  const [settings, setSettings] = useState({
    customDomain: "support.company.com",
    brandName: "Company Support",
    logoUrl: "https://company.com/logo.png",
    primaryColor: "#3b82f6",
    enableSelfService: true,
    enableTicketSubmission: true,
    enableKB: true,
    enableCommunity: false,
    footerText: "© 2026 Company Inc. All rights reserved.",
  });

  const portalUrl = `https://${settings.customDomain}`;

  return (
    <AppShell title="Customer Portal Settings">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Settings */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Customer Portal</h2>
            <p className="text-sm text-muted-foreground">White-label support portal for your customers</p>
          </div>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Branding</h3>

            <div>
              <Label>Brand Name</Label>
              <Input
                value={settings.brandName}
                onChange={(e) => setSettings({ ...settings, brandName: e.target.value })}
              />
            </div>

            <div>
              <Label>Logo URL</Label>
              <Input
                value={settings.logoUrl}
                onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label>Primary Color</Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  className="h-10 w-20 cursor-pointer rounded border"
                />
                <Input
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Footer Text</Label>
              <Textarea
                value={settings.footerText}
                onChange={(e) => setSettings({ ...settings, footerText: e.target.value })}
                rows={2}
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Features</h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Self-Service Portal</Label>
                <Switch
                  checked={settings.enableSelfService}
                  onCheckedChange={(v) => setSettings({ ...settings, enableSelfService: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Ticket Submission</Label>
                <Switch
                  checked={settings.enableTicketSubmission}
                  onCheckedChange={(v) => setSettings({ ...settings, enableTicketSubmission: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Knowledge Base</Label>
                <Switch
                  checked={settings.enableKB}
                  onCheckedChange={(v) => setSettings({ ...settings, enableKB: v })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Community Forum</Label>
                <Switch
                  checked={settings.enableCommunity}
                  onCheckedChange={(v) => setSettings({ ...settings, enableCommunity: v })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Custom Domain</h3>

            <div>
              <Label>Domain</Label>
              <Input
                value={settings.customDomain}
                onChange={(e) => setSettings({ ...settings, customDomain: e.target.value })}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Point your DNS CNAME record to: portal.remotedesk.io
              </p>
            </div>

            <Button>Verify Domain</Button>
          </Card>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Cancel
            </Button>
            <Button className="flex-1">Save Settings</Button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <Card className="p-6 space-y-4">
            <h3 className="font-semibold">Portal Preview</h3>

            <div className="rounded-lg border border-border bg-slate-50 p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">{portalUrl}</span>
                </div>

                <div className="rounded bg-white p-3">
                  <div
                    className="h-12 rounded-t text-white flex items-center px-3"
                    style={{ backgroundColor: settings.primaryColor }}
                  >
                    <span className="font-semibold">{settings.brandName}</span>
                  </div>
                  <div className="space-y-2 rounded-b border border-t-0 border-gray-200 p-3 text-xs">
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>✓ Ticket Submission</p>
                  <p>✓ Knowledge Base</p>
                  <p>✓ Self-Service</p>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Portal
            </Button>

            <Button variant="outline" className="w-full">
              <Copy className="mr-2 h-4 w-4" />
              Copy Portal URL
            </Button>
          </Card>

          <Card className="p-6 space-y-3">
            <h3 className="font-semibold text-sm">Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Domain</span>
                <Badge variant="outline" className="bg-green-50">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>SSL Certificate</span>
                <Badge variant="outline" className="bg-green-50">
                  Valid
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Uptime</span>
                <Badge variant="outline" className="bg-green-50">
                  99.9%
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
