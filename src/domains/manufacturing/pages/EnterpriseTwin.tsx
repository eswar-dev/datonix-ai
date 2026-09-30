import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Database, Download, Layers, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/common/components/ui/textarea";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import {
  AecButton,
  AecLivePill,
  AecPanel,
  AecProgress,
  AecStatCard,
  AecTag,
} from "@/domains/aec/components/primitives";
import { DEFAULT_TWIN_PROMPT, type MfgSiteId } from "@/domains/manufacturing/data";
import { MfgGlyph, SITE_ICONS, SITE_TONES } from "@/domains/manufacturing/components/mfgIcons";

export default function EnterpriseTwin() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState(DEFAULT_TWIN_PROMPT);
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      toast.success("Enterprise twin generated for Riverside Fabrication Group");
      navigate("/enterprise-twin/summary");
    }, 700);
  };

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Enterprise Twin"
        subtitle="Generate, inspect and manage your AI-powered multi-site manufacturing twin."
        actions={
          <>
            <AecButton variant="outline" size="sm" onClick={() => navigate("/connectors")}>
              <Database className="h-3.5 w-3.5" />
              Connector Mapping
            </AecButton>
            <AecButton size="sm" onClick={() => navigate("/enterprise-twin/summary")}>
              View Twin Summary
              <ArrowRight className="h-3.5 w-3.5" />
            </AecButton>
          </>
        }
      />

      <AecPanel
        title="Enterprise Twin Generator"
        icon={<Sparkles className="h-3.5 w-3.5 text-[color:var(--page-teal)]" />}
        actions={<AecLivePill label="Ready" />}
      >
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={4}
          className="resize-none text-[12.5px]"
        />
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-2xl text-[11px] leading-relaxed text-[color:var(--page-muted)]">
            Describe your site network — Datonix generates a per-site digital twin, org hierarchy, KPI
            framework, skill matrix and compliance rules, then co-links shared resources and suppliers.
          </p>
          <AecButton onClick={generate} disabled={generating || !prompt.trim()}>
            <Layers className="h-3.5 w-3.5" />
            {generating ? "Generating…" : "Generate Twin"}
          </AecButton>
        </div>
      </AecPanel>

      <div className="grid gap-3.5 lg:grid-cols-[2fr_1fr]">
        <AecPanel
          title="Multi-site structure"
          icon={<Layers className="h-3.5 w-3.5 text-[color:var(--page-accent)]" />}
          actions={<AecTag variant="teal">Live</AecTag>}
        >
          <SiteRow
            siteId="group"
            name="Riverside Fabrication Group"
            sub="Parent Holding · UK · GBP reporting"
            meta="70 staff"
            root
          />
          <div className="ml-3.5 border-l border-[color:var(--page-border)] pl-3.5">
            <SiteRow siteId="birmingham" name="Birmingham Site" sub="Precision machining & assembly · UK · GBP" meta="34" status="Live" />
            <SiteRow siteId="katowice" name="Katowice Site" sub="Welded structures & sub-assembly · Poland · EUR" meta="22" status="Active" />
            <SiteRow siteId="coventry" name="Coventry Site" sub="Finishing, assembly & logistics hub · UK · GBP" meta="14" status="Configuring" />
          </div>
        </AecPanel>
        <div className="space-y-3.5">
          <AecPanel title="Shared governance">
            <Row label="Shared maintenance technicians" tag="Enabled" variant="success" />
            <Row label="Shared supplier base" tag="Enabled" variant="success" />
            <Row label="Shared skill matrix" tag="Enabled" variant="success" />
            <Row label="Parent P&L roll-up" tag="GBP" variant="teal" last />
          </AecPanel>
          <AecPanel title="Compliance">
            <Row label="UK VAT 20%" tag="Active" variant="success" />
            <Row label="Poland VAT 23%" tag="Active" variant="success" />
            <Row label="ISO 9001 (Group)" tag="Certified" variant="teal" last />
          </AecPanel>
        </div>
      </div>
    </div>
  );
}

export function TwinSummary() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Twin Summary — Riverside Fabrication Group"
        subtitle="AI-generated organisational interpretation · 70 staff · 3 sites · 2 jurisdictions"
        actions={
          <>
            <AecLivePill label="Generated" />
            <AecButton variant="outline" size="sm" onClick={() => navigate("/enterprise-twin")}>
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </AecButton>
            <AecButton size="sm" onClick={() => toast.success("Twin export queued")}>
              <Download className="h-3.5 w-3.5" />
              Export Twin
            </AecButton>
          </>
        }
      />
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <AecStatCard label="Sites" value="3" sub="+ 1 parent group" accent="brand" />
        <AecStatCard label="Digital twin modules / site" value="10" accent="teal" />
        <AecStatCard label="Source systems" value="5" accent="blue" />
        <AecStatCard label="AI agents generated" value="6" accent="purple" />
      </div>
      <div className="grid gap-3.5 lg:grid-cols-2">
        <AecPanel
          title="Organisation structure"
          actions={
            <AecButton variant="outline" size="xs" onClick={() => navigate("/org-chart")}>
              Full view
            </AecButton>
          }
        >
          <HierarchyBand label="Group Ops Director" count="1 person" className="border-[color:var(--page-accent)]/25 bg-[color:var(--page-accent)]/5" />
          <div className="ml-3 border-l border-[color:var(--page-border)] pl-3">
            <HierarchyBand label="Site managers" count="3 people" className="border-[color:var(--page-blue)]/25 bg-[color:var(--page-blue)]/5" />
            <div className="ml-3 border-l border-[color:var(--page-border)] pl-3">
              <HierarchyBand label="Shift & production leads" count="8 people" className="border-[color:var(--page-teal)]/25 bg-[color:var(--page-teal)]/5" />
              <div className="ml-3 border-l border-[color:var(--page-border)] pl-3">
                <HierarchyBand label="Operators & technicians" count="58 people" className="border-[color:var(--page-purple)]/25 bg-[color:var(--page-purple)]/5" />
              </div>
            </div>
          </div>
        </AecPanel>
        <AecPanel
          title="Site digital twin coverage"
          actions={
            <AecButton variant="outline" size="xs" onClick={() => navigate("/site-twin")}>
              Open twins
            </AecButton>
          }
        >
          <Coverage label="Birmingham" value={100} caption="10 / 10 modules" bar="bg-[color:var(--page-teal)]" />
          <Coverage label="Katowice" value={80} caption="8 / 10 modules" bar="bg-[color:var(--page-amber)]" />
          <Coverage label="Coventry" value={60} caption="6 / 10 modules" bar="bg-[color:var(--page-blue)]" />
          <p className="mt-3 text-[10.5px] text-[color:var(--page-muted)]">
            Modules: Overview, Workforce, Production Line, Machinery, Digital Systems, Inventory, Financials, Supply Chain, Maintenance, Product Lifecycle.
          </p>
        </AecPanel>
        <AecPanel
          title="Generated connector mappings"
          actions={
            <AecButton variant="outline" size="xs" onClick={() => navigate("/connectors")}>
              Full view
            </AecButton>
          }
        >
          <Flow source="E2 MFG" srcLabel="Birmingham ERP" connector="ERP Connector" target="AR / AP / GL" status="Live" />
          <Flow source="Ridder iQ" srcLabel="Katowice ERP" connector="ERP Connector" target="Production & Resources" status="Pending" />
          <Flow source="Deacom" srcLabel="Coventry ERP" connector="ERP Connector" target="Inventory & Logistics" status="Not Connected" />
          <Flow source="MES / APS" srcLabel="All sites" connector="Shop-Floor Connector" target="Quality / SPC" status="Live" />
        </AecPanel>
        <AecPanel title="Generated KPI framework">
          {[
            ["Operational KPIs", "OTIF, OEE, Right First Time, Capacity Utilisation"],
            ["Financial KPIs", "Cost of Poor Quality, Revenue, Gross Margin"],
            ["People KPIs", "Utilisation %, Skill Coverage, Overtime Hours"],
            ["Agent KPIs", "Alerts Raised, Actions Approved, Decision Accuracy"],
          ].map(([t, d]) => (
            <div key={t} className="mb-2 rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-2.5 py-2 last:mb-0">
              <p className="text-[11.5px] font-semibold">{t}</p>
              <p className="text-[10.5px] text-[color:var(--page-muted)]">{d}</p>
            </div>
          ))}
        </AecPanel>
        <AecPanel
          title="Generated AI agents"
          actions={
            <AecButton variant="outline" size="xs" onClick={() => navigate("/ai-agents")}>
              Manage
            </AecButton>
          }
        >
          {[
            ["Schedule Risk Sentinel", "Monitors OTIF slip across all 3 sites", true],
            ["COPQ Erosion Monitor", "Detects scrap/rework cost drift", true],
            ["Resource Overload Agent", "Flags over-allocated shared technicians", true],
            ["Downtime Prediction Agent", "Flags bearing/vibration failure risk", true],
            ["FX Risk Monitor", "GBP/EUR threshold alerts", false],
            ["Skill Gap Predictor", "Hiring forecasting from order pipeline", false],
          ].map(([n, d, on]) => (
            <div key={String(n)} className="mb-1.5 flex items-center gap-2.5 rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-2.5 py-2 last:mb-0">
              <span className={`h-1.5 w-1.5 rounded-full ${on ? "aec-pulse bg-[color:var(--page-teal)]" : "bg-[color:var(--page-dim)]"}`} />
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold">{n}</p>
                <p className="text-[10px] text-[color:var(--page-muted)]">{d}</p>
              </div>
              <AecTag variant={on ? "success" : "default"}>{on ? "Active" : "Inactive"}</AecTag>
            </div>
          ))}
        </AecPanel>
        <AecPanel
          title="Generated skill categories"
          actions={
            <AecButton variant="outline" size="xs" onClick={() => navigate("/resources/skills")}>
              Full matrix
            </AecButton>
          }
        >
          <SkillBlock title="Machining & production (Birmingham)" tags={["CNC Setter", "CNC Operator", "Quality Inspector", "Production Planner"]} />
          <SkillBlock title="Welding & fabrication (Katowice)" tags={["Welder (MIG/TIG)", "Fabricator", "NDT Inspector"]} />
          <SkillBlock title="Finishing & logistics (Coventry)" tags={["Paint Technician", "Warehouse Operative", "Logistics Coordinator"]} />
          <SkillBlock title="Shared maintenance (cross-site)" tags={["Maintenance Technician", "Controls Engineer"]} shared />
        </AecPanel>
      </div>
    </div>
  );
}

function SiteRow({
  siteId,
  name,
  sub,
  meta,
  status,
  root,
}: {
  siteId: MfgSiteId | "group";
  name: string;
  sub: string;
  meta: string;
  status?: string;
  root?: boolean;
}) {
  return (
    <div
      className={`mb-1.5 flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
        root
          ? "border-[color:var(--page-accent)]/20 bg-[color:var(--page-accent)]/5"
          : "border-[color:var(--page-border)] bg-[color:var(--page-card-2)]"
      }`}
    >
      <MfgGlyph icon={SITE_ICONS[siteId]} tone={SITE_TONES[siteId]} />
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold">{name}</p>
        <p className="text-[9.5px] text-[color:var(--page-muted)]">{sub}</p>
      </div>
      <div className="text-right">
        <p className="text-[11.5px] font-bold">{meta}</p>
        <p className="text-[9px] text-[color:var(--page-muted)]">{status ?? "Total"}</p>
      </div>
    </div>
  );
}

function Row({
  label,
  tag,
  variant,
  last,
}: {
  label: string;
  tag: string;
  variant: "success" | "teal";
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-1.5 text-[11.5px] ${last ? "" : "border-b border-[color:var(--page-border)]"}`}>
      <span>{label}</span>
      <AecTag variant={variant}>{tag}</AecTag>
    </div>
  );
}

function HierarchyBand({ label, count, className }: { label: string; count: string; className: string }) {
  return (
    <div className={`mb-1.5 flex items-center justify-between rounded-md border px-2 py-1.5 ${className}`}>
      <span className="text-[11px] font-semibold">{label}</span>
      <span className="text-[10px] text-[color:var(--page-muted)]">{count}</span>
    </div>
  );
}

function Coverage({ label, value, caption, bar }: { label: string; value: number; caption: string; bar: string }) {
  return (
    <div className="mb-2.5 last:mb-0">
      <div className="mb-1 flex justify-between text-[11.5px]">
        <span className="font-semibold">{label}</span>
        <span className="text-[color:var(--page-muted)]">{caption}</span>
      </div>
      <AecProgress value={value} barClassName={bar} className="h-1.5" />
    </div>
  );
}

function Flow({
  source,
  srcLabel,
  connector,
  target,
  status,
}: {
  source: string;
  srcLabel: string;
  connector: string;
  target: string;
  status: string;
}) {
  const tag = status === "Live" ? "success" : status === "Pending" ? "amber" : "default";
  return (
    <div className="mb-2.5 flex flex-wrap items-center gap-1.5 last:mb-0">
      <FlowBox label={source} hint={srcLabel} cls="aec-flow-source" />
      <ArrowRight className="h-4 w-4 shrink-0 text-[color:var(--page-dim)]" />
      <FlowBox label={connector} hint="Connector" cls="aec-flow-connector" />
      <ArrowRight className="h-4 w-4 shrink-0 text-[color:var(--page-dim)]" />
      <FlowBox label={target} hint="Datonix module" cls="aec-flow-module" />
      <AecTag variant={tag} className="ml-auto">
        {status}
      </AecTag>
    </div>
  );
}

function FlowBox({ label, hint, cls }: { label: string; hint: string; cls: string }) {
  return (
    <div className="min-w-[90px] text-center">
      <div className={`rounded-md border px-2 py-1 text-[11px] font-semibold ${cls}`}>{label}</div>
      <p className="mt-0.5 text-[9.5px] text-[color:var(--page-muted)]">{hint}</p>
    </div>
  );
}

function SkillBlock({ title, tags, shared }: { title: string; tags: string[]; shared?: boolean }) {
  return (
    <div className="mb-2 rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-2.5 py-2 last:mb-0">
      <p className="mb-1.5 text-[11px] font-bold">
        {shared && (
          <AecTag variant="purple" className="mr-1.5">
            Shared
          </AecTag>
        )}
        {title}
      </p>
      <div className="flex flex-wrap gap-1">
        {tags.map((t) => (
          <AecTag key={t}>{t}</AecTag>
        ))}
      </div>
    </div>
  );
}
