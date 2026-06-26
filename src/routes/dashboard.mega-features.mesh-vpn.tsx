import { createFileRoute } from "@tanstack/react-router";
import { Network, Wifi, Activity, Globe } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/mega-features/mesh-vpn")({
  head: () => ({ meta: [{ title: "Mesh VPN & Network — RemoteDesk" }] }),
  component: MeshVPNDashboard,
});

function MeshVPNDashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Mesh VPN & Network</h1>
            <p className="text-gray-600">Manage private mesh networks and monitor connectivity</p>
          </div>
          <Button>Create Mesh Network</Button>
        </div>

        {/* Network Health */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">Network Health Score</p>
              <p className="text-5xl font-bold">94/100</p>
              <p className="text-sm text-gray-600 mt-2">Excellent connectivity across all nodes</p>
            </div>
            <Network className="w-24 h-24 text-green-500 opacity-50" />
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Online Nodes</p>
                <p className="text-2xl font-bold">8/8</p>
              </div>
              <Wifi className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Latency</p>
                <p className="text-2xl font-bold">8ms</p>
              </div>
              <Activity className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Bandwidth Used</p>
                <p className="text-2xl font-bold">2.3 Gbps</p>
              </div>
              <Globe className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Packet Loss</p>
                <p className="text-2xl font-bold">0.02%</p>
              </div>
              <Badge className="bg-green-500">Excellent</Badge>
            </div>
          </Card>
        </div>

        {/* Mesh Networks */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Mesh Networks</h2>
          <div className="space-y-3">
            {[
              { name: "Main Office Network", nodes: 5, status: "active", devices: 12 },
              { name: "Remote Branch Network", nodes: 3, status: "active", devices: 8 },
              { name: "Development Network", nodes: 4, status: "active", devices: 6 },
            ].map((network, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded flex items-center justify-between">
                <div>
                  <p className="font-medium">{network.name}</p>
                  <p className="text-sm text-gray-600">{network.nodes} nodes • {network.devices} devices</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">{network.status}</Badge>
                  <Button variant="ghost" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Network Nodes */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Network Nodes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Node ID</th>
                  <th className="text-left py-2">Status</th>
                  <th className="text-left py-2">Latency</th>
                  <th className="text-left py-2">Bandwidth</th>
                  <th className="text-left py-2">Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: "node-001",
                    status: "online",
                    latency: "5ms",
                    bandwidth: "850 Mbps",
                    lastSeen: "now",
                  },
                  {
                    id: "node-002",
                    status: "online",
                    latency: "12ms",
                    bandwidth: "620 Mbps",
                    lastSeen: "now",
                  },
                  {
                    id: "node-003",
                    status: "online",
                    latency: "8ms",
                    bandwidth: "750 Mbps",
                    lastSeen: "now",
                  },
                ].map((node) => (
                  <tr key={node.id} className="border-b hover:bg-gray-50">
                    <td className="py-2 font-mono text-xs">{node.id}</td>
                    <td className="py-2">
                      <Badge className="bg-green-500">{node.status}</Badge>
                    </td>
                    <td className="py-2">{node.latency}</td>
                    <td className="py-2">{node.bandwidth}</td>
                    <td className="py-2">{node.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Network Topology */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Network Topology</h2>
          <div className="bg-gray-50 rounded p-8 h-64 flex items-center justify-center">
            <div className="text-center">
              <Network className="w-16 h-16 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-600">Interactive topology visualization</p>
              <p className="text-sm text-gray-500">Shows all nodes and connections</p>
            </div>
          </div>
        </Card>

        {/* Bandwidth Analytics */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Bandwidth Usage (Last 24h)</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Inbound</span>
                <span>1.2 Gbps avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "65%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Outbound</span>
                <span>1.1 Gbps avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "60%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Peak Usage</span>
                <span>3.8 Gbps</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "100%" }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Access Control List (ACL) */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Access Control Rules</h2>
          <div className="space-y-2">
            {[
              { from: "node-001", to: "node-002", ports: "22,80,443", status: "allow" },
              { from: "node-002", to: "node-003", ports: "3306", status: "allow" },
              { from: "node-003", to: "node-001", ports: "5432", status: "allow" },
            ].map((rule, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="text-sm">
                  <p className="font-medium">
                    {rule.from} → {rule.to}
                  </p>
                  <p className="text-gray-600">Ports: {rule.ports}</p>
                </div>
                <Badge className="bg-green-500">{rule.status}</Badge>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline">
            Add ACL Rule
          </Button>
        </Card>

        {/* DNS Records */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">DNS Records</h2>
          <div className="space-y-2">
            {[
              { hostname: "office.mesh.local", target: "node-001" },
              { hostname: "branch.mesh.local", target: "node-002" },
              { hostname: "dev.mesh.local", target: "node-003" },
            ].map((record, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="text-sm">
                  <p className="font-mono font-medium">{record.hostname}</p>
                  <p className="text-gray-600">→ {record.target}</p>
                </div>
                <Button variant="ghost" size="sm">
                  Edit
                </Button>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline">
            Add DNS Record
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
