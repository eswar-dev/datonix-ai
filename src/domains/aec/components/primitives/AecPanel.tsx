import { cn } from "@/common/lib/utils";

export function AecPanel({
  title,
  icon,
  actions,
  children,
  className,
}: {
  title?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)]",
        className,
      )}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between border-b border-[color:var(--page-border)] px-4 py-2.5">
          <div className="flex items-center gap-2">
            {icon}
            {title && (
              <h3 className="text-[12.5px] font-semibold text-[color:var(--page-text)]">{title}</h3>
            )}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
