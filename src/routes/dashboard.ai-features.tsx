import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, Zap } from "lucide-react";

export const Route = createFileRoute("/dashboard/ai-features")({
  head: () => ({ meta: [{ title: "AI Features — RemoteDesk" }] }),
  component: AIFeatures,
});

function AIFeatures() {
  const [sentiments, setSentiments] = useState([
    { messageId: "1", text: "This is amazing!", sentiment: "positive", confidence: 0.95 },
    { messageId: "2", text: "Not working as expected", sentiment: "negative", confidence: 0.88 },
    { messageId: "3", text: "It's okay", sentiment: "neutral", confidence: 0.72 },
  ]);

  const sentimentStats = {
    positive: 65,
    neutral: 20,
    negative: 15,
  };

  return (
    <AppShell title="AI Features">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">AI-Powered Features</h2>
          <p className="text-sm text-muted-foreground">Sentiment analysis, auto-translation, and intelligent automation</p>
        </div>

        {/* Sentiment Overview */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Positive</p>
                <p className="text-2xl font-bold">{sentimentStats.positive}%</p>
              </div>
              <Badge className="bg-green-100 text-green-800">😊</Badge>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Neutral</p>
                <p className="text-2xl font-bold">{sentimentStats.neutral}%</p>
              </div>
              <Badge className="bg-gray-100 text-gray-800">😐</Badge>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Negative</p>
                <p className="text-2xl font-bold">{sentimentStats.negative}%</p>
              </div>
              <Badge className="bg-red-100 text-red-800">😞</Badge>
            </div>
          </Card>
        </div>

        {/* Sentiment Analysis */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Recent Sentiment Analysis</h3>
          <div className="space-y-3">
            {sentiments.map((item) => (
              <div key={item.messageId} className="flex items-start justify-between rounded-lg border p-3">
                <div className="flex-1">
                  <p className="text-sm">{item.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Confidence: {(item.confidence * 100).toFixed(0)}%</p>
                </div>
                <Badge
                  className={
                    item.sentiment === "positive"
                      ? "bg-green-100 text-green-800"
                      : item.sentiment === "negative"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                  }
                >
                  {item.sentiment}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Auto-Translation */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold">Auto-Translation</h3>
          <p className="mb-4 text-sm text-muted-foreground">Automatically translate messages between agents and customers</p>
          <div className="space-y-2">
            <div className="flex gap-2">
              <select className="flex-1 rounded border px-2 py-1 text-sm">
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Chinese</option>
              </select>
              <Button>Enable Auto-Translate</Button>
            </div>
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-6">
          <h3 className="mb-4 font-semibold flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Insights
          </h3>
          <div className="space-y-3">
            <div className="rounded-lg bg-blue-50 p-3">
              <p className="text-sm font-medium">Trending Issues</p>
              <p className="text-xs text-muted-foreground">Login failures (23 mentions), Performance issues (18 mentions)</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-sm font-medium">Recommended Actions</p>
              <p className="text-xs text-muted-foreground">Create KB article for login troubleshooting, escalate performance issues to engineering</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <p className="text-sm font-medium">Agent Performance</p>
              <p className="text-xs text-muted-foreground">Alice has highest CSAT (4.8), recommend her for complex issues</p>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
