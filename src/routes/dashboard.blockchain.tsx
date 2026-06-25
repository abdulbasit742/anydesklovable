import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/dashboard/blockchain")({
  component: BlockchainDashboard,
});

function BlockchainDashboard() {
  const [address, setAddress] = useState<string | null>(null);

  const connectWallet = async () => {
    // Logic to connect wallet
    setAddress("0x123...abc");
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blockchain & DID</h1>
        <button 
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
        >
          {address ? `Connected: ${address}` : "Connect Wallet"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">Decentralized Identity</h2>
          <p className="text-slate-400 mb-4">Your DID: did:ethr:0x123...abc</p>
          <div className="space-y-2">
            <div className="flex justify-between p-3 bg-slate-900 rounded">
              <span>Status</span>
              <span className="text-green-400">Verified</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-xl font-semibold mb-4">On-Chain Permissions</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-900 rounded">
              <div>
                <p className="font-medium">Device: Work-PC</p>
                <p className="text-sm text-slate-500">Expires in 2 days</p>
              </div>
              <button className="text-red-400 hover:text-red-300">Revoke</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
