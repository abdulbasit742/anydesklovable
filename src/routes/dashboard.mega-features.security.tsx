import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Shield, TrendingDown, Activity } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/mega-features/security")({
  head: () => ({ meta: [{ title: "Security Operations Center — RemoteDesk" }] }),
  component: SecurityDashboard,
});

function SecurityDashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Security Operations Center</h1>
            <p className="text-gray-600">Monitor threats, vulnerabilities, and incidents</p>
          </div>
          <Button>Run Security Scan</Button>
        </div>

        {/* Security Score */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Overall Security Score</p>
              <p className="text-5xl font-bold">87/100</p>
              <p className="text-sm text-gray-600 mt-2">Good - Keep monitoring for improvements</p>
            </div>
            <Shield className="w-24 h-24 text-blue-500 opacity-50" />
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Critical Events</p>
                <p className="text-2xl font-bold">2</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Vulnerabilities</p>
                <p className="text-2xl font-bold">5</p>
              </div>
              <TrendingDown className="w-8 h-8 text-orange-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Open Incidents</p>
                <p className="text-2xl font-bold">1</p>
              </div>
              <Activity className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Compliance</p>
                <p className="text-2xl font-bold">92%</p>
              </div>
              <Shield className="w-8 h-8 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Recent Security Events */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Security Events</h2>
          <div className="space-y-3">
            {[
              {
                type: "Suspicious Process",
                severity: "high",
                device: "Desktop-01",
                time: "2 hours ago",
              },
              {
                type: "Failed Login Attempt",
                severity: "medium",
                device: "Laptop-02",
                time: "4 hours ago",
              },
              {
                type: "File Integrity Change",
                severity: "medium",
                device: "Server-01",
                time: "6 hours ago",
              },
            ].map((event, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{event.type}</p>
                  <p className="text-sm text-gray-600">{event.device} • {event.time}</p>
                </div>
                <Badge
                  className={
                    event.severity === "high"
                      ? "bg-red-500"
                      : event.severity === "medium"
                        ? "bg-orange-500"
                        : "bg-yellow-500"
                  }
                >
                  {event.severity}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Vulnerabilities Report */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Vulnerabilities</h2>
          <div className="space-y-3">
            {[
              { cve: "CVE-2024-1234", severity: "critical", software: "Windows 11", status: "Patch Available" },
              { cve: "CVE-2024-5678", severity: "high", software: "Chrome", status: "Patched" },
              { cve: "CVE-2024-9012", severity: "medium", software: "Adobe Reader", status: "Patch Available" },
            ].map((vuln, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-mono text-sm font-medium">{vuln.cve}</p>
                  <p className="text-sm text-gray-600">{vuln.software}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      vuln.severity === "critical"
                        ? "bg-red-500"
                        : vuln.severity === "high"
                          ? "bg-orange-500"
                          : "bg-yellow-500"
                    }
                  >
                    {vuln.severity}
                  </Badge>
                  <Badge variant="outline">{vuln.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Security Policies */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Active Security Policies</h2>
          <div className="space-y-2">
            {[
              "Windows Defender Real-time Protection",
              "Firewall Enabled",
              "USB Device Restrictions",
              "Screen Lock on Idle",
            ].map((policy, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <input type="checkbox" checked className="rounded" />
                <span>{policy}</span>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full">Add Policy</Button>
        </Card>

        {/* Compliance Status */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Compliance Checklist</h2>
          <div className="space-y-2">
            {[
              { check: "Firewall enabled", passed: true },
              { check: "Antivirus installed", passed: true },
              { check: "Windows updates current", passed: false },
              { check: "Strong password policy", passed: true },
            ].map((check, i) => (
              <div key={i} className="flex items-center gap-2 p-2">
                <input type="checkbox" checked={check.passed} className="rounded" />
                <span className={check.passed ? "" : "line-through text-gray-400"}>{check.check}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
