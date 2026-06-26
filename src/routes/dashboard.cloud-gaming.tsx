/**
 * Cloud Gaming Dashboard Page
 *
 * Provides: streaming profile management, game library, session history,
 * Wake-on-LAN controls, performance stats, and encoder configuration.
 */

import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  listStreamingProfiles, createStreamingProfile, deleteStreamingProfile,
  listGamingSessions, listGames, addGame, deleteGame,
  listWolTargets, addWolTarget, deleteWolTarget, sendWakeOnLan,
  getCloudGamingStats,
  type StreamingProfile, type GamingSession, type GameEntry,
  type WolTarget, type CloudGamingStats
} from "@/lib/services/cloudGaming";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/dashboard/cloud-gaming")({
  component: CloudGamingPage,
});

// ─── Utility Components ───────────────────────────────────────────────────────

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="text-xs text-slate-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color || "text-white"}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
    </div>
  );
}

function Badge({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    green: "bg-emerald-900 text-emerald-300 border-emerald-700",
    red: "bg-red-900 text-red-300 border-red-700",
    blue: "bg-blue-900 text-blue-300 border-blue-700",
    yellow: "bg-yellow-900 text-yellow-300 border-yellow-700",
    slate: "bg-slate-700 text-slate-300 border-slate-600",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded border font-medium ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function CloudGamingPage() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "profiles" | "games" | "sessions" | "wol">("overview");
  const [profiles, setProfiles] = useState<StreamingProfile[]>([]);
  const [sessions, setSessions] = useState<GamingSession[]>([]);
  const [games, setGames] = useState<GameEntry[]>([]);
  const [wolTargets, setWolTargets] = useState<WolTarget[]>([]);
  const [stats, setStats] = useState<CloudGamingStats | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Profile form
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "", codec: "h264", resolution: "1920x1080", framerate: 60,
    bitrate: 20000, latencyMode: "low", hdrEnabled: false,
    adaptiveBitrate: true, audioChannels: 2, isDefault: false
  });

  // Game form
  const [showGameForm, setShowGameForm] = useState(false);
  const [gameForm, setGameForm] = useState({ name: "", processName: "", platform: "steam", coverUrl: "" });

  // WoL form
  const [showWolForm, setShowWolForm] = useState(false);
  const [wolForm, setWolForm] = useState({ name: "", macAddress: "", broadcastIp: "255.255.255.255" });

  const showMsg = useCallback((text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }, []);

  const setLoad = useCallback((key: string, val: boolean) => setLoading(p => ({ ...p, [key]: val })), []);

  const loadAll = useCallback(async () => {
    if (!token) return;
    setLoad("init", true);
    try {
      const [p, s, g, w, st] = await Promise.allSettled([
        listStreamingProfiles(token),
        listGamingSessions(token),
        listGames(token),
        listWolTargets(token),
        getCloudGamingStats(token)
      ]);
      if (p.status === "fulfilled") setProfiles(p.value);
      if (s.status === "fulfilled") setSessions(s.value);
      if (g.status === "fulfilled") setGames(g.value);
      if (w.status === "fulfilled") setWolTargets(w.value);
      if (st.status === "fulfilled") setStats(st.value);
    } finally {
      setLoad("init", false);
    }
  }, [token, setLoad]);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Profile Actions ──────────────────────────────────────────────────────────

  const handleCreateProfile = async () => {
    if (!token || !profileForm.name) return;
    setLoad("profile", true);
    try {
      const p = await createStreamingProfile(token, profileForm);
      setProfiles(prev => [...prev, p]);
      setShowProfileForm(false);
      setProfileForm({ name: "", codec: "h264", resolution: "1920x1080", framerate: 60, bitrate: 20000, latencyMode: "low", hdrEnabled: false, adaptiveBitrate: true, audioChannels: 2, isDefault: false });
      showMsg("Streaming profile created!");
    } catch (e) { showMsg(e instanceof Error ? e.message : "Failed", "error"); }
    finally { setLoad("profile", false); }
  };

  const handleDeleteProfile = async (id: string) => {
    if (!token) return;
    try {
      await deleteStreamingProfile(token, id);
      setProfiles(prev => prev.filter(p => p.id !== id));
      showMsg("Profile deleted");
    } catch (e) { showMsg(e instanceof Error ? e.message : "Failed", "error"); }
  };

  // ── Game Actions ─────────────────────────────────────────────────────────────

  const handleAddGame = async () => {
    if (!token || !gameForm.name) return;
    setLoad("game", true);
    try {
      const g = await addGame(token, gameForm);
      setGames(prev => [...prev, g]);
      setShowGameForm(false);
      setGameForm({ name: "", processName: "", platform: "steam", coverUrl: "" });
      showMsg("Game added to library!");
    } catch (e) { showMsg(e instanceof Error ? e.message : "Failed", "error"); }
    finally { setLoad("game", false); }
  };

  const handleDeleteGame = async (id: string) => {
    if (!token) return;
    try {
      await deleteGame(token, id);
      setGames(prev => prev.filter(g => g.id !== id));
      showMsg("Game removed");
    } catch (e) { showMsg(e instanceof Error ? e.message : "Failed", "error"); }
  };

  // ── WoL Actions ──────────────────────────────────────────────────────────────

  const handleAddWol = async () => {
    if (!token || !wolForm.name || !wolForm.macAddress) return;
    setLoad("wol", true);
    try {
      const t = await addWolTarget(token, wolForm);
      setWolTargets(prev => [...prev, t]);
      setShowWolForm(false);
      setWolForm({ name: "", macAddress: "", broadcastIp: "255.255.255.255" });
      showMsg("WoL target added!");
    } catch (e) { showMsg(e instanceof Error ? e.message : "Failed", "error"); }
    finally { setLoad("wol", false); }
  };

  const handleWake = async (target: WolTarget) => {
    if (!token) return;
    setLoad(`wake-${target.id}`, true);
    try {
      const result = await sendWakeOnLan(token, target.id);
      showMsg(result.message, result.success ? "success" : "error");
    } catch (e) { showMsg(e instanceof Error ? e.message : "Wake failed", "error"); }
    finally { setLoad(`wake-${target.id}`, false); }
  };

  const handleDeleteWol = async (id: string) => {
    if (!token) return;
    try {
      await deleteWolTarget(token, id);
      setWolTargets(prev => prev.filter(t => t.id !== id));
      showMsg("WoL target removed");
    } catch (e) { showMsg(e instanceof Error ? e.message : "Failed", "error"); }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "overview", label: "📊 Overview" },
    { id: "profiles", label: "⚙️ Profiles" },
    { id: "games", label: "🎮 Games" },
    { id: "sessions", label: "📡 Sessions" },
    { id: "wol", label: "⚡ Wake-on-LAN" },
  ] as const;

  const inputCls = "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500";
  const selectCls = "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500";
  const btnCls = (color = "blue") => `px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none text-white bg-${color}-600 hover:bg-${color}-700 transition-colors`;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">🎮 Cloud Gaming & Streaming</h1>
        <p className="text-slate-400 text-sm mt-1">Parsec/Moonlight-style high-performance game streaming management</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${message.type === "success" ? "bg-emerald-900 text-emerald-300" : "bg-red-900 text-red-300"}`}>
          {message.text}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer ${activeTab === tab.id ? "bg-blue-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Sessions" value={stats?.totalSessions ?? 0} color="text-blue-400" />
            <StatCard label="Active Sessions" value={stats?.activeSessions ?? 0} color={stats?.activeSessions ? "text-emerald-400" : "text-slate-400"} />
            <StatCard label="Total Playtime" value={`${(stats?.totalPlaytimeHours ?? 0).toFixed(1)}h`} color="text-purple-400" />
            <StatCard label="Avg Latency" value={`${(stats?.avgLatencyMs ?? 0).toFixed(1)}ms`} color={(stats?.avgLatencyMs ?? 0) <= 16 ? "text-emerald-400" : "text-yellow-400"} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <StatCard label="Avg FPS" value={(stats?.avgFps ?? 0).toFixed(1)} sub="frames per second" />
            <StatCard label="Avg Bitrate" value={`${(stats?.avgBitrateMbps ?? 0).toFixed(1)} Mbps`} sub="streaming quality" />
            <StatCard label="Streaming Profiles" value={profiles.length} sub="configured" />
          </div>

          {/* Top Games */}
          {stats?.topGames && stats.topGames.length > 0 && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-6">
              <h3 className="font-semibold mb-4">🏆 Top Games by Playtime</h3>
              <div className="space-y-3">
                {stats.topGames.map((g, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-slate-500 text-sm w-5">{i + 1}.</span>
                    <span className="flex-1 text-sm">{g.name}</span>
                    <div className="flex-1 bg-slate-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(100, (g.playtimeHours / (stats.topGames[0]?.playtimeHours || 1)) * 100)}%` }} />
                    </div>
                    <span className="text-slate-400 text-xs w-16 text-right">{g.playtimeHours.toFixed(1)}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
            <h3 className="font-semibold mb-4">⚡ Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => setActiveTab("profiles")} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer text-white">
                ⚙️ Manage Profiles
              </button>
              <button onClick={() => setActiveTab("wol")} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer text-white">
                ⚡ Wake a PC
              </button>
              <button onClick={() => setActiveTab("games")} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer text-white">
                🎮 Game Library
              </button>
              <button onClick={loadAll} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer text-white">
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Profiles Tab ── */}
      {activeTab === "profiles" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Streaming Profiles</h2>
            <button onClick={() => setShowProfileForm(!showProfileForm)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold border-none cursor-pointer text-white transition-colors">
              {showProfileForm ? "✕ Cancel" : "➕ New Profile"}
            </button>
          </div>

          {showProfileForm && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-4">
              <h3 className="font-semibold mb-4">Create Streaming Profile</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="col-span-2">
                  <label className="text-xs text-slate-400 mb-1 block">Profile Name</label>
                  <input className={inputCls} placeholder="Gaming - Competitive" value={profileForm.name} onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Codec</label>
                  <select className={selectCls} value={profileForm.codec} onChange={e => setProfileForm(p => ({ ...p, codec: e.target.value }))}>
                    <option value="h264">H.264 (Best Compatibility)</option>
                    <option value="h265">H.265/HEVC (50% smaller)</option>
                    <option value="av1">AV1 (Best Quality)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Resolution</label>
                  <select className={selectCls} value={profileForm.resolution} onChange={e => setProfileForm(p => ({ ...p, resolution: e.target.value }))}>
                    {["1280x720", "1920x1080", "2560x1440", "3840x2160"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Framerate</label>
                  <select className={selectCls} value={profileForm.framerate} onChange={e => setProfileForm(p => ({ ...p, framerate: parseInt(e.target.value) }))}>
                    {[30, 60, 120, 144, 240].map(f => <option key={f} value={f}>{f} fps</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Bitrate (Kbps): {profileForm.bitrate.toLocaleString()}</label>
                  <input type="range" min={1000} max={100000} step={1000} value={profileForm.bitrate}
                    onChange={e => setProfileForm(p => ({ ...p, bitrate: parseInt(e.target.value) }))}
                    className="w-full accent-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Latency Mode</label>
                  <select className={selectCls} value={profileForm.latencyMode} onChange={e => setProfileForm(p => ({ ...p, latencyMode: e.target.value }))}>
                    <option value="ultra_low">Ultra Low (&lt;8ms)</option>
                    <option value="low">Low (&lt;16ms)</option>
                    <option value="balanced">Balanced (&lt;50ms)</option>
                    <option value="quality">Quality</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Audio Channels</label>
                  <select className={selectCls} value={profileForm.audioChannels} onChange={e => setProfileForm(p => ({ ...p, audioChannels: parseInt(e.target.value) }))}>
                    <option value={2}>Stereo (2.0)</option>
                    <option value={6}>5.1 Surround</option>
                    <option value={8}>7.1 Surround</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={profileForm.adaptiveBitrate} onChange={e => setProfileForm(p => ({ ...p, adaptiveBitrate: e.target.checked }))} className="accent-blue-500" />
                  Adaptive Bitrate
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={profileForm.hdrEnabled} onChange={e => setProfileForm(p => ({ ...p, hdrEnabled: e.target.checked }))} className="accent-blue-500" />
                  HDR Enabled
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={profileForm.isDefault} onChange={e => setProfileForm(p => ({ ...p, isDefault: e.target.checked }))} className="accent-blue-500" />
                  Set as Default
                </label>
              </div>
              <button onClick={handleCreateProfile} disabled={loading.profile} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-semibold border-none cursor-pointer text-white transition-colors">
                {loading.profile ? "Creating..." : "✓ Create Profile"}
              </button>
            </div>
          )}

          {profiles.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-10 border border-slate-700 text-center text-slate-400">
              No streaming profiles yet. Create one to get started.
            </div>
          ) : (
            <div className="grid gap-3">
              {profiles.map(profile => (
                <div key={profile.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-start justify-between">
                  <div>
                    <div className="font-semibold flex items-center gap-2">
                      {profile.name}
                      {profile.isDefault && <Badge color="blue">Default</Badge>}
                      {profile.hdrEnabled && <Badge color="yellow">HDR</Badge>}
                      {profile.adaptiveBitrate && <Badge color="green">ABR</Badge>}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {profile.codec.toUpperCase()} · {profile.resolution} · {profile.framerate}fps · {(profile.bitrate / 1000).toFixed(0)} Mbps · {profile.latencyMode} latency
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Audio: {profile.audioChannels === 2 ? "Stereo" : profile.audioChannels === 6 ? "5.1" : "7.1"}
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProfile(profile.id)} className="px-3 py-1.5 bg-red-900 hover:bg-red-800 rounded-lg text-xs font-medium border-none cursor-pointer text-red-300 transition-colors">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Games Tab ── */}
      {activeTab === "games" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Game Library</h2>
            <button onClick={() => setShowGameForm(!showGameForm)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold border-none cursor-pointer text-white transition-colors">
              {showGameForm ? "✕ Cancel" : "➕ Add Game"}
            </button>
          </div>

          {showGameForm && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-4">
              <h3 className="font-semibold mb-4">Add Game to Library</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Game Name</label>
                  <input className={inputCls} placeholder="Cyberpunk 2077" value={gameForm.name} onChange={e => setGameForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Process Name</label>
                  <input className={inputCls} placeholder="cyberpunk2077.exe" value={gameForm.processName} onChange={e => setGameForm(p => ({ ...p, processName: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Platform</label>
                  <select className={selectCls} value={gameForm.platform} onChange={e => setGameForm(p => ({ ...p, platform: e.target.value }))}>
                    {["steam", "epic", "gog", "battlenet", "ea", "riot", "microsoft", "other"].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Cover URL (optional)</label>
                  <input className={inputCls} placeholder="https://..." value={gameForm.coverUrl} onChange={e => setGameForm(p => ({ ...p, coverUrl: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleAddGame} disabled={loading.game} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold border-none cursor-pointer text-white transition-colors">
                {loading.game ? "Adding..." : "✓ Add Game"}
              </button>
            </div>
          )}

          {games.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-10 border border-slate-700 text-center text-slate-400">
              No games in library. Add games to track playtime and auto-optimize streaming settings.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {games.map(game => (
                <div key={game.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {game.coverUrl ? (
                    <img src={game.coverUrl} alt={game.name} className="w-full h-32 object-cover" />
                  ) : (
                    <div className="w-full h-32 bg-slate-700 flex items-center justify-center text-4xl">🎮</div>
                  )}
                  <div className="p-3">
                    <div className="font-semibold text-sm truncate">{game.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{game.platform}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {(game.totalPlaytimeSeconds / 3600).toFixed(1)}h played
                    </div>
                    <button onClick={() => handleDeleteGame(game.id)} className="mt-2 w-full px-2 py-1 bg-red-900 hover:bg-red-800 rounded text-xs font-medium border-none cursor-pointer text-red-300 transition-colors">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Sessions Tab ── */}
      {activeTab === "sessions" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Gaming Sessions</h2>
            <button onClick={loadAll} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium border-none cursor-pointer text-white transition-colors">
              🔄 Refresh
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-10 border border-slate-700 text-center text-slate-400">
              No gaming sessions recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map(session => (
                <div key={session.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        📡 {session.deviceName || session.deviceId.slice(0, 8)}
                        <Badge color={session.status === "active" ? "green" : session.status === "failed" ? "red" : "slate"}>
                          {session.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {session.encoderType.toUpperCase()} · {session.codec.toUpperCase()} · {session.resolution} · {session.framerate}fps
                      </div>
                    </div>
                    <div className="text-xs text-slate-500">
                      {new Date(session.startedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-3">
                    {[
                      { label: "Avg FPS", value: session.avgFps.toFixed(0) },
                      { label: "Peak FPS", value: session.peakFps.toFixed(0) },
                      { label: "Latency", value: `${session.avgLatencyMs.toFixed(1)}ms` },
                      { label: "Bitrate", value: `${(session.avgBitrateKbps / 1000).toFixed(1)}M` },
                      { label: "Pkt Loss", value: `${session.packetLossPercent.toFixed(2)}%` },
                      { label: "Duration", value: `${(session.durationSeconds / 60).toFixed(0)}m` },
                    ].map(m => (
                      <div key={m.label} className="bg-slate-900 rounded-lg p-2 text-center">
                        <div className="text-xs text-slate-500">{m.label}</div>
                        <div className="text-sm font-semibold text-white">{m.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Wake-on-LAN Tab ── */}
      {activeTab === "wol" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Wake-on-LAN</h2>
            <button onClick={() => setShowWolForm(!showWolForm)} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold border-none cursor-pointer text-white transition-colors">
              {showWolForm ? "✕ Cancel" : "➕ Add Target"}
            </button>
          </div>

          {showWolForm && (
            <div className="bg-slate-800 rounded-xl p-5 border border-slate-700 mb-4">
              <h3 className="font-semibold mb-4">Add WoL Target</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Name</label>
                  <input className={inputCls} placeholder="Gaming PC" value={wolForm.name} onChange={e => setWolForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">MAC Address</label>
                  <input className={inputCls} placeholder="AA:BB:CC:DD:EE:FF" value={wolForm.macAddress} onChange={e => setWolForm(p => ({ ...p, macAddress: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Broadcast IP</label>
                  <input className={inputCls} placeholder="255.255.255.255" value={wolForm.broadcastIp} onChange={e => setWolForm(p => ({ ...p, broadcastIp: e.target.value }))} />
                </div>
              </div>
              <button onClick={handleAddWol} disabled={loading.wol} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold border-none cursor-pointer text-white transition-colors">
                {loading.wol ? "Adding..." : "✓ Add Target"}
              </button>
            </div>
          )}

          {wolTargets.length === 0 ? (
            <div className="bg-slate-800 rounded-xl p-10 border border-slate-700 text-center text-slate-400">
              No WoL targets configured. Add a gaming PC to wake it remotely.
            </div>
          ) : (
            <div className="space-y-3">
              {wolTargets.map(target => (
                <div key={target.id} className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-semibold">⚡ {target.name}</div>
                    <div className="text-xs text-slate-400 mt-1">{target.macAddress} · {target.broadcastIp}</div>
                    {target.lastWokenAt && (
                      <div className="text-xs text-slate-500 mt-1">Last woken: {new Date(target.lastWokenAt).toLocaleString()}</div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleWake(target)}
                      disabled={loading[`wake-${target.id}`]}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-semibold border-none cursor-pointer text-white transition-colors"
                    >
                      {loading[`wake-${target.id}`] ? "Sending..." : "⚡ Wake"}
                    </button>
                    <button onClick={() => handleDeleteWol(target.id)} className="px-3 py-2 bg-red-900 hover:bg-red-800 rounded-lg text-sm font-medium border-none cursor-pointer text-red-300 transition-colors">
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
