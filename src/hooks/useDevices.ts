import { useState, useEffect } from "react";
export function useDevices() { const [devices, setDevices] = useState([]); const [loading, setLoading] = useState(true); useEffect(() => { fetch("/api/devices").then(r => r.json()).then(d => { setDevices(d.devices || []); setLoading(false); }).catch(() => setLoading(false)); }, []); return { devices, loading, refetch: () => {} }; }
