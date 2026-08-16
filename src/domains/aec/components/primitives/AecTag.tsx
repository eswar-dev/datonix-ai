import { cn } from "@/common/lib/utils";

const variants = {
  default: "border-[color:var(--page-border)] bg-[color:var(--page-card-2)] text-[color:var(--page-muted)]",
  brand: "border-[color:var(--page-accent)]/30 bg-[color:var(--page-accent)]/10 text-[color:var(--page-accent)]",
  teal: "border-[color:var(--page-teal)]/30 bg-[color:var(--page-teal)]/10 text-[color:var(--page-teal)]",
  amber: "border-[color:var(--page-amber)]/30 bg-[color:var(--page-amber)]/10 text-[color:var(--page-amber)]",
  blue: "border-[color:var(--page-blue)]/30 bg-[color:var(--page-blue)]/10 text-[color:var(--page-blue)]",
  purple: "border-[color:var(--page-purple)]/30 bg-[color:var(--page-purple)]/10 text-[color:var(--page-purple)]",
  success: "border-[color:var(--page-success)]/30 bg-[color:var(--page-success)]/10 text-[color:var(--page-success)]",
  danger: "border-[color:var(--page-danger)]/30 bg-[color:var(--page-danger)]/10 text-[color:var(--page-danger)]",
};

export function AecTag({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: keyof typeof variants;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-semibold border",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
