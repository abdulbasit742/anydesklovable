import { createFileRoute } from "@tanstack/react-router";
import { Clock, RotateCcw, Shield, AlertTriangle, HardDrive, History, Copy, FileText } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/time-machine")({
  head: () => ({ meta: [{ title: "Time Machine — RemoteDesk" }] }),
  component: TimeMachineDashboard,
});

function TimeMachineDashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Clock className="w-8 h-8 text-blue-600" />
              Time Machine
            </h1>
            <p className="text-gray-600">Rewind any device to a previous state</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Schedule Snapshot</Button>
            <Button>Take Snapshot Now</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Snapshots</p>
                <p className="text-2xl font-bold">247</p>
              </div>
              <History className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Storage Used</p>
                <p className="text-2xl font-bold">18.4 GB</p>
                <p className="text-xs text-green-600">62% dedup savings</p>
              </div>
              <HardDrive className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Restores Done</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <RotateCcw className="w-8 h-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Alerts</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
          </Card>
        </div>

        {/* Visual Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">System Timeline</h2>
          <div className="relative">
            {/* Timeline bar */}
            <div className="h-2 bg-gray-200 rounded-full mb-6">
              <div className="h-2 bg-gradient-to-r from-green-400 via-yellow-400 to-green-400 rounded-full w-full relative">
                {/* Timeline dots */}
                <div className="absolute left-[10%] -top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer" title="Safe change"></div>
                <div className="absolute left-[25%] -top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer" title="Software installed"></div>
                <div className="absolute left-[40%] -top-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white cursor-pointer" title="Registry modified"></div>
                <div className="absolute left-[55%] -top-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white cursor-pointer" title="Suspicious change"></div>
                <div className="absolute left-[70%] -top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer" title="Snapshot taken"></div>
                <div className="absolute left-[85%] -top-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white cursor-pointer" title="Current state"></div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>7 days ago</span>
              <span>5 days ago</span>
              <span>3 days ago</span>
              <span>Yesterday</span>
              <span>Today</span>
              <span>Now</span>
            </div>
          </div>

          {/* Timeline Events */}
          <div className="mt-6 space-y-3">
            {[
              { time: "Today, 2:30 PM", event: "Automatic snapshot completed", severity: "info", icon: "🟢" },
              { time: "Today, 11:15 AM", event: "3 startup items added without user action", severity: "critical", icon: "🔴" },
              { time: "Yesterday, 4:00 PM", event: "Chrome updated to v126.0", severity: "info", icon: "🟢" },
              { time: "Yesterday, 9:00 AM", event: "Compliance snapshot (weekly)", severity: "info", icon: "🟢" },
              { time: "2 days ago", event: "Registry run keys modified", severity: "warning", icon: "🟡" },
              { time: "3 days ago", event: "Windows Update KB5039212 installed", severity: "info", icon: "🟢" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer">
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <div>
                    <p className="font-medium text-sm">{item.event}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    item.severity === "critical" ? "bg-red-500" :
                    item.severity === "warning" ? "bg-yellow-500" : "bg-green-500"
                  }>
                    {item.severity}
                  </Badge>
                  <Button variant="ghost" size="sm">Restore to here</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Restore */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Restore</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "1 hour ago", time: "2:00 PM today" },
              { label: "2 hours ago", time: "1:00 PM today" },
              { label: "Yesterday", time: "Jun 25, 3:00 PM" },
              { label: "Last week", time: "Jun 19, 9:00 AM" },
            ].map((point, i) => (
              <button key={i} className="p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left">
                <p className="font-medium">{point.label}</p>
                <p className="text-xs text-gray-500">{point.time}</p>
                <RotateCcw className="w-4 h-4 text-blue-500 mt-2" />
              </button>
            ))}
          </div>
        </Card>

        {/* Selective Restore */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Selective Restore</h2>
          <p className="text-sm text-gray-600 mb-4">Pick exactly what to restore from any point in time</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { component: "Files & Folders", icon: "📁", desc: "Restore specific files or directories" },
              { component: "Registry", icon: "🔧", desc: "Restore registry keys" },
              { component: "Network Settings", icon: "🌐", desc: "Restore network configuration" },
              { component: "Installed Software", icon: "📦", desc: "Restore software state" },
              { component: "Browser Data", icon: "🌍", desc: "Bookmarks, extensions, settings" },
              { component: "User Accounts", icon: "👤", desc: "Restore user accounts & permissions" },
            ].map((item, i) => (
              <button key={i} className="p-4 border rounded-lg hover:bg-gray-50 text-left">
                <span className="text-2xl">{item.icon}</span>
                <p className="font-medium text-sm mt-2">{item.component}</p>
                <p className="text-xs text-gray-500">{item.desc}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Cross-Device Clone */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Copy className="w-5 h-5" />
            Cross-Device Clone
          </h2>
          <p className="text-sm text-gray-600 mb-4">Copy entire system state from one device to another</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="font-medium text-sm">New Employee Setup</p>
              <p className="text-xs text-gray-500 mt-1">Clone from template device to new laptop</p>
              <Button variant="outline" size="sm" className="mt-3">Start Clone</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-medium text-sm">Replace Broken Device</p>
              <p className="text-xs text-gray-500 mt-1">Clone everything to replacement hardware</p>
              <Button variant="outline" size="sm" className="mt-3">Start Clone</Button>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="font-medium text-sm">Dev Environment</p>
              <p className="text-xs text-gray-500 mt-1">Clone identical dev setup to all team members</p>
              <Button variant="outline" size="sm" className="mt-3">Start Clone</Button>
            </div>
          </div>
        </Card>

        {/* Alerts & Suspicious Changes */}
        <Card className="p-6 border-red-200">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Suspicious Changes Detected
          </h2>
          <div className="space-y-3">
            {[
              {
                alert: "3 startup items added without user action",
                time: "Today, 11:15 AM",
                device: "Desktop-01",
                analysis: "Possible malware persistence mechanism detected. Review executables.",
              },
              {
                alert: "Registry run keys modified",
                time: "2 days ago",
                device: "Desktop-01",
                analysis: "Run keys modified outside of known software installation. May indicate unauthorized software.",
              },
              {
                alert: "50 new files appeared in System32",
                time: "3 days ago",
                device: "Server-02",
                analysis: "Large batch of files added to system directory. Correlates with Windows Update KB5039212.",
              },
            ].map((alert, i) => (
              <div key={i} className="p-4 bg-red-50 rounded border border-red-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-sm text-red-800">{alert.alert}</p>
                    <p className="text-xs text-gray-600 mt-1">{alert.device} • {alert.time}</p>
                    <p className="text-xs text-gray-700 mt-2 italic">AI Analysis: {alert.analysis}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm">Dismiss</Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">Rollback</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Snapshot Schedules */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Snapshot Schedules</h2>
          <div className="space-y-3">
            {[
              { name: "Hourly Incremental", cron: "Every hour", nextRun: "3:00 PM", status: "active" },
              { name: "Daily Full Snapshot", cron: "Every day at midnight", nextRun: "12:00 AM", status: "active" },
              { name: "Weekly Compliance", cron: "Every Monday at 9 AM", nextRun: "Mon, Jul 1", status: "active" },
            ].map((schedule, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{schedule.name}</p>
                  <p className="text-xs text-gray-500">{schedule.cron} • Next: {schedule.nextRun}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-500">{schedule.status}</Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline">Add Schedule</Button>
        </Card>

        {/* Storage Analytics */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Storage Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-sm mb-3">Space Usage</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Raw data size</span>
                    <span>48.2 GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>After deduplication</span>
                    <span>22.1 GB (54% saved)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: "46%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>After compression</span>
                    <span>18.4 GB (62% saved)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: "38%" }}></div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-sm mb-3">Storage by Device</h3>
              <div className="space-y-2">
                {[
                  { device: "Desktop-01", size: "8.2 GB", snapshots: 120 },
                  { device: "Laptop-02", size: "5.1 GB", snapshots: 85 },
                  { device: "Server-01", size: "3.8 GB", snapshots: 30 },
                  { device: "Server-02", size: "1.3 GB", snapshots: 12 },
                ].map((device, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium">{device.device}</span>
                    <span className="text-sm text-gray-600">{device.size} • {device.snapshots} snapshots</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Compliance Reports */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Compliance Reports
          </h2>
          <div className="space-y-2">
            {[
              { title: "Weekly Compliance Report - Jun 24", score: 95, status: "passed" },
              { title: "Weekly Compliance Report - Jun 17", score: 92, status: "passed" },
              { title: "Monthly Audit Report - May 2024", score: 88, status: "warning" },
            ].map((report, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-sm">{report.title}</p>
                  <p className="text-xs text-gray-500">Score: {report.score}/100</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={report.status === "passed" ? "bg-green-500" : "bg-yellow-500"}>
                    {report.status}
                  </Badge>
                  <Button variant="ghost" size="sm">Download PDF</Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Disaster Recovery */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-xl font-bold mb-2">Disaster Recovery</h2>
          <p className="text-sm text-gray-600 mb-4">Full bare-metal restore capability — recover even if the OS won't boot</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="font-medium text-sm">1. Create Recovery USB</p>
              <p className="text-xs text-gray-500 mt-1">Download bootable recovery image</p>
              <Button variant="outline" size="sm" className="mt-3">Download ISO</Button>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="font-medium text-sm">2. Boot & Connect</p>
              <p className="text-xs text-gray-500 mt-1">Boot from USB, connects to RemoteDesk</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow-sm">
              <p className="font-medium text-sm">3. Select & Restore</p>
              <p className="text-xs text-gray-500 mt-1">Choose snapshot, restore entire OS</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
