import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import axios from "axios";

export const Route = createFileRoute("/dashboard/digital-twin")({
  component: DigitalTwinDashboard,
});

interface DeviceHealth {
  deviceId: string;
  healthScore: number;
  latestMetrics: any;
  predictions: string[];
}

function DigitalTwinDashboard() {
  const [deviceHealth, setDeviceHealth] = useState<DeviceHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeviceHealth = async () => {
      try {
        // Replace with actual deviceId from user context or selection
        const deviceId = "desktop-client-1"; 
        const response = await axios.get<DeviceHealth>(`/api/digital-twin/device-health/${deviceId}`);
        setDeviceHealth(response.data);
      } catch (err) {
        setError("Failed to fetch device health.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeviceHealth();
    const interval = setInterval(fetchDeviceHealth, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-6">Loading Digital Twin data...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>;
  }

  if (!deviceHealth) {
    return <div className="p-6">No Digital Twin data available.</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Digital Twin & Predictive Intelligence</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Device Health Score</h2>
          <p className="text-5xl font-bold text-green-400">{deviceHealth.healthScore}</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Predicted Issues</h2>
          {deviceHealth.predictions.length > 0 ? (
            <ul className="list-disc list-inside space-y-2">
              {deviceHealth.predictions.map((prediction, index) => (
                <li key={index} className="text-red-400">{prediction}</li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400">No predicted issues at the moment.</p>
          )}
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-4">Latest Metrics</h2>
        {deviceHealth.latestMetrics ? (
          <pre className="bg-slate-900 p-3 rounded text-sm overflow-auto">
            {JSON.stringify(deviceHealth.latestMetrics, null, 2)}
          </pre>
        ) : (
          <p className="text-slate-400">No latest metrics available.</p>
        )}
      </div>
    </div>
  );
}
