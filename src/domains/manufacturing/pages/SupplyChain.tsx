import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecPanel, AecStatCard, AecTag } from "@/domains/aec/components/primitives";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { MfgKpiGrid, MfgSitePills, MfgTriggerCard } from "@/domains/manufacturing/components/MfgUi";
import { ROLE_KPIS, SITE_BY_ID, SUPPLIERS, TRIGGERS, type MfgSiteId } from "@/domains/manufacturing/data";
import { useManufacturingSite } from "@/domains/manufacturing/context/ManufacturingSiteContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";

export default function SupplyChain() {
  const triggers = TRIGGERS.filter((t) => t.domain === "Supply Chain");
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Supply Chain — Group View"
        subtitle="Forecast accuracy, supplier performance and lead-time risk across Birmingham, Katowice and Coventry."
      />
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <AecStatCard label="Forecast accuracy (MAPE)" value="18%" sub="Target 12%" />
        <AecStatCard label="Group supplier OTIF" value="94%" sub="3 suppliers below 90%" accent="teal" />
        <AecStatCard label="Lead-time variance" value="±5.2d" sub="2 suppliers: ±7–9 days" accent="brand" />
        <AecStatCard label="Inventory turns (annual)" value="6.2×" sub="Improving" accent="blue" />
      </div>
      <AecPanel title="Group supply chain flow" actions={<AecTag variant="purple">Cross-site</AecTag>}>
        <div className="flex flex-wrap items-stretch gap-2">
          <FlowCol title="Tier 2" items={["UK/EU Steel Mills", "Aluminium Smelters"]} cls="aec-flow-source" />
          <Sep />
          <FlowCol title="Tier 1" items={["Ashbourne Steel Stockholders", "Hutmen Regional Supply"]} cls="aec-flow-connector" />
          <Sep />
          <FlowCol title="Sites" items={["Birmingham · Katowice · Coventry"]} cls="aec-flow-module" />
          <Sep />
          <FlowCol title="Customers" items={["Rail, Hydraulics & EU Industrial OEMs"]} cls="aec-flow-source" />
        </div>
      </AecPanel>
      <AecPanel title="Supplier scorecard — all sites">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Supplier</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Site</TableHead>
              <TableHead>OTIF</TableHead>
              <TableHead>Lead-time variance</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {SUPPLIERS.map((s) => (
              <TableRow key={s.name}>
                <TableCell className="font-semibold">{s.name}</TableCell>
                <TableCell>{s.category}</TableCell>
                <TableCell><AecTag variant={s.site === "Katowice" ? "amber" : s.site === "Coventry" ? "purple" : "blue"}>{s.site}</AecTag></TableCell>
                <TableCell className="font-bold">{s.otif}</TableCell>
                <TableCell>{s.variance}</TableCell>
                <TableCell><StatusBadge status={s.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AecPanel>
      <h4 className="text-[12.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">Supply chain decision triggers</h4>
      {triggers.map((t) => <MfgTriggerCard key={t.id} trigger={t} />)}
    </div>
  );
}

export function SiteOperations() {
  const { activeSiteId, setActiveSiteId, activeSite } = useManufacturingSite();
  const kpis = ROLE_KPIS.plant[activeSiteId] ?? [];
  const quality = ROLE_KPIS.quality[activeSiteId] ?? [];
  const triggers = TRIGGERS.filter((t) => t.site === activeSiteId);
  const d = SITE_BY_ID[activeSiteId];
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Site Operations"
        subtitle="Live operational cockpit for a single site — production, quality and maintenance in one view."
      />
      <MfgSitePills value={activeSiteId} onChange={(id) => setActiveSiteId(id as MfgSiteId)} />
      <MfgKpiGrid kpis={kpis} />
      <div className="grid gap-3.5 lg:grid-cols-3">
        <AecPanel title="Production line">
          {d.production.steps.slice(0, 4).map((s) => (
            <div key={s[0]} className="flex gap-2 border-b border-[color:var(--page-border)] py-1.5 text-[11.5px] last:border-0">
              <span className="font-mono text-[color:var(--page-dim)]">{s[0]}</span>
              <span>{s[1]}</span>
            </div>
          ))}
          <p className="mt-2 text-[10.5px] text-[color:var(--page-muted)]">{d.machinery[0][0]} — {d.machinery[0][2]}</p>
        </AecPanel>
        <AecPanel title="Quality snapshot">
          {quality.slice(0, 3).map((k) => (
            <div key={k.l} className="flex justify-between border-b border-[color:var(--page-border)] py-1.5 text-[11.5px] last:border-0">
              <span className="text-[color:var(--page-muted)]">{k.l}</span>
              <span className="font-bold">{k.v}</span>
            </div>
          ))}
        </AecPanel>
        <AecPanel title="Maintenance snapshot">
          {d.maintenance.map((m) => (
            <div key={m[0]} className="flex items-center justify-between border-b border-[color:var(--page-border)] py-1.5 text-[11px] last:border-0">
              <span>{m[0]}</span>
              <StatusBadge status={m[2]} />
            </div>
          ))}
        </AecPanel>
      </div>
      <h4 className="text-[12.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">
        {activeSite.name} decision triggers
      </h4>
      {triggers.length ? triggers.map((t) => <MfgTriggerCard key={t.id} trigger={t} />) : (
        <p className="py-6 text-center text-xs text-[color:var(--page-muted)]">No site-specific triggers active right now.</p>
      )}
    </div>
  );
}

function FlowCol({ title, items, cls }: { title: string; items: string[]; cls: string }) {
  return (
    <div className="flex w-[150px] shrink-0 flex-col gap-1.5">
      <p className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">{title}</p>
      {items.map((item) => (
        <div key={item} className={`rounded-md border px-2.5 py-2 text-center text-[11px] font-semibold ${cls}`}>{item}</div>
      ))}
    </div>
  );
}

function Sep() {
  return (
    <div className="flex min-w-[24px] flex-1 items-center justify-center text-[color:var(--page-dim)]">
      <ArrowRight className="h-5 w-5" />
    </div>
  );
}
