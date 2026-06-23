import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

/**
 * Route-level error boundary fallback.
 * Shows safe error message — no stack trace in production UI.
 */

interface ErrorBoundaryFallbackProps {
  error?: Error | null;
  requestId?: string;
  onRetry?: () => void;
}

export function ErrorBoundaryFallback({
  error,
  requestId,
  onRetry,
}: ErrorBoundaryFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle>Something went wrong</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground text-sm">
            {error?.message && !error.message.includes("stack")
              ? error.message
              : "An unexpected error occurred. Please try again."}
          </p>

          {requestId && (
            <p className="text-xs text-muted-foreground font-mono">
              Request ID: {requestId}
            </p>
          )}

          <div className="flex flex-col gap-2">
            {onRetry && (
              <Button onClick={onRetry} variant="default">
                Try Again
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Go to Dashboard
            </Button>
            <a
              href="/dashboard/support"
              className="text-sm text-primary hover:underline"
            >
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
