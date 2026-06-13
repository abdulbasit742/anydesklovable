import { AlertCircle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

export function LoadingRow({ cols = 1, label = "Loading…" }: { cols?: number; label?: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />{label}</span>
      </td>
    </tr>
  );
}

export function EmptyRow({ cols = 1, children }: { cols?: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-sm text-muted-foreground">
        <Inbox className="mx-auto mb-2 h-5 w-5 opacity-60" />
        {children}
      </td>
    </tr>
  );
}

export function ErrorRow({ cols = 1, message }: { cols?: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-sm text-destructive">
        <AlertCircle className="mx-auto mb-2 h-5 w-5" />{message}
      </td>
    </tr>
  );
}

export function DemoBanner({ children = "Showing demo data — connect a device to see real activity." }: { children?: ReactNode }) {
  return (
    <div className="mb-4 rounded-md border border-dashed border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
      {children}
    </div>
  );
}

export function PanelState({
  loading, error, empty, emptyText = "Nothing here yet.", children,
}: {
  loading?: boolean; error?: Error | null; empty?: boolean; emptyText?: ReactNode; children?: ReactNode;
}) {
  if (loading) return <div className="px-4 py-10 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto mb-2 h-4 w-4 animate-spin" />Loading…</div>;
  if (error) return <div className="px-4 py-10 text-center text-sm text-destructive"><AlertCircle className="mx-auto mb-2 h-5 w-5" />{error.message}</div>;
  if (empty) return <div className="px-4 py-10 text-center text-sm text-muted-foreground"><Inbox className="mx-auto mb-2 h-5 w-5 opacity-60" />{emptyText}</div>;
  return <>{children}</>;
}
