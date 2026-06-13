export const currentUser = {
  name: "Abdul Basit",
  email: "abdul.basit@remotedesk.io",
  plan: "Pro" as const,
  remoteDeskId: "482913706",
  devicePassword: "set" as const,
  role: "Owner" as const,
};

export const formatRemoteDeskId = (id: string) =>
  id.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3");

export type DeviceStatus = "online" | "offline";
export type DeviceOS = "Windows" | "macOS" | "Linux";

export interface Device {
  id: string;
  name: string;
  os: DeviceOS;
  osVersion: string;
  status: DeviceStatus;
  lastSeen: string;
  remoteDeskId: string;
  owner: string;
  ip: string;
  cpu: string;
  ram: string;
  clientVersion: string;
  tags: string[];
}

export const devices: Device[] = [
  { id: "d1", name: "Abdul-PC", os: "Windows", osVersion: "11 Pro 23H2", status: "online", lastSeen: "Now", remoteDeskId: "482913706", owner: "Abdul Basit", ip: "94.12.44.18", cpu: "Intel i7-13700K", ram: "32 GB", clientVersion: "4.2.1", tags: ["workstation", "primary"] },
  { id: "d2", name: "Office-Laptop", os: "Windows", osVersion: "10 Pro 22H2", status: "offline", lastSeen: "2h ago", remoteDeskId: "117284903", owner: "Sara Khan", ip: "10.0.12.5", cpu: "Intel i5-1145G7", ram: "16 GB", clientVersion: "4.2.0", tags: ["laptop"] },
  { id: "d3", name: "MacBook-Air", os: "macOS", osVersion: "Sonoma 14.5", status: "online", lastSeen: "Now", remoteDeskId: "904172556", owner: "Daniel Lee", ip: "73.55.91.2", cpu: "Apple M2", ram: "16 GB", clientVersion: "4.2.1", tags: ["laptop", "design"] },
  { id: "d4", name: "Ubuntu-Server", os: "Linux", osVersion: "Ubuntu 24.04 LTS", status: "online", lastSeen: "Now", remoteDeskId: "551238440", owner: "Maria Gomez", ip: "203.0.113.7", cpu: "AMD EPYC 7402", ram: "64 GB", clientVersion: "4.2.1", tags: ["server", "production"] },
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
  { id: "s5", target: "Ubuntu-Server", role: "Viewer", initiator: "Maria Gomez", status: "ended", duration: "1h 12m", quality: "good", startedAt: "2 days ago, 09:02", reason: "Completed" },
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
  { id: "a1", actor: "Abdul Basit", action: "session.started", target: "Abdul-PC", at: "Today, 14:02", ip: "94.12.44.18", severity: "info" as const },
  { id: "a2", actor: "Sara Khan", action: "policy.updated", target: "Clipboard policy", at: "Today, 12:40", ip: "10.0.12.5", severity: "warn" as const },
  { id: "a3", actor: "Support Agent", action: "session.ended", target: "Office-Laptop", at: "Today, 11:56", ip: "73.55.91.2", severity: "info" as const },
  { id: "a4", actor: "System", action: "connection.rejected", target: "Office-Laptop", at: "Yesterday, 09:11", ip: "203.0.113.99", severity: "warn" as const },
  { id: "a5", actor: "Abdul Basit", action: "device.password.rotated", target: "Abdul-PC", at: "Yesterday, 08:30", ip: "94.12.44.18", severity: "info" as const },
  { id: "a6", actor: "System", action: "auth.failed", target: "abdul.basit@remotedesk.io", at: "2 days ago, 22:11", ip: "185.220.101.5", severity: "critical" as const },
  { id: "a7", actor: "Maria Gomez", action: "file.transferred", target: "Ubuntu-Server /backup.tar.gz", at: "2 days ago, 09:42", ip: "203.0.113.7", severity: "info" as const },
  { id: "a8", actor: "Sara Khan", action: "member.invited", target: "daniel@remotedesk.io", at: "3 days ago, 14:01", ip: "10.0.12.5", severity: "info" as const },
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

// Admin metrics
export const adminMetrics = {
  totalAccounts: 1284,
  activeOrgs: 312,
  liveSessions: 87,
  monthlyRevenue: "$48,210",
  signups7d: 142,
  churnRate: "2.1%",
};

export const adminOrgs = [
  { id: "o1", name: "Acme Corp", plan: "Business", seats: 24, devices: 96, status: "active" },
  { id: "o2", name: "Northwind", plan: "Enterprise", seats: 180, devices: 540, status: "active" },
  { id: "o3", name: "Globex", plan: "Pro", seats: 1, devices: 4, status: "trial" },
  { id: "o4", name: "Initech", plan: "Business", seats: 12, devices: 38, status: "past_due" },
];

// Support
export const supportArticles = [
  { id: "h1", category: "Getting started", title: "Install the RemoteDesk client", excerpt: "Download the desktop app for Windows, macOS, or Linux and sign in." },
  { id: "h2", category: "Getting started", title: "Connect to a device using a 9-digit ID", excerpt: "Enter the RemoteDesk ID and approve the host prompt." },
  { id: "h3", category: "Security", title: "Set a device password and rotate it", excerpt: "Device passwords add a second factor on top of host approval." },
  { id: "h4", category: "Security", title: "Use the emergency stop shortcut", excerpt: "Ctrl + Shift + . instantly terminates the active session." },
  { id: "h5", category: "Billing", title: "Change your plan or seat count", excerpt: "Upgrade, downgrade, or update billing details from the Billing page." },
  { id: "h6", category: "Troubleshooting", title: "Diagnose a poor connection", excerpt: "Check latency, bitrate and packet loss in the session diagnostics panel." },
];

export const supportTickets = [
  { id: "TKT-3041", subject: "Cannot connect to Office-Laptop", status: "open", priority: "high", updated: "12m ago" },
  { id: "TKT-3032", subject: "File transfer stuck at 80%", status: "pending", priority: "medium", updated: "2h ago" },
  { id: "TKT-2998", subject: "Add SSO for our domain", status: "resolved", priority: "low", updated: "3d ago" },
];
