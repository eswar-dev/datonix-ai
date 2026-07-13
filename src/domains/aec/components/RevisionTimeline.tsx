import type { RateRevision } from "@/domains/aec/data/rateCards";

export function RevisionTimeline({ revisions }: { revisions: RateRevision[] }) {
  return (
    <div className="space-y-0">
      {revisions.map((rev, i) => (
        <div key={rev.id} className="relative flex gap-4 pb-6 last:pb-0">
          {i < revisions.length - 1 && (
            <div className="absolute left-[7px] top-4 h-full w-px bg-border" />
          )}
          <div className="relative z-10 mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-accent bg-card" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-medium">{rev.summary}</p>
              <span className="text-xs text-muted-foreground">{rev.date}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {rev.author} · {rev.changes} change{rev.changes !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
