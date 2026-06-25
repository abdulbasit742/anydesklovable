import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Search, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/dashboard/agent-management")({
  head: () => ({ meta: [{ title: "Agent Management — RemoteDesk" }] }),
  component: AgentManagement,
});

function AgentManagement() {
  const [agents, setAgents] = useState([
    {
      id: "1",
      name: "Alice Johnson",
      email: "alice@company.com",
      status: "available",
      tickets: 12,
      avgTime: "1.8h",
      csat: 4.8,
      skills: ["billing", "technical"],
    },
    {
      id: "2",
      name: "Bob Smith",
      email: "bob@company.com",
      status: "busy",
      tickets: 8,
      avgTime: "2.1h",
      csat: 4.6,
      skills: ["technical", "account"],
    },
    {
      id: "3",
      name: "Carol Davis",
      email: "carol@company.com",
      status: "break",
      tickets: 0,
      avgTime: "2.4h",
      csat: 4.5,
      skills: ["billing", "account"],
    },
  ]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredAgents = agents.filter((a) => {
    const matchesSearch = a.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case "busy":
        return <Clock className="h-4 w-4 text-amber-600" />;
      case "break":
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <AppShell title="Agent Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Agent Management</h2>
            <p className="text-sm text-muted-foreground">Manage team members and their skills</p>
          </div>
          <Button>
            <Users className="mr-2 h-4 w-4" />
            Add Agent
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="break">On Break</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Agents Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{agent.name}</h3>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(agent.status)}
                      <Badge variant="outline" className="capitalize">
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{agent.email}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Tickets:</span>
                  <span className="font-medium">{agent.tickets}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Avg Resolution:</span>
                  <span className="font-medium">{agent.avgTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">CSAT Score:</span>
                  <span className="font-medium">{agent.csat} ⭐</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {agent.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-xs capitalize">
                    {skill}
                  </Badge>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Skills
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
