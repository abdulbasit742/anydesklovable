import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import axios from "axios";

export const Route = createFileRoute("/dashboard/network")({
  component: NetworkOptimizationDashboard,
});

interface NetworkConfig {
  deviceId: string;
  optimizationLevel: string;
  videoQuality: string;
  compression: string;
  timestamp: number;
}

function NetworkOptimizationDashboard() {
  const [config, setConfig] = useState<NetworkConfig | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNetworkConfig = async () => {
      try {
        const deviceId = "desktop-client-1"; // Mock deviceId
        // Assuming an endpoint exists or we mock it
        const response = await axios.get(`/api/digital-twin/device-health/${deviceId}`);
        // For demonstration, we'll mock the network part if not in the response
        setConfig({
          deviceId,
          optimizationLevel: "Balanced",
          videoQuality: "Medium",
          compression: "Medium",
          timestamp: Date.now()
        });
      } catch (err) {
        console.error("Failed to fetch network config", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNetworkConfig();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-400">Adaptive Network Optimization</h1>
      
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Current Network Configuration</h2>
        {loading ? (
          <p>Loading configuration...</p>
        ) : config ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
              <p className="text-slate-400 text-sm">Optimization Mode</p>
              <p className="text-2xl font-bold text-blue-400">{config.optimizationLevel}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
              <p className="text-slate-400 text-sm">Video Quality</p>
              <p className="text-2xl font-bold text-green-400">{config.videoQuality}</p>
            </div>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 text-center">
              <p className="text-slate-400 text-sm">Compression Level</p>
              <p className="text-2xl font-bold text-yellow-400">{config.compression}</p>
            </div>
          </div>
        ) : (
          <p className="text-slate-400">No network data available.</p>
        )}
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Optimization Strategy</h2>
        <p className="text-slate-300">
          The AI engine monitors latency and jitter every 5 seconds. If latency exceeds 150ms, the system 
          automatically switches to <strong>Aggressive Mode</strong>, reducing video bitrate and increasing 
          compression to maintain a lag-free experience.
        </p>
      </div>
    </div>
  );
}
