import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Zap, Plus, Edit2, Trash2, Copy } from "lucide-react";

export const Route = createFileRoute("/dashboard/automation-builder")({
  head: () => ({ meta: [{ title: "Automation Rules — RemoteDesk" }] }),
  component: AutomationBuilder,
});

function AutomationBuilder() {
  const [rules, setRules] = useState([
    {
      id: "1",
      name: "Auto-assign urgent tickets",
      trigger: "ticket_created",
      conditions: "priority = urgent",
      actions: "assign_to_senior_agent",
      isActive: true,
    },
    {
      id: "2",
      name: "Send satisfaction survey",
      trigger: "ticket_resolved",
      conditions: "status = resolved",
      actions: "send_survey_after_1h",
      isActive: true,
    },
    {
      id: "3",
      name: "Escalate stale tickets",
      trigger: "ticket_idle",
      conditions: "idle_for > 24h",
      actions: "escalate_to_manager",
      isActive: false,
    },
  ]);

  const [createOpen, setCreateOpen] = useState(false);

  const toggleRule = (id: string) => {
    setRules(rules.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r)));
  };

  return (
    <AppShell title="Automation Rules">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Automation Rules</h2>
            <p className="text-sm text-muted-foreground">Create workflows to automate support tasks</p>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Rule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Automation Rule</DialogTitle>
              </DialogHeader>
              <CreateRuleForm onClose={() => setCreateOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Rules List */}
        <div className="space-y-3">
          {rules.length === 0 ? (
            <Card className="p-10 text-center">
              <Zap className="mx-auto mb-3 h-8 w-8 opacity-40" />
              <p className="text-muted-foreground">No automation rules yet</p>
            </Card>
          ) : (
            rules.map((rule) => (
              <Card key={rule.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{rule.name}</h3>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                      <p>
                        <span className="font-medium">Trigger:</span> {rule.trigger}
                      </p>
                      <p>
                        <span className="font-medium">Conditions:</span> {rule.conditions}
                      </p>
                      <p>
                        <span className="font-medium">Actions:</span> {rule.actions}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={rule.isActive} onCheckedChange={() => toggleRule(rule.id)} />
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}

function CreateRuleForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("ticket_created");
  const [conditions, setConditions] = useState("");
  const [actions, setActions] = useState("");

  const handleSubmit = () => {
    // Handle rule creation
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Rule Name</Label>
        <Input
          placeholder="e.g., Auto-assign urgent tickets"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <Label>Trigger Event</Label>
        <Select value={trigger} onValueChange={setTrigger}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ticket_created">Ticket Created</SelectItem>
            <SelectItem value="ticket_resolved">Ticket Resolved</SelectItem>
            <SelectItem value="ticket_idle">Ticket Idle (24h+)</SelectItem>
            <SelectItem value="message_received">Message Received</SelectItem>
            <SelectItem value="csat_low">Low CSAT Score</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Conditions</Label>
        <Input
          placeholder="e.g., priority = urgent AND status = open"
          value={conditions}
          onChange={(e) => setConditions(e.target.value)}
        />
      </div>

      <div>
        <Label>Actions</Label>
        <Select value={actions} onValueChange={setActions}>
          <SelectTrigger>
            <SelectValue placeholder="Select action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="assign_to_senior_agent">Assign to Senior Agent</SelectItem>
            <SelectItem value="send_survey_after_1h">Send Survey After 1h</SelectItem>
            <SelectItem value="escalate_to_manager">Escalate to Manager</SelectItem>
            <SelectItem value="add_tag">Add Tag</SelectItem>
            <SelectItem value="send_notification">Send Notification</SelectItem>
            <SelectItem value="create_bug_report">Create Bug Report</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Create Rule</Button>
      </DialogFooter>
    </div>
  );
}
