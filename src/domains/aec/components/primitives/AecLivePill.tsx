export function AecLivePill({ label = "Live" }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-[10px] border border-[color:var(--page-success)]/20 bg-[color:var(--page-success)]/10 px-2 py-0.5 text-[10px] font-semibold text-[color:var(--page-success)]">
      <span className="aec-pulse h-1.5 w-1.5 rounded-full bg-[color:var(--page-success)]" />
      {label}
    </span>
  );
}
