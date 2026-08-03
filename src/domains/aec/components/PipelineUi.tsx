import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/common/lib/utils";

export function PipelineLoadingBanner({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
      <span>{label}</span>
    </div>
  );
}

export function PipelineErrorBanner({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5 text-sm text-warning">
      {message}
    </p>
  );
}

export function PipelineEmptyState({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[160px] items-center justify-center rounded-card border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function PipelineProjectCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-full min-h-[132px] w-full flex-col rounded-card border p-4 text-left transition-colors hover:bg-muted/30",
        selected && "border-accent bg-accent/5 ring-1 ring-accent/20",
        className
      )}
    >
      {children}
    </button>
  );
}
