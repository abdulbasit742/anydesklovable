import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Plus, Users, Hash } from "lucide-react";

export const Route = createFileRoute("/dashboard/team-channels")({
  head: () => ({ meta: [{ title: "Team Channels — RemoteDesk" }] }),
  component: TeamChannels,
});

function TeamChannels() {
  const [channels, setChannels] = useState([
    { id: "1", name: "general", description: "General team discussion", members: 12, unread: 3 },
    { id: "2", name: "support-team", description: "Support team coordination", members: 8, unread: 0 },
    { id: "3", name: "engineering", description: "Engineering team", members: 5, unread: 1 },
    { id: "4", name: "announcements", description: "Company announcements", members: 15, unread: 0 },
  ]);

  const [createOpen, setCreateOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  return (
    <AppShell title="Team Channels">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Channels List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Channels</h3>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Channel</DialogTitle>
                </DialogHeader>
                <CreateChannelForm onClose={() => setCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-2">
            {channels.map((channel) => (
              <Card
                key={channel.id}
                className={`p-3 cursor-pointer transition-colors ${selectedChannel === channel.id ? "bg-primary/10" : "hover:bg-muted/50"}`}
                onClick={() => setSelectedChannel(channel.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{channel.name}</p>
                      <p className="text-xs text-muted-foreground">{channel.members} members</p>
                    </div>
                  </div>
                  {channel.unread > 0 && (
                    <Badge className="bg-primary text-white">{channel.unread}</Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Channel Content */}
        <div className="lg:col-span-2">
          {selectedChannel ? (
            <ChannelView channelId={selectedChannel} channels={channels} />
          ) : (
            <Card className="p-10 text-center">
              <MessageSquare className="mx-auto mb-3 h-8 w-8 opacity-40" />
              <p className="text-muted-foreground">Select a channel to start chatting</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function ChannelView({ channelId, channels }: { channelId: string; channels: any[] }) {
  const channel = channels.find((c) => c.id === channelId);
  const [messages, setMessages] = useState([
    { id: "1", sender: "Alice", text: "Hey team, how's the support queue looking?", time: "10:30 AM" },
    { id: "2", sender: "Bob", text: "We have 12 open tickets, mostly billing related", time: "10:32 AM" },
    { id: "3", sender: "Carol", text: "I can take a few of those", time: "10:33 AM" },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSend = () => {
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        { id: String(messages.length + 1), sender: "You", text: newMessage, time: "now" },
      ]);
      setNewMessage("");
    }
  };

  return (
    <Card className="flex flex-col h-96">
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Hash className="h-4 w-4" />
          {channel?.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1">{channel?.description}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
              {msg.sender[0]}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{msg.sender}</p>
                <p className="text-xs text-muted-foreground">{msg.time}</p>
              </div>
              <p className="text-sm text-muted-foreground">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t p-4 flex gap-2">
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
        />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </Card>
  );
}

function CreateChannelForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Channel Name</label>
        <Input
          placeholder="e.g., support-team"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div>
        <label className="text-sm font-medium">Description</label>
        <Input
          placeholder="What is this channel for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button className="flex-1">Create Channel</Button>
      </div>
    </div>
  );
}
