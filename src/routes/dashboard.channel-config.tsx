import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Mail, Phone, Settings } from "lucide-react";

export const Route = createFileRoute("/dashboard/channel-config")({
  head: () => ({ meta: [{ title: "Channel Configuration — RemoteDesk" }] }),
  component: ChannelConfig,
});

function ChannelConfig() {
  const [channels, setChannels] = useState([
    {
      id: "chat",
      name: "Live Chat",
      icon: MessageSquare,
      enabled: true,
      configured: true,
      description: "Real-time chat widget for websites",
    },
    {
      id: "email",
      name: "Email",
      icon: Mail,
      enabled: true,
      configured: true,
      description: "Email support integration",
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      icon: MessageSquare,
      enabled: false,
      configured: false,
      description: "WhatsApp Business API integration",
    },
    {
      id: "phone",
      name: "VoIP Phone System",
      icon: Phone,
      enabled: false,
      configured: false,
      description: "Business phone system with IVR",
    },
  ]);

  const toggleChannel = (id: string) => {
    setChannels(channels.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c)));
  };

  return (
    <AppShell title="Channel Configuration">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Communication Channels</h2>
          <p className="text-sm text-muted-foreground">Configure omnichannel support across multiple platforms</p>
        </div>

        {/* Channels Grid */}
        <div className="grid gap-4 md:grid-cols-2">
          {channels.map((channel) => {
            const Icon = channel.icon;
            return (
              <Card key={channel.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-primary/10 p-3 text-primary">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{channel.name}</h3>
                      <p className="text-sm text-muted-foreground">{channel.description}</p>
                      <div className="mt-2 flex gap-2">
                        {channel.configured && (
                          <Badge variant="outline" className="bg-green-50">
                            Configured
                          </Badge>
                        )}
                        {!channel.configured && (
                          <Badge variant="outline" className="bg-amber-50">
                            Not Configured
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <Switch checked={channel.enabled} onCheckedChange={() => toggleChannel(channel.id)} />
                </div>

                <div className="mt-4 flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Settings className="mr-2 h-4 w-4" />
                        Configure
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Configure {channel.name}</DialogTitle>
                      </DialogHeader>
                      <ChannelConfigForm channel={channel} />
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="flex-1">
                    Test
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}

function ChannelConfigForm({ channel }: { channel: any }) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <Label>API Key</Label>
        <Input
          type="password"
          placeholder="Enter API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </div>
      <div>
        <Label>API Secret</Label>
        <Input
          type="password"
          placeholder="Enter API secret"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1">
          Cancel
        </Button>
        <Button className="flex-1">Save Configuration</Button>
      </div>
    </div>
  );
}
