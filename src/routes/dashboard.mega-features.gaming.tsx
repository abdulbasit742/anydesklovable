import { createFileRoute } from "@tanstack/react-router";
import { Gamepad2, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dashboard/mega-features/gaming")({
  head: () => ({ meta: [{ title: "Gaming & Streaming — RemoteDesk" }] }),
  component: GamingDashboard,
});

function GamingDashboard() {
  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Gaming & Streaming</h1>
            <p className="text-gray-600">Monitor gaming sessions and streaming quality</p>
          </div>
          <Button>Start Gaming Session</Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Sessions</p>
                <p className="text-2xl font-bold">24</p>
              </div>
              <Gamepad2 className="w-8 h-8 text-purple-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Latency</p>
                <p className="text-2xl font-bold">12ms</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg FPS</p>
                <p className="text-2xl font-bold">58</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Bitrate</p>
                <p className="text-2xl font-bold">25 Mbps</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Recent Gaming Sessions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Gaming Sessions</h2>
          <div className="space-y-3">
            {[
              {
                game: "Cyberpunk 2077",
                duration: "2h 15m",
                latency: "8ms",
                fps: "60",
                bitrate: "28 Mbps",
              },
              {
                game: "Elden Ring",
                duration: "1h 45m",
                latency: "12ms",
                fps: "55",
                bitrate: "22 Mbps",
              },
              {
                game: "The Witcher 3",
                duration: "3h 20m",
                latency: "15ms",
                fps: "58",
                bitrate: "26 Mbps",
              },
            ].map((session, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">{session.game}</p>
                  <Badge variant="outline">{session.duration}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Latency</p>
                    <p className="font-medium">{session.latency}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">FPS</p>
                    <p className="font-medium">{session.fps}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Bitrate</p>
                    <p className="font-medium">{session.bitrate}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quality Metrics Trend */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Quality Metrics (Last 7 Days)</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Latency</span>
                <span>12ms avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Frame Rate</span>
                <span>58 fps avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "97%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Bitrate</span>
                <span>25 Mbps avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: "83%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Packet Loss</span>
                <span>0.1% avg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "5%" }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Game Library */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Game Library</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              "Cyberpunk 2077",
              "Elden Ring",
              "The Witcher 3",
              "Starfield",
              "Baldur's Gate 3",
              "Fortnite",
              "Valorant",
              "CS:GO",
            ].map((game) => (
              <div key={game} className="p-3 bg-gray-50 rounded text-center hover:bg-gray-100 cursor-pointer">
                <p className="text-sm font-medium">{game}</p>
              </div>
            ))}
          </div>
          <Button className="mt-4 w-full" variant="outline">
            Add Game
          </Button>
        </Card>

        {/* Streaming Configuration */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Streaming Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Encoder</label>
              <select className="w-full border rounded px-3 py-2">
                <option>NVIDIA NVENC (Recommended)</option>
                <option>AMD VCE</option>
                <option>Intel QuickSync</option>
                <option>Software (CPU)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Target Bitrate</label>
              <select className="w-full border rounded px-3 py-2">
                <option>Auto (Recommended)</option>
                <option>10 Mbps</option>
                <option>20 Mbps</option>
                <option>30 Mbps</option>
                <option>50 Mbps</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Resolution</label>
              <select className="w-full border rounded px-3 py-2">
                <option>1080p 60fps</option>
                <option>1440p 60fps</option>
                <option>4K 30fps</option>
                <option>720p 60fps</option>
              </select>
            </div>
            <Button className="w-full">Save Configuration</Button>
          </div>
        </Card>

        {/* Performance Recommendations */}
        <Card className="p-6 bg-blue-50">
          <h2 className="text-xl font-bold mb-4">Performance Recommendations</h2>
          <ul className="space-y-2 text-sm">
            <li>✅ Your network latency is excellent (12ms avg)</li>
            <li>✅ Frame rate is stable above 55 fps</li>
            <li>⚠️ Consider increasing bitrate to 30 Mbps for better quality</li>
            <li>💡 Enable hardware encoding for lower CPU usage</li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
