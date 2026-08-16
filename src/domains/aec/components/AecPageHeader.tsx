import type { ReactNode } from "react";

export function AecPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: { label: string; href?: string }[];
  actions?: ReactNode;
}) {
  return (
    <div className="mb-[18px] flex flex-col flex-wrap items-start justify-between gap-3.5 sm:flex-row sm:items-start">
      <div className="min-w-0 flex-1">
        <h1 className="text-lg font-bold tracking-tight text-[color:var(--page-text)]">{title}</h1>
        {subtitle && (
          <p className="mt-0.5 max-w-3xl text-[11.5px] leading-relaxed text-[color:var(--page-muted)]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>
      )}
    </div>
  );
}
