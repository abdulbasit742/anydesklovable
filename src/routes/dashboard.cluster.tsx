import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Server, Plus, LogIn, Cpu, MemoryStick, Monitor, Thermometer, Network,
  Trash2, RefreshCw, Send, ChevronRight, Activity, Zap, Users
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  useClusters, useClusterDetail, useClusterStats, useClusterTasks,
  useCreateCluster, useJoinCluster, useDeleteCluster, useSubmitTask,
  type Cluster, type ClusterNode, type ClusterAggregateStats,
} from "@/lib/services/cluster";

export const Route = createFileRoute("/dashboard/cluster")({
  head: () => ({ meta: [{ title: "Cluster — RemoteDesk" }] }),
  component: ClusterPage,
});

// ─── Status badge helper ──────────────────────────────────────────────────────

function nodeStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "online" || status === "idle") return "default";
  if (status === "busy") return "secondary";
  if (status === "offline") return "destructive";
  return "outline";
}

function taskStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  if (status === "completed") return "default";
  if (status === "running") return "secondary";
  if (status === "failed") return "destructive";
  return "outline";
}

// ─── Metric card ─────────────────────────────────────────────────────────────

function MetricCard({ title, value, unit, icon: Icon, color, progress }: {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ElementType;
  color: string;
  progress?: number;
}) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</span>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
        <div className="text-2xl font-bold" style={{ color: progress != null && progress > 85 ? "#ef4444" : progress != null && progress > 65 ? "#f59e0b" : undefined }}>
          {value}{unit && <span className="text-sm font-normal text-muted-foreground ml-1">{unit}</span>}
        </div>
        {progress != null && (
          <Progress value={progress} className="mt-2 h-1.5" />
        )}
      </CardContent>
    </Card>
  );
}

// ─── Aggregate stats panel ────────────────────────────────────────────────────

function AggregateStatsPanel({ stats }: { stats: ClusterAggregateStats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 mb-6">
      <MetricCard title="Avg CPU" value={stats.avgCpuPercent.toFixed(1)} unit="%" icon={Cpu} color="#3b82f6" progress={stats.avgCpuPercent} />
      <MetricCard title="Avg RAM" value={stats.avgRamPercent.toFixed(1)} unit="%" icon={MemoryStick} color="#8b5cf6" progress={stats.avgRamPercent} />
      {stats.avgGpuPercent != null && (
        <MetricCard title="Avg GPU" value={stats.avgGpuPercent.toFixed(1)} unit="%" icon={Monitor} color="#06b6d4" progress={stats.avgGpuPercent} />
      )}
      <MetricCard title="Online Nodes" value={`${stats.onlineNodes}/${stats.totalNodes}`} icon={Users} color="#22c55e" />
      <MetricCard title="Active Tasks" value={stats.totalActiveTasks} icon={Activity} color="#f59e0b" />
      <MetricCard title="Done Today" value={stats.completedTasksToday} icon={Zap} color="#22c55e" />
      {stats.avgCpuTempC != null && (
        <MetricCard title="CPU Temp" value={stats.avgCpuTempC.toFixed(0)} unit="°C" icon={Thermometer} color="#f97316" progress={stats.avgCpuTempC} />
      )}
      <MetricCard title="Net ↑" value={(stats.totalNetworkUpKbps / 1024).toFixed(1)} unit="MB/s" icon={Network} color="#22c55e" />
      <MetricCard title="Net ↓" value={(stats.totalNetworkDownKbps / 1024).toFixed(1)} unit="MB/s" icon={Network} color="#22c55e" />
      <MetricCard title="Pending Tasks" value={stats.pendingTasks} icon={Server} color="#94a3b8" />
    </div>
  );
}

// ─── Node row ─────────────────────────────────────────────────────────────────

function NodeRow({ node }: { node: ClusterNode }) {
  const t = node.latestTelemetry;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{node.nickname ?? `Node ${node.id.slice(0, 8)}`}</span>
          <Badge variant={nodeStatusVariant(node.status)} className="text-xs">{node.status}</Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">
          Priority {node.priorityLevel} · CPU limit {Math.round(node.cpuShareLimit * 100)}% · RAM limit {Math.round(node.ramShareLimit * 100)}% · GPU limit {Math.round(node.gpuShareLimit * 100)}%
        </div>
      </div>
      {t && (
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Cpu className="h-3 w-3" />{t.cpuPercent.toFixed(1)}%</span>
          <span className="flex items-center gap-1"><MemoryStick className="h-3 w-3" />{t.ramPercent.toFixed(1)}%</span>
          {t.gpuPercent != null && <span className="flex items-center gap-1"><Monitor className="h-3 w-3" />{t.gpuPercent.toFixed(1)}%</span>}
          <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{t.activeTaskCount} tasks</span>
        </div>
      )}
      {!t && <span className="text-xs text-muted-foreground">No telemetry yet</span>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ClusterPage() {
  const [selectedClusterId, setSelectedClusterId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);

  // Form state
  const [createName, setCreateName] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createMax, setCreateMax] = useState(5);
  const [inviteCode, setInviteCode] = useState("");
  const [joinDeviceId, setJoinDeviceId] = useState("");
  const [taskName, setTaskName] = useState("");
  const [taskType, setTaskType] = useState("custom");
  const [taskPriority, setTaskPriority] = useState([5]);
  const [taskDesc, setTaskDesc] = useState("");

  const qc = useQueryClient();
  const { data: clusters = [], isLoading: clustersLoading } = useClusters();
  const { data: clusterDetail } = useClusterDetail(selectedClusterId);
  const { data: clusterStats } = useClusterStats(selectedClusterId);
  const { data: tasks = [] } = useClusterTasks(selectedClusterId);

  const createMut = useCreateCluster();
  const joinMut = useJoinCluster();
  const deleteMut = useDeleteCluster();
  const submitTaskMut = useSubmitTask();

  const selectedCluster = clusters.find((c) => c.id === selectedClusterId) ?? null;

  const handleCreate = async () => {
    if (!createName.trim()) return;
    try {
      await createMut.mutateAsync({ name: createName.trim(), description: createDesc || undefined, maxNodes: createMax });
      toast.success("Cluster created");
      setCreateOpen(false);
      setCreateName(""); setCreateDesc(""); setCreateMax(5);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleJoin = async () => {
    if (!inviteCode.trim() || !joinDeviceId.trim()) return;
    try {
      await joinMut.mutateAsync({ inviteCode: inviteCode.trim(), deviceId: joinDeviceId.trim() });
      toast.success("Joined cluster");
      setJoinOpen(false);
      setInviteCode(""); setJoinDeviceId("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMut.mutateAsync(id);
      toast.success("Cluster deleted");
      if (selectedClusterId === id) setSelectedClusterId(null);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSubmitTask = async () => {
    if (!selectedClusterId || !taskName.trim()) return;
    try {
      await submitTaskMut.mutateAsync({
        clusterId: selectedClusterId,
        task: { name: taskName.trim(), type: taskType, priority: taskPriority[0], description: taskDesc || undefined },
      });
      toast.success("Task submitted");
      setTaskOpen(false);
      setTaskName(""); setTaskDesc(""); setTaskPriority([5]);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const actions = (
    <div className="flex gap-2">
      <Button size="sm" variant="outline" onClick={() => qc.invalidateQueries({ queryKey: ["clusters"] })}>
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Refresh
      </Button>
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline"><LogIn className="mr-1.5 h-3.5 w-3.5" /> Join</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Join a Cluster</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Invite Code</Label><Input value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} placeholder="UUID invite code" /></div>
            <div><Label>Your Device ID</Label><Input value={joinDeviceId} onChange={(e) => setJoinDeviceId(e.target.value)} placeholder="Device UUID" /></div>
          </div>
          <DialogFooter>
            <Button onClick={handleJoin} disabled={joinMut.isPending}>
              {joinMut.isPending ? "Joining…" : "Join Cluster"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogTrigger asChild>
          <Button size="sm"><Plus className="mr-1.5 h-3.5 w-3.5" /> New Cluster</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Cluster</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label>Name</Label><Input value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="My Render Farm" /></div>
            <div><Label>Description</Label><Textarea value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} placeholder="Optional description" rows={2} /></div>
            <div>
              <Label>Max Nodes: {createMax}</Label>
              <Slider value={[createMax]} onValueChange={(v) => setCreateMax(v[0])} min={2} max={20} step={1} className="mt-2" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={createMut.isPending}>
              {createMut.isPending ? "Creating…" : "Create Cluster"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );

  return (
    <AppShell title="Distributed Computing" actions={actions}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Cluster list */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Clusters</h2>
          {clustersLoading && <div className="text-sm text-muted-foreground">Loading clusters…</div>}
          {!clustersLoading && clusters.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No clusters yet. Create one to get started.
            </div>
          )}
          {clusters.map((cluster) => (
            <div
              key={cluster.id}
              onClick={() => setSelectedClusterId(cluster.id)}
              className={`cursor-pointer rounded-lg border p-3 transition-colors ${
                selectedClusterId === cluster.id
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">{cluster.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={cluster.status === "active" ? "default" : "secondary"} className="text-xs">
                    {cluster.status}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6"
                    onClick={(e) => { e.stopPropagation(); handleDelete(cluster.id); }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span>{cluster.onlineNodeCount}/{cluster.nodeCount} nodes online</span>
                <ChevronRight className="h-3 w-3 ml-auto" />
              </div>
              <div className="mt-1 text-xs text-muted-foreground truncate">
                Invite: <code className="text-xs">{cluster.inviteCode}</code>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Cluster detail */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedCluster ? (
            <div className="flex items-center justify-center h-48 rounded-lg border border-dashed border-border text-sm text-muted-foreground">
              Select a cluster to view details
            </div>
          ) : (
            <>
              {/* Aggregate stats */}
              {clusterStats && <AggregateStatsPanel stats={clusterStats} />}

              {/* Nodes */}
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Nodes ({clusterDetail?.nodes.length ?? 0})
                </h3>
                <div className="space-y-2">
                  {(clusterDetail?.nodes ?? []).length === 0 ? (
                    <div className="text-sm text-muted-foreground">No nodes in this cluster yet.</div>
                  ) : (
                    (clusterDetail?.nodes ?? []).map((node) => <NodeRow key={node.id} node={node} />)
                  )}
                </div>
              </div>

              {/* Tasks */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Tasks ({tasks.length})
                  </h3>
                  <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline"><Send className="mr-1.5 h-3.5 w-3.5" /> Submit Task</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Submit Distributed Task</DialogTitle></DialogHeader>
                      <div className="space-y-3 py-2">
                        <div><Label>Task Name</Label><Input value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Render batch 001" /></div>
                        <div>
                          <Label>Type</Label>
                          <Select value={taskType} onValueChange={setTaskType}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="custom">Custom</SelectItem>
                              <SelectItem value="video_render">Video Render</SelectItem>
                              <SelectItem value="ai_inference">AI Inference</SelectItem>
                              <SelectItem value="compilation">Compilation</SelectItem>
                              <SelectItem value="game_stream">Game Stream</SelectItem>
                              <SelectItem value="scientific_compute">Scientific Compute</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Priority: {taskPriority[0]}</Label>
                          <Slider value={taskPriority} onValueChange={setTaskPriority} min={1} max={10} step={1} className="mt-2" />
                        </div>
                        <div><Label>Description</Label><Textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Optional description" rows={2} /></div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleSubmitTask} disabled={submitTaskMut.isPending}>
                          {submitTaskMut.isPending ? "Submitting…" : "Submit Task"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                {tasks.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No tasks yet.</div>
                ) : (
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Name</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Type</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Status</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Progress</th>
                          <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">Priority</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {tasks.map((task) => (
                          <tr key={task.id} className="hover:bg-muted/30">
                            <td className="px-3 py-2 font-medium">{task.name}</td>
                            <td className="px-3 py-2 text-muted-foreground capitalize">{task.type.replace("_", " ")}</td>
                            <td className="px-3 py-2">
                              <Badge variant={taskStatusVariant(task.status)} className="text-xs">{task.status}</Badge>
                            </td>
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <Progress value={task.progressPercent} className="h-1.5 w-16" />
                                <span className="text-xs text-muted-foreground">{task.progressPercent.toFixed(0)}%</span>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-muted-foreground">{task.priority}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
