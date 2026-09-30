import { useState } from "react";
import { toast } from "sonner";
import { Bot, Calendar, Download, Landmark, Settings2, ShieldCheck, TrendingDown, TrendingUp } from "lucide-react";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecPanel, AecTag } from "@/domains/aec/components/primitives";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { MfgDisclaimer } from "@/domains/manufacturing/components/MfgUi";
import { MfgGlyph } from "@/domains/manufacturing/components/mfgIcons";
import { AGENTS } from "@/domains/manufacturing/data";
import { cn } from "@/common/lib/utils";

export default function ExecutiveDashboard() {
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Executive Dashboard"
        subtitle="Group-wide performance — Riverside Fabrication Group, all 3 sites."
        actions={
          <>
            <AecButton variant="outline" size="sm">
              <Calendar className="h-3.5 w-3.5" />
              This month
            </AecButton>
            <AecButton variant="outline" size="sm" onClick={() => toast.success("Board pack export queued")}>
              <Download className="h-3.5 w-3.5" />
              Export board pack
            </AecButton>
          </>
        }
      />
      <MfgDisclaimer>Illustrative demo data. Figures shown are for product-demonstration purposes and do not represent a real client.</MfgDisclaimer>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="OTIF" value="91.4%" delta="4.2pts" up target="Target 95% · On-Time-In-Full" />
        <Kpi label="OEE" value="76.8%" delta="2.1pts" up target="Target 85% · Overall Equipment Effectiveness" />
        <Kpi label="RFT" value="94.2%" delta="1.3pts" up={false} target="Target 98% · Right-First-Time" />
        <Kpi label="COPQ" value="£184k" delta="0.6pts" up={false} target="Target <£120k · Cost of Poor Quality, MTD" />
      </div>
      <div className="grid gap-3.5 lg:grid-cols-2">
        <AecPanel title="OTIF trend by site" actions={<AecTag>Rolling 8 weeks</AecTag>}>
          <Bars values={[70, 74, 68, 79, 81, 85, 88, 91]} labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]} color="var(--page-teal)" />
        </AecPanel>
        <AecPanel title="Site contribution — COPQ" actions={<AecTag>MTD, £k</AecTag>}>
          <Bars values={[88, 50, 14]} labels={["Birmingham £108k", "Katowice £61k", "Coventry £15k"]} color="var(--page-blue)" />
        </AecPanel>
      </div>
      <AecPanel title="Root-cause: traditional vs AI-enhanced response" actions={<AecTag variant="success">£412k annualised benefit</AecTag>}>
        <div className="grid gap-3 lg:grid-cols-3">
          <Insight
            title="Unplanned CNC downtime — Birmingham Cell 3"
            body="Spindle bearing wear detected 11 days before failure by vibration sensors already on the machine, but the signal sat unreviewed in the MES historian."
            trad="Reactive repair after failure: 14hr downtime, £22k"
            ai="Flagged & scheduled at next PM window: 1.5hr, £2.4k"
          />
          <Insight
            title="RFT slippage — Katowice weld cell"
            body="Porosity defects traced to a batch of shielding gas with drifted flow-rate calibration, not operator technique as first assumed."
            trad="Retraining programme launched: 3 weeks, no root-cause fix"
            ai="Gas-flow correlation surfaced: recalibrated same shift"
          />
          <Insight
            title="FX exposure — EUR/GBP steel contracts"
            body="Katowice's steel purchases in EUR were not hedged against the Birmingham GBP price book, compressing group margin during rate moves."
            trad="Quarterly FX review: exposure spotted after the fact"
            ai="Daily FX Risk Monitor flags & suggests forward cover"
          />
        </div>
      </AecPanel>
    </div>
  );
}

export function AiAgentGovernance() {
  const [agents, setAgents] = useState(AGENTS);
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="AI Agent Governance"
        subtitle={`${agents.filter((a) => a.status === "Active").length} agents monitoring the group — ${agents.filter((a) => a.status === "Pending").length} pending approval.`}
        actions={
          <AecButton size="sm" onClick={() => toast.message("Agent configuration opens after twin publish")}>
            <Settings2 className="h-3.5 w-3.5" />
            Configure agent
          </AecButton>
        }
      />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((a) => (
          <div
            key={a.name}
            className={cn(
              "rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-3.5",
              a.status !== "Active" && "opacity-80",
            )}
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <p className="flex items-center gap-2 text-[12.5px] font-bold">
                <MfgGlyph icon={Bot} tone={a.status === "Active" ? "teal" : "muted"} size="sm" />
                {a.name}
              </p>
              <StatusBadge status={a.status === "Pending" ? "Pending" : "Active"} />
            </div>
            <p className="text-[11px] leading-relaxed text-[color:var(--page-muted)]">{a.desc}</p>
            <div className="mt-2 flex justify-between border-t border-[color:var(--page-border)] pt-2 text-[10.5px] text-[color:var(--page-muted)]">
              <span>{a.stat}</span>
              <span>{a.scope}</span>
            </div>
            {a.status === "Pending" && (
              <div className="mt-2 flex gap-1.5">
                <AecButton size="xs" onClick={() => { setAgents((prev) => prev.map((x) => x.name === a.name ? { ...x, status: "Active" } : x)); toast.success(`${a.name} approved`); }}>Approve</AecButton>
                <AecButton size="xs" variant="outline" onClick={() => { setAgents((prev) => prev.filter((x) => x.name !== a.name)); toast.message(`${a.name} rejected`); }}>Reject</AecButton>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Reports() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Reports" subtitle="Scheduled and on-demand reporting for plant and group leaders." />
      <AecPanel>
        <p className="py-10 text-center text-[12px] text-[color:var(--page-muted)]">
          Board pack, OTIF / OEE / RFT / COPQ trend packs and site digital twin exports are generated from the Executive Dashboard and Site Digital Twin pages.
        </p>
      </AecPanel>
    </div>
  );
}

export function ComplianceLayer() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Compliance Layer" subtitle="Regulatory frameworks tracked per jurisdiction across the group." />
      <div className="grid gap-3.5 lg:grid-cols-3">
        <AecPanel title="United Kingdom" icon={<Landmark className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />} actions={<AecTag variant="blue">Birmingham + Coventry</AecTag>}>
          <CRow label="VAT" value="20%" />
          <CRow label="UK Health & Safety (HSE)" tag="Compliant" />
          <CRow label="EU Machinery Directive / UKCA" tag="Compliant" />
        </AecPanel>
        <AecPanel title="Poland" icon={<Landmark className="h-3.5 w-3.5 text-[color:var(--page-amber)]" />} actions={<AecTag variant="amber">Katowice</AecTag>}>
          <CRow label="VAT" value="23%" />
          <CRow label="EU Machinery Directive / CE Marking" tag="Compliant" />
          <CRow label="PIP (State Labour Inspectorate)" tag="Review due" />
        </AecPanel>
        <AecPanel title="Group-wide" icon={<ShieldCheck className="h-3.5 w-3.5 text-[color:var(--page-purple)]" />} actions={<AecTag variant="purple">All sites</AecTag>}>
          <CRow label="ISO 9001:2015" tag="Certified" />
          <CRow label="ISO 14001" tag="In progress (Coventry)" />
          <CRow label="GDPR / Data Protection" tag="Compliant" />
        </AecPanel>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, up, target }: { label: string; value: string; delta: string; up: boolean; target: string }) {
  return (
    <div className="rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-3.5">
      <div className="mb-1 flex justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--page-muted)]">{label}</span>
        <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10.5px] font-bold ${up ? "bg-[color:var(--page-success)]/10 text-[color:var(--page-success)]" : "bg-[color:var(--page-danger)]/10 text-[color:var(--page-danger)]"}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta}
        </span>
      </div>
      <p className="font-mono text-[22px] font-bold">{value}</p>
      <p className="mt-1 text-[10px] text-[color:var(--page-dim)]">{target}</p>
    </div>
  );
}

function Bars({ values, labels, color }: { values: number[]; labels: string[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-[140px] items-end gap-2">
      {values.map((v, i) => (
        <div key={labels[i]} className="flex flex-1 flex-col items-center justify-end gap-1.5">
          <div className="w-full rounded-t" style={{ height: `${Math.max(8, (v / max) * 100)}%`, background: color }} />
          <span className="text-center text-[9px] leading-tight text-[color:var(--page-muted)]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function Insight({ title, body, trad, ai }: { title: string; body: string; trad: string; ai: string }) {
  return (
    <div className="rounded-lg border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-3">
      <p className="mb-1.5 text-[12.5px] font-bold">{title}</p>
      <p className="mb-2 text-[11px] leading-relaxed text-[color:var(--page-muted)]">{body}</p>
      <div className="grid gap-2">
        <div className="rounded-md border border-[color:var(--page-accent)]/20 bg-[color:var(--page-accent)]/5 p-2">
          <p className="mb-0.5 text-[9.5px] font-bold uppercase text-[color:var(--page-accent)]">Traditional</p>
          <p className="text-[11px] text-[color:var(--page-muted)]">{trad}</p>
        </div>
        <div className="rounded-md border border-[color:var(--page-teal)]/20 bg-[color:var(--page-teal)]/5 p-2">
          <p className="mb-0.5 text-[9.5px] font-bold uppercase text-[color:var(--page-teal)]">AI-enhanced</p>
          <p className="text-[11px] text-[color:var(--page-muted)]">{ai}</p>
        </div>
      </div>
    </div>
  );
}

function CRow({ label, value, tag }: { label: string; value?: string; tag?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-[11.5px]">
      <span>{label}</span>
      {value ? <span className="font-mono text-[color:var(--page-muted)]">{value}</span> : <StatusBadge status={tag ?? ""} />}
    </div>
  );
}
