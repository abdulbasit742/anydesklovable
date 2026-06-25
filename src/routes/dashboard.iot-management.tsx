import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  getSites, createSite, deleteSite,
  getDevices, createDevice, deleteDevice, pingDevice,
  getTopology,
  getSmartEntities, controlEntity, syncHomeAssistant,
  getAlerts, acknowledgeAlert,
  getTunnels, createTunnel, startTunnel, stopTunnel, deleteTunnel,
  getTasks, createTask, runTask, deleteTask,
  getIoTStats,
} from "@/lib/services/iotManagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/iot-management")({
  component: IoTManagementPage,
});

const DEVICE_ICONS: Record<string, string> = {
  camera: "📷", nas: "🗄️", router: "📡", server: "🖥️",
  smart_light: "💡", thermostat: "🌡️", lock: "🔒", printer: "🖨️",
  switch: "🔌", hub: "🏠", sensor: "📊", other: "📟",
};

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  online: "default", offline: "destructive", warning: "secondary", unknown: "outline",
};

function IoTManagementPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sites, setSites] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>("");
  const [devices, setDevices] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [entities, setEntities] = useState<any[]>([]);
  const [tunnels, setTunnels] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [topology, setTopology] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Add forms
  const [newSite, setNewSite] = useState({ name: "", location: "", description: "" });
  const [newDevice, setNewDevice] = useState({ name: "", type: "other", ipAddress: "", macAddress: "", port: "", protocol: "http", vendor: "", model: "" });
  const [newTunnel, setNewTunnel] = useState({ name: "", localPort: "", remoteHost: "", remotePort: "", protocol: "tcp" });
  const [newTask, setNewTask] = useState({ name: "", type: "reboot", schedule: "0 3 * * *", command: "" });

  const fetchAll = useCallback(async () => {
    try {
      const [statsData, sitesData, alertsData, tunnelsData, tasksData] = await Promise.all([
        getIoTStats().catch(() => null),
        getSites().catch(() => ({ sites: [] })),
        getAlerts(false).catch(() => ({ alerts: [] })),
        getTunnels().catch(() => ({ tunnels: [] })),
        getTasks().catch(() => ({ tasks: [] })),
      ]);
      setStats(statsData);
      setSites(sitesData.sites || []);
      setAlerts(alertsData.alerts || []);
      setTunnels(tunnelsData.tunnels || []);
      setTasks(tasksData.tasks || []);
      if (!selectedSite && sitesData.sites?.length > 0) {
        setSelectedSite(sitesData.sites[0].id);
      }
    } catch {}
  }, [selectedSite]);

  const fetchSiteData = useCallback(async () => {
    if (!selectedSite) return;
    try {
      const [devData, entData, topoData] = await Promise.all([
        getDevices(selectedSite).catch(() => ({ devices: [] })),
        getSmartEntities(selectedSite).catch(() => ({ entities: [] })),
        getTopology(selectedSite).catch(() => null),
      ]);
      setDevices(devData.devices || []);
      setEntities(entData.entities || []);
      setTopology(topoData);
    } catch {}
  }, [selectedSite]);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { fetchSiteData(); }, [selectedSite]);

  const handleCreateSite = async () => {
    try {
      await createSite(newSite);
      toast.success("Site created");
      setNewSite({ name: "", location: "", description: "" });
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteSite = async (id: string) => {
    try { await deleteSite(id); toast.success("Site deleted"); fetchAll(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleCreateDevice = async () => {
    if (!selectedSite) return toast.error("Select a site first");
    try {
      await createDevice({ ...newDevice, siteId: selectedSite, port: newDevice.port ? Number(newDevice.port) : undefined });
      toast.success("Device added");
      setNewDevice({ name: "", type: "other", ipAddress: "", macAddress: "", port: "", protocol: "http", vendor: "", model: "" });
      fetchSiteData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handlePing = async (device: any) => {
    try {
      const r = await pingDevice(device.id);
      toast.success(`Ping: ${r.latency >= 0 ? `${r.latency}ms` : "offline"}`);
      fetchSiteData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleControlEntity = async (entity: any, action: string, value?: any) => {
    try {
      await controlEntity(entity.id, action, value);
      toast.success(`${action} sent`);
      fetchSiteData();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleAcknowledge = async (id: string) => {
    try { await acknowledgeAlert(id); toast.success("Alert acknowledged"); fetchAll(); }
    catch (e: any) { toast.error(e.message); }
  };

  const handleCreateTunnel = async () => {
    try {
      await createTunnel({ ...newTunnel, localPort: Number(newTunnel.localPort), remotePort: Number(newTunnel.remotePort) });
      toast.success("Tunnel created");
      setNewTunnel({ name: "", localPort: "", remoteHost: "", remotePort: "", protocol: "tcp" });
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleCreateTask = async () => {
    if (!selectedSite) return toast.error("Select a site first");
    try {
      await createTask({ ...newTask, siteId: selectedSite });
      toast.success("Task created");
      setNewTask({ name: "", type: "reboot", schedule: "0 3 * * *", command: "" });
      fetchAll();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleSyncHA = async () => {
    if (!selectedSite) return;
    setLoading(true);
    try {
      await syncHomeAssistant(selectedSite);
      toast.success("Home Assistant synced");
      fetchSiteData();
    } catch (e: any) { toast.error(e.message); }
    finally { setLoading(false); }
  };

  const unackedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🌐 IoT & Smart Device Management</h1>
          <p className="text-muted-foreground">Manage all devices, cameras, NAS, smart home, and networks across all your sites</p>
        </div>
        <div className="flex items-center gap-3">
          {unackedAlerts.length > 0 && (
            <Badge variant="destructive">{unackedAlerts.length} alerts</Badge>
          )}
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select site" />
            </SelectTrigger>
            <SelectContent>
              {sites.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAll}>↻ Refresh</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="overview">📊 Overview</TabsTrigger>
          <TabsTrigger value="sites">🌍 Sites</TabsTrigger>
          <TabsTrigger value="devices">📟 Devices ({devices.length})</TabsTrigger>
          <TabsTrigger value="topology">🗺️ Network Map</TabsTrigger>
          <TabsTrigger value="smarthome">🏠 Smart Home</TabsTrigger>
          <TabsTrigger value="tunnels">🔒 Tunnels</TabsTrigger>
          <TabsTrigger value="tasks">⏰ Tasks</TabsTrigger>
          <TabsTrigger value="alerts">
            🔔 Alerts {unackedAlerts.length > 0 && <Badge variant="destructive" className="ml-1">{unackedAlerts.length}</Badge>}
          </TabsTrigger>
        </TabsList>

        {/* ─── Overview ─────────────────────────────────────────────────────── */}
        <TabsContent value="overview" className="space-y-4">
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Sites", value: stats.totalSites, icon: "🌍", color: "text-blue-500" },
                { label: "Devices", value: stats.totalDevices, icon: "📟", color: "text-purple-500" },
                { label: "Online", value: stats.onlineDevices, icon: "✅", color: "text-green-500" },
                { label: "Offline", value: stats.offlineDevices, icon: "❌", color: "text-red-500" },
                { label: "Alerts", value: stats.unackedAlerts, icon: "🔔", color: "text-yellow-500" },
                { label: "Tunnels", value: stats.activeTunnels, icon: "🔒", color: "text-cyan-500" },
              ].map(s => (
                <Card key={s.label}>
                  <CardContent className="pt-4 text-center">
                    <div className="text-2xl">{s.icon}</div>
                    <div className={`text-3xl font-bold ${s.color}`}>{s.value ?? 0}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Recent Alerts */}
          {unackedAlerts.length > 0 && (
            <Card>
              <CardHeader><CardTitle>🔔 Recent Alerts</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {unackedAlerts.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center justify-between p-2 rounded bg-muted">
                    <div>
                      <span className={`font-medium ${a.severity === "critical" ? "text-red-500" : a.severity === "warning" ? "text-yellow-500" : "text-blue-500"}`}>
                        {a.severity === "critical" ? "🔴" : a.severity === "warning" ? "🟡" : "🔵"} {a.title}
                      </span>
                      <p className="text-xs text-muted-foreground">{a.message}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleAcknowledge(a.id)}>Ack</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Site Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map(site => (
              <Card key={site.id} className={`cursor-pointer ${selectedSite === site.id ? "ring-2 ring-primary" : ""}`}
                onClick={() => setSelectedSite(site.id)}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{site.name}</div>
                    <Badge variant={site.isActive ? "default" : "secondary"}>{site.isActive ? "Active" : "Inactive"}</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{site.location || "No location"}</div>
                  <div className="text-xs text-muted-foreground mt-1">{site._count?.devices || 0} devices</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Sites ────────────────────────────────────────────────────────── */}
        <TabsContent value="sites" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Sites</h2>
            <Dialog>
              <DialogTrigger asChild><Button>+ Add Site</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add New Site</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={newSite.name} onChange={e => setNewSite(p => ({ ...p, name: e.target.value }))} placeholder="Home Office" /></div>
                  <div><Label>Location</Label><Input value={newSite.location} onChange={e => setNewSite(p => ({ ...p, location: e.target.value }))} placeholder="New York, USA" /></div>
                  <div><Label>Description</Label><Input value={newSite.description} onChange={e => setNewSite(p => ({ ...p, description: e.target.value }))} /></div>
                  <Button className="w-full" onClick={handleCreateSite}>Create Site</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map(site => (
              <Card key={site.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{site.name}</div>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteSite(site.id)}>Delete</Button>
                  </div>
                  <div className="text-sm text-muted-foreground">{site.location}</div>
                  <div className="text-xs text-muted-foreground">{site.description}</div>
                  <div className="text-xs mt-2">{site._count?.devices || 0} devices • {site._count?.alerts || 0} alerts</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ─── Devices ──────────────────────────────────────────────────────── */}
        <TabsContent value="devices" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Devices {selectedSite ? `— ${sites.find(s => s.id === selectedSite)?.name}` : ""}</h2>
            <Dialog>
              <DialogTrigger asChild><Button>+ Add Device</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Device</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={newDevice.name} onChange={e => setNewDevice(p => ({ ...p, name: e.target.value }))} placeholder="Living Room Camera" /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newDevice.type} onValueChange={v => setNewDevice(p => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(DEVICE_ICONS).map(([k, v]) => <SelectItem key={k} value={k}>{v} {k}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>IP Address</Label><Input value={newDevice.ipAddress} onChange={e => setNewDevice(p => ({ ...p, ipAddress: e.target.value }))} placeholder="192.168.1.100" /></div>
                  <div><Label>MAC Address</Label><Input value={newDevice.macAddress} onChange={e => setNewDevice(p => ({ ...p, macAddress: e.target.value }))} placeholder="AA:BB:CC:DD:EE:FF" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Port</Label><Input value={newDevice.port} onChange={e => setNewDevice(p => ({ ...p, port: e.target.value }))} placeholder="80" /></div>
                    <div><Label>Protocol</Label><Input value={newDevice.protocol} onChange={e => setNewDevice(p => ({ ...p, protocol: e.target.value }))} placeholder="http" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Vendor</Label><Input value={newDevice.vendor} onChange={e => setNewDevice(p => ({ ...p, vendor: e.target.value }))} placeholder="Synology" /></div>
                    <div><Label>Model</Label><Input value={newDevice.model} onChange={e => setNewDevice(p => ({ ...p, model: e.target.value }))} placeholder="DS920+" /></div>
                  </div>
                  <Button className="w-full" onClick={handleCreateDevice}>Add Device</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {devices.length === 0 ? (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">No devices. Add devices manually or use the desktop client to scan your network.</CardContent></Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {devices.map(d => (
                <Card key={d.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">{DEVICE_ICONS[d.type] || "📟"}</span>
                      <Badge variant={STATUS_BADGE[d.status] || "outline"}>{d.status}</Badge>
                    </div>
                    <div className="font-semibold">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.type} • {d.ipAddress || "—"}</div>
                    {d.vendor && <div className="text-xs text-muted-foreground">{d.vendor} {d.model}</div>}
                    {d.lastPing !== undefined && d.lastPing >= 0 && (
                      <div className="text-xs text-green-500">⚡ {d.lastPing}ms</div>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <Button size="sm" variant="outline" onClick={() => handlePing(d)}>Ping</Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteDevice(d.id).then(fetchSiteData)}>✕</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Network Topology ─────────────────────────────────────────────── */}
        <TabsContent value="topology" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Network Topology Map</h2>
            <Button variant="outline" onClick={fetchSiteData}>↻ Refresh</Button>
          </div>
          {!topology ? (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">Select a site to view topology</CardContent></Card>
          ) : (
            <Card>
              <CardContent className="pt-4">
                <div className="relative bg-muted/30 rounded-lg" style={{ minHeight: 420 }}>
                  <svg className="absolute inset-0 w-full h-full">
                    {topology.edges?.map((e: any) => {
                      const src = topology.nodes?.find((n: any) => n.id === e.source);
                      const tgt = topology.nodes?.find((n: any) => n.id === e.target);
                      if (!src || !tgt) return null;
                      return <line key={e.id} x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y} stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4,4" />;
                    })}
                  </svg>
                  {topology.nodes?.map((n: any) => (
                    <div key={n.id} className="absolute text-center" style={{ left: n.x - 30, top: n.y - 30, width: 60 }}>
                      <div className="text-2xl">{DEVICE_ICONS[n.type] || "📟"}</div>
                      <div className="text-xs text-muted-foreground truncate">{n.name}</div>
                      <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${n.status === "online" ? "bg-green-500" : n.status === "offline" ? "bg-red-500" : "bg-yellow-500"}`} />
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {topology.nodes?.map((n: any) => (
                    <div key={n.id} className="flex items-center gap-2 text-sm">
                      <span>{DEVICE_ICONS[n.type] || "📟"}</span>
                      <span className="truncate">{n.name}</span>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${n.status === "online" ? "bg-green-500" : "bg-red-500"}`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ─── Smart Home ───────────────────────────────────────────────────── */}
        <TabsContent value="smarthome" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Smart Home Control</h2>
            <Button variant="outline" onClick={handleSyncHA} disabled={loading}>{loading ? "Syncing..." : "Sync Home Assistant"}</Button>
          </div>
          {entities.length === 0 ? (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">No smart home entities. Click "Sync Home Assistant" to import from your HA instance.</CardContent></Card>
          ) : (
            (() => {
              const domains = [...new Set(entities.map((e: any) => e.domain))];
              return domains.map(domain => (
                <Card key={domain as string}>
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {domain === "light" ? "💡" : domain === "switch" ? "🔌" : domain === "climate" ? "🌡️" : domain === "lock" ? "🔒" : domain === "sensor" ? "📊" : "🏠"} {domain as string}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {entities.filter((e: any) => e.domain === domain).map((entity: any) => (
                        <div key={entity.id} className="p-3 rounded-lg bg-muted space-y-2">
                          <div className="font-medium text-sm">{entity.name}</div>
                          <Badge variant={entity.state === "on" || entity.state === "unlocked" ? "default" : "secondary"}>{entity.state || "unknown"}</Badge>
                          {entity.isControllable && (
                            <div className="flex gap-1 flex-wrap">
                              {(domain === "light" || domain === "switch") && (
                                <>
                                  <Button size="sm" className="h-6 text-xs" onClick={() => handleControlEntity(entity, "turn_on")}>On</Button>
                                  <Button size="sm" variant="destructive" className="h-6 text-xs" onClick={() => handleControlEntity(entity, "turn_off")}>Off</Button>
                                </>
                              )}
                              {domain === "lock" && (
                                <>
                                  <Button size="sm" className="h-6 text-xs" onClick={() => handleControlEntity(entity, "unlock")}>Unlock</Button>
                                  <Button size="sm" variant="destructive" className="h-6 text-xs" onClick={() => handleControlEntity(entity, "lock")}>Lock</Button>
                                </>
                              )}
                              {domain === "climate" && (
                                <div className="flex items-center gap-1">
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => handleControlEntity(entity, "set_temperature", Number(entity.state || 20) - 1)}>−</Button>
                                  <span className="text-xs">{entity.state}°C</span>
                                  <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => handleControlEntity(entity, "set_temperature", Number(entity.state || 20) + 1)}>+</Button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ));
            })()
          )}
        </TabsContent>

        {/* ─── Tunnels ──────────────────────────────────────────────────────── */}
        <TabsContent value="tunnels" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Secure Tunnels</h2>
            <Dialog>
              <DialogTrigger asChild><Button>+ New Tunnel</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Secure Tunnel</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={newTunnel.name} onChange={e => setNewTunnel(p => ({ ...p, name: e.target.value }))} placeholder="NAS Access" /></div>
                  <div><Label>Remote Host</Label><Input value={newTunnel.remoteHost} onChange={e => setNewTunnel(p => ({ ...p, remoteHost: e.target.value }))} placeholder="192.168.1.100" /></div>
                  <div className="grid grid-cols-2 gap-2">
                    <div><Label>Local Port</Label><Input value={newTunnel.localPort} onChange={e => setNewTunnel(p => ({ ...p, localPort: e.target.value }))} placeholder="8080" /></div>
                    <div><Label>Remote Port</Label><Input value={newTunnel.remotePort} onChange={e => setNewTunnel(p => ({ ...p, remotePort: e.target.value }))} placeholder="80" /></div>
                  </div>
                  <div>
                    <Label>Protocol</Label>
                    <Select value={newTunnel.protocol} onValueChange={v => setNewTunnel(p => ({ ...p, protocol: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tcp">TCP</SelectItem>
                        <SelectItem value="udp">UDP</SelectItem>
                        <SelectItem value="ssh">SSH</SelectItem>
                        <SelectItem value="http">HTTP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full" onClick={handleCreateTunnel}>Create Tunnel</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {tunnels.length === 0 ? (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">No tunnels configured.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {tunnels.map(t => (
                <Card key={t.id}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">localhost:{t.localPort} → {t.remoteHost}:{t.remotePort} ({t.protocol.toUpperCase()})</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={t.status === "running" ? "default" : "secondary"}>{t.status}</Badge>
                      {t.status !== "running" ? (
                        <Button size="sm" onClick={() => startTunnel(t.id).then(fetchAll)}>Start</Button>
                      ) : (
                        <Button size="sm" variant="destructive" onClick={() => stopTunnel(t.id).then(fetchAll)}>Stop</Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => deleteTunnel(t.id).then(fetchAll)}>✕</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Tasks ────────────────────────────────────────────────────────── */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Scheduled Tasks</h2>
            <Dialog>
              <DialogTrigger asChild><Button>+ New Task</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create Scheduled Task</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <div><Label>Name</Label><Input value={newTask.name} onChange={e => setNewTask(p => ({ ...p, name: e.target.value }))} placeholder="Nightly Reboot" /></div>
                  <div>
                    <Label>Type</Label>
                    <Select value={newTask.type} onValueChange={v => setNewTask(p => ({ ...p, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="reboot">Reboot</SelectItem>
                        <SelectItem value="backup">Backup</SelectItem>
                        <SelectItem value="update">Update</SelectItem>
                        <SelectItem value="ping">Ping Check</SelectItem>
                        <SelectItem value="script">Custom Script</SelectItem>
                        <SelectItem value="alert_check">Alert Check</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Schedule (cron)</Label><Input value={newTask.schedule} onChange={e => setNewTask(p => ({ ...p, schedule: e.target.value }))} placeholder="0 3 * * *" /></div>
                  {newTask.type === "script" && (
                    <div><Label>Command</Label><Input value={newTask.command} onChange={e => setNewTask(p => ({ ...p, command: e.target.value }))} placeholder="bash /opt/backup.sh" /></div>
                  )}
                  <Button className="w-full" onClick={handleCreateTask}>Create Task</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          {tasks.length === 0 ? (
            <Card><CardContent className="pt-6 text-center text-muted-foreground">No scheduled tasks.</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {tasks.map(t => (
                <Card key={t.id}>
                  <CardContent className="pt-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-sm text-muted-foreground">Type: {t.type} • Schedule: {t.schedule}</div>
                      {t.lastRunAt && (
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(t.lastRunAt).toLocaleString()} —
                          <span className={`ml-1 ${t.lastRunStatus === "success" ? "text-green-500" : t.lastRunStatus === "failed" ? "text-red-500" : "text-yellow-500"}`}>
                            {t.lastRunStatus}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={t.isEnabled ? "default" : "secondary"}>{t.isEnabled ? "Enabled" : "Disabled"}</Badge>
                      <Button size="sm" onClick={() => runTask(t.id).then(fetchAll)}>▶ Run</Button>
                      <Button size="sm" variant="outline" onClick={() => deleteTask(t.id).then(fetchAll)}>✕</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ─── Alerts ───────────────────────────────────────────────────────── */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Alerts</h2>
            <Button variant="outline" onClick={fetchAll}>↻ Refresh</Button>
          </div>
          {alerts.length === 0 ? (
            <Card><CardContent className="pt-6 text-center text-green-500">✅ No unacknowledged alerts</CardContent></Card>
          ) : (
            <div className="space-y-3">
              {alerts.map(a => (
                <Card key={a.id} className={`border-l-4 ${a.severity === "critical" ? "border-l-red-500" : a.severity === "warning" ? "border-l-yellow-500" : "border-l-blue-500"}`}>
                  <CardContent className="pt-4 flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{a.title}</div>
                      <div className="text-sm text-muted-foreground">{a.message}</div>
                      {a.device && <div className="text-xs text-muted-foreground">Device: {a.device.name}</div>}
                      <div className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={a.severity === "critical" ? "destructive" : a.severity === "warning" ? "secondary" : "default"}>{a.severity}</Badge>
                      <Button size="sm" variant="outline" onClick={() => handleAcknowledge(a.id)}>Acknowledge</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
