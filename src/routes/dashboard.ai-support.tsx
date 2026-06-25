import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bot, Zap, Ticket, Play, AlertTriangle, CheckCircle2, Clock,
  Cpu, HardDrive, Wifi, Shield, Thermometer, Search, Plus,
  Mic, MicOff, RefreshCw, ChevronDown, ChevronRight, X
} from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import {
  getTickets, createTicket, resolveTicket, getDeviceDiagnostics, getPredictiveAlerts,
  parseNLCommand, generateAutoFixScript,
  type SupportTicket, type DiagnosticReport, type PredictiveAlert
} from "@/lib/services/aiSupport";
import { useDevices } from "@/lib/services";

export const Route = createFileRoute("/dashboard/ai-support")({
  head: () => ({ meta: [{ title: "AI IT Support — RemoteDesk" }] }),
  component: AiSupportPage,
});

// ─── Status helpers ───────────────────────────────────────────────────────────

function statusColor(s: string) {
  if (s === "critical") return "destructive";
  if (s === "high" || s === "warning") return "secondary";
  return "default";
}

function statusIcon(s: string) {
  if (s === "critical") return <AlertTriangle className="h-4 w-4 text-red-500" />;
  if (s === "high" || s === "warning") return <AlertTriangle className="h-4 w-4 text-amber-500" />;
  return <CheckCircle2 className="h-4 w-4 text-green-500" />;
}

function priorityColor(p: string) {
  if (p === "critical") return "bg-red-500/20 text-red-400 border-red-500/30";
  if (p === "high") return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  if (p === "medium") return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-green-500/20 text-green-400 border-green-500/30";
}

// ─── Chat Message ─────────────────────────────────────────────────────────────

interface ChatMsg {
  role: "user" | "assistant";
  content: string;
  ts: Date;
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function AiSupportPage() {
  const [tab, setTab] = useState("chat");
  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: "assistant",
      content: "👋 Hello! I'm your AI IT Support Agent. Select a device and type a command like \"why is my PC slow\", \"fix my wifi\", or \"scan for issues\" to get started.",
      ts: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [diagnostics, setDiagnostics] = useState<DiagnosticReport[]>([]);
  const [alerts, setAlerts] = useState<PredictiveAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [newTicketOpen, setNewTicketOpen] = useState(false);
  const [newTicketTitle, setNewTicketTitle] = useState("");
  const [newTicketDesc, setNewTicketDesc] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const { data: devicesResult } = useDevices();
  const devices = devicesResult ?? [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load data when device changes
  useEffect(() => {
    if (!selectedDeviceId) return;
    setIsLoading(true);
    Promise.all([
      getDeviceDiagnostics(selectedDeviceId).catch(() => []),
      getPredictiveAlerts(selectedDeviceId).catch(() => [])
    ]).then(([diags, pAlerts]) => {
      setDiagnostics(diags);
      setAlerts(pAlerts);
    }).finally(() => setIsLoading(false));
  }, [selectedDeviceId]);

  // Load tickets on mount
  useEffect(() => {
    getTickets().then(setTickets).catch(() => {});
  }, []);

  const addMsg = useCallback((msg: Omit<ChatMsg, "ts">) => {
    setMessages(prev => [...prev, { ...msg, ts: new Date() }]);
  }, []);

  // ── Chat Handler ──────────────────────────────────────────────────────────

  const handleSend = useCallback(async () => {
    const text = chatInput.trim();
    if (!text || isProcessing) return;
    setChatInput("");
    addMsg({ role: "user", content: text });
    setIsProcessing(true);

    try {
      if (!selectedDeviceId) {
        addMsg({ role: "assistant", content: "⚠️ Please select a device first to run commands." });
        return;
      }

      // Try to parse as a natural language command
      const action = await parseNLCommand(selectedDeviceId, text);
      addMsg({
        role: "assistant",
        content: `🤖 **Parsed Action:** ${action.explanation}\n\nAction type: \`${action.type}\`\n\nTo execute this on the remote machine, the desktop agent will pick it up automatically when connected.`
      });

      // If it looks like a fix request, also generate a script
      if (text.toLowerCase().includes("fix") || text.toLowerCase().includes("repair") || text.toLowerCase().includes("slow")) {
        const scriptResult = await generateAutoFixScript(selectedDeviceId, text);
        addMsg({
          role: "assistant",
          content: `🔧 **Auto-Fix Script Ready**\n\n${scriptResult.explanation}\n\n\`\`\`\n${scriptResult.script.substring(0, 400)}...\n\`\`\`\n\n${scriptResult.requiresReboot ? "⚠️ A reboot may be required." : "✅ No reboot needed."}`
        });
      }
    } catch (err: any) {
      addMsg({ role: "assistant", content: `⚠️ ${err.message || "Something went wrong. Please try again."}` });
    } finally {
      setIsProcessing(false);
    }
  }, [chatInput, isProcessing, selectedDeviceId, addMsg]);

  // ── Voice Input ───────────────────────────────────────────────────────────

  const toggleVoice = useCallback(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Speech recognition not supported in this browser"); return; }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const r = new SR();
    r.continuous = false;
    r.interimResults = false;
    r.lang = "en-US";
    r.onresult = (e: any) => { setChatInput(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start();
    setIsListening(true);
  }, [isListening]);

  // ── Create Ticket ─────────────────────────────────────────────────────────

  const handleCreateTicket = useCallback(async () => {
    if (!newTicketTitle || !selectedDeviceId) {
      toast.error("Please select a device and enter a ticket title");
      return;
    }
    try {
      const ticket = await createTicket({
        deviceId: selectedDeviceId,
        title: newTicketTitle,
        description: newTicketDesc,
        priority: newTicketPriority
      });
      setTickets(prev => [ticket, ...prev]);
      setNewTicketOpen(false);
      setNewTicketTitle("");
      setNewTicketDesc("");
      toast.success("Ticket created");
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [newTicketTitle, newTicketDesc, newTicketPriority, selectedDeviceId]);

  const handleResolveTicket = useCallback(async (id: string) => {
    try {
      const updated = await resolveTicket(id, "Resolved via AI Support Dashboard");
      setTickets(prev => prev.map(t => t.id === id ? updated : t));
      toast.success("Ticket resolved");
    } catch (err: any) {
      toast.error(err.message);
    }
  }, []);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20">
              <Bot className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">AI IT Support</h1>
              <p className="text-sm text-slate-400">Powered by GPT-4o — Diagnose, fix, and monitor remote machines</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
              <SelectTrigger className="w-52 bg-slate-800 border-slate-700 text-slate-200">
                <SelectValue placeholder="Select a device..." />
              </SelectTrigger>
              <SelectContent>
                {devices.map((d: any) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name} ({d.os})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Open Tickets", value: tickets.filter(t => t.status === "open").length, icon: <Ticket className="h-5 w-5 text-amber-400" />, color: "text-amber-400" },
            { label: "Resolved Today", value: tickets.filter(t => t.status === "resolved").length, icon: <CheckCircle2 className="h-5 w-5 text-green-400" />, color: "text-green-400" },
            { label: "Predictive Alerts", value: alerts.length, icon: <AlertTriangle className="h-5 w-5 text-red-400" />, color: "text-red-400" },
            { label: "Diagnostics Run", value: diagnostics.length, icon: <Cpu className="h-5 w-5 text-indigo-400" />, color: "text-indigo-400" },
          ].map(stat => (
            <Card key={stat.label} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-700">{stat.icon}</div>
                <div>
                  <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="flex-1">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="chat" className="data-[state=active]:bg-indigo-600">
              <Bot className="h-4 w-4 mr-2" /> AI Chat
            </TabsTrigger>
            <TabsTrigger value="diagnostics" className="data-[state=active]:bg-indigo-600">
              <Cpu className="h-4 w-4 mr-2" /> Diagnostics
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-indigo-600">
              <Ticket className="h-4 w-4 mr-2" /> Tickets
            </TabsTrigger>
            <TabsTrigger value="alerts" className="data-[state=active]:bg-indigo-600">
              <AlertTriangle className="h-4 w-4 mr-2" /> Predictive Alerts
            </TabsTrigger>
          </TabsList>

          {/* ── Chat Tab ──────────────────────────────────────────────────── */}
          <TabsContent value="chat" className="mt-4">
            <Card className="bg-slate-800 border-slate-700">
              <CardContent className="p-0 flex flex-col" style={{ height: 500 }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 items-start ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm ${msg.role === "user" ? "bg-indigo-600" : "bg-sky-600"}`}>
                        {msg.role === "user" ? "👤" : "🤖"}
                      </div>
                      <div className={`max-w-[70%] p-3 rounded-xl text-sm leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-indigo-600 rounded-tr-sm" : "bg-slate-700 rounded-tl-sm"}`}>
                        {msg.content}
                        <div className="text-xs text-slate-400 mt-1">{msg.ts.toLocaleTimeString()}</div>
                      </div>
                    </div>
                  ))}
                  {isProcessing && (
                    <div className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-sm">🤖</div>
                      <div className="p-3 rounded-xl bg-slate-700 text-sm text-slate-400">Thinking...</div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick Actions */}
                <div className="px-4 pb-2 flex gap-2 flex-wrap">
                  {["Why is my PC slow?", "Fix my wifi", "Clear temp files", "Scan for malware", "Restart print spooler"].map(q => (
                    <button
                      key={q}
                      onClick={() => setChatInput(q)}
                      className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-slate-700 flex gap-2">
                  <button
                    onClick={toggleVoice}
                    className={`p-2 rounded-lg transition-colors ${isListening ? "bg-red-500 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"}`}
                    title="Voice command"
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <Input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder='Type a command or question... (e.g. "fix my wifi")'
                    className="flex-1 bg-slate-900 border-slate-600 text-slate-200"
                  />
                  <Button onClick={handleSend} disabled={isProcessing || !chatInput.trim()} className="bg-indigo-600 hover:bg-indigo-700">
                    {isProcessing ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Send"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Diagnostics Tab ───────────────────────────────────────────── */}
          <TabsContent value="diagnostics" className="mt-4">
            {!selectedDeviceId ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center text-slate-400">
                  <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a device to view diagnostic reports</p>
                </CardContent>
              </Card>
            ) : isLoading ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center text-slate-400">
                  <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                  <p>Loading diagnostics...</p>
                </CardContent>
              </Card>
            ) : diagnostics.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center text-slate-400">
                  <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No diagnostic reports yet. Run diagnostics from the desktop client.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-4">
                {diagnostics.map(report => (
                  <Card key={report.id} className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-slate-200">
                          Diagnostic Report — {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                        </CardTitle>
                        <div className="flex gap-2">
                          {[
                            { label: "CPU", val: report.cpuStatus },
                            { label: "RAM", val: report.memoryStatus },
                            { label: "Disk", val: report.diskStatus },
                            { label: "Net", val: report.networkStatus },
                            { label: "Sec", val: report.securityStatus },
                          ].map(({ label, val }) => (
                            <div key={label} className="flex items-center gap-1 text-xs">
                              {statusIcon(val)}
                              <span className="text-slate-400">{label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 flex flex-col gap-3">
                      <div>
                        <div className="text-xs font-semibold text-slate-400 mb-1">AI Analysis</div>
                        <p className="text-sm text-slate-300 leading-relaxed">{report.aiAnalysis}</p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-400 mb-1">Recommended Actions</div>
                        <p className="text-sm text-slate-300 leading-relaxed">{report.recommendedActions}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tickets Tab ───────────────────────────────────────────────── */}
          <TabsContent value="tickets" className="mt-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-300">Support Tickets</h2>
                <Dialog open={newTicketOpen} onOpenChange={setNewTicketOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" /> New Ticket
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-slate-200">
                    <DialogHeader>
                      <DialogTitle>Create Support Ticket</DialogTitle>
                      <DialogDescription className="text-slate-400">Create a new IT support ticket for a device issue.</DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 mt-4">
                      <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId}>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Select device..." />
                        </SelectTrigger>
                        <SelectContent>
                          {devices.map((d: any) => (
                            <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={newTicketTitle}
                        onChange={e => setNewTicketTitle(e.target.value)}
                        placeholder="Issue title..."
                        className="bg-slate-700 border-slate-600 text-slate-200"
                      />
                      <Textarea
                        value={newTicketDesc}
                        onChange={e => setNewTicketDesc(e.target.value)}
                        placeholder="Describe the issue..."
                        className="bg-slate-700 border-slate-600 text-slate-200"
                        rows={3}
                      />
                      <Select value={newTicketPriority} onValueChange={v => setNewTicketPriority(v as any)}>
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["low", "medium", "high", "critical"].map(p => (
                            <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleCreateTicket} className="bg-indigo-600 hover:bg-indigo-700">Create Ticket</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {tickets.length === 0 ? (
                <Card className="bg-slate-800 border-slate-700">
                  <CardContent className="p-12 text-center text-slate-400">
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No tickets yet. Create one or run diagnostics to auto-generate.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="flex flex-col gap-3">
                  {tickets.map(ticket => (
                    <Card key={ticket.id} className="bg-slate-800 border-slate-700">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-slate-200">{ticket.title}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${priorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                              <Badge variant={ticket.status === "resolved" ? "default" : "secondary"} className="text-xs">
                                {ticket.status}
                              </Badge>
                            </div>
                            {ticket.description && (
                              <p className="text-xs text-slate-400 mb-2">{ticket.description}</p>
                            )}
                            {ticket.aiSummary && (
                              <div className="text-xs text-slate-400 bg-slate-700/50 rounded p-2">
                                🤖 {ticket.aiSummary}
                              </div>
                            )}
                            <div className="text-xs text-slate-500 mt-2">
                              {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                            </div>
                          </div>
                          {ticket.status !== "resolved" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolveTicket(ticket.id)}
                              className="border-slate-600 text-slate-300 hover:bg-slate-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-1" /> Resolve
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* ── Predictive Alerts Tab ─────────────────────────────────────── */}
          <TabsContent value="alerts" className="mt-4">
            {!selectedDeviceId ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center text-slate-400">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a device to view predictive maintenance alerts</p>
                </CardContent>
              </Card>
            ) : alerts.length === 0 ? (
              <Card className="bg-slate-800 border-slate-700">
                <CardContent className="p-12 text-center text-slate-400">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-70" />
                  <p className="text-green-400">No predictive alerts — this device looks healthy!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {alerts.map(alert => (
                  <Card key={alert.id} className="bg-slate-800 border-slate-700 border-l-4 border-l-amber-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-amber-400" />
                            <span className="text-sm font-semibold text-slate-200">{alert.component}</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              {Math.round(alert.confidenceScore * 100)}% confidence
                            </span>
                          </div>
                          <p className="text-sm text-slate-300 mb-2">{alert.reasoning}</p>
                          {alert.predictedFailureDate && (
                            <div className="text-xs text-red-400">
                              ⏰ Predicted failure: {formatDistanceToNow(new Date(alert.predictedFailureDate), { addSuffix: true })}
                            </div>
                          )}
                          <div className="text-xs text-slate-500 mt-1">
                            Detected {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setChatInput(`How do I fix ${alert.component} failure?`);
                            setTab("chat");
                          }}
                          className="border-slate-600 text-slate-300 hover:bg-slate-700"
                        >
                          <Bot className="h-4 w-4 mr-1" /> Ask AI
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
