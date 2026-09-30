import { cn } from "@/common/lib/utils";
import { AecTag } from "@/domains/aec/components/primitives";
import type { MfgKpi, MfgKpiStatus, MfgTrigger } from "@/domains/manufacturing/data";
import { SITES } from "@/domains/manufacturing/data";
import { MfgCountryChip, MfgGlyph, siteGlyphProps } from "@/domains/manufacturing/components/mfgIcons";

export function kpiTone(status: MfgKpiStatus) {
  if (status === "good") return "text-[color:var(--page-success)]";
  if (status === "critical") return "text-[color:var(--page-danger)]";
  return "text-[color:var(--page-amber)]";
}

export function MfgDisclaimer({ children }: { children: string }) {
  return (
    <div className="rounded-r-md border border-[color:var(--page-amber)]/25 border-l-2 border-l-[color:var(--page-amber)] bg-[#fffbeb] px-3 py-2.5 text-[11px] leading-relaxed text-[color:var(--page-muted)] dark:bg-[color:var(--page-card-2)]">
      {children}
    </div>
  );
}

export function MfgKpiGrid({ kpis }: { kpis: MfgKpi[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((k) => (
        <div
          key={k.l}
          className="rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-3.5"
        >
          <p className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--page-muted)]">{k.l}</p>
          <p className="mt-1 font-mono text-[22px] font-bold tracking-tight text-[color:var(--page-text)]">{k.v}</p>
          <p className={cn("mt-1 text-[10px]", kpiTone(k.s))}>{k.t}</p>
        </div>
      ))}
    </div>
  );
}

export function MfgSitePills({
  value,
  onChange,
  includeGroup,
}: {
  value: string;
  onChange: (id: string) => void;
  includeGroup?: boolean;
}) {
  const options = includeGroup
    ? [{ id: "group", flag: "", name: "Group (All Sites)", coverage: 0, status: "Live" }, ...SITES]
    : SITES;
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((s) => {
        const active = s.id === value;
        const dot =
          s.status === "Live" ? "bg-[color:var(--page-success)]" : s.status === "Active" ? "bg-[color:var(--page-blue)]" : "bg-[color:var(--page-amber)]";
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange(s.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors",
              active
                ? "border-[color:var(--page-accent)] bg-[color:var(--page-accent)]/10 text-[color:var(--page-text)]"
                : "border-[color:var(--page-border)] bg-[color:var(--page-card)] text-[color:var(--page-muted)] hover:border-[color:var(--page-accent)]/40",
            )}
          >
            <MfgGlyph {...siteGlyphProps(s.id)} size="sm" />
            {s.name}
            {s.id !== "group" && <MfgCountryChip id={s.id} />}
            {s.id !== "group" && <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />}
            {"coverage" in s && s.id !== "group" ? (
              <span className="font-mono text-[9.5px] text-[color:var(--page-dim)]">{s.coverage}%</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function MfgTriggerCard({ trigger }: { trigger: MfgTrigger }) {
  const sev = trigger.severity === "critical" ? "danger" : trigger.severity === "warning" ? "amber" : "teal";
  const border =
    trigger.severity === "critical"
      ? "border-l-[color:var(--page-danger)]"
      : trigger.severity === "warning"
        ? "border-l-[color:var(--page-amber)]"
        : "border-l-[color:var(--page-teal)]";
  const siteLabel =
    trigger.site === "group" ? "Group-wide" : trigger.site.charAt(0).toUpperCase() + trigger.site.slice(1);
  return (
    <div className={cn("mb-3 rounded-[8px] border border-[color:var(--page-border)] border-l-[3px] bg-[color:var(--page-card)] p-4", border)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[13.5px] font-bold text-[color:var(--page-text)]">{trigger.title}</h3>
          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-[color:var(--page-muted)]">
            {trigger.category} · {siteLabel}
          </p>
        </div>
        <AecTag variant={sev}>{trigger.severity}</AecTag>
      </div>
      <div className="mb-2.5 grid gap-2.5 md:grid-cols-2">
        <div className="rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-2.5">
          <p className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">Root cause</p>
          <p className="text-[11.5px] leading-relaxed text-[color:var(--page-text)]">{trigger.rootCause}</p>
        </div>
        <div className="rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-2.5">
          <p className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">Decision</p>
          <p className="text-[11.5px] leading-relaxed text-[color:var(--page-text)]">{trigger.decision}</p>
        </div>
      </div>
      <div className="mb-2 grid gap-2 md:grid-cols-2">
        <div className="rounded-md border border-[color:var(--page-amber)]/25 bg-[color:var(--page-amber)]/5 p-2.5 text-[11px] leading-relaxed">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[color:var(--page-amber)]">Traditional</p>
          {trigger.traditional}
        </div>
        <div className="rounded-md border border-[color:var(--page-teal)]/25 bg-[color:var(--page-teal)]/5 p-2.5 text-[11px] leading-relaxed">
          <p className="mb-1 text-[9px] font-bold uppercase tracking-wide text-[color:var(--page-teal)]">AI-enhanced</p>
          {trigger.ai}
        </div>
      </div>
      <div className="mb-2 rounded-r-md border border-[color:var(--page-purple)]/25 border-l-[3px] border-l-[color:var(--page-purple)] bg-[color:var(--page-purple)]/5 px-3 py-2.5">
        <p className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-[color:var(--page-purple)]">Recommended action</p>
        <p className="text-[11.5px] leading-relaxed">{trigger.recommendation}</p>
      </div>
      <div className="rounded-r-md border border-[color:var(--page-success)]/20 border-l-[3px] border-l-[color:var(--page-success)] bg-[color:var(--page-success)]/5 px-3 py-2.5 text-[11.5px]">
        <span className="font-semibold text-[color:var(--page-success)]">Expected impact: </span>
        {trigger.roi}
      </div>
    </div>
  );
}

export function MfgTabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="mb-4 flex gap-0.5 overflow-x-auto border-b border-[color:var(--page-border)]">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={cn(
            "whitespace-nowrap border-b-2 px-3 py-1.5 text-[11.5px] font-medium transition-colors",
            value === t.id
              ? "border-[color:var(--page-accent)] font-semibold text-[color:var(--page-text)]"
              : "border-transparent text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function MfgFlowRail({
  steps,
  active,
  onSelect,
}: {
  steps: { num: string; name: string; desc?: string }[];
  active: number;
  onSelect: (i: number) => void;
}) {
  const current = steps[active];
  return (
    <div>
      <div className="mb-2 flex gap-0 overflow-x-auto pb-1">
        {steps.map((s, i) => (
          <button
            key={s.num + s.name}
            type="button"
            onClick={() => onSelect(i)}
            className={cn(
              "w-[112px] shrink-0 border-b-[3px] px-1.5 py-2.5 text-center",
              i === active ? "border-[color:var(--page-accent)]" : "border-[color:var(--page-border)]",
            )}
          >
            <span className="block font-mono text-[9.5px] text-[color:var(--page-dim)]">{s.num}</span>
            <span
              className={cn(
                "mt-1 block text-[10.5px] font-semibold leading-tight",
                i === active ? "text-[color:var(--page-text)]" : "text-[color:var(--page-muted)]",
              )}
            >
              {s.name}
            </span>
          </button>
        ))}
      </div>
      {current && (
        <div className="rounded-lg border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-3">
          <p className="text-[13px] font-bold text-[color:var(--page-text)]">{current.name}</p>
          {current.desc && (
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-[color:var(--page-muted)]">{current.desc}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function MfgSparkline({ values, color = "var(--page-teal)" }: { values: number[]; color?: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-10 items-end gap-0.5">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm opacity-70"
          style={{ height: `${Math.max(8, (v / max) * 100)}%`, background: color }}
        />
      ))}
    </div>
  );
}

export function skillClass(n: number) {
  if (n >= 5) return "bg-[color:var(--page-teal)] text-white";
  if (n === 4) return "bg-[color:var(--page-teal)]/70 text-white";
  if (n === 3) return "bg-[color:var(--page-blue)]/60 text-white";
  if (n === 2) return "bg-[color:var(--page-amber)]/50 text-white";
  if (n === 1) return "bg-[color:var(--page-danger)]/40 text-white";
  return "bg-[color:var(--page-border)] text-[color:var(--page-dim)]";
}

export function statusToTag(status: string): "success" | "amber" | "danger" | "blue" | "purple" | "default" {
  const s = status.toLowerCase();
  if (["live", "active", "good", "on track", "new", "certified", "compliant"].some((k) => s.includes(k))) return "success";
  if (["pending", "watch", "partial", "review", "configur", "at risk", "open"].some((k) => s.includes(k))) return "amber";
  if (["critical", "blocked", "danger", "overdue", "under review"].some((k) => s.includes(k))) return "danger";
  if (["in review", "scheduled"].some((k) => s.includes(k))) return "blue";
  return "default";
}
