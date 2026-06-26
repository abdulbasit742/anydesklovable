import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
import {
  Shield, ShieldAlert, ShieldCheck, Lock, Globe, Fingerprint,
  AlertTriangle, FileText, CheckCircle, XCircle, Clock, Download
} from "lucide-react";
import {
  getDeviceFingerprints, approveDeviceFingerprint, getGeoFencePolicies,
  createGeoFencePolicy, getThreatAlerts, resolveThreatAlert, getAuditLogs,
  generateComplianceReport,
  type DeviceFingerprint, type GeoFencePolicy, type ThreatAlert,
  type SecurityAuditLog, type ComplianceReport
} from "@/lib/services/zeroTrust";

export const Route = createFileRoute("/dashboard/zero-trust")({
  component: ZeroTrustPage
});

const COUNTRY_OPTIONS = [
  { code: "CN", name: "China" }, { code: "RU", name: "Russia" }, { code: "KP", name: "North Korea" },
  { code: "IR", name: "Iran" }, { code: "SY", name: "Syria" }, { code: "CU", name: "Cuba" },
  { code: "US", name: "United States" }, { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" }, { code: "FR", name: "France" }
];

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-900/50 text-red-400 border-red-700",
    high: "bg-orange-900/50 text-orange-400 border-orange-700",
    medium: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
    low: "bg-blue-900/50 text-blue-400 border-blue-700"
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${colors[severity] || "bg-slate-700 text-slate-300 border-slate-600"}`}>
      {severity.toUpperCase()}
    </span>
  );
}

function StatusIcon({ status }: { status: "pass" | "fail" | "warning" }) {
  if (status === "pass") return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (status === "fail") return <XCircle className="w-4 h-4 text-red-400" />;
  return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
}

function ZeroTrustPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "devices" | "geo" | "threats" | "audit" | "compliance">("overview");
  const [fingerprints, setFingerprints] = useState<DeviceFingerprint[]>([]);
  const [geoPolicies, setGeoPolicies] = useState<GeoFencePolicy[]>([]);
  const [threats, setThreats] = useState<ThreatAlert[]>([]);
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [selectedFramework, setSelectedFramework] = useState<"SOC2" | "HIPAA" | "GDPR">("SOC2");

  // Geo-fence form state
  const [geoForm, setGeoForm] = useState({ name: "", action: "block" as "block" | "alert", countries: [] as string[] });

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [fps, geo, thr, logs] = await Promise.all([
        getDeviceFingerprints(),
        getGeoFencePolicies(),
        getThreatAlerts(),
        getAuditLogs()
      ]);
      setFingerprints(fps);
      setGeoPolicies(geo);
      setThreats(thr);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleApproveDevice = async (id: string) => {
    await approveDeviceFingerprint(id);
    await loadAll();
  };

  const handleResolveTheat = async (id: string) => {
    await resolveThreatAlert(id);
    await loadAll();
  };

  const handleCreateGeoPolicy = async () => {
    if (!geoForm.name || geoForm.countries.length === 0) return;
    await createGeoFencePolicy({ ...geoForm, enabled: true });
    setGeoForm({ name: "", action: "block", countries: [] });
    await loadAll();
  };

  const handleGenerateReport = () => {
    const r = generateComplianceReport(selectedFramework, auditLogs, threats, fingerprints, geoPolicies);
    setReport(r);
  };

  const downloadReport = () => {
    if (!report) return;
    const text = JSON.stringify(report, null, 2);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${report.framework}-compliance-report-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const unresolvedThreats = threats.filter(t => !t.resolved).length;
  const approvedDevices = fingerprints.filter(f => f.approved).length;

  const tabs = [
    { id: "overview", label: "Overview", icon: Shield },
    { id: "devices", label: "Devices", icon: Fingerprint },
    { id: "geo", label: "Geo-Fence", icon: Globe },
    { id: "threats", label: `Threats${unresolvedThreats > 0 ? ` (${unresolvedThreats})` : ""}`, icon: ShieldAlert },
    { id: "audit", label: "Audit Trail", icon: FileText },
    { id: "compliance", label: "Compliance", icon: ShieldCheck }
  ] as const;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-900/40 rounded-lg border border-indigo-700">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Zero-Trust Security</h1>
            <p className="text-sm text-slate-400">Enterprise E2EE, Device Fingerprinting, DLP & Compliance</p>
          </div>
        </div>
        <button
          onClick={loadAll}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Approved Devices", value: approvedDevices, icon: ShieldCheck, color: "text-green-400", bg: "bg-green-900/20 border-green-800" },
          { label: "Pending Approval", value: fingerprints.filter(f => !f.approved).length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-900/20 border-yellow-800" },
          { label: "Active Threats", value: unresolvedThreats, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-900/20 border-red-800" },
          { label: "Geo-Fence Policies", value: geoPolicies.filter(g => g.enabled).length, icon: Globe, color: "text-blue-400", bg: "bg-blue-900/20 border-blue-800" }
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className={`p-4 rounded-xl border ${bg}`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs text-slate-400">{label}</span>
            </div>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-slate-700 pb-2 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === id
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:text-white hover:bg-slate-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Security Features Active
            </h3>
            <div className="space-y-3">
              {[
                { label: "AES-256-GCM End-to-End Encryption", enabled: true },
                { label: "Perfect Forward Secrecy (ECDH)", enabled: true },
                { label: "Device Fingerprinting", enabled: true },
                { label: "Blockchain Audit Trail", enabled: true },
                { label: "DLP (Data Loss Prevention)", enabled: true },
                { label: "Session Watermarking", enabled: true },
                { label: "Certificate Pinning", enabled: true },
                { label: "Geo-Fencing", enabled: geoPolicies.length > 0 },
                { label: "Zero-Trust Policy Engine", enabled: true }
              ].map(({ label, enabled }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${enabled ? "bg-green-900/40 text-green-400" : "bg-slate-700 text-slate-400"}`}>
                    {enabled ? "Active" : "Inactive"}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" /> Recent Threats
            </h3>
            {threats.filter(t => !t.resolved).length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p className="text-sm">No active threats</p>
              </div>
            ) : (
              <div className="space-y-2">
                {threats.filter(t => !t.resolved).slice(0, 5).map(t => (
                  <div key={t.id} className="p-3 bg-red-900/20 rounded-lg border border-red-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-red-400">{t.type.replace(/_/g, " ").toUpperCase()}</span>
                      <SeverityBadge severity={t.severity} />
                    </div>
                    <p className="text-xs text-slate-300">{t.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === "devices" && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-indigo-400" /> Device Fingerprints
            </h3>
            <span className="text-xs text-slate-400">{fingerprints.length} registered</span>
          </div>
          {fingerprints.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Fingerprint className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No devices registered yet</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 text-xs text-slate-400">
                  <th className="text-left p-4">Device</th>
                  <th className="text-left p-4">Hardware ID</th>
                  <th className="text-left p-4">OS</th>
                  <th className="text-left p-4">Secure Boot</th>
                  <th className="text-left p-4">TPM</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {fingerprints.map(fp => (
                  <tr key={fp.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="p-4 text-white">{fp.device?.name || fp.deviceId.slice(0, 8)}</td>
                    <td className="p-4 font-mono text-xs text-slate-400">{fp.hardwareId.slice(0, 16)}...</td>
                    <td className="p-4 text-slate-300">{fp.osVersion}</td>
                    <td className="p-4">{fp.secureBootEnabled ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-red-400" />}</td>
                    <td className="p-4">{fp.tpmHash ? <CheckCircle className="w-4 h-4 text-green-400" /> : <XCircle className="w-4 h-4 text-slate-500" />}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${fp.approved ? "bg-green-900/40 text-green-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                        {fp.approved ? "Approved" : "Pending"}
                      </span>
                    </td>
                    <td className="p-4">
                      {!fp.approved && (
                        <button
                          onClick={() => handleApproveDevice(fp.id)}
                          className="px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs font-medium"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Geo-Fence Tab */}
      {activeTab === "geo" && (
        <div className="space-y-6">
          {/* Create Policy */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" /> Create Geo-Fence Policy
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="Policy name"
                value={geoForm.name}
                onChange={e => setGeoForm(f => ({ ...f, name: e.target.value }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400"
              />
              <select
                value={geoForm.action}
                onChange={e => setGeoForm(f => ({ ...f, action: e.target.value as "block" | "alert" }))}
                className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="block">Block</option>
                <option value="alert">Alert Only</option>
              </select>
              <button
                onClick={handleCreateGeoPolicy}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium"
              >
                Create Policy
              </button>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-2">Select countries to {geoForm.action}:</p>
              <div className="flex flex-wrap gap-2">
                {COUNTRY_OPTIONS.map(c => (
                  <button
                    key={c.code}
                    onClick={() => setGeoForm(f => ({
                      ...f,
                      countries: f.countries.includes(c.code)
                        ? f.countries.filter(x => x !== c.code)
                        : [...f.countries, c.code]
                    }))}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                      geoForm.countries.includes(c.code)
                        ? "bg-blue-600 border-blue-500 text-white"
                        : "bg-slate-700 border-slate-600 text-slate-300 hover:border-blue-500"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Existing Policies */}
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h3 className="font-semibold text-white">Active Geo-Fence Policies</h3>
            </div>
            {geoPolicies.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No geo-fence policies configured</div>
            ) : (
              <div className="divide-y divide-slate-700">
                {geoPolicies.map(p => (
                  <div key={p.id} className="p-4 flex items-center justify-between">
                    <div>
                      <span className="text-white font-medium">{p.name}</span>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        {(p.countries as string[]).map(c => (
                          <span key={c} className="px-1.5 py-0.5 bg-slate-700 rounded text-xs text-slate-300">{c}</span>
                        ))}
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${p.action === "block" ? "bg-red-900/40 text-red-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                      {p.action.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Threats Tab */}
      {activeTab === "threats" && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Threat Alerts
            </h3>
            <span className="text-xs text-slate-400">{unresolvedThreats} unresolved</span>
          </div>
          {threats.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <ShieldCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-sm">No threats detected</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700">
              {threats.map(t => (
                <div key={t.id} className={`p-4 ${t.resolved ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <SeverityBadge severity={t.severity} />
                        <span className="text-xs text-slate-400 font-mono">{t.type.replace(/_/g, " ")}</span>
                        {t.user && <span className="text-xs text-slate-500">· {t.user.email}</span>}
                      </div>
                      <p className="text-sm text-slate-300">{t.description}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        {t.ipAddress && <span>IP: {t.ipAddress}</span>}
                        <span>{new Date(t.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {!t.resolved && (
                      <button
                        onClick={() => handleResolveTheat(t.id)}
                        className="ml-4 px-3 py-1 bg-green-700 hover:bg-green-600 text-white rounded text-xs font-medium"
                      >
                        Resolve
                      </button>
                    )}
                    {t.resolved && <span className="ml-4 text-xs text-green-400 font-semibold">Resolved</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Audit Trail Tab */}
      {activeTab === "audit" && (
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" /> Blockchain-Style Audit Trail
            </h3>
            <span className="text-xs text-slate-400">{auditLogs.length} events</span>
          </div>
          <div className="divide-y divide-slate-700 max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No audit events yet</div>
            ) : auditLogs.map((log, i) => (
              <div key={log.id} className="p-3 hover:bg-slate-700/30">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-indigo-400">{log.action}</span>
                    {log.user && <span className="text-xs text-slate-400">· {log.user.email}</span>}
                    {log.ipAddress && <span className="text-xs text-slate-500">· {log.ipAddress}</span>}
                    {log.riskScore > 0 && (
                      <span className={`text-xs px-1.5 py-0.5 rounded ${log.riskScore >= 80 ? "bg-red-900/40 text-red-400" : log.riskScore >= 50 ? "bg-yellow-900/40 text-yellow-400" : "bg-slate-700 text-slate-400"}`}>
                        Risk: {log.riskScore}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <div className="font-mono text-xs text-slate-600 truncate">
                  #{i + 1} Hash: {log.hash.slice(0, 32)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compliance Tab */}
      {activeTab === "compliance" && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl border border-slate-700 p-5">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-400" /> Generate Compliance Report
            </h3>
            <div className="flex gap-3 mb-4">
              {(["SOC2", "HIPAA", "GDPR"] as const).map(fw => (
                <button
                  key={fw}
                  onClick={() => setSelectedFramework(fw)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                    selectedFramework === fw
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-slate-700 border-slate-600 text-slate-300 hover:border-indigo-500"
                  }`}
                >
                  {fw}
                </button>
              ))}
              <button
                onClick={handleGenerateReport}
                className="ml-auto px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm font-semibold"
              >
                Generate
              </button>
            </div>
          </div>

          {report && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-white">{report.framework} Compliance Report</h3>
                  <p className="text-xs text-slate-400">Generated: {new Date(report.generatedAt).toLocaleString()}</p>
                </div>
                <button onClick={downloadReport} className="flex items-center gap-2 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-medium">
                  <Download className="w-3 h-3" /> Download JSON
                </button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {[
                    { label: "Audit Events", value: report.summary.totalAuditEvents },
                    { label: "Threats", value: report.summary.threatAlerts },
                    { label: "Approved Devices", value: report.summary.approvedDevices },
                    { label: "Geo Policies", value: report.summary.geoFencePolicies }
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-700/50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-white">{value}</div>
                      <div className="text-xs text-slate-400">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {report.controls.map(ctrl => (
                    <div key={ctrl.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                      <StatusIcon status={ctrl.status} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-white">{ctrl.name}</span>
                          <span className="text-xs text-slate-500 font-mono">{ctrl.id}</span>
                        </div>
                        <p className="text-xs text-slate-400">{ctrl.description}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${ctrl.status === "pass" ? "bg-green-900/40 text-green-400" : ctrl.status === "fail" ? "bg-red-900/40 text-red-400" : "bg-yellow-900/40 text-yellow-400"}`}>
                        {ctrl.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
