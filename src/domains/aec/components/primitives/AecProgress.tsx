import { cn } from "@/common/lib/utils";

export function AecProgress({
  value,
  className,
  barClassName,
}: {
  value: number;
  className?: string;
  barClassName?: string;
}) {
  const color =
    value >= 95
      ? "bg-[color:var(--page-danger)]"
      : value >= 85
        ? "bg-[color:var(--page-amber)]"
        : "bg-[color:var(--page-teal)]";
  return (
    <div
      className={cn(
        "h-1 overflow-hidden rounded-sm bg-[color:var(--page-border)]",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-sm transition-all", color, barClassName)}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
