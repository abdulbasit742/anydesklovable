import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Play, Edit2, Trash2, PhoneOff } from "lucide-react";

export const Route = createFileRoute("/dashboard/ivr-designer")({
  head: () => ({ meta: [{ title: "IVR Designer — RemoteDesk" }] }),
  component: IVRDesigner,
});

function IVRDesigner() {
  const [flows, setFlows] = useState([
    {
      id: "1",
      name: "Main Menu",
      description: "Primary IVR flow",
      status: "active",
      calls: 1250,
      avgDuration: "2m 30s",
    },
    {
      id: "2",
      name: "Support Queue",
      description: "Route to support team",
      status: "active",
      calls: 890,
      avgDuration: "1m 15s",
    },
    {
      id: "3",
      name: "Billing",
      description: "Billing inquiries",
      status: "inactive",
      calls: 0,
      avgDuration: "N/A",
    },
  ]);

  const [selectedFlow, setSelectedFlow] = useState<string | null>(null);

  return (
    <AppShell title="IVR Visual Designer">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Flows List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">IVR Flows</h3>
            <Button size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            {flows.map((flow) => (
              <Card
                key={flow.id}
                className={`p-3 cursor-pointer transition-colors ${selectedFlow === flow.id ? "bg-primary/10" : "hover:bg-muted/50"}`}
                onClick={() => setSelectedFlow(flow.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{flow.name}</p>
                    <p className="text-xs text-muted-foreground">{flow.description}</p>
                  </div>
                  <Badge variant={flow.status === "active" ? "default" : "secondary"}>
                    {flow.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Flow Designer */}
        <div className="lg:col-span-2">
          {selectedFlow ? (
            <IVRFlowEditor flowId={selectedFlow} flows={flows} />
          ) : (
            <Card className="p-10 text-center">
              <PhoneOff className="mx-auto mb-3 h-8 w-8 opacity-40" />
              <p className="text-muted-foreground">Select a flow to edit</p>
            </Card>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function IVRFlowEditor({ flowId, flows }: { flowId: string; flows: any[] }) {
  const flow = flows.find((f) => f.id === flowId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{flow?.name}</h3>
            <p className="text-sm text-muted-foreground">{flow?.description}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Play className="h-4 w-4 mr-1" />
              Test
            </Button>
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Canvas */}
      <Card className="p-6 min-h-96 bg-slate-50">
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="text-center">
            <p className="font-semibold mb-2">IVR Flow Diagram</p>
            <p className="text-sm text-muted-foreground mb-4">Drag and drop nodes to build your IVR flow</p>
          </div>

          {/* Sample Flow Nodes */}
          <div className="w-full max-w-md space-y-3">
            <div className="p-3 bg-blue-100 border-2 border-blue-300 rounded text-center font-medium text-sm">
              📞 Welcome Message
            </div>
            <div className="text-center text-muted-foreground">↓</div>
            <div className="p-3 bg-green-100 border-2 border-green-300 rounded text-center font-medium text-sm">
              🔢 Collect DTMF Input
            </div>
            <div className="text-center text-muted-foreground">↓</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-amber-100 border-2 border-amber-300 rounded text-center font-medium text-xs">
                1️⃣ Support
              </div>
              <div className="p-2 bg-amber-100 border-2 border-amber-300 rounded text-center font-medium text-xs">
                2️⃣ Billing
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total Calls</p>
          <p className="text-2xl font-bold">{flow?.calls}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Avg Duration</p>
          <p className="text-2xl font-bold">{flow?.avgDuration}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Status</p>
          <Badge variant={flow?.status === "active" ? "default" : "secondary"}>
            {flow?.status}
          </Badge>
        </Card>
      </div>
    </div>
  );
}
