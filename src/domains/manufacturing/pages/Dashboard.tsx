import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, BarChart3, CheckCircle, ChevronRight, Download, Factory, TrendingDown, TrendingUp, User } from "lucide-react";
import { toast } from "sonner";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecPanel, AecStatCard, AecTag } from "@/domains/aec/components/primitives";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { MfgDisclaimer } from "@/domains/manufacturing/components/MfgUi";
import { MfgGlyph, SITE_ICONS, SITE_TONES, MfgCountryChip } from "@/domains/manufacturing/components/mfgIcons";
import {
  AGENT_DECISIONS,
  MY_APPROVALS,
  MY_WORK_ORDERS,
  SITE_COMPARISON,
  TIMESHEETS,
  type MfgSiteId,
} from "@/domains/manufacturing/data";
import { useManufacturingSite } from "@/domains/manufacturing/context/ManufacturingSiteContext";
import { cn } from "@/common/lib/utils";

type DashTab = "my" | "executive" | "multi-site";

export default function MfgDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  const pathTab: DashTab =
    location.pathname.includes("executive") ? "executive"
      : location.pathname.includes("multi") ? "multi-site"
      : "my";

  const [tab, setTab] = useState<DashTab>(pathTab);
  const [approvals, setApprovals] = useState(MY_APPROVALS);

  const handleTabChange = (t: DashTab) => {
    setTab(t);
    navigate(t === "my" ? "/dashboard/my" : t === "executive" ? "/dashboard/executive" : "/dashboard/multi-site", { replace: true });
  };

  const approve = (id: string) => {
    setApprovals((prev) => prev.map((a) => a.id === id ? { ...a, status: "Approved" } : a));
    toast.success("Approved");
  };
  const reject = (id: string) => {
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    toast.message("Rejected and removed");
  };

  const TABS: { id: DashTab; label: string; icon: typeof User }[] = [
    { id: "my", label: "My View", icon: User },
    { id: "executive", label: "Executive View", icon: BarChart3 },
    { id: "multi-site", label: "Multi-Site View", icon: Factory },
  ];

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Manufacturing Dashboard"
        subtitle="Riverside Fabrication Group — role view, executive summary and multi-site comparison."
        actions={
          <AecButton variant="outline" size="sm" onClick={() => toast.success("Dashboard export queued")}>
            <Download className="h-3.5 w-3.5" />
            Export
          </AecButton>
        }
      />
      <MfgDisclaimer>Illustrative demo data. KPIs, figures and trends shown are for product-demonstration purposes.</MfgDisclaimer>

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-[color:var(--page-border)]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => handleTabChange(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 border-b-2 px-4 py-2 text-[12px] font-semibold transition-colors",
              tab === t.id
                ? "border-[color:var(--page-accent)] text-[color:var(--page-text)]"
                : "border-transparent text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]",
            )}
          >
            <t.icon className="h-3.5 w-3.5" strokeWidth={1.75} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === "my" && <MyView approvals={approvals} onApprove={approve} onReject={reject} />}
      {tab === "executive" && <ExecutiveView />}
      {tab === "multi-site" && <MultiSiteView />}
    </div>
  );
}

// ─── MY VIEW ──────────────────────────────────────────────────────────────────
function MyView({
  approvals,
  onApprove,
  onReject,
}: {
  approvals: typeof MY_APPROVALS;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const { activeSite } = useManufacturingSite();
  const pending = approvals.filter((a) => a.status === "Pending");

  return (
    <div className="space-y-4">
      <div className="rounded-[9px] border border-[color:var(--page-accent)]/20 bg-[color:var(--page-accent)]/5 px-4 py-3">
        <p className="text-[13px] font-bold text-[color:var(--page-text)]">Good morning, Site Manager</p>
        <p className="mt-0.5 text-[11.5px] text-[color:var(--page-muted)]">
          Active site: {activeSite.full} · {pending.length} items need your attention today.
        </p>
      </div>

      {/* My site KPIs */}
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <DashKpi label="OTIF" value="93%" delta="4.2pts" up />
        <DashKpi label="OEE" value="79%" delta="2.1pts" up />
        <DashKpi label="RFT" value="95%" delta="1.3pts" up={false} />
        <DashKpi label="COPQ" value="£108k" delta="0.6pts" up={false} />
      </div>

      <div className="grid gap-3.5 lg:grid-cols-2">
        {/* Pending approvals */}
        <AecPanel
          title="Pending approvals"
          icon={<AlertTriangle className="h-3.5 w-3.5 text-[color:var(--page-amber)]" />}
          actions={<AecTag variant={pending.length > 0 ? "amber" : "success"}>{pending.length} pending</AecTag>}
        >
          {pending.length === 0 && (
            <div className="flex items-center gap-2 py-6 text-center">
              <CheckCircle className="mx-auto h-5 w-5 text-[color:var(--page-success)]" />
              <p className="text-[11.5px] text-[color:var(--page-muted)]">All caught up — no pending approvals.</p>
            </div>
          )}
          {pending.map((a) => (
            <div key={a.id} className="mb-2 flex items-center justify-between rounded-lg border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-2.5 last:mb-0">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <AecTag variant="amber" className="shrink-0">{a.type}</AecTag>
                  <span className="truncate text-[11.5px] font-semibold">{a.person}</span>
                </div>
                <p className="mt-0.5 text-[10.5px] text-[color:var(--page-muted)]">{a.detail}</p>
              </div>
              <div className="ml-2 flex shrink-0 gap-1">
                <AecButton size="xs" onClick={() => onApprove(a.id)}>Approve</AecButton>
                <AecButton size="xs" variant="outline" onClick={() => onReject(a.id)}>Reject</AecButton>
              </div>
            </div>
          ))}
        </AecPanel>

        {/* My work orders */}
        <AecPanel title="My work orders" icon={<BarChart3 className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />}>
          {MY_WORK_ORDERS.map((wo) => (
            <div key={wo.id} className="mb-2 flex items-center gap-2.5 rounded-lg border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-2.5 py-2 last:mb-0">
              <span className="font-mono text-[11px] text-[color:var(--page-accent)]">{wo.id}</span>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-semibold">{wo.customer}</p>
                <p className="text-[10px] text-[color:var(--page-muted)]">{wo.stage} · {wo.assigned}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={wo.status} />
                <p className="mt-0.5 text-[9.5px] text-[color:var(--page-muted)]">Due {wo.due}</p>
              </div>
            </div>
          ))}
        </AecPanel>
      </div>

      {/* Agent alerts relevant to my role */}
      <AecPanel title="AI agent alerts for you" icon={<AlertTriangle className="h-3.5 w-3.5 text-[color:var(--page-danger)]" />}>
        <div className="grid gap-2.5 md:grid-cols-2">
          {AGENT_DECISIONS.filter((d) => d.status === "Pending").map((d) => (
            <div key={d.id} className={cn("rounded-[8px] border-l-[3px] border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-3", d.urgency === "high" ? "border-l-[color:var(--page-danger)]" : "border-l-[color:var(--page-amber)]")}>
              <div className="mb-1.5 flex items-start justify-between gap-2">
                <p className="text-[12px] font-bold">{d.agent}</p>
                <AecTag variant={d.urgency === "high" ? "danger" : "amber"}>{d.urgency}</AecTag>
              </div>
              <p className="text-[11px] leading-relaxed text-[color:var(--page-muted)]">{d.recommendation}</p>
              <p className="mt-2 text-[10.5px] font-semibold text-[color:var(--page-success)]">Impact: {d.impact}</p>
            </div>
          ))}
        </div>
      </AecPanel>
    </div>
  );
}

// ─── EXECUTIVE VIEW ────────────────────────────────────────────────────────────
function ExecutiveView() {
  return (
    <div className="space-y-4">
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <DashKpi label="OTIF (Group)" value="91.4%" delta="4.2pts" up />
        <DashKpi label="OEE (Group)" value="76.8%" delta="2.1pts" up />
        <DashKpi label="RFT (Group)" value="94.2%" delta="1.3pts" up={false} />
        <DashKpi label="COPQ (MTD)" value="£184k" delta="0.6pts" up={false} />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
        <AecStatCard label="Total headcount" value="70" sub="3 sites" />
        <AecStatCard label="Active work orders" value="19" sub="Group-wide" accent="teal" />
        <AecStatCard label="AR outstanding" value="£486k" sub="18 open invoices" accent="brand" />
        <AecStatCard label="AI cost avoidance" value="£412k" sub="Annualised benefit" accent="purple" />
      </div>

      <div className="grid gap-3.5 lg:grid-cols-2">
        <AecPanel title="OTIF trend by site" actions={<AecTag>Rolling 8 weeks</AecTag>}>
          <BarChart values={[70, 74, 68, 79, 81, 85, 88, 91]} labels={["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]} color="var(--page-teal)" />
        </AecPanel>
        <AecPanel title="COPQ by site (MTD, £k)" actions={<AecTag>Sep 2026</AecTag>}>
          <BarChart values={[108, 61, 15]} labels={["Birmingham £108k", "Katowice £61k", "Coventry £15k"]} color="var(--page-blue)" />
        </AecPanel>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-3">
        <InsightCard title="CNC Cell 3 — Birmingham" body="Spindle bearing wear detected 11 days before predicted failure." trad="Reactive repair: 14hr downtime, £22k" ai="Scheduled PM: 1.5hr, £2.4k · £19,600 saving" />
        <InsightCard title="Weld Cell RFT — Katowice" body="Porosity defects traced to shielding gas calibration drift, not operator technique." trad="Retraining: 3 weeks, no root-cause fix" ai="Gas-flow recalibration: same shift · £8,200 scrap avoided" />
        <InsightCard title="FX Exposure — EUR/GBP" body="Katowice steel contracts in EUR unhedged against GBP price book during rate moves." trad="Quarterly FX review: exposure spotted after the fact" ai="Daily FX Risk Monitor flags & suggests forward cover" />
      </div>
    </div>
  );
}

// ─── MULTI-SITE VIEW ───────────────────────────────────────────────────────────
function MultiSiteView() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      {/* Site comparison strip */}
      <div className="grid gap-3 lg:grid-cols-3">
        {SITE_COMPARISON.map((s) => {
          const Icon = SITE_ICONS[s.id as MfgSiteId];
          const tone = SITE_TONES[s.id as MfgSiteId];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => navigate("/site-ops")}
              className="rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-4 text-left hover:border-[color:var(--page-accent)] transition-colors"
            >
              <div className="mb-3 flex items-center gap-2">
                <MfgGlyph icon={Icon} tone={tone} />
                <div>
                  <p className="text-[13px] font-bold">{s.site}</p>
                  <div className="flex items-center gap-1">
                    <MfgCountryChip id={s.id} />
                    <StatusBadge status={s.alerts > 0 ? (s.alerts > 1 ? "At Risk" : "Watch") : "Good"} />
                  </div>
                </div>
                <ChevronRight className="ml-auto h-4 w-4 text-[color:var(--page-dim)]" />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[["OTIF", `${s.otif}%`], ["OEE", `${s.oee}%`], ["RFT", `${s.rft}%`]].map(([l, v]) => (
                  <div key={l} className="rounded-md bg-[color:var(--page-card-2)] px-2 py-1.5 text-center">
                    <p className="text-[9px] font-bold uppercase text-[color:var(--page-dim)]">{l}</p>
                    <p className="text-[14px] font-bold">{v}</p>
                  </div>
                ))}
                {[["COPQ", `£${s.copq}k`], ["Staff", String(s.headcount)], ["Open WOs", String(s.openWOs)]].map(([l, v]) => (
                  <div key={l} className="rounded-md bg-[color:var(--page-card-2)] px-2 py-1.5 text-center">
                    <p className="text-[9px] font-bold uppercase text-[color:var(--page-dim)]">{l}</p>
                    <p className="text-[14px] font-bold">{v}</p>
                  </div>
                ))}
              </div>
              {s.alerts > 0 && (
                <div className="mt-2 flex items-center gap-1 text-[10.5px] text-[color:var(--page-amber)]">
                  <AlertTriangle className="h-3 w-3" />
                  {s.alerts} agent alert{s.alerts > 1 ? "s" : ""}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* OTIF comparison */}
      <AecPanel title="OTIF trend — all sites" actions={<AecTag>Rolling 7 weeks</AecTag>}>
        <div className="grid gap-4 lg:grid-cols-3">
          {SITE_COMPARISON.map((s) => (
            <div key={s.id}>
              <p className="mb-1.5 text-[10.5px] font-semibold text-[color:var(--page-muted)]">{s.site}</p>
              <div className="flex h-[60px] items-end gap-0.5">
                {s.trend.map((v, i) => (
                  <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${(v / 100) * 100}%`, background: s.id === "birmingham" ? "var(--page-blue)" : s.id === "katowice" ? "var(--page-amber)" : "var(--page-purple)", opacity: 0.75 }} />
                ))}
              </div>
              <p className="mt-1 text-right font-mono text-[11.5px] font-bold">{s.otif}%</p>
            </div>
          ))}
        </div>
      </AecPanel>

      <div className="grid gap-3.5 lg:grid-cols-2">
        {/* Shared resource utilisation */}
        <AecPanel title="Shared resource utilisation" actions={<AecTag variant="purple">Cross-site</AecTag>}>
          <SharedResourceRow name="Marcus Klein" role="Senior Maintenance Tech" sites={[{ label: "Birmingham", pct: 60, color: "bg-[color:var(--page-blue)]" }, { label: "Katowice", pct: 40, color: "bg-[color:var(--page-amber)]" }]} alert="Conflict flagged: 23 Sep" />
          <SharedResourceRow name="Priya Chandran" role="Supply Chain Analyst" sites={[{ label: "Birmingham", pct: 55, color: "bg-[color:var(--page-blue)]" }, { label: "Coventry", pct: 45, color: "bg-[color:var(--page-purple)]" }]} />
        </AecPanel>

        {/* Cross-site agent alerts */}
        <AecPanel title="Cross-site agent alerts" icon={<AlertTriangle className="h-3.5 w-3.5 text-[color:var(--page-danger)]" />} actions={<AecTag variant="amber">4 active</AecTag>}>
          {AGENT_DECISIONS.filter((d) => d.status === "Pending").map((d) => (
            <div key={d.id} className="mb-2 flex items-start gap-2 border-b border-[color:var(--page-border)] pb-2 last:mb-0 last:border-0 last:pb-0">
              <AecTag variant={d.urgency === "high" ? "danger" : "amber"} className="shrink-0 mt-0.5">{d.site}</AecTag>
              <div>
                <p className="text-[11.5px] font-semibold">{d.agent}</p>
                <p className="text-[10.5px] leading-relaxed text-[color:var(--page-muted)]">{d.recommendation.slice(0, 90)}…</p>
              </div>
            </div>
          ))}
        </AecPanel>
      </div>
    </div>
  );
}

// ─── Shared helpers ────────────────────────────────────────────────────────────
function DashKpi({ label, value, delta, up }: { label: string; value: string; delta: string; up: boolean }) {
  return (
    <div className="rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card)] p-3.5">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">{label}</span>
        <span className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-bold", up ? "bg-[color:var(--page-success)]/10 text-[color:var(--page-success)]" : "bg-[color:var(--page-danger)]/10 text-[color:var(--page-danger)]")}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta}
        </span>
      </div>
      <p className="font-mono text-[22px] font-bold">{value}</p>
    </div>
  );
}

function BarChart({ values, labels, color }: { values: number[]; labels: string[]; color: string }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-[120px] items-end gap-1.5">
      {values.map((v, i) => (
        <div key={labels[i]} className="flex flex-1 flex-col items-center justify-end gap-1">
          <div className="w-full rounded-t" style={{ height: `${Math.max(8, (v / max) * 100)}%`, background: color }} />
          <span className="text-center text-[8.5px] leading-tight text-[color:var(--page-muted)]">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

function InsightCard({ title, body, trad, ai }: { title: string; body: string; trad: string; ai: string }) {
  return (
    <div className="rounded-[9px] border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-3.5">
      <p className="mb-1.5 text-[12px] font-bold">{title}</p>
      <p className="mb-2.5 text-[11px] leading-relaxed text-[color:var(--page-muted)]">{body}</p>
      <div className="space-y-1.5">
        <div className="rounded-md border border-[color:var(--page-amber)]/20 bg-[color:var(--page-amber)]/5 p-2">
          <p className="mb-0.5 text-[9px] font-bold uppercase text-[color:var(--page-amber)]">Traditional</p>
          <p className="text-[10.5px] text-[color:var(--page-muted)]">{trad}</p>
        </div>
        <div className="rounded-md border border-[color:var(--page-teal)]/20 bg-[color:var(--page-teal)]/5 p-2">
          <p className="mb-0.5 text-[9px] font-bold uppercase text-[color:var(--page-teal)]">AI-enhanced</p>
          <p className="text-[10.5px] text-[color:var(--page-muted)]">{ai}</p>
        </div>
      </div>
    </div>
  );
}

function SharedResourceRow({ name, role, sites, alert }: { name: string; role: string; sites: { label: string; pct: number; color: string }[]; alert?: string }) {
  return (
    <div className="mb-3 last:mb-0 rounded-lg border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-[12px] font-bold">{name}</p>
          <p className="text-[10.5px] text-[color:var(--page-muted)]">{role}</p>
        </div>
        {alert && <AecTag variant="amber">{alert}</AecTag>}
      </div>
      {sites.map((s) => (
        <div key={s.label} className="mb-1.5 last:mb-0">
          <div className="mb-0.5 flex justify-between text-[10px] text-[color:var(--page-muted)]">
            <span>{s.label}</span>
            <span className="font-mono font-bold">{s.pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[color:var(--page-border)]">
            <div className={cn("h-1.5 rounded-full", s.color)} style={{ width: `${s.pct}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
