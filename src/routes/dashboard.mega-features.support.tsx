import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Ticket, Clock, CheckCircle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/mega-features/support")({
  head: () => ({ meta: [{ title: "Support Center — RemoteDesk" }] }),
  component: SupportDashboard,
});

function SupportDashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Support Center</h1>
            <p className="text-gray-600">Manage tickets, chat, and knowledge base</p>
          </div>
          <Button>Create New Ticket</Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Open Tickets</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Ticket className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">In Progress</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Resolved</p>
                <p className="text-2xl font-bold">48</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Resolution</p>
                <p className="text-2xl font-bold">2.4h</p>
              </div>
              <MessageSquare className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>

        {/* Support Tickets */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Tickets</h2>
          <div className="space-y-3">
            {[
              {
                id: "TKT-001",
                subject: "Cannot connect to remote device",
                status: "open",
                priority: "high",
                created: "2 hours ago",
              },
              {
                id: "TKT-002",
                subject: "File transfer not working",
                status: "in_progress",
                priority: "medium",
                created: "4 hours ago",
              },
              {
                id: "TKT-003",
                subject: "License key activation issue",
                status: "waiting",
                priority: "medium",
                created: "1 day ago",
              },
            ].map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                <div>
                  <p className="font-medium">{ticket.subject}</p>
                  <p className="text-sm text-gray-600">{ticket.id} • {ticket.created}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      ticket.priority === "high"
                        ? "bg-red-500"
                        : ticket.priority === "medium"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                    }
                  >
                    {ticket.priority}
                  </Badge>
                  <Badge
                    variant={
                      ticket.status === "open"
                        ? "default"
                        : ticket.status === "in_progress"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {ticket.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Live Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-bold mb-4">Live Chat</h2>
            <div className="h-64 bg-gray-50 rounded p-4 mb-4 overflow-y-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-start">
                  <div className="bg-gray-200 p-2 rounded">
                    <p>Hi, I need help with file transfer</p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="bg-blue-500 text-white p-2 rounded">
                    <p>Sure! What's the issue?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-gray-200 p-2 rounded">
                    <p>Files won't transfer to remote device</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input placeholder="Type your message..." />
              <Button>Send</Button>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4">Active Agents</h2>
            <div className="space-y-2">
              {[
                { name: "John Smith", status: "available", chats: 2 },
                { name: "Sarah Johnson", status: "busy", chats: 3 },
                { name: "Mike Chen", status: "available", chats: 1 },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{agent.name}</p>
                    <p className="text-xs text-gray-600">{agent.chats} active chats</p>
                  </div>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      agent.status === "available" ? "bg-green-500" : "bg-orange-500"
                    }`}
                  ></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Knowledge Base */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Knowledge Base Articles</h2>
          <div className="space-y-2 mb-4">
            {[
              { title: "How to connect to a remote device", views: 234 },
              { title: "File transfer troubleshooting", views: 156 },
              { title: "License key activation guide", views: 89 },
            ].map((article) => (
              <div key={article.title} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <p className="font-medium text-sm">{article.title}</p>
                <p className="text-xs text-gray-600">{article.views} views</p>
              </div>
            ))}
          </div>
          <Button className="w-full" variant="outline">
            Add New Article
          </Button>
        </Card>

        {/* CSAT Analytics */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Customer Satisfaction</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600 text-sm">Average Rating</p>
              <p className="text-3xl font-bold">4.6/5</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Response Rate</p>
              <p className="text-3xl font-bold">92%</p>
            </div>
          </div>
          <div className="flex gap-1">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex-1">
                <div className="text-xs text-center mb-1">{rating}⭐</div>
                <div className="bg-gray-200 rounded h-16 flex items-end justify-center">
                  <div
                    className="bg-blue-500 w-full rounded"
                    style={{
                      height: `${[45, 35, 12, 5, 3][5 - rating]}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
