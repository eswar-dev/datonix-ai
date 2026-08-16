import { cn } from "@/common/lib/utils";

const barColors = {
  brand: "from-[color:var(--page-accent)] to-transparent",
  teal: "from-[color:var(--page-teal)] to-transparent",
  blue: "from-[color:var(--page-blue)] to-transparent",
  amber: "from-[color:var(--page-amber)] to-transparent",
  purple: "from-[color:var(--page-purple)] to-transparent",
};

export function AecStatCard({
  label,
  value,
  sub,
  accent = "brand",
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  accent?: keyof typeof barColors;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-3.5",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r",
          barColors[accent],
        )}
      />
      <p className="mb-1 text-[10px] font-medium tracking-wide text-[color:var(--page-muted)]">
        {label}
      </p>
      <p className="text-[22px] font-bold tabular-nums tracking-tight text-[color:var(--page-text)]">
        {value}
      </p>
      {sub && <p className="mt-1 text-[10px] text-[color:var(--page-muted)]">{sub}</p>}
    </div>
  );
}
