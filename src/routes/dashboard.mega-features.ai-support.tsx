import { createFileRoute } from "@tanstack/react-router";
import { Brain, Zap, CheckCircle, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/dashboard/mega-features/ai-support")({
  head: () => ({ meta: [{ title: "AI Support Operations — RemoteDesk" }] }),
  component: AISupportDashboard,
});

function AISupportDashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">AI Support Operations</h1>
            <p className="text-gray-600">AI-powered diagnostics and automated fixes</p>
          </div>
          <Button>Run System Diagnosis</Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Issues Diagnosed</p>
                <p className="text-2xl font-bold">127</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Auto-Fixed</p>
                <p className="text-2xl font-bold">94</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Success Rate</p>
                <p className="text-2xl font-bold">74%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Fix Time</p>
                <p className="text-2xl font-bold">2.3m</p>
              </div>
              <AlertCircle className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* AI Chat Interface */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">AI Support Chat</h2>
          <div className="h-64 bg-gray-50 rounded p-4 mb-4 overflow-y-auto">
            <div className="space-y-3 text-sm">
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded max-w-xs">
                  <p>Hi! I can help diagnose and fix issues on your devices. What's the problem?</p>
                </div>
              </div>
              <div className="flex justify-end">
                <div className="bg-blue-500 text-white p-3 rounded max-w-xs">
                  <p>My computer is running slow</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded max-w-xs">
                  <p>Let me analyze your system. Running diagnostics...</p>
                </div>
              </div>
              <div className="flex justify-start">
                <div className="bg-gray-200 p-3 rounded max-w-xs">
                  <p>Found: High CPU usage (87%), 2 memory leaks detected. Would you like me to fix these?</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Textarea placeholder="Describe your issue..." className="resize-none" rows={2} />
            <Button>Send</Button>
          </div>
        </Card>

        {/* Recent Diagnoses */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Diagnoses</h2>
          <div className="space-y-3">
            {[
              {
                issue: "High CPU usage",
                device: "Desktop-01",
                status: "fixed",
                fixTime: "1m 23s",
              },
              {
                issue: "Disk space low",
                device: "Laptop-02",
                status: "fixed",
                fixTime: "2m 15s",
              },
              {
                issue: "Memory leak detected",
                device: "Server-01",
                status: "fixed",
                fixTime: "3m 42s",
              },
            ].map((diagnosis, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium">{diagnosis.issue}</p>
                    <p className="text-sm text-gray-600">{diagnosis.device}</p>
                  </div>
                  <Badge className="bg-green-500">{diagnosis.status}</Badge>
                </div>
                <p className="text-xs text-gray-600">Fixed in {diagnosis.fixTime}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Knowledge Base */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Knowledge Base</h2>
          <div className="space-y-2 mb-4">
            {[
              { title: "High CPU Usage Solutions", issues: 12 },
              { title: "Disk Space Management", issues: 8 },
              { title: "Memory Leak Detection", issues: 6 },
              { title: "Network Connectivity Issues", issues: 15 },
            ].map((kb, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{kb.title}</p>
                  <p className="text-xs text-gray-600">{kb.issues} solutions</p>
                </div>
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </div>
            ))}
          </div>
          <Button className="w-full" variant="outline">
            Add to Knowledge Base
          </Button>
        </Card>

        {/* AI Configuration */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">AI Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Aggressiveness Level</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Low (Ask before fixing)</option>
                <option selected>Medium (Recommended)</option>
                <option>High (Auto-fix everything)</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="autofix" defaultChecked />
              <label htmlFor="autofix" className="text-sm">
                Enable automatic fixes
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="approval" defaultChecked />
              <label htmlFor="approval" className="text-sm">
                Require approval for critical changes
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="voice" />
              <label htmlFor="voice" className="text-sm">
                Enable voice commands
              </label>
            </div>
            <Button className="w-full">Save Configuration</Button>
          </div>
        </Card>

        {/* Performance Analytics */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">AI Performance Analytics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Diagnosis Accuracy</span>
                <span>94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "94%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Fix Success Rate</span>
                <span>74%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "74%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>User Satisfaction</span>
                <span>88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "88%" }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Failed Fixes */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Failed Fixes (Escalated)</h2>
          <div className="space-y-2">
            {[
              { issue: "Custom application crash", device: "Desktop-03", reason: "Unknown error code" },
              { issue: "Network driver issue", device: "Laptop-04", reason: "Requires manual installation" },
            ].map((failed, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 rounded">
                <div>
                  <p className="font-medium text-sm">{failed.issue}</p>
                  <p className="text-xs text-gray-600">{failed.device} • {failed.reason}</p>
                </div>
                <Button variant="ghost" size="sm">
                  Escalate
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
