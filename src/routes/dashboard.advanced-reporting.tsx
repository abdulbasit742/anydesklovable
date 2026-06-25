import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Download, Filter } from "lucide-react";

export const Route = createFileRoute("/dashboard/advanced-reporting")({
  head: () => ({ meta: [{ title: "Advanced Reporting — RemoteDesk" }] }),
  component: AdvancedReporting,
});

function AdvancedReporting() {
  const [reportType, setReportType] = useState("tickets");
  const [dateRange, setDateRange] = useState("30d");
  const [groupBy, setGroupBy] = useState("day");

  const ticketData = [
    { date: "Mon", created: 45, resolved: 38, pending: 7 },
    { date: "Tue", created: 52, resolved: 48, pending: 4 },
    { date: "Wed", created: 48, resolved: 45, pending: 3 },
    { date: "Thu", created: 61, resolved: 58, pending: 3 },
    { date: "Fri", created: 55, resolved: 52, pending: 3 },
    { date: "Sat", created: 30, resolved: 28, pending: 2 },
    { date: "Sun", created: 25, resolved: 22, pending: 3 },
  ];

  const agentData = [
    { agent: "Alice", tickets: 156, avgTime: 1.8, csat: 4.8 },
    { agent: "Bob", tickets: 143, avgTime: 2.1, csat: 4.6 },
    { agent: "Carol", tickets: 128, avgTime: 2.4, csat: 4.5 },
    { agent: "David", tickets: 115, avgTime: 2.7, csat: 4.4 },
  ];

  return (
    <AppShell title="Advanced Reporting">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">Advanced Reporting</h2>
          <p className="text-sm text-muted-foreground">Create custom reports and export data</p>
        </div>

        {/* Filters */}
        <Card className="p-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <Label className="text-xs">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tickets">Tickets</SelectItem>
                  <SelectItem value="agents">Agent Performance</SelectItem>
                  <SelectItem value="channels">Channel Analytics</SelectItem>
                  <SelectItem value="csat">Customer Satisfaction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Group By</Label>
              <Select value={groupBy} onValueChange={setGroupBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button variant="outline" className="flex-1">
                <Filter className="mr-2 h-4 w-4" />
                More Filters
              </Button>
            </div>
          </div>
        </Card>

        {/* Report */}
        {reportType === "tickets" && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Ticket Metrics</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="created" fill="#3b82f6" />
                <Bar dataKey="resolved" fill="#10b981" />
                <Bar dataKey="pending" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {reportType === "agents" && (
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Agent Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-4 py-2 text-left">Agent</th>
                    <th className="px-4 py-2 text-left">Tickets</th>
                    <th className="px-4 py-2 text-left">Avg Time</th>
                    <th className="px-4 py-2 text-left">CSAT</th>
                  </tr>
                </thead>
                <tbody>
                  {agentData.map((agent) => (
                    <tr key={agent.agent} className="border-t">
                      <td className="px-4 py-2">{agent.agent}</td>
                      <td className="px-4 py-2">{agent.tickets}</td>
                      <td className="px-4 py-2">{agent.avgTime}h</td>
                      <td className="px-4 py-2">{agent.csat} ⭐</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Export Options */}
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export as CSV
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export as PDF
            </Button>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export as Excel
            </Button>
            <Button>Schedule Report</Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
