import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecStatCard, AecTag } from "@/domains/aec/components/primitives";
import { DOMAIN_ICONS, MfgGlyph, ROLE_ICONS } from "@/domains/manufacturing/components/mfgIcons";
import {
  MfgDisclaimer,
  MfgKpiGrid,
  MfgSitePills,
  MfgTabs,
  MfgTriggerCard,
} from "@/domains/manufacturing/components/MfgUi";
import {
  DEC_DOMAINS,
  DEC_ROLES,
  DEC_SCOPES,
  DOMAIN_OVERVIEW,
  ROLE_KPIS,
  TRIGGERS,
  type MfgScopeId,
} from "@/domains/manufacturing/data";
import { cn } from "@/common/lib/utils";

export default function RoleBasedDecisions() {
  const navigate = useNavigate();
  const [view, setView] = useState("role");
  const [roleId, setRoleId] = useState("plant");
  const [scope, setScope] = useState<MfgScopeId>("group");
  const role = DEC_ROLES.find((r) => r.id === roleId)!;
  const kpis = ROLE_KPIS[roleId]?.[scope] ?? [];
  const triggers = useMemo(
    () => TRIGGERS.filter((t) => t.roles.includes(roleId) && (scope === "group" || t.site === scope || t.site === "group")),
    [roleId, scope],
  );

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Role-Based Decision Intelligence"
        subtitle="What each leader should know, decide and do next — at group level or drilled into a single site."
      />
      <MfgDisclaimer>Illustrative demo data. KPIs, triggers and financial impacts shown are for product-demonstration purposes.</MfgDisclaimer>
      <MfgTabs
        tabs={[
          { id: "role", label: "By role" },
          { id: "domain", label: "By domain" },
        ]}
        value={view}
        onChange={setView}
      />
      {view === "role" ? (
        <>
          <div className="flex flex-wrap gap-2">
            {DEC_ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoleId(r.id)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11.5px] font-semibold",
                  r.id === roleId
                    ? "border-[color:var(--page-accent)] bg-[color:var(--page-accent)]/10 text-[color:var(--page-text)]"
                    : "border-[color:var(--page-border)] bg-[color:var(--page-card)] text-[color:var(--page-muted)]",
                )}
              >
                <MfgGlyph icon={ROLE_ICONS[r.id] ?? ROLE_ICONS.plant} tone={r.id === roleId ? "brand" : "muted"} size="sm" />
                {r.name}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--page-dim)]">Scope</span>
            <MfgSitePills includeGroup value={scope} onChange={(id) => setScope(id as MfgScopeId)} />
          </div>
          <p className="text-[11.5px] leading-relaxed text-[color:var(--page-muted)]">{role.intro}</p>
          <h4 className="text-[12.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">Key KPIs</h4>
          <MfgKpiGrid kpis={kpis} />
          <h4 className="text-[12.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">Active decision triggers</h4>
          {triggers.length ? triggers.map((t) => <MfgTriggerCard key={t.id} trigger={t} />) : (
            <p className="py-8 text-center text-xs text-[color:var(--page-muted)]">No active triggers for this role at this scope.</p>
          )}
        </>
      ) : (
        <>
          <p className="text-[11.5px] text-[color:var(--page-muted)]">
            The decision domains Datonix Manufacturing monitors across the group — open a domain to view its failure-mode library.
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {DOMAIN_OVERVIEW.map((d) => {
              const count = TRIGGERS.filter((t) => t.domain === d.name).length;
              return (
                <button
                  key={d.name}
                  type="button"
                  onClick={() => navigate(`/failure-modes?domain=${encodeURIComponent(d.name)}`)}
                  className="rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-4 text-center hover:border-[color:var(--page-accent)]"
                >
                  <div className="mb-2 flex justify-center">
                    <MfgGlyph icon={DOMAIN_ICONS[d.name] ?? DOMAIN_ICONS.Production} tone="brand" size="lg" />
                  </div>
                  <p className="text-[12.5px] font-bold">{d.name}</p>
                  <p className="mt-1 text-[10.5px] leading-relaxed text-[color:var(--page-muted)]">{d.kpis}</p>
                  <div className="mt-2">
                    <AecTag variant={count ? "amber" : "default"}>
                      {count} active failure mode{count === 1 ? "" : "s"}
                    </AecTag>
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function FailureModesLibrary() {
  const [params] = useSearchParams();
  const [domain, setDomain] = useState(params.get("domain") ?? "all");
  const filtered = domain === "all" ? TRIGGERS : TRIGGERS.filter((t) => t.domain === domain);
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Failure Modes Library"
        subtitle="Every known failure mode across the group, organised by decision domain — root cause, traditional vs AI-enhanced fix, and quantified impact."
      />
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <AecStatCard label="Failure modes tracked" value={String(TRIGGERS.length)} />
        <AecStatCard label="Domains covered" value={String(DEC_DOMAINS.length)} />
        <AecStatCard label="Total margin at risk" value="£630K" accent="brand" />
        <AecStatCard label="AI-enhanced recovery" value="£388K" accent="teal" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["all", ...DEC_DOMAINS].map((d) => (
          <button key={d} type="button" onClick={() => setDomain(d)}>
            <AecTag variant={d === domain ? "blue" : "default"} className="cursor-pointer px-3 py-1.5 text-[11px]">
              {d === "all" ? "All domains" : d}
            </AecTag>
          </button>
        ))}
      </div>
      {filtered.map((t) => <MfgTriggerCard key={t.id} trigger={t} />)}
    </div>
  );
}
