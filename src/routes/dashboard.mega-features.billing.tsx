import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CreditCard, Download, TrendingUp, AlertCircle } from "lucide-react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/mega-features/billing")({
  head: () => ({ meta: [{ title: "Monetization Dashboard — RemoteDesk" }] }),
  component: BillingMonetizationPage,
});

function BillingMonetizationPage() {
  const [loading, setLoading] = useState(false);

  // Fetch billing dashboard data
  const fetchBillingDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/billing/dashboard");
      const data = await res.json();
      return data.data;
    } catch (error) {
      toast.error("Failed to load billing dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Monetization Dashboard</h1>
            <p className="text-gray-600">Manage subscriptions, billing, and revenue</p>
          </div>
          <Button onClick={fetchBillingDashboard} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Current Plan</p>
                <p className="text-2xl font-bold">Pro</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">MRR</p>
                <p className="text-2xl font-bold">$999</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Devices Used</p>
                <p className="text-2xl font-bold">8/10</p>
              </div>
              <Badge>80%</Badge>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Status</p>
                <p className="text-2xl font-bold">Active</p>
              </div>
              <Badge variant="default" className="bg-green-500">Active</Badge>
            </div>
          </Card>
        </div>

        {/* Plans Comparison */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Plan Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Feature</th>
                  <th className="text-left py-2">Free</th>
                  <th className="text-left py-2">Pro</th>
                  <th className="text-left py-2">Business</th>
                  <th className="text-left py-2">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2">Max Devices</td>
                  <td>1</td>
                  <td>10</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Session Duration</td>
                  <td>30 min</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">File Transfer</td>
                  <td>❌</td>
                  <td>✅</td>
                  <td>✅</td>
                  <td>✅</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2">Team Members</td>
                  <td>1</td>
                  <td>5</td>
                  <td>Unlimited</td>
                  <td>Unlimited</td>
                </tr>
                <tr>
                  <td className="py-2">Price</td>
                  <td>Free</td>
                  <td>$9.99/mo</td>
                  <td>$29.99/mo</td>
                  <td>Custom</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        {/* Usage Tracking */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Usage This Month</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Connection Minutes</span>
                <span>450 / 1000</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Data Transferred</span>
                <span>2.3 GB / 10 GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: "23%" }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span>Devices Registered</span>
                <span>8 / 10</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: "80%" }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Invoices */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Invoices</h2>
          <div className="space-y-2">
            {[
              { date: "Jun 1, 2024", amount: "$9.99", status: "Paid" },
              { date: "May 1, 2024", amount: "$9.99", status: "Paid" },
              { date: "Apr 1, 2024", amount: "$9.99", status: "Paid" },
            ].map((invoice, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">{invoice.date}</p>
                  <p className="text-sm text-gray-600">{invoice.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{invoice.status}</Badge>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* License Keys */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">License Keys</h2>
          <div className="space-y-2">
            <div className="p-3 bg-gray-50 rounded flex items-center justify-between">
              <div>
                <p className="font-mono text-sm">REMOTEDESK-1234567890</p>
                <p className="text-xs text-gray-600">Expires: Dec 31, 2024</p>
              </div>
              <Badge className="bg-green-500">Active</Badge>
            </div>
          </div>
          <Button className="mt-4 w-full">Generate New License Key</Button>
        </Card>

        {/* Referral Program */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Referral Program</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-gray-600 text-sm">Total Earnings</p>
              <p className="text-2xl font-bold">$240</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pending Payout</p>
              <p className="text-2xl font-bold">$120</p>
            </div>
          </div>
          <Button className="w-full" variant="outline">
            Copy Referral Link
          </Button>
        </Card>
      </div>
    </AppShell>
  );
}
