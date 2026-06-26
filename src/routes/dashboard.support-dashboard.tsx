import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, MessageSquare, Clock, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/dashboard/support-dashboard")({
  head: () => ({ meta: [{ title: "Support Dashboard — RemoteDesk" }] }),
  component: SupportDashboard,
});

function SupportDashboard() {
  const [timeRange, setTimeRange] = useState("7d");

  // Mock data for demonstration
  const metrics = {
    totalTickets: 1234,
    openTickets: 45,
    avgResponseTime: "2.5h",
    avgResolutionTime: "24h",
    csat: 4.7,
    aiResolutionRate: 68,
  };

  const ticketsByChannel = [
    { name: "Chat", value: 450, fill: "#3b82f6" },
    { name: "Email", value: 320, fill: "#10b981" },
    { name: "WhatsApp", value: 280, fill: "#8b5cf6" },
    { name: "Phone", value: 184, fill: "#f59e0b" },
  ];

  const performanceTrend = [
    { date: "Mon", resolved: 45, open: 12 },
    { date: "Tue", resolved: 52, open: 8 },
    { date: "Wed", resolved: 48, open: 15 },
    { date: "Thu", resolved: 61, open: 5 },
    { date: "Fri", resolved: 55, open: 18 },
    { date: "Sat", resolved: 30, open: 22 },
    { date: "Sun", resolved: 25, open: 35 },
  ];

  const agentStats = [
    { name: "Alice Johnson", tickets: 156, avgTime: "1.8h", csat: 4.8 },
    { name: "Bob Smith", tickets: 143, avgTime: "2.1h", csat: 4.6 },
    { name: "Carol Davis", tickets: 128, avgTime: "2.4h", csat: 4.5 },
    { name: "David Wilson", tickets: 115, avgTime: "2.7h", csat: 4.4 },
  ];

  return (
    <AppShell title="Support Dashboard">
      <div className="space-y-6">
        {/* Header with filters */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Support Operations</h2>
            <p className="text-sm text-muted-foreground">Real-time metrics and team performance</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <MetricCard
            icon={<MessageSquare className="h-5 w-5" />}
            label="Total Tickets"
            value={metrics.totalTickets.toLocaleString()}
            trend="+12%"
          />
          <MetricCard
            icon={<AlertCircle className="h-5 w-5" />}
            label="Open Tickets"
            value={metrics.openTickets}
            trend="-5%"
            variant="warning"
          />
          <MetricCard
            icon={<Clock className="h-5 w-5" />}
            label="Avg Response Time"
            value={metrics.avgResponseTime}
            trend="-0.3h"
          />
          <MetricCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Avg Resolution Time"
            value={metrics.avgResolutionTime}
            trend="-2h"
          />
          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="CSAT Score"
            value={metrics.csat}
            trend="+0.2"
          />
          <MetricCard
            icon={<Phone className="h-5 w-5" />}
            label="AI Resolution Rate"
            value={`${metrics.aiResolutionRate}%`}
            trend="+8%"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tickets by Channel */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Tickets by Channel</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketsByChannel}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ticketsByChannel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Performance Trend */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Weekly Performance</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="open" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Agent Performance */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Top Agents</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Agent</th>
                  <th className="px-4 py-2 text-left font-medium">Tickets Resolved</th>
                  <th className="px-4 py-2 text-left font-medium">Avg Resolution Time</th>
                  <th className="px-4 py-2 text-left font-medium">CSAT</th>
                </tr>
              </thead>
              <tbody>
                {agentStats.map((agent, i) => (
                  <tr key={i} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{agent.name}</td>
                    <td className="px-4 py-3">{agent.tickets}</td>
                    <td className="px-4 py-3">{agent.avgTime}</td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className="bg-green-50">
                        {agent.csat} ⭐
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}

function MetricCard({
  icon,
  label,
  value,
  trend,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: string;
  variant?: "default" | "warning";
}) {
  return (
    <Card className={`p-4 ${variant === "warning" ? "border-amber-200 bg-amber-50/50" : ""}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-bold">{value}</p>
          <p className={`mt-1 text-xs ${trend.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
            {trend} from last period
          </p>
        </div>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">{icon}</div>
      </div>
    </Card>
  );
}
