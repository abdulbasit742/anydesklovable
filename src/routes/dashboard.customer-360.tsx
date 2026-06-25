import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Smartphone, Clock, FileText, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/dashboard/customer-360")({
  head: () => ({ meta: [{ title: "Customer 360 View — RemoteDesk" }] }),
  component: Customer360,
});

function Customer360() {
  const customer = {
    id: "cust_123",
    name: "John Doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    joinDate: "2024-01-15",
    totalSpent: "$2,450",
    accountStatus: "active",
    devices: [
      { id: "dev_1", name: "MacBook Pro", os: "macOS", lastSeen: "2 hours ago", status: "online" },
      { id: "dev_2", name: "iPhone 14", os: "iOS", lastSeen: "1 day ago", status: "offline" },
    ],
    sessions: [
      { id: "sess_1", device: "MacBook Pro", duration: "45m", date: "Today", type: "remote-support" },
      { id: "sess_2", device: "iPhone 14", duration: "2h 30m", date: "Yesterday", type: "remote-support" },
    ],
    tickets: [
      { id: "1", subject: "Login issue", status: "resolved", date: "2024-06-20" },
      { id: "2", subject: "Payment failed", status: "open", date: "2024-06-22" },
      { id: "3", subject: "Feature request", status: "pending", date: "2024-06-23" },
    ],
    interactions: [
      { type: "chat", date: "Today 10:30 AM", agent: "Alice", duration: "15m" },
      { type: "email", date: "Yesterday 2:15 PM", agent: "Bob", duration: "N/A" },
      { type: "phone", date: "2 days ago 3:45 PM", agent: "Carol", duration: "12m" },
    ],
  };

  return (
    <AppShell title="Customer 360 View">
      <div className="space-y-6">
        {/* Customer Header */}
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{customer.name}</h2>
                <p className="text-muted-foreground">{customer.email}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
                <div className="mt-2 flex gap-2">
                  <Badge>{customer.accountStatus}</Badge>
                  <Badge variant="outline">Customer since {customer.joinDate}</Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">{customer.totalSpent}</p>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="interactions">Interactions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Active Devices
                </h3>
                <div className="space-y-2">
                  {customer.devices.map((device) => (
                    <div key={device.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p className="font-medium">{device.name}</p>
                        <p className="text-xs text-muted-foreground">{device.os}</p>
                      </div>
                      <Badge variant={device.status === "online" ? "default" : "secondary"}>
                        {device.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Recent Sessions
                </h3>
                <div className="space-y-2">
                  {customer.sessions.slice(0, 2).map((session) => (
                    <div key={session.id} className="text-sm">
                      <p className="font-medium">{session.device}</p>
                      <p className="text-xs text-muted-foreground">{session.date} • {session.duration}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            {customer.devices.map((device) => (
              <Card key={device.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{device.name}</h4>
                    <p className="text-sm text-muted-foreground">{device.os}</p>
                    <p className="text-xs text-muted-foreground mt-1">Last seen: {device.lastSeen}</p>
                  </div>
                  <Badge variant={device.status === "online" ? "default" : "secondary"}>
                    {device.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            {customer.tickets.map((ticket) => (
              <Card key={ticket.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{ticket.subject}</h4>
                    <p className="text-xs text-muted-foreground">{ticket.date}</p>
                  </div>
                  <Badge
                    variant={
                      ticket.status === "resolved"
                        ? "default"
                        : ticket.status === "open"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {ticket.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="interactions" className="space-y-4">
            {customer.interactions.map((interaction, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {interaction.type === "chat" && <MessageSquare className="h-4 w-4 text-blue-600" />}
                    {interaction.type === "email" && <FileText className="h-4 w-4 text-green-600" />}
                    {interaction.type === "phone" && <Clock className="h-4 w-4 text-amber-600" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium capitalize">{interaction.type}</p>
                    <p className="text-sm text-muted-foreground">{interaction.date}</p>
                    <p className="text-xs text-muted-foreground">Agent: {interaction.agent} • Duration: {interaction.duration}</p>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
