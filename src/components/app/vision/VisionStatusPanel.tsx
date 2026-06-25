import { useEffect, useState } from "react";
import { Eye, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface VisionStatusPanelProps {
  sessionId: string;
}

interface VisionStatus {
  isActive: boolean;
  lastEventTime?: Date;
  totalEvents: number;
  recentEventTypes: string[];
}

export function VisionStatusPanel({ sessionId }: VisionStatusPanelProps) {
  const [status, setStatus] = useState<VisionStatus>({
    isActive: false,
    totalEvents: 0,
    recentEventTypes: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/vision/events/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            const events = data.data;
            const eventTypes = [...new Set(events.map((e: any) => e.eventType))];
            setStatus({
              isActive: events.length > 0,
              lastEventTime: events[0]?.timestamp ? new Date(events[0].timestamp) : undefined,
              totalEvents: events.length,
              recentEventTypes: eventTypes.slice(0, 3),
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch vision status:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Eye className="h-4 w-4" />
          AI Vision Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <span className={`text-sm px-2 py-1 rounded ${status.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {status.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Total Events
              </span>
              <span className="text-sm font-semibold">{status.totalEvents}</span>
            </div>

            {status.lastEventTime && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Last Event
                </span>
                <span className="text-sm">{status.lastEventTime.toLocaleTimeString()}</span>
              </div>
            )}

            {status.recentEventTypes.length > 0 && (
              <div>
                <span className="text-sm font-medium block mb-2">Recent Event Types</span>
                <div className="flex flex-wrap gap-1">
                  {status.recentEventTypes.map((type) => (
                    <span key={type} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {type}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
