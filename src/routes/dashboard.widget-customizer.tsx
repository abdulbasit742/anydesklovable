import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Eye } from "lucide-react";

export const Route = createFileRoute("/dashboard/widget-customizer")({
  head: () => ({ meta: [{ title: "Widget Customizer — RemoteDesk" }] }),
  component: WidgetCustomizer,
});

function WidgetCustomizer() {
  const [settings, setSettings] = useState({
    position: "bottom-right",
    primaryColor: "#3b82f6",
    secondaryColor: "#f3f4f6",
    title: "How can we help?",
    subtitle: "Chat with our support team",
    welcomeMessage: "Welcome! How can I assist you today?",
    offlineMessage: "We're currently offline. Please leave a message and we'll get back to you soon.",
    showAvatar: true,
    showRatings: true,
  });

  const embedCode = `<script>
  window.RemoteDeskWidget = {
    position: "${settings.position}",
    primaryColor: "${settings.primaryColor}",
    title: "${settings.title}",
  };
  (function() {
    var s = document.createElement('script');
    s.src = 'https://widget.remotedesk.io/embed.js';
    document.head.appendChild(s);
  })();
</script>`;

  return (
    <AppShell title="Widget Customizer">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Settings Panel */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Live Chat Widget</h2>
            <p className="text-sm text-muted-foreground">Customize the appearance and behavior of your chat widget</p>
          </div>

          <Card className="p-6 space-y-4">
            <div>
              <Label>Position</Label>
              <Select value={settings.position} onValueChange={(v) => setSettings({ ...settings, position: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bottom-right">Bottom Right</SelectItem>
                  <SelectItem value="bottom-left">Bottom Left</SelectItem>
                  <SelectItem value="top-right">Top Right</SelectItem>
                  <SelectItem value="top-left">Top Left</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>Widget Title</Label>
              <Input
                value={settings.title}
                onChange={(e) => setSettings({ ...settings, title: e.target.value })}
              />
            </div>

            <div>
              <Label>Subtitle</Label>
              <Input
                value={settings.subtitle}
                onChange={(e) => setSettings({ ...settings, subtitle: e.target.value })}
              />
            </div>

            <div>
              <Label>Welcome Message</Label>
              <Textarea
                value={settings.welcomeMessage}
                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label>Offline Message</Label>
              <Textarea
                value={settings.offlineMessage}
                onChange={(e) => setSettings({ ...settings, offlineMessage: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Agent Avatar</Label>
              <input
                type="checkbox"
                checked={settings.showAvatar}
                onChange={(e) => setSettings({ ...settings, showAvatar: e.target.checked })}
                className="h-4 w-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Ratings</Label>
              <input
                type="checkbox"
                checked={settings.showRatings}
                onChange={(e) => setSettings({ ...settings, showRatings: e.target.checked })}
                className="h-4 w-4 cursor-pointer"
              />
            </div>
          </Card>
        </div>

        {/* Preview & Embed Code */}
        <div className="space-y-6">
          {/* Preview */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Preview</h3>
            <div className="relative h-96 rounded-lg border border-border bg-gradient-to-br from-slate-50 to-slate-100">
              <div className={`absolute ${settings.position === "bottom-right" ? "bottom-4 right-4" : settings.position === "bottom-left" ? "bottom-4 left-4" : settings.position === "top-right" ? "top-4 right-4" : "top-4 left-4"}`}>
                <div
                  className="w-64 rounded-lg shadow-lg"
                  style={{ backgroundColor: settings.primaryColor }}
                >
                  <div className="p-4 text-white">
                    <h4 className="font-semibold">{settings.title}</h4>
                    <p className="text-sm opacity-90">{settings.subtitle}</p>
                  </div>
                  <div className="bg-white p-4 text-sm text-gray-700">
                    {settings.welcomeMessage}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Embed Code */}
          <Card className="p-6 space-y-3">
            <h3 className="font-semibold">Embed Code</h3>
            <p className="text-sm text-muted-foreground">Copy this code and paste it into your website's HTML</p>
            <div className="relative">
              <Textarea
                value={embedCode}
                readOnly
                rows={8}
                className="font-mono text-xs"
              />
              <Button
                size="sm"
                variant="outline"
                className="absolute right-2 top-2"
                onClick={() => navigator.clipboard.writeText(embedCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Eye className="mr-2 h-4 w-4" />
              Preview Live
            </Button>
            <Button className="flex-1">Save Settings</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
