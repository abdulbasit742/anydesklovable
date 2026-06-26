import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import axios from "axios";

export const Route = createFileRoute("/dashboard/remediation")({
  component: AIRemediationDashboard,
});

interface Remediation {
  deviceId: string;
  timestamp: number;
  issue: string;
  action: string;
  status: string;
}

function AIRemediationDashboard() {
  const [remediations, setRemediations] = useState<Remediation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRemediations = async () => {
      try {
        const deviceId = "desktop-client-1"; // Mock deviceId
        const response = await axios.get(`/api/remediation/device-remediations/${deviceId}`);
        setRemediations(response.data.remediations);
      } catch (err) {
        console.error("Failed to fetch remediations", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRemediations();
  }, []);

  const handleApprove = async (index: number) => {
    // Logic to approve remediation
    alert("Remediation approved!");
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-indigo-400">AI-Powered Automated Troubleshooting</h1>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Suggested AI Remediation Actions</h2>
        {loading ? (
          <p>Loading remediations...</p>
        ) : remediations.length > 0 ? (
          <div className="space-y-4">
            {remediations.map((r, i) => (
              <div key={i} className="bg-slate-900 p-4 rounded-lg border border-slate-700 flex justify-between items-center">
                <div>
                  <p className="text-red-400 font-bold">{r.issue}</p>
                  <p className="text-slate-300">Suggested Action: {r.action}</p>
                  <p className="text-xs text-slate-500">{new Date(r.timestamp).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => handleApprove(i)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition"
                >
                  Approve & Execute
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No remediation actions required at this time.</p>
        )}
      </div>
    </div>
  );
}
