export const currentUser = {
  name: "Abdul Basit",
  email: "abdul.basit@remotedesk.io",
  plan: "Pro" as const,
  remoteDeskId: "482913706",
  devicePassword: "set" as const,
};

export const formatRemoteDeskId = (id: string) =>
  id.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");

export type DeviceStatus = "online" | "offline";
export type DeviceOS = "Windows" | "macOS" | "Linux";

export interface Device {
  id: string;
  name: string;
  os: DeviceOS;
  status: DeviceStatus;
  lastSeen: string;
  remoteDeskId: string;
}

export const devices: Device[] = [
  { id: "d1", name: "Abdul-PC", os: "Windows", status: "online", lastSeen: "Now", remoteDeskId: "482913706" },
  { id: "d2", name: "Office-Laptop", os: "Windows", status: "offline", lastSeen: "2h ago", remoteDeskId: "117284903" },
  { id: "d3", name: "MacBook-Air", os: "macOS", status: "online", lastSeen: "Now", remoteDeskId: "904172556" },
];

export type SessionStatus = "connected" | "ended" | "rejected";
export type Quality = "good" | "fair" | "poor";

export interface Session {
  id: string;
  target: string;
  role: "Host" | "Viewer";
  initiator: string;
  status: SessionStatus;
  duration: string;
  quality: Quality;
  startedAt: string;
  reason?: string;
}

export const sessions: Session[] = [
  { id: "s1", target: "Abdul-PC", role: "Host", initiator: "Viewer", status: "connected", duration: "18m", quality: "good", startedAt: "Today, 14:02" },
  { id: "s2", target: "Office-Laptop", role: "Host", initiator: "Support Agent", status: "ended", duration: "42m", quality: "fair", startedAt: "Today, 11:14", reason: "Closed by host" },
  { id: "s3", target: "MacBook-Air", role: "Viewer", initiator: "Abdul Basit", status: "ended", duration: "7m", quality: "good", startedAt: "Yesterday, 18:30", reason: "Completed" },
  { id: "s4", target: "Office-Laptop", role: "Host", initiator: "Unknown", status: "rejected", duration: "—", quality: "good", startedAt: "Yesterday, 09:11", reason: "Host rejected" },
];

export const invoices = [
  { id: "INV-2026-0612", date: "Jun 1, 2026", amount: "$19.00", status: "Paid" },
  { id: "INV-2026-0512", date: "May 1, 2026", amount: "$19.00", status: "Paid" },
  { id: "INV-2026-0412", date: "Apr 1, 2026", amount: "$19.00", status: "Paid" },
];

export const teamMembers = [
  { id: "t1", name: "Abdul Basit", email: "abdul.basit@remotedesk.io", role: "Owner", devices: 3, lastActive: "Now" },
  { id: "t2", name: "Sara Khan", email: "sara@remotedesk.io", role: "Admin", devices: 2, lastActive: "10m ago" },
  { id: "t3", name: "Daniel Lee", email: "daniel@remotedesk.io", role: "Support", devices: 1, lastActive: "1h ago" },
  { id: "t4", name: "Maria Gomez", email: "maria@remotedesk.io", role: "Member", devices: 1, lastActive: "Yesterday" },
];

export const auditLog = [
  { id: "a1", actor: "Abdul Basit", action: "Started session", target: "Abdul-PC", at: "Today, 14:02", ip: "94.12.x.x" },
  { id: "a2", actor: "Sara Khan", action: "Updated device policy", target: "Org-wide", at: "Today, 12:40", ip: "10.0.x.x" },
  { id: "a3", actor: "Support Agent", action: "Session ended", target: "Office-Laptop", at: "Today, 11:56", ip: "73.55.x.x" },
  { id: "a4", actor: "System", action: "Rejected connection", target: "Office-Laptop", at: "Yesterday, 09:11", ip: "203.0.x.x" },
];

export const plans = [
  {
    name: "Free", price: "$0", period: "/mo",
    tagline: "Personal use",
    features: ["1 device", "Basic remote sessions", "60 minute session limit", "Community support"],
    cta: "Get started",
  },
  {
    name: "Pro", price: "$19", period: "/mo", highlight: true,
    tagline: "Power users",
    features: ["5 devices", "Unlimited sessions", "HD streaming", "Session chat", "Email support"],
    cta: "Upgrade to Pro",
  },
  {
    name: "Business", price: "$49", period: "/user/mo",
    tagline: "Teams & support",
    features: ["Team management", "Audit logs", "File transfer", "Policy controls", "Priority support"],
    cta: "Start Business",
  },
  {
    name: "Enterprise", price: "Custom", period: "",
    tagline: "Large orgs",
    features: ["SSO / SAML", "Custom policies", "Priority TURN servers", "Dedicated support", "SLA"],
    cta: "Contact sales",
  },
];
