import { createFileRoute } from "@tanstack/react-router";
import { Wifi, Zap, Globe, Activity, AlertTriangle, Clock, Server } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/connection-optimizer")({
  head: () => ({ meta: [{ title: "Connection Optimizer — RemoteDesk" }] }),
  component: ConnectionOptimizerDashboard,
});

function ConnectionOptimizerDashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Zap className="w-8 h-8 text-yellow-500" />
              Connection Optimizer
            </h1>
            <p className="text-gray-600">AI-powered bandwidth optimization and network intelligence</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Run Speed Test</Button>
            <Button>Why is it slow?</Button>
          </div>
        </div>

        {/* Live Connection Status */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Connection Quality</p>
              <p className="text-4xl font-bold text-green-600">Excellent</p>
              <p className="text-sm text-gray-500 mt-1">Score: 94/100 • Profile: 1080p 60fps</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-xs text-gray-500">Latency</p>
                  <p className="text-lg font-bold">12ms</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">FPS</p>
                  <p className="text-lg font-bold">60</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bandwidth</p>
                  <p className="text-lg font-bold">85 Mbps</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Packet Loss</p>
                  <p className="text-lg font-bold">0.1%</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Protocol</p>
                <p className="font-bold">Custom UDP</p>
                <p className="text-xs text-green-600">Optimal</p>
              </div>
              <Wifi className="w-6 h-6 text-blue-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Multi-Path</p>
                <p className="font-bold">2 paths active</p>
                <p className="text-xs text-green-600">WiFi + Ethernet</p>
              </div>
              <Globe className="w-6 h-6 text-purple-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Predictive</p>
                <p className="font-bold">Enabled</p>
                <p className="text-xs text-green-600">5ms perceived latency</p>
              </div>
              <Zap className="w-6 h-6 text-yellow-500" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Compression</p>
                <p className="font-bold">H.265 + ROI</p>
                <p className="text-xs text-green-600">3.2x ratio</p>
              </div>
              <Activity className="w-6 h-6 text-green-500" />
            </div>
          </Card>
        </div>

        {/* AI Adaptive Streaming */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">AI Adaptive Streaming</h2>
          <p className="text-sm text-gray-600 mb-4">AI continuously adapts quality based on network conditions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Bandwidth</th>
                  <th className="text-left py-2">Quality</th>
                  <th className="text-left py-2">Resolution</th>
                  <th className="text-left py-2">FPS</th>
                  <th className="text-left py-2">Features</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { bw: "100+ Mbps", quality: "Ultra", res: "4K", fps: "60", features: "Lossless, HDR" },
                  { bw: "25-100 Mbps", quality: "High", res: "1080p", fps: "60", features: "H.265" },
                  { bw: "10-25 Mbps", quality: "Medium", res: "1080p", fps: "30", features: "H.265, ROI" },
                  { bw: "2-10 Mbps", quality: "Low", res: "720p", fps: "15-30", features: "H.264, Delta" },
                  { bw: "< 2 Mbps", quality: "Minimal", res: "480p", fps: "5-15", features: "Text priority" },
                  { bw: "< 100 Kbps", quality: "Text Only", res: "Native", fps: "5", features: "Text extraction" },
                ].map((row, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-2">{row.bw}</td>
                    <td className="py-2"><Badge variant="outline">{row.quality}</Badge></td>
                    <td className="py-2">{row.res}</td>
                    <td className="py-2">{row.fps}</td>
                    <td className="py-2 text-xs text-gray-600">{row.features}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Multi-Path Connection */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Multi-Path Connection</h2>
          <p className="text-sm text-gray-600 mb-4">Using all available connections simultaneously</p>
          <div className="space-y-3">
            {[
              { path: "WiFi (5GHz)", interface: "wlan0", latency: "8ms", bandwidth: "65 Mbps", traffic: "Video + Files", status: "primary" },
              { path: "Ethernet", interface: "eth0", latency: "3ms", bandwidth: "95 Mbps", traffic: "Input (mouse/keyboard)", status: "active" },
              { path: "Mobile (5G)", interface: "rmnet0", latency: "25ms", bandwidth: "45 Mbps", traffic: "Standby (failover)", status: "standby" },
            ].map((path, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Wifi className={`w-5 h-5 ${path.status === "primary" ? "text-green-500" : path.status === "active" ? "text-blue-500" : "text-gray-400"}`} />
                  <div>
                    <p className="font-medium text-sm">{path.path}</p>
                    <p className="text-xs text-gray-500">{path.interface} • {path.traffic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>{path.latency}</span>
                  <span>{path.bandwidth}</span>
                  <Badge className={
                    path.status === "primary" ? "bg-green-500" :
                    path.status === "active" ? "bg-blue-500" : "bg-gray-400"
                  }>{path.status}</Badge>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">Bonded Bandwidth: 205 Mbps (effective: 184 Mbps)</p>
            <p className="text-xs text-blue-600">Multi-path efficiency: 90% • Auto-failover: enabled</p>
          </div>
        </Card>

        {/* Speed Test Results */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Speed Test History</h2>
          <div className="space-y-3">
            {[
              { date: "Today, 2:30 PM", download: "92 Mbps", upload: "45 Mbps", latency: "8ms", type: "Remote Device" },
              { date: "Today, 9:00 AM", download: "88 Mbps", upload: "42 Mbps", latency: "12ms", type: "Internet" },
              { date: "Yesterday", download: "75 Mbps", upload: "38 Mbps", latency: "15ms", type: "Remote Device" },
            ].map((test, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{test.date}</p>
                  <p className="text-xs text-gray-500">{test.type}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <span>↓ {test.download}</span>
                  <span>↑ {test.upload}</span>
                  <span>⏱ {test.latency}</span>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline">Run New Speed Test</Button>
        </Card>

        {/* Bandwidth Scheduling */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Bandwidth Scheduling
          </h2>
          <div className="space-y-3">
            {[
              { name: "Work Hours Limit", schedule: "Mon-Fri, 9AM-5PM", limit: "5 Mbps", reason: "Save for video calls", active: true },
              { name: "Evening Unlimited", schedule: "Every day, 6PM-12AM", limit: "Unlimited", reason: "Full speed", active: true },
              { name: "Backup Window", schedule: "Daily, 2AM-5AM", limit: "10 Mbps", reason: "Background backups", active: true },
            ].map((schedule, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{schedule.name}</p>
                  <p className="text-xs text-gray-500">{schedule.schedule} • {schedule.reason}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{schedule.limit}</span>
                  <Badge className="bg-green-500">active</Badge>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline">Add Schedule</Button>
        </Card>

        {/* Edge Relay Network */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Server className="w-5 h-5" />
            Edge Relay Network
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 bg-gray-50 rounded text-center">
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-gray-500">Active Relays</p>
            </div>
            <div className="p-3 bg-gray-50 rounded text-center">
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-gray-500">Regions</p>
            </div>
            <div className="p-3 bg-gray-50 rounded text-center">
              <p className="text-2xl font-bold">34%</p>
              <p className="text-xs text-gray-500">Network Load</p>
            </div>
          </div>
          <div className="bg-gray-100 rounded p-6 h-40 flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Global relay network map</p>
              <p className="text-xs text-gray-400">Auto-selects fastest relay based on your location</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1">Contribute Bandwidth</Button>
            <Button variant="outline" className="flex-1">View All Relays</Button>
          </div>
        </Card>

        {/* Network Diagnostics */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Network Diagnostics
          </h2>
          <div className="space-y-3 mb-4">
            <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
              <p className="font-medium text-sm text-yellow-800">Last Diagnostic Result</p>
              <p className="text-xs text-yellow-700 mt-1">Bottleneck detected at hop 5 (ISP router in Dallas)</p>
              <p className="text-xs text-gray-600 mt-2">Recommendation: Switch to 5GHz WiFi for 40% better performance</p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Visual Traceroute</p>
            <div className="flex items-center gap-1 overflow-x-auto pb-2">
              {[
                { hop: 1, name: "Your Router", latency: "1ms", status: "good" },
                { hop: 2, name: "ISP Gateway", latency: "5ms", status: "good" },
                { hop: 3, name: "ISP Core", latency: "8ms", status: "good" },
                { hop: 4, name: "Backbone", latency: "15ms", status: "good" },
                { hop: 5, name: "ISP Dallas", latency: "45ms", status: "warning" },
                { hop: 6, name: "Datacenter", latency: "12ms", status: "good" },
                { hop: 7, name: "Remote Device", latency: "3ms", status: "good" },
              ].map((hop, i) => (
                <div key={i} className="flex items-center">
                  <div className={`p-2 rounded text-center min-w-[80px] ${
                    hop.status === "warning" ? "bg-yellow-100 border border-yellow-300" : "bg-green-50 border border-green-200"
                  }`}>
                    <p className="text-xs font-medium">{hop.name}</p>
                    <p className="text-xs text-gray-500">{hop.latency}</p>
                  </div>
                  {i < 6 && <span className="mx-1 text-gray-300">→</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline">Run Traceroute</Button>
            <Button variant="outline">DNS Test</Button>
            <Button variant="outline">Full Analysis</Button>
          </div>
        </Card>

        {/* Connection Quality History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Connection Quality (Last 7 Days)</h2>
          <div className="space-y-2">
            {[
              { day: "Today", score: 94, latency: "12ms", bandwidth: "85 Mbps", issues: [] },
              { day: "Yesterday", score: 88, latency: "18ms", bandwidth: "72 Mbps", issues: ["brief_spike"] },
              { day: "Jun 24", score: 91, latency: "14ms", bandwidth: "80 Mbps", issues: [] },
              { day: "Jun 23", score: 72, latency: "45ms", bandwidth: "35 Mbps", issues: ["high_latency", "low_bandwidth"] },
              { day: "Jun 22", score: 95, latency: "10ms", bandwidth: "90 Mbps", issues: [] },
            ].map((day, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    day.score >= 90 ? "bg-green-500" :
                    day.score >= 70 ? "bg-yellow-500" : "bg-red-500"
                  }`}></div>
                  <div>
                    <p className="font-medium text-sm">{day.day}</p>
                    <p className="text-xs text-gray-500">{day.latency} • {day.bandwidth}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold">{day.score}/100</span>
                  {day.issues.length > 0 && (
                    <Badge className="bg-yellow-500 text-xs">{day.issues.length} issue{day.issues.length > 1 ? "s" : ""}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Offline Mode & Session Continuity */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Offline Mode & Session Continuity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="font-medium text-sm">Auto-Reconnect</p>
              <p className="text-xs text-gray-500 mt-1">Reconnects within 2 seconds if connection drops. Queues all inputs during disconnect.</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-500">Enabled</Badge>
                <span className="text-xs text-gray-500">0 disconnects today</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded">
              <p className="font-medium text-sm">Local File Cache</p>
              <p className="text-xs text-gray-500 mt-1">Important files cached locally for offline access. Syncs when back online.</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-green-500">Enabled</Badge>
                <span className="text-xs text-gray-500">128 MB cached</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Protocol Selection */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Protocol Selection</h2>
          <p className="text-sm text-gray-600 mb-4">Automatic protocol selection with fallback chain</p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { name: "Custom UDP", status: "active", desc: "Fastest, real-time" },
              { name: "QUIC", status: "fallback", desc: "Handles network changes" },
              { name: "WebSocket", status: "fallback", desc: "Firewall-friendly" },
              { name: "HTTP Long-Poll", status: "fallback", desc: "Last resort" },
            ].map((proto, i) => (
              <div key={i} className={`p-3 rounded border ${
                proto.status === "active" ? "border-green-300 bg-green-50" : "border-gray-200"
              }`}>
                <p className="font-medium text-sm">{proto.name}</p>
                <p className="text-xs text-gray-500">{proto.desc}</p>
                {proto.status === "active" && <Badge className="bg-green-500 mt-1 text-xs">Active</Badge>}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
