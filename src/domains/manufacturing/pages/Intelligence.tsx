import { useState } from "react";
import {
  AlertTriangle, Bot, BarChart3, Calendar, CheckCircle, ChevronRight,
  Download, FileBarChart, Landmark, Network, Settings2, ShieldCheck, TrendingDown, TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecPanel, AecProgress, AecStatCard, AecTag } from "@/domains/aec/components/primitives";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { MfgDisclaimer } from "@/domains/manufacturing/components/MfgUi";
import { MfgGlyph, SITE_ICONS, SITE_TONES } from "@/domains/manufacturing/components/mfgIcons";
import {
  AGENT_DECISIONS, AGENT_NETWORK_NODES, AGENTS, COMPLIANCE_FRAMEWORKS, COMPLIANCE_RULES,
  REPORT_CATALOGUE, REPORT_PREVIEW, type MfgSiteId,
} from "@/domains/manufacturing/data";
import { cn } from "@/common/lib/utils";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/common/components/ui/table";

// ─── EXECUTIVE DASHBOARD ───────────────────────────────────────────────────────
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
          <Bars values={[108, 61, 15]} labels={["Birmingham £108k", "Katowice £61k", "Coventry £15k"]} color="var(--page-blue)" />
        </AecPanel>
      </div>
      <AecPanel title="Root-cause: traditional vs AI-enhanced response" actions={<AecTag variant="success">£412k annualised benefit</AecTag>}>
        <div className="grid gap-3 lg:grid-cols-3">
          <Insight title="Unplanned CNC downtime — Birmingham Cell 3" body="Spindle bearing wear detected 11 days before failure by vibration sensors already on the machine, but the signal sat unreviewed in the MES historian." trad="Reactive repair after failure: 14hr downtime, £22k" ai="Flagged & scheduled at next PM window: 1.5hr, £2.4k" />
          <Insight title="RFT slippage — Katowice weld cell" body="Porosity defects traced to a batch of shielding gas with drifted flow-rate calibration, not operator technique as first assumed." trad="Retraining programme launched: 3 weeks, no root-cause fix" ai="Gas-flow correlation surfaced: recalibrated same shift" />
          <Insight title="FX exposure — EUR/GBP steel contracts" body="Katowice's steel purchases in EUR were not hedged against the Birmingham GBP price book, compressing group margin during rate moves." trad="Quarterly FX review: exposure spotted after the fact" ai="Daily FX Risk Monitor flags & suggests forward cover" />
        </div>
      </AecPanel>
    </div>
  );
}

// ─── AI AGENT GOVERNANCE (Phase 8) ────────────────────────────────────────────
export function AiAgentGovernance() {
  const [agents, setAgents] = useState(AGENTS);
  const [decisions, setDecisions] = useState(AGENT_DECISIONS);
  const [activeTab, setActiveTab] = useState<"decisions" | "governance" | "network">("decisions");

  const approve = (id: string) => {
    setDecisions((prev) => prev.map((d) => d.id === id ? { ...d, status: "Approved" as const } : d));
    toast.success("Agent recommendation approved — action queued");
  };
  const override = (id: string) => {
    setDecisions((prev) => prev.filter((d) => d.id !== id));
    toast.message("Recommendation overridden and removed");
  };

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="AI Agent Governance"
        subtitle={`${agents.filter((a) => a.status === "Active").length} agents active · ${decisions.filter((d) => d.status === "Pending").length} decisions awaiting action`}
        actions={
          <AecButton size="sm" onClick={() => toast.message("Agent configuration opens after twin publish")}>
            <Settings2 className="h-3.5 w-3.5" />
            Configure agent
          </AecButton>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-[color:var(--page-border)]">
        {([["decisions", "Agent Decisions"], ["governance", "Agent Registry"], ["network", "Multi-Site Network"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)}
            className={cn("border-b-2 px-4 py-2 text-[11.5px] font-semibold transition-colors",
              activeTab === id ? "border-[color:var(--page-accent)] text-[color:var(--page-text)]" : "border-transparent text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]")}>
            {label}
          </button>
        ))}
      </div>

      {/* Decisions tab */}
      {activeTab === "decisions" && (
        <div className="space-y-3">
          {decisions.map((d) => (
            <div key={d.id} className={cn("rounded-[9px] border border-[color:var(--page-border)] border-l-[3px] bg-[color:var(--page-card)] p-4",
              d.urgency === "high" ? "border-l-[color:var(--page-danger)]" : d.status === "Approved" ? "border-l-[color:var(--page-success)]" : "border-l-[color:var(--page-amber)]")}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <MfgGlyph icon={Bot} tone={d.status === "Approved" ? "teal" : d.urgency === "high" ? "brand" : "amber"} />
                  <div>
                    <p className="text-[13px] font-bold">{d.agent}</p>
                    <p className="text-[10px] uppercase tracking-wide text-[color:var(--page-muted)]">{d.scope} · {d.site}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-[9.5px] text-[color:var(--page-muted)]">Confidence</p>
                    <p className="font-mono text-[13px] font-bold">{d.confidence}%</p>
                  </div>
                  <StatusBadge status={d.status === "Approved" ? "Compliant" : d.urgency === "high" ? "Critical" : "Watch"} />
                </div>
              </div>

              <div className="mb-3 rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-3">
                <p className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-[color:var(--page-accent)]">Recommendation</p>
                <p className="text-[12px] leading-relaxed text-[color:var(--page-text)]">{d.recommendation}</p>
              </div>

              <div className="mb-3 grid gap-2 sm:grid-cols-3">
                {d.evidence.map((e) => (
                  <div key={e} className="flex items-start gap-1.5 rounded border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-2.5 py-1.5 text-[10.5px]">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-[color:var(--page-amber)]" />
                    <span>{e}</span>
                  </div>
                ))}
              </div>

              <div className="mb-3 rounded-r-md border border-[color:var(--page-success)]/20 border-l-[3px] border-l-[color:var(--page-success)] bg-[color:var(--page-success)]/5 px-3 py-2 text-[11.5px]">
                <span className="font-bold text-[color:var(--page-success)]">Expected impact: </span>
                <span>{d.impact}</span>
              </div>

              {d.status === "Pending" ? (
                <div className="flex gap-2">
                  <AecButton size="sm" onClick={() => approve(d.id)}>
                    <CheckCircle className="h-3.5 w-3.5" />
                    {d.action}
                  </AecButton>
                  <AecButton size="sm" variant="outline" onClick={() => override(d.id)}>Override</AecButton>
                  <AecButton size="sm" variant="outline" onClick={() => toast.message("Review request sent to Group Ops Director")}>Request review</AecButton>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[11px] text-[color:var(--page-success)]">
                  <CheckCircle className="h-4 w-4" />
                  <span>Approved and actioned</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Governance registry */}
      {activeTab === "governance" && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {agents.map((a) => (
            <div key={a.name} className={cn("rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-3.5", a.status !== "Active" && "opacity-80")}>
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
      )}

      {/* Multi-site network graph */}
      {activeTab === "network" && (
        <div className="space-y-4">
          <MfgDisclaimer>Multi-site agent network — each agent monitors its site, feeding signals to the Group Orchestrator which co-ordinates cross-site decisions.</MfgDisclaimer>
          <AecPanel title="Agent network — Riverside Fabrication Group" icon={<Network className="h-3.5 w-3.5 text-[color:var(--page-accent)]" />}>
            {/* Network grid */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Birmingham agents */}
              <SiteAgentCol siteId="birmingham" title="Birmingham Agents" nodes={AGENT_NETWORK_NODES.filter((n) => n.site === "Birmingham")} />
              {/* Group agents */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-[10.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">Group / Cross-site</p>
                {AGENT_NETWORK_NODES.filter((n) => n.site === "Group").map((node) => (
                  <AgentNode key={node.id} node={node} isCenter />
                ))}
              </div>
              {/* Katowice + Coventry agents */}
              <div className="space-y-4">
                <SiteAgentCol siteId="katowice" title="Katowice Agents" nodes={AGENT_NETWORK_NODES.filter((n) => n.site === "Katowice")} />
                <SiteAgentCol siteId="coventry" title="Coventry Agents" nodes={AGENT_NETWORK_NODES.filter((n) => n.site === "Coventry")} />
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3 border-t border-[color:var(--page-border)] pt-3">
              {[["Active", "bg-[color:var(--page-teal)]"], ["Pending approval", "bg-[color:var(--page-amber)]"], ["Cross-site link", "bg-[color:var(--page-accent)]"]].map(([label, cls]) => (
                <div key={label} className="flex items-center gap-1.5 text-[10.5px] text-[color:var(--page-muted)]">
                  <span className={cn("h-2.5 w-2.5 rounded-full", cls)} />
                  {label}
                </div>
              ))}
            </div>
          </AecPanel>

          {/* Conflict alerts */}
          <AecPanel title="Cross-site agent conflicts" icon={<AlertTriangle className="h-3.5 w-3.5 text-[color:var(--page-amber)]" />} actions={<AecTag variant="amber">1 conflict</AecTag>}>
            <div className="rounded-[8px] border border-[color:var(--page-amber)]/30 bg-[color:var(--page-amber)]/5 p-3">
              <p className="text-[12px] font-bold">Resource Overload — Marcus Klein · 23 Sep 2026</p>
              <p className="mt-1 text-[11px] leading-relaxed text-[color:var(--page-muted)]">Birmingham Breakdown agent and Katowice PM Scheduler both require Marcus Klein on 23 Sep. Group Orchestrator recommends re-scheduling Katowice PM to 26 Sep.</p>
              <div className="mt-2 flex gap-2">
                <AecButton size="xs" onClick={() => toast.success("Re-sequence approved — Katowice PM moved to 26 Sep")}>Approve re-sequence</AecButton>
                <AecButton size="xs" variant="outline">View detail</AecButton>
              </div>
            </div>
          </AecPanel>
        </div>
      )}
    </div>
  );
}

// ─── REPORTS (Phase 9) ────────────────────────────────────────────────────────
export function MfgReports() {
  const [selectedId, setSelectedId] = useState<string | null>("r1");
  const [filterCat, setFilterCat] = useState("All");
  const [search, setSearch] = useState("");

  const cats = ["All", "Production", "Quality", "People", "Finance", "Compliance", "Executive"];
  const filtered = REPORT_CATALOGUE.filter((r) =>
    (filterCat === "All" || r.category === filterCat) &&
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const selected = REPORT_CATALOGUE.find((r) => r.id === selectedId);
  const preview = selectedId ? REPORT_PREVIEW[selectedId] : null;

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Reports"
        subtitle="Manufacturing report library — production, quality, people, finance and compliance reports."
        actions={
          <div className="flex gap-2">
            <AecButton variant="outline" size="sm" onClick={() => toast.message("Custom report builder coming soon")}>Custom report</AecButton>
            <AecButton size="sm" onClick={() => toast.success("Report export queued")}>
              <Download className="h-3.5 w-3.5" />
              Export
            </AecButton>
          </div>
        }
      />
      <div className="grid gap-2.5 sm:grid-cols-4">
        <AecStatCard label="Reports available" value={String(REPORT_CATALOGUE.length)} />
        <AecStatCard label="Ready" value={String(REPORT_CATALOGUE.filter((r) => r.status === "Ready").length)} accent="teal" />
        <AecStatCard label="Alert / attention" value={String(REPORT_CATALOGUE.filter((r) => r.status === "Alert").length)} accent="amber" />
        <AecStatCard label="Last run" value="Today 08:00" accent="brand" />
      </div>

      <div className="flex gap-3.5 lg:flex-row flex-col">
        {/* Left sidebar — report list */}
        <div className="w-full lg:w-[280px] shrink-0 space-y-2">
          <input
            className="w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-3 py-2 text-[12px] placeholder:text-[color:var(--page-dim)]"
            placeholder="Search reports…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="flex flex-wrap gap-1">
            {cats.map((c) => (
              <button key={c} type="button" onClick={() => setFilterCat(c)}>
                <AecTag variant={filterCat === c ? "blue" : "default"} className="cursor-pointer text-[10.5px]">{c}</AecTag>
              </button>
            ))}
          </div>
          <div className="space-y-1 rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-1.5">
            {filtered.map((r) => (
              <button key={r.id} type="button" onClick={() => setSelectedId(r.id)}
                className={cn("flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left transition-colors",
                  selectedId === r.id ? "bg-[color:var(--page-accent)]/10 text-[color:var(--page-text)]" : "hover:bg-[color:var(--page-card-2)] text-[color:var(--page-muted)]")}>
                <div>
                  <p className="text-[11.5px] font-semibold leading-tight">{r.name}</p>
                  <p className="text-[9.5px] text-[color:var(--page-dim)]">{r.category} · {r.period}</p>
                </div>
                <div className="flex items-center gap-1">
                  {r.status === "Alert" && <AlertTriangle className="h-3.5 w-3.5 text-[color:var(--page-amber)]" />}
                  <StatusBadge status={r.status === "Alert" ? "Watch" : "Good"} />
                </div>
              </button>
            ))}
            {filtered.length === 0 && <p className="py-4 text-center text-[11px] text-[color:var(--page-dim)]">No reports match your filter.</p>}
          </div>
        </div>

        {/* Right — report viewer */}
        <div className="flex-1 min-w-0">
          {selected ? (
            <AecPanel
              title={selected.name}
              icon={<FileBarChart className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />}
              actions={
                <div className="flex items-center gap-2">
                  <AecTag>{selected.category}</AecTag>
                  <AecTag variant="default">{selected.period}</AecTag>
                  <AecButton size="xs" variant="outline" onClick={() => toast.success("PDF export queued")}>PDF</AecButton>
                  <AecButton size="xs" variant="outline" onClick={() => toast.success("CSV export queued")}>CSV</AecButton>
                </div>
              }
            >
              <div className="mb-3 flex flex-wrap gap-4 text-[11.5px]">
                <span className="text-[color:var(--page-muted)]">Last run: <strong>{selected.lastRun}</strong></span>
                <span className="text-[color:var(--page-muted)]">Period: <strong>{selected.period}</strong></span>
                <StatusBadge status={selected.status === "Alert" ? "Watch" : "Good"} />
              </div>

              {preview ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>{preview.headers.map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.rows.map((row, i) => (
                        <TableRow key={i}>
                          {row.map((cell, j) => <TableCell key={j} className={j === 0 ? "font-semibold" : ""}>{cell}</TableCell>)}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] py-12 text-center">
                  <BarChart3 className="mx-auto mb-2 h-8 w-8 text-[color:var(--page-dim)]" />
                  <p className="text-[12px] text-[color:var(--page-muted)]">Report data preview will appear here once connected to live ERP / MES.</p>
                  <AecButton size="sm" className="mt-3" onClick={() => toast.success("Report generation queued")}>Generate report</AecButton>
                </div>
              )}
            </AecPanel>
          ) : (
            <div className="flex h-full items-center justify-center rounded-[9px] border border-dashed border-[color:var(--page-border)] bg-[color:var(--page-card)] py-16 text-center">
              <div>
                <FileBarChart className="mx-auto mb-2 h-8 w-8 text-[color:var(--page-dim)]" />
                <p className="text-[12px] text-[color:var(--page-muted)]">Select a report from the list to view it here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── COMPLIANCE (Phase 10) ────────────────────────────────────────────────────
export function ComplianceLayer() {
  const [framework, setFramework] = useState("All");
  const [site, setSite] = useState("All");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = COMPLIANCE_RULES.filter((r) =>
    (framework === "All" || r.framework === framework) &&
    (site === "All" || r.sites.toLowerCase().includes(site.toLowerCase()) || r.sites === "All")
  );

  const compliant = filtered.filter((r) => r.status === "Compliant").length;
  const gaps = filtered.filter((r) => r.status === "Gap").length;
  const reviews = filtered.filter((r) => r.status === "Review due").length;
  const inProgress = filtered.filter((r) => r.status === "In Progress").length;

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Manufacturing Compliance"
        subtitle="HSE, ISO, regulatory and jurisdictional compliance — real-time status across all sites."
        actions={
          <AecButton size="sm" onClick={() => { setReportGenerated(true); toast.success("Compliance report generated"); }}>
            <FileBarChart className="h-3.5 w-3.5" />
            Generate compliance report
          </AecButton>
        }
      />

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
        <AecStatCard label="Rules tracked" value={String(COMPLIANCE_RULES.length)} />
        <AecStatCard label="Compliant" value={String(compliant)} accent="teal" />
        <AecStatCard label="Gaps" value={String(COMPLIANCE_RULES.filter((r) => r.status === "Gap").length)} accent="brand" />
        <AecStatCard label="Review due" value={String(COMPLIANCE_RULES.filter((r) => r.status === "Review due").length)} accent="amber" />
        <AecStatCard label="Next audit" value="ISO 9001 Mar 2027" />
      </div>

      {/* Coverage bar */}
      <AecPanel title="Overall compliance coverage">
        <div className="mb-2 flex justify-between text-[11.5px]">
          <span className="font-semibold">Group compliance score</span>
          <span className="font-mono font-bold">78%</span>
        </div>
        <AecProgress value={78} barClassName="bg-[color:var(--page-teal)]" className="h-2.5" />
        <p className="mt-2 text-[10.5px] text-[color:var(--page-muted)]">{compliant}/{COMPLIANCE_RULES.length} rules met across all frameworks and sites</p>
      </AecPanel>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--page-dim)]">Framework</span>
        {["All", ...COMPLIANCE_FRAMEWORKS].map((f) => (
          <button key={f} type="button" onClick={() => setFramework(f)}>
            <AecTag variant={framework === f ? "blue" : "default"} className="cursor-pointer text-[10.5px]">{f === "All" ? "All frameworks" : f}</AecTag>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--page-dim)]">Site</span>
        {["All", "Birmingham", "Katowice", "Coventry"].map((s) => (
          <button key={s} type="button" onClick={() => setSite(s)}>
            <AecTag variant={site === s ? "blue" : "default"} className="cursor-pointer text-[10.5px]">{s}</AecTag>
          </button>
        ))}
      </div>

      {/* Rules list */}
      <div className="space-y-2">
        {filtered.map((rule) => (
          <div key={rule.id} className={cn("rounded-[8px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] overflow-hidden",
            rule.status === "Gap" && "border-l-[3px] border-l-[color:var(--page-danger)]",
            rule.status === "Review due" && "border-l-[3px] border-l-[color:var(--page-amber)]")}>
            <button type="button" className="flex w-full items-center gap-3 px-4 py-3 text-left" onClick={() => setExpandedId(expandedId === rule.id ? null : rule.id)}>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-[color:var(--page-accent)]">{rule.code}</span>
                  <span className="text-[12px] font-semibold">{rule.requirement}</span>
                </div>
                <p className="mt-0.5 text-[10px] text-[color:var(--page-muted)]">{rule.framework} · {rule.sites} · Last checked: {rule.lastChecked}</p>
              </div>
              <StatusBadge status={rule.status === "Compliant" ? "Good" : rule.status === "Gap" ? "Critical" : rule.status === "In Progress" ? "Pending" : "Watch"} />
              <ChevronRight className={cn("h-4 w-4 shrink-0 text-[color:var(--page-dim)] transition-transform", expandedId === rule.id && "rotate-90")} />
            </button>
            {expandedId === rule.id && rule.deviation && (
              <div className="border-t border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-4 py-3">
                <p className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-[color:var(--page-danger)]">Gap / Deviation</p>
                <p className="text-[11.5px] leading-relaxed text-[color:var(--page-text)]">{rule.deviation}</p>
                <div className="mt-2 flex gap-2">
                  <AecButton size="xs" onClick={() => toast.success("Corrective action logged")}>Log corrective action</AecButton>
                  <AecButton size="xs" variant="outline" onClick={() => toast.message("Assigned to compliance officer")}>Assign</AecButton>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="py-8 text-center text-[12px] text-[color:var(--page-muted)]">No rules match your filter.</p>}
      </div>

      {/* Generated report */}
      {reportGenerated && (
        <AecPanel title="Compliance Report — Sep 2026" icon={<ShieldCheck className="h-3.5 w-3.5 text-[color:var(--page-teal)]" />}
          actions={
            <div className="flex gap-2">
              <AecButton size="xs" variant="outline" onClick={() => toast.success("PDF exported")}>Export PDF</AecButton>
              <AecButton size="xs" variant="outline" onClick={() => toast.success("Sent to compliance officer")}>Email</AecButton>
            </div>
          }>
          <div className="mb-3 grid gap-2 sm:grid-cols-4 text-center">
            {[["Rules assessed", String(COMPLIANCE_RULES.length)], ["Compliant", String(COMPLIANCE_RULES.filter((r) => r.status === "Compliant").length)], ["Gaps", String(COMPLIANCE_RULES.filter((r) => r.status === "Gap").length)], ["Actions required", "2"]].map(([l, v]) => (
              <div key={l} className="rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] py-2">
                <p className="text-[9.5px] font-bold uppercase text-[color:var(--page-muted)]">{l}</p>
                <p className="text-[18px] font-bold font-mono">{v}</p>
              </div>
            ))}
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead><TableHead>Framework</TableHead><TableHead>Requirement</TableHead><TableHead>Sites</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {COMPLIANCE_RULES.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-[color:var(--page-accent)]">{r.code}</TableCell>
                  <TableCell><AecTag>{r.framework}</AecTag></TableCell>
                  <TableCell className="max-w-[240px]">{r.requirement}</TableCell>
                  <TableCell>{r.sites}</TableCell>
                  <TableCell><StatusBadge status={r.status === "Compliant" ? "Good" : r.status === "Gap" ? "Critical" : r.status === "In Progress" ? "Pending" : "Watch"} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </AecPanel>
      )}
    </div>
  );
}

// ─── ADMINISTRATION (Phase 11 stub) ───────────────────────────────────────────
export function MfgAdmin() {
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Administration"
        subtitle="Platform configuration, user management and integrations for the Datonix Manufacturing module."
        actions={
          <AecButton size="sm" variant="outline" onClick={() => toast.message("Admin settings — coming soon")}>
            <Settings2 className="h-3.5 w-3.5" />
            Settings
          </AecButton>
        }
      />
      <MfgDisclaimer>Administration features are enabled on the full platform. Contact your Datonix success team to configure roles, SSO, and integrations.</MfgDisclaimer>
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { title: "User Management", desc: "Add, edit and deactivate users. Assign roles and site access permissions.", icon: Bot, tag: "3 sites configured" },
          { title: "ERP/MES Integrations", desc: "Manage connector credentials, sync schedules and field mappings for E2 MFG, Ridder iQ and Deacom.", icon: Network, tag: "3 connectors" },
          { title: "Audit Log", desc: "Full audit trail of approvals, overrides and configuration changes across all sites.", icon: ShieldCheck, tag: "Last event: 2 min ago" },
          { title: "Notification Rules", desc: "Configure email, in-app and Slack alerts for OTIF, COPQ and agent decisions.", icon: AlertTriangle, tag: "12 rules active" },
          { title: "Data Retention", desc: "Set retention policies for timesheets, invoices and compliance records per jurisdiction.", icon: Landmark, tag: "UK: 7 yr · EU: 5 yr" },
          { title: "API Keys", desc: "Manage API tokens for external BI tools (Power BI, Tableau) and webhook endpoints.", icon: Network, tag: "2 active keys" },
        ].map((item) => (
          <div key={item.title} className="rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-4">
            <div className="mb-2 flex items-center gap-2">
              <MfgGlyph icon={item.icon} tone="blue" size="sm" />
              <p className="text-[12.5px] font-bold">{item.title}</p>
            </div>
            <p className="mb-3 text-[11px] leading-relaxed text-[color:var(--page-muted)]">{item.desc}</p>
            <div className="flex items-center justify-between">
              <AecTag>{item.tag}</AecTag>
              <AecButton size="xs" variant="outline" onClick={() => toast.message(`${item.title} — full config available in production`)}>Configure</AecButton>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
function SiteAgentCol({ siteId, title, nodes }: { siteId: string; title: string; nodes: typeof AGENT_NETWORK_NODES }) {
  const SiteIcon = SITE_ICONS[siteId as MfgSiteId] ?? SITE_ICONS.birmingham;
  const tone = SITE_TONES[siteId as MfgSiteId] ?? "blue";
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <MfgGlyph icon={SiteIcon} tone={tone} size="sm" />
        <p className="text-[10.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">{title}</p>
      </div>
      {nodes.map((node) => <AgentNode key={node.id} node={node} />)}
    </div>
  );
}

function AgentNode({ node, isCenter }: { node: typeof AGENT_NETWORK_NODES[0]; isCenter?: boolean }) {
  return (
    <div className={cn("rounded-[8px] border p-2.5 text-[11px]",
      isCenter ? "border-[color:var(--page-accent)]/30 bg-[color:var(--page-accent)]/5" : "border-[color:var(--page-border)] bg-[color:var(--page-card-2)]",
      node.status === "Pending" && "opacity-60")}>
      <div className="flex items-center gap-1.5">
        <span className={cn("h-2 w-2 rounded-full shrink-0", node.status === "Active" ? "bg-[color:var(--page-teal)] aec-pulse" : "bg-[color:var(--page-amber)]")} />
        <span className="font-semibold leading-tight">{node.label}</span>
      </div>
      <p className="mt-0.5 text-[9.5px] text-[color:var(--page-muted)]">{node.status === "Pending" ? "Pending approval" : `${node.connections.length} connection${node.connections.length !== 1 ? "s" : ""}`}</p>
    </div>
  );
}

function Kpi({ label, value, delta, up, target }: { label: string; value: string; delta: string; up: boolean; target: string }) {
  return (
    <div className="rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-3.5">
      <div className="mb-1 flex justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[color:var(--page-muted)]">{label}</span>
        <span className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10.5px] font-bold", up ? "bg-[color:var(--page-success)]/10 text-[color:var(--page-success)]" : "bg-[color:var(--page-danger)]/10 text-[color:var(--page-danger)]")}>
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
