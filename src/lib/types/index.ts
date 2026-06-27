export interface Device { id: string; name: string; type: string; os: string; status: "online" | "offline" | "maintenance"; ipAddress?: string; lastSeen: string; cpuUsage?: number; ramUsage?: number; diskUsage?: number; }
export interface User { id: string; email: string; name: string; role: string; plan: string; avatar?: string; }
export interface Subscription { id: string; plan: string; status: string; currentPeriodEnd: string; monthlyAmount: number; }
export interface Alert { id: string; severity: string; message: string; deviceId: string; deviceName: string; triggeredAt: string; status: string; }
export interface Notification { id: string; title: string; body: string; type: string; readAt?: string; createdAt: string; }
