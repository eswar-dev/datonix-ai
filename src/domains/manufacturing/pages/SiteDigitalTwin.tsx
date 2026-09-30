import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Layers } from "lucide-react";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecPanel, AecStatCard, AecTag } from "@/domains/aec/components/primitives";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  MfgDisclaimer,
  MfgFlowRail,
  MfgSitePills,
  MfgSparkline,
  MfgTabs,
} from "@/domains/manufacturing/components/MfgUi";
import { SITE_BY_ID, SITE_TABS, type MfgSiteId } from "@/domains/manufacturing/data";
import { useManufacturingSite } from "@/domains/manufacturing/context/ManufacturingSiteContext";
import { Input } from "@/common/components/ui/input";

export default function SiteDigitalTwin() {
  const navigate = useNavigate();
  const { activeSiteId, setActiveSiteId } = useManufacturingSite();
  const [tab, setTab] = useState("overview");
  const [flow, setFlow] = useState(0);
  const [sc, setSc] = useState(0);
  const [lc, setLc] = useState(0);
  const [invQ, setInvQ] = useState("");
  const d = SITE_BY_ID[activeSiteId];

  const inv = useMemo(
    () => d.inventory.filter((r) => r[0].toLowerCase().includes(invQ.toLowerCase())),
    [d, invQ],
  );
  const maxBar = Math.max(...d.financials.bars.map((b) => b[1]), 1);

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Site Digital Twin"
        subtitle="Per-site, 10-module twin built on the Datonix digital-twin methodology — co-linked where sites share resources or suppliers."
        actions={
          <AecButton size="sm" onClick={() => navigate("/enterprise-twin/summary")}>
            <Layers className="h-3.5 w-3.5" />
            Twin summary
          </AecButton>
        }
      />
      <MfgSitePills value={activeSiteId} onChange={(id) => { setActiveSiteId(id as MfgSiteId); setTab("overview"); setFlow(0); }} />
      <MfgTabs tabs={SITE_TABS} value={tab} onChange={(id) => { setTab(id); setFlow(0); setSc(0); setLc(0); }} />

      {tab === "overview" && (
        <>
          <div className="grid gap-3.5 lg:grid-cols-2">
            <AecPanel title="Site profile"><p className="text-[12px] leading-relaxed text-[color:var(--page-muted)]">{d.overview.profile}</p></AecPanel>
            <AecPanel title="Capabilities">
              <div className="flex flex-wrap gap-1.5">
                {d.overview.caps.map((c) => <AecTag key={c} variant="teal">{c}</AecTag>)}
              </div>
            </AecPanel>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
            {d.overview.stats.map(([l, v]) => <AecStatCard key={l} label={l} value={v} />)}
          </div>
        </>
      )}

      {tab === "workforce" && (
        <div className="grid gap-3.5 lg:grid-cols-2">
          <AecPanel title="Headcount trend"><MfgSparkline values={d.workforce.spark} /></AecPanel>
          <AecPanel title="Shift pattern">
            {d.workforce.shifts.map((s) => (
              <div key={s[0]} className="flex justify-between border-b border-[color:var(--page-border)] py-1.5 text-[11.5px] last:border-0">
                <span className="font-semibold">{s[0]}</span>
                <span className="text-[color:var(--page-muted)]">{s[1]}</span>
                <span className="font-mono">{s[2]}</span>
              </div>
            ))}
          </AecPanel>
        </div>
      )}

      {tab === "production" && (
        <AecPanel title="Production flow">
          <MfgFlowRail
            steps={d.production.steps.map(([num, name, desc]) => ({ num, name, desc }))}
            active={flow}
            onSelect={setFlow}
          />
        </AecPanel>
      )}

      {tab === "machinery" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {d.machinery.map((m) => (
            <div key={m[0]} className="rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-3.5">
              <p className="text-[12.5px] font-bold">{m[0]}</p>
              <p className="mt-1 font-mono text-[10.5px] text-[color:var(--page-amber)]">{m[1]}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-[color:var(--page-muted)]">{m[2]}</p>
            </div>
          ))}
        </div>
      )}

      {tab === "systems" && (
        <div className="grid gap-3.5 lg:grid-cols-2">
          <AecPanel title="Stack">
            {d.systems.map((s) => (
              <div key={s[0]} className="flex justify-between gap-3 border-b border-[color:var(--page-border)] py-2 last:border-0">
                <div>
                  <p className="text-[11.5px] font-semibold">{s[0]}</p>
                  <p className="text-[10.5px] text-[color:var(--page-muted)]">{s[1]}</p>
                </div>
                <p className="max-w-[200px] text-right text-[10.5px] text-[color:var(--page-muted)]">{s[2]}</p>
              </div>
            ))}
          </AecPanel>
          <AecPanel title="Where the pain point is">
            <p className="text-[12px] leading-relaxed text-[color:var(--page-muted)]">{d.systemsPain}</p>
          </AecPanel>
        </div>
      )}

      {tab === "inventory" && (
        <AecPanel title="Inventory console" actions={<AecTag>Illustrative</AecTag>}>
          <Input value={invQ} onChange={(e) => setInvQ(e.target.value)} placeholder="Filter materials…" className="mb-3 h-8 text-xs" />
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="text-left text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                <th className="pb-2">Material</th><th>Category</th><th>Status</th><th className="text-right">Qty</th>
              </tr>
            </thead>
            <tbody>
              {inv.map((r) => (
                <tr key={r[0]} className="border-t border-[color:var(--page-border)]">
                  <td className="py-2 font-semibold">{r[0]}</td>
                  <td className="text-[color:var(--page-muted)]">{r[1]}</td>
                  <td><StatusBadge status={r[2] === "ok" ? "Live" : r[2] === "low" ? "Watch" : "Critical"} /></td>
                  <td className="text-right font-mono">{r[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </AecPanel>
      )}

      {tab === "financials" && (
        <div className="grid gap-3.5 lg:grid-cols-2">
          <AecPanel title="Site revenue proxy">
            <div className="flex h-[140px] items-end gap-2">
              {d.financials.bars.map(([l, v]) => (
                <div key={l} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                  <div className="w-full rounded-t bg-[color:var(--page-blue)]" style={{ height: `${Math.max(8, (v / maxBar) * 100)}%` }} />
                  <span className="text-[9px] text-[color:var(--page-muted)]">{l}</span>
                </div>
              ))}
            </div>
          </AecPanel>
          <AecPanel title="Group context">
            {d.financials.list.map((l) => (
              <div key={l[0]} className="flex justify-between border-b border-[color:var(--page-border)] py-1.5 text-[11.5px] last:border-0">
                <span>{l[0]}</span><span className="font-mono font-semibold">{l[1]}</span>
              </div>
            ))}
          </AecPanel>
        </div>
      )}

      {tab === "supplychain" && (
        <>
          <AecPanel title="Supply chain flow">
            <MfgFlowRail
              steps={d.supplychain.tiers.map(([name, desc], i) => ({ num: String(i + 1), name, desc }))}
              active={sc}
              onSelect={setSc}
            />
          </AecPanel>
          <AecPanel title="Suppliers">
            {d.supplychain.suppliers.map((s) => (
              <div key={s[0]} className="flex justify-between border-b border-[color:var(--page-border)] py-2 last:border-0">
                <div>
                  <p className="text-[11.5px] font-semibold">{s[0]}</p>
                  <p className="text-[10.5px] text-[color:var(--page-muted)]">{s[1]}</p>
                </div>
                <span className="font-mono text-[11px]">{s[2]}</span>
              </div>
            ))}
          </AecPanel>
        </>
      )}

      {tab === "maintenance" && (
        <AecPanel title="Maintenance cadence">
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="text-left text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                <th className="pb-2">Asset</th><th>Type</th><th>Status</th><th>Date</th><th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {d.maintenance.map((m) => (
                <tr key={m[0] + m[3]} className="border-t border-[color:var(--page-border)]">
                  <td className="py-2 font-semibold">{m[0]}</td>
                  <td className="text-[color:var(--page-muted)]">{m[1]}</td>
                  <td><StatusBadge status={m[2]} /></td>
                  <td className="text-[color:var(--page-muted)]">{m[3]}</td>
                  <td>
                    {m[4]}
                    {m[4].includes("Marcus") && <AecTag variant="purple" className="ml-1.5">Shared</AecTag>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AecPanel>
      )}

      {tab === "lifecycle" && (
        <>
          <AecPanel title="Lifecycle stages">
            <MfgFlowRail
              steps={d.lifecycle.steps.map(([num, name, desc]) => ({ num, name, desc }))}
              active={lc}
              onSelect={setLc}
            />
          </AecPanel>
          <div className="flex flex-wrap gap-1.5">
            {d.lifecycle.grid.map((g) => <AecTag key={g} variant="teal">{g}</AecTag>)}
          </div>
        </>
      )}

      <MfgDisclaimer>
        {`Illustrative demo data for ${d.full}. Coverage: ${d.coverage}% of the 10-module Site Digital Twin structure populated from the digital-twin methodology.`}
      </MfgDisclaimer>
    </div>
  );
}
