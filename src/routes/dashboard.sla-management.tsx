import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute("/dashboard/sla-management")({
  head: () => ({ meta: [{ title: "SLA Management — RemoteDesk" }] }),
  component: SLAManagement,
});

function SLAManagement() {
  const [tickets, setTickets] = useState([
    {
      id: "1",
      subject: "Login issue",
      priority: "high",
      status: "open",
      responseTime: "2h 15m",
      responseTarget: "4h",
      resolutionTime: "12h",
      resolutionTarget: "24h",
      slaStatus: "on-track",
    },
    {
      id: "2",
      subject: "Payment failed",
      priority: "critical",
      status: "open",
      responseTime: "5h 30m",
      responseTarget: "2h",
      resolutionTime: null,
      resolutionTarget: "8h",
      slaStatus: "breached",
    },
    {
      id: "3",
      subject: "Feature request",
      priority: "low",
      status: "pending",
      responseTime: "1h",
      responseTarget: "24h",
      resolutionTime: null,
      resolutionTarget: "72h",
      slaStatus: "on-track",
    },
  ]);

  const slaStats = {
    onTrack: 65,
    atRisk: 20,
    breached: 15,
  };

  return (
    <AppShell title="SLA Management">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">SLA Management</h2>
          <p className="text-sm text-muted-foreground">Monitor and manage service level agreements</p>
        </div>

        {/* SLA Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold">{slaStats.onTrack}%</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{slaStats.atRisk}%</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Breached</p>
                <p className="text-2xl font-bold">{slaStats.breached}%</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Tickets with SLA Status */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Ticket</th>
                  <th className="px-4 py-3 text-left font-medium">Priority</th>
                  <th className="px-4 py-3 text-left font-medium">Response</th>
                  <th className="px-4 py-3 text-left font-medium">Resolution</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3 font-medium">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          ticket.priority === "critical"
                            ? "bg-red-50"
                            : ticket.priority === "high"
                              ? "bg-amber-50"
                              : "bg-blue-50"
                        }
                      >
                        {ticket.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <p>{ticket.responseTime}</p>
                        <p className="text-muted-foreground">Target: {ticket.responseTarget}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-xs">
                        <p>{ticket.resolutionTime || "In progress"}</p>
                        <p className="text-muted-foreground">Target: {ticket.resolutionTarget}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          ticket.slaStatus === "on-track"
                            ? "bg-green-100 text-green-800"
                            : ticket.slaStatus === "at-risk"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                        }
                      >
                        {ticket.slaStatus}
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
