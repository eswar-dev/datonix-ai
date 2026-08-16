import { cn } from "@/common/lib/utils";

const variants = {
  primary:
    "bg-[color:var(--page-accent)] text-white hover:bg-[color:var(--page-accent-hover)] border-transparent",
  outline:
    "border-[color:var(--page-border)] bg-transparent text-[color:var(--page-muted)] hover:bg-[color:var(--page-row-hover)] hover:text-[color:var(--page-text)]",
  ghost:
    "border-transparent bg-transparent text-[color:var(--page-muted)] hover:bg-[color:var(--page-row-hover)] hover:text-[color:var(--page-text)]",
};

const sizes = {
  xs: "h-6 px-2 text-[10px] gap-1",
  sm: "h-7 px-2.5 text-[11px] gap-1.5",
  md: "h-8 px-3 text-[12px] gap-2",
};

export function AecButton({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md border font-semibold transition-colors disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
