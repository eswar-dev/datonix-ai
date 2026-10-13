import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle, ArrowRight, Banknote, CheckCircle, ClipboardList, ClipboardPlus,
  Download, Landmark, MessageSquarePlus, Package, Plus,
  Route, TrendingDown, TrendingUp, Users, X,
} from "lucide-react";
import { toast } from "sonner";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecPanel, AecProgress, AecStatCard, AecTag } from "@/domains/aec/components/primitives";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { MfgDisclaimer } from "@/domains/manufacturing/components/MfgUi";
import { useManufacturingSite } from "@/domains/manufacturing/context/ManufacturingSiteContext";
import {
  ENQUIRY_TYPES,
  GL_ENTRIES,
  INQUIRIES,
  INVOICES_AR,
  PART_FAMILIES,
  PAYABLES_AP,
  PAYROLL_SUMMARY,
  PRODUCTION_LINES,
  ROUTING_STEPS_BY_SITE,
  SHIFT_SCHEDULE,
  TIMESHEET_ENTRIES,
  WORK_ORDERS,
  type MfgSiteId,
  type RoutingStep,
} from "@/domains/manufacturing/data";
import { siteTagVariant } from "@/domains/manufacturing/data";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/common/components/ui/table";
import { cn } from "@/common/lib/utils";

// ─── CUSTOMER INQUIRIES (Phase 3: New Enquiry) ────────────────────────────────
export function CustomerInquiries() {
  const [inquiries, setInquiries] = useState(INQUIRIES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer: "", contact: "", site: "Birmingham", type: "RFQ" as typeof ENQUIRY_TYPES[number], ref: "", notes: "" });

  const submit = () => {
    if (!form.customer || !form.notes) { toast.error("Customer and description are required"); return; }
    setInquiries((prev) => [{ customer: form.customer, subject: `${form.type} — ${form.notes.slice(0, 40)}`, site: form.site, raised: "Just now", status: "New" }, ...prev]);
    setShowForm(false);
    setForm({ customer: "", contact: "", site: "Birmingham", type: "RFQ", ref: "", notes: "" });
    toast.success("Enquiry raised and assigned to site team");
  };

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Customer Inquiries"
        subtitle={`${inquiries.filter((i) => i.status === "Open" || i.status === "New").length} open enquiries across the group.`}
        actions={
          <AecButton size="sm" onClick={() => setShowForm(!showForm)}>
            <MessageSquarePlus className="h-3.5 w-3.5" />
            New Enquiry
          </AecButton>
        }
      />

      <div className="grid gap-2.5 sm:grid-cols-4">
        <AecStatCard label="Open" value={String(inquiries.filter((i) => i.status === "Open").length)} />
        <AecStatCard label="New" value={String(inquiries.filter((i) => i.status === "New").length)} accent="brand" />
        <AecStatCard label="In Review" value={String(inquiries.filter((i) => i.status === "In Review").length)} accent="amber" />
        <AecStatCard label="Avg response" value="1.8d" accent="teal" />
      </div>

      {showForm && (
        <AecPanel title="New Customer Enquiry" icon={<MessageSquarePlus className="h-3.5 w-3.5 text-[color:var(--page-accent)]" />}>
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Customer name">
              <Input placeholder="e.g. Ashford Rail Components" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
            </Field>
            <Field label="Contact person">
              <Input placeholder="Name / email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </Field>
            <Field label="Site">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}>
                <option>Birmingham</option><option>Katowice</option><option>Coventry</option>
              </select>
            </Field>
            <Field label="Enquiry type">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as typeof ENQUIRY_TYPES[number] })}>
                {ENQUIRY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Reference (PO / WO)">
              <Input placeholder="Optional" value={form.ref} onChange={(e) => setForm({ ...form, ref: e.target.value })} />
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Description">
              <Textarea rows={3} placeholder="Describe the enquiry…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="resize-none text-[12.5px]" />
            </Field>
          </div>
          <div className="mt-3 flex justify-end gap-2 border-t border-[color:var(--page-border)] pt-3">
            <AecButton variant="outline" onClick={() => setShowForm(false)}>Cancel</AecButton>
            <AecButton onClick={submit}>Submit enquiry</AecButton>
          </div>
        </AecPanel>
      )}

      <AecPanel title="All enquiries">
        <DataTable
          headers={["Customer", "Subject", "Site", "Raised", "Status"]}
          rows={inquiries.map((r) => [r.customer, r.subject, r.site, r.raised, r.status])}
        />
      </AecPanel>
    </div>
  );
}

// ─── WORK ORDER LIFECYCLE ──────────────────────────────────────────────────────
export function WorkOrderLifecycle() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Work Order Lifecycle"
        subtitle="19 active work orders across the group, from release to dispatch."
        actions={
          <AecButton size="sm" onClick={() => navigate("/work-orders/create")}>
            <ClipboardPlus className="h-3.5 w-3.5" />
            Create work order
          </AecButton>
        }
      />
      <div className="grid gap-2.5 sm:grid-cols-4">
        <AecStatCard label="Active WOs" value="19" sub="Group-wide" />
        <AecStatCard label="On Track" value="14" accent="teal" />
        <AecStatCard label="At Risk" value="3" accent="amber" />
        <AecStatCard label="Blocked" value="2" accent="brand" />
      </div>
      <AecPanel title="All work orders" icon={<ClipboardList className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />}>
        <DataTable
          headers={["WO #", "Customer", "Site", "Stage", "Due", "Status"]}
          rows={WORK_ORDERS.map((r) => [r.id, r.customer, r.site, r.stage, r.due, r.status])}
          monoFirst
        />
      </AecPanel>
    </div>
  );
}

// ─── CREATE WORK ORDER ────────────────────────────────────────────────────────
export function CreateWorkOrder() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer: "", site: "Birmingham", due: "", partFamily: PART_FAMILIES[0], qty: "", notes: "" });

  return (
    <div className="space-y-4">
      <AecPageHeader title="Create Work Order" subtitle="Release a new work order to a site's production schedule." />
      <AecPanel icon={<ClipboardPlus className="h-3.5 w-3.5 text-[color:var(--page-accent)]" />}>
        <Section title="Order details">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Customer"><Input placeholder="e.g. Ashford Rail Components" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} /></Field>
            <Field label="Site">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}>
                <option>Birmingham (UK)</option><option>Katowice (Poland)</option><option>Coventry (UK)</option>
              </select>
            </Field>
            <Field label="Due date"><Input type="date" value={form.due} onChange={(e) => setForm({ ...form, due: e.target.value })} /></Field>
          </div>
        </Section>
        <Section title="Production details">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Part family">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={form.partFamily} onChange={(e) => setForm({ ...form, partFamily: e.target.value })}>
                {PART_FAMILIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Quantity"><Input placeholder="e.g. 24 units" value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></Field>
            <Field label="WO number"><Input placeholder="Auto-generated" disabled /></Field>
          </div>
          <div className="mt-3">
            <Field label="Notes / special requirements">
              <Textarea rows={2} placeholder="e.g. Customer cert pack required, surface finish RA 1.6" className="resize-none text-[12.5px]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
          </div>
        </Section>
        <div className="flex items-center justify-between border-t border-[color:var(--page-border)] pt-3">
          <AecButton variant="outline" onClick={() => navigate("/work-orders/routing")}>
            <Route className="h-3.5 w-3.5" />
            Generate routing
          </AecButton>
          <div className="flex gap-2">
            <AecButton variant="outline" onClick={() => navigate("/work-orders")}>Cancel</AecButton>
            <AecButton onClick={() => { toast.success("Work order WO-2310 created"); navigate("/work-orders"); }}>Create work order</AecButton>
          </div>
        </div>
      </AecPanel>
    </div>
  );
}

// ─── ROUTING BUILDER (Phase 4) ────────────────────────────────────────────────
export function RoutingBuilder() {
  const { activeSiteId, activeSite } = useManufacturingSite();
  const siteId = activeSiteId as MfgSiteId;
  const [steps, setSteps] = useState<RoutingStep[]>(() => ROUTING_STEPS_BY_SITE[siteId].map((s) => ({ ...s })));
  const [selectedLine, setSelectedLine] = useState(PRODUCTION_LINES[siteId][0]);
  const [partFamily, setPartFamily] = useState(PART_FAMILIES[0]);
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [approvalSent, setApprovalSent] = useState(false);
  const lines = PRODUCTION_LINES[siteId];

  const totalStd = steps.reduce((s, r) => s + r.std, 0);
  const bottleneck = [...steps].sort((a, b) => b.std - a.std)[0];

  const moveUp = (i: number) => {
    if (i === 0) return;
    setSteps((prev) => { const s = [...prev]; [s[i - 1], s[i]] = [s[i], s[i - 1]]; return s.map((r, idx) => ({ ...r, step: idx + 1 })); });
  };
  const moveDown = (i: number) => {
    if (i === steps.length - 1) return;
    setSteps((prev) => { const s = [...prev]; [s[i], s[i + 1]] = [s[i + 1], s[i]]; return s.map((r, idx) => ({ ...r, step: idx + 1 })); });
  };
  const removeStep = (i: number) => setSteps((prev) => prev.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, step: idx + 1 })));
  const addStep = () => setSteps((prev) => [...prev, { step: prev.length + 1, op: "New operation", cell: lines[0], std: 1.0 }]);
  const updateStep = (i: number, patch: Partial<RoutingStep>) => setSteps((prev) => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));

  return (
    <div className="space-y-4">
      <AecPageHeader
        title={`Routing Builder — ${activeSite.name}`}
        subtitle="AI-generated operation sequence based on your site layout, part family and production flow. Review and adjust before release."
        actions={
          <AecButton size="sm" onClick={() => { toast.success("Routing R-0044 saved — awaiting site manager approval"); setApprovalSent(true); }}>
            Save routing
          </AecButton>
        }
      />

      <MfgDisclaimer>AI-suggested routing sequence pre-populated from site production data, inventory and part family. Review each step before release.</MfgDisclaimer>

      {approvalSent && (
        <div className="flex items-center gap-2 rounded-[8px] border border-[color:var(--page-success)]/30 bg-[color:var(--page-success)]/5 px-3 py-2.5 text-[11.5px]">
          <CheckCircle className="h-4 w-4 text-[color:var(--page-success)]" />
          <span>Routing R-0044 saved — approval request sent to Site Manager.</span>
        </div>
      )}

      {/* Context selectors */}
      <AecPanel title="Routing context" icon={<Route className="h-3.5 w-3.5 text-[color:var(--page-accent)]" />}>
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="Production site">
            <div className="flex h-9 items-center rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-2.5 text-sm font-semibold text-[color:var(--page-text)]">
              {activeSite.full}
            </div>
          </Field>
          <Field label="Part family">
            <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={partFamily} onChange={(e) => setPartFamily(e.target.value)}>
              {PART_FAMILIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Primary line">
            <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={selectedLine} onChange={(e) => setSelectedLine(e.target.value)}>
              {lines.map((l) => <option key={l}>{l}</option>)}
            </select>
          </Field>
        </div>
      </AecPanel>

      {/* Routing sequence */}
      <AecPanel
        title="AI-generated routing sequence"
        icon={<ClipboardList className="h-3.5 w-3.5 text-[color:var(--page-teal)]" />}
        actions={
          <div className="flex items-center gap-2">
            <AecTag variant="teal">AI pre-populated</AecTag>
            <AecButton size="xs" onClick={addStep}>
              <Plus className="h-3 w-3" />
              Add step
            </AecButton>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-[11.5px]">
            <thead>
              <tr className="border-b border-[color:var(--page-border)] text-[9.5px] uppercase tracking-wide text-[color:var(--page-muted)]">
                <th className="pb-2 pl-1 text-left w-8"></th>
                <th className="pb-2 text-left w-8">#</th>
                <th className="pb-2 text-left">Operation</th>
                <th className="pb-2 text-left">Cell / Machine</th>
                <th className="pb-2 text-right w-20">Std hrs</th>
                <th className="pb-2 text-left pl-3">Notes</th>
                <th className="pb-2 text-right w-20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, i) => (
                <tr key={s.step} className="border-b border-[color:var(--page-border)] last:border-0">
                  <td className="py-2 pl-1">
                    <div className="flex flex-col gap-0.5">
                      <button type="button" onClick={() => moveUp(i)} className="text-[color:var(--page-dim)] hover:text-[color:var(--page-text)]" title="Move up">▲</button>
                      <button type="button" onClick={() => moveDown(i)} className="text-[color:var(--page-dim)] hover:text-[color:var(--page-text)]" title="Move down">▼</button>
                    </div>
                  </td>
                  <td className="py-2 font-mono text-[color:var(--page-accent)] font-bold">{s.step}</td>
                  <td className="py-2 pr-2">
                    {editIdx === i
                      ? <Input value={s.op} onChange={(e) => updateStep(i, { op: e.target.value })} className="h-7 text-[11.5px]" />
                      : <span className="font-semibold">{s.op}</span>}
                  </td>
                  <td className="py-2 pr-2">
                    {editIdx === i
                      ? <select className="h-7 rounded border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-1.5 text-[11.5px]" value={s.cell} onChange={(e) => updateStep(i, { cell: e.target.value })}>
                          {lines.map((l) => <option key={l}>{l}</option>)}
                        </select>
                      : <AecTag>{s.cell}</AecTag>}
                  </td>
                  <td className="py-2 pr-2 text-right font-mono">
                    {editIdx === i
                      ? <Input type="number" value={s.std} onChange={(e) => updateStep(i, { std: parseFloat(e.target.value) || 0 })} className="h-7 w-16 text-right text-[11.5px]" step="0.25" />
                      : `${s.std}h`}
                  </td>
                  <td className="py-2 pl-3 text-[color:var(--page-muted)]">
                    {editIdx === i
                      ? <Input value={s.notes ?? ""} onChange={(e) => updateStep(i, { notes: e.target.value })} className="h-7 text-[11.5px]" placeholder="Notes…" />
                      : s.notes ?? "—"}
                  </td>
                  <td className="py-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <AecButton size="xs" variant="outline" onClick={() => setEditIdx(editIdx === i ? null : i)}>
                        {editIdx === i ? "Done" : "Edit"}
                      </AecButton>
                      <button type="button" onClick={() => removeStep(i)} className="rounded p-0.5 text-[color:var(--page-dim)] hover:text-[color:var(--page-danger)]">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-3 grid gap-2 rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-3 sm:grid-cols-3 text-[11.5px]">
          <div><p className="text-[9.5px] font-bold uppercase text-[color:var(--page-muted)]">Total std hours</p><p className="font-mono font-bold text-[16px]">{totalStd.toFixed(2)}h</p></div>
          <div><p className="text-[9.5px] font-bold uppercase text-[color:var(--page-muted)]">Bottleneck step</p><p className="font-semibold">{bottleneck?.op} ({bottleneck?.std}h)</p></div>
          <div><p className="text-[9.5px] font-bold uppercase text-[color:var(--page-muted)]">Steps</p><p className="font-mono font-bold text-[16px]">{steps.length}</p></div>
        </div>
      </AecPanel>

      {/* Approval panel */}
      <AecPanel title="Routing sign-off" icon={<CheckCircle className="h-3.5 w-3.5 text-[color:var(--page-success)]" />}>
        <ApprovalFlow steps={[
          { label: "Routing Builder (AI)", status: "complete" },
          { label: "Site Manager review", status: approvalSent ? "active" : "pending" },
          { label: "Group Ops Director", status: "pending" },
          { label: "Released to production", status: "pending" },
        ]} />
      </AecPanel>
    </div>
  );
}

// ─── SHIFT & TIMESHEETS (Phase 6) ─────────────────────────────────────────────
export function ShiftTimesheets() {
  const { activeSiteId, activeSite } = useManufacturingSite();
  const siteId = activeSiteId as MfgSiteId;
  const [timesheets, setTimesheets] = useState(TIMESHEET_ENTRIES);
  const [activeTab, setActiveTab] = useState<"submit" | "approvals" | "schedule">("approvals");
  const [myHours, setMyHours] = useState<Record<string, string>>({ Mon: "8", Tue: "8", Wed: "8", Thu: "8", Fri: "8", Sat: "", Sun: "" });
  const [submitted, setSubmitted] = useState(false);

  const pending = timesheets.filter((t) => t.status === "Pending");
  const approve = (id: string) => { setTimesheets((prev) => prev.map((t) => t.id === id ? { ...t, status: "Approved" } : t)); toast.success("Timesheet approved"); };
  const reject = (id: string) => { setTimesheets((prev) => prev.map((t) => t.id === id ? { ...t, status: "Rejected" } : t)); toast.message("Timesheet rejected"); };
  const totalHrs = Object.values(myHours).reduce((s, v) => s + (parseFloat(v) || 0), 0);
  const otHrs = Math.max(0, totalHrs - 40);

  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Shift & Timesheets"
        subtitle={`${pending.length} timesheets pending approval · ${activeSite.name}`}
      />
      <div className="grid gap-2.5 sm:grid-cols-4">
        <AecStatCard label="Pending approval" value={String(pending.length)} accent="amber" />
        <AecStatCard label="Approved this week" value={String(timesheets.filter((t) => t.status === "Approved").length)} accent="teal" />
        <AecStatCard label="Overtime flagged" value={timesheets.filter((t) => parseFloat(t.overtime) > 0 && t.status === "Pending").length.toString()} accent="brand" />
        <AecStatCard label="Rejected" value={String(timesheets.filter((t) => t.status === "Rejected").length)} />
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-[color:var(--page-border)]">
        {([["submit", "Submit Timesheet"], ["approvals", "Approvals"], ["schedule", "Shift Schedule"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)}
            className={cn("border-b-2 px-4 py-2 text-[11.5px] font-semibold transition-colors",
              activeTab === id ? "border-[color:var(--page-accent)] text-[color:var(--page-text)]" : "border-transparent text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]")}>
            {label}
          </button>
        ))}
      </div>

      {/* Submit timesheet */}
      {activeTab === "submit" && (
        <AecPanel title="Submit timesheet — W/C 08 Sep 2026" icon={<ClipboardList className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />}>
          {submitted
            ? <div className="flex items-center gap-2 py-6 text-[color:var(--page-success)]"><CheckCircle className="h-5 w-5" /><span className="text-[12.5px] font-semibold">Timesheet submitted — awaiting manager approval.</span></div>
            : <>
              <div className="grid grid-cols-7 gap-1.5 mb-3">
                {DAYS.map((d) => (
                  <div key={d}>
                    <p className="mb-1 text-center text-[10px] font-bold uppercase text-[color:var(--page-muted)]">{d}</p>
                    <Input type="number" value={myHours[d]} onChange={(e) => setMyHours({ ...myHours, [d]: e.target.value })} className="text-center text-[12px]" min="0" max="12" step="0.5" placeholder="—" />
                  </div>
                ))}
              </div>
              <div className="mb-3 flex items-center gap-4 rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-3 py-2 text-[11.5px]">
                <span>Total: <strong>{totalHrs.toFixed(1)}h</strong></span>
                {otHrs > 0 && <span className="text-[color:var(--page-amber)]">Overtime: <strong>{otHrs.toFixed(1)}h</strong></span>}
                <div className="ml-auto flex gap-1.5">
                  {["Regular", "Overtime", "Training", "Leave"].map((t) => <AecTag key={t} className="cursor-pointer">{t}</AecTag>)}
                </div>
              </div>
              <Field label="Notes">
                <Textarea rows={2} placeholder="Any notes for your manager…" className="resize-none text-[12.5px]" />
              </Field>
              <div className="mt-3 flex justify-end gap-2 border-t border-[color:var(--page-border)] pt-3">
                <AecButton onClick={() => { setSubmitted(true); toast.success("Timesheet submitted for approval"); }}>Submit for approval</AecButton>
              </div>
            </>}
        </AecPanel>
      )}

      {/* Approvals */}
      {activeTab === "approvals" && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <AecButton size="sm" onClick={() => { pending.forEach((t) => approve(t.id)); }}>
              <CheckCircle className="h-3.5 w-3.5" />
              Approve all pending
            </AecButton>
          </div>
          {timesheets.map((t) => (
            <div key={t.id} className={cn("flex items-center gap-3 rounded-[9px] border bg-[color:var(--page-card)] p-3", t.status === "Pending" ? "border-[color:var(--page-amber)]/30" : "border-[color:var(--page-border)]")}>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[12.5px] font-bold">{t.name}</p>
                  <AecTag variant={siteTagVariant(t.site)}>{t.site}</AecTag>
                  {parseFloat(t.overtime) > 0 && <AecTag variant="amber">{t.overtime}h OT</AecTag>}
                </div>
                <p className="text-[10.5px] text-[color:var(--page-muted)]">{t.week} · {t.hours}h total · {t.shift} shift</p>
              </div>
              <StatusBadge status={t.status} />
              {t.status === "Pending" && (
                <div className="flex gap-1">
                  <AecButton size="xs" onClick={() => approve(t.id)}>Approve</AecButton>
                  <AecButton size="xs" variant="outline" onClick={() => reject(t.id)}>Reject</AecButton>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Shift schedule */}
      {activeTab === "schedule" && (
        <AecPanel title={`Shift schedule — ${activeSite.name}`} icon={<Users className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />}>
          <div className="space-y-2">
            {(SHIFT_SCHEDULE[siteId] ?? []).map((s) => (
              <div key={s.shift} className="flex items-center justify-between rounded-lg border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-3 py-2.5">
                <div>
                  <p className="text-[12px] font-bold">{s.shift}</p>
                  <p className="text-[10.5px] text-[color:var(--page-muted)]">{s.time} · Lead: {s.lead}</p>
                </div>
                <div className="text-right">
                  <p className="text-[16px] font-bold font-mono">{s.headcount}</p>
                  <p className="text-[9.5px] text-[color:var(--page-muted)]">staff</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-md border border-[color:var(--page-amber)]/25 bg-[color:var(--page-amber)]/5 px-3 py-2.5 text-[11px]">
            <span className="font-bold text-[color:var(--page-amber)]">AI insight: </span>
            CNC Cell 3 operator overtime running at 14% — AI recommends adjusting shift pattern or recruiting a second setter for days shift.
          </div>
        </AecPanel>
      )}
    </div>
  );
}

// ─── BILLING & ACCOUNTING (Phase 7) ──────────────────────────────────────────
export function BillingAccounting() {
  const [activeTab, setActiveTab] = useState<"ar" | "ap" | "gl" | "payroll">("ar");
  const [invoices, setInvoices] = useState(INVOICES_AR);
  const [payables, setPayables] = useState(PAYABLES_AP);

  const arTotal = invoices.reduce((s, i) => s + i.amount, 0);
  const overdue = invoices.filter((i) => i.status === "Overdue");
  const apTotal = payables.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Billing & Accounting"
        subtitle="AR, AP, GL and payroll across Birmingham, Katowice and Coventry."
        actions={
          <AecButton variant="outline" size="sm" onClick={() => toast.success("Export queued")}>
            <Download className="h-3.5 w-3.5" />
            Export
          </AecButton>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-[color:var(--page-border)]">
        {([["ar", "Accounts Receivable"], ["ap", "Accounts Payable"], ["gl", "GL & Month-end"], ["payroll", "Payroll"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setActiveTab(id)}
            className={cn("border-b-2 px-4 py-2 text-[11.5px] font-semibold transition-colors",
              activeTab === id ? "border-[color:var(--page-accent)] text-[color:var(--page-text)]" : "border-transparent text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]")}>
            {label}
          </button>
        ))}
      </div>

      {/* AR */}
      {activeTab === "ar" && (
        <div className="space-y-4">
          <div className="grid gap-2.5 sm:grid-cols-4">
            <AecStatCard label="AR outstanding" value={`£${(arTotal / 1000).toFixed(0)}k`} sub={`${invoices.length} open invoices`} accent="brand" />
            <AecStatCard label="Overdue" value={`£${overdue.reduce((s, i) => s + i.amount, 0) / 1000}k`} sub={`${overdue.length} invoices`} accent="amber" />
            <AecStatCard label="Avg debtor days" value="38d" sub="Target <35d" />
            <AecStatCard label="Collected MTD" value="£312k" sub="Sep 2026" accent="teal" />
          </div>
          <AecPanel title="Invoice register" icon={<Banknote className="h-3.5 w-3.5 text-[color:var(--page-accent)]" />}
            actions={<AecButton size="xs" onClick={() => toast.success("Create invoice — form opens after ERP connection")}>+ Raise invoice</AecButton>}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead><TableHead>WO</TableHead><TableHead>Customer</TableHead>
                  <TableHead>Site</TableHead><TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-bold">{inv.id}</TableCell>
                    <TableCell className="font-mono text-[color:var(--page-muted)]">{inv.wo}</TableCell>
                    <TableCell className="font-semibold">{inv.customer}</TableCell>
                    <TableCell><AecTag variant={siteTagVariant(inv.site)}>{inv.site}</AecTag></TableCell>
                    <TableCell className="text-right font-mono font-bold">£{inv.amount.toLocaleString()}</TableCell>
                    <TableCell>{inv.due}</TableCell>
                    <TableCell><StatusBadge status={inv.status} /></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <AecButton size="xs" variant="outline" onClick={() => toast.success(`Chase sent for ${inv.id}`)}>Chase</AecButton>
                        {inv.status === "Overdue" && <AecButton size="xs" onClick={() => { setInvoices((p) => p.map((i) => i.id === inv.id ? { ...i, status: "Current" } : i)); toast.success("Escalated"); }}>Escalate</AecButton>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AecPanel>
        </div>
      )}

      {/* AP */}
      {activeTab === "ap" && (
        <div className="space-y-4">
          <div className="grid gap-2.5 sm:grid-cols-4">
            <AecStatCard label="AP due (30d)" value={`£${(apTotal / 1000).toFixed(0)}k`} sub="Steel, energy, services" accent="amber" />
            <AecStatCard label="Overdue" value="£38.7k" sub="1 supplier" accent="brand" />
            <AecStatCard label="Paid MTD" value="£187k" sub="Sep 2026" accent="teal" />
            <AecStatCard label="Suppliers" value="4" sub="Active" />
          </div>
          <AecPanel title="Payables register" icon={<Package className="h-3.5 w-3.5 text-[color:var(--page-amber)]" />}
            actions={<AecButton size="xs" onClick={() => toast.success("Add payable form")}>+ Add payable</AecButton>}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead><TableHead>Supplier</TableHead><TableHead>Category</TableHead>
                  <TableHead>Site</TableHead><TableHead className="text-right">Amount</TableHead>
                  <TableHead>Due</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payables.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono">{p.id}</TableCell>
                    <TableCell className="font-semibold">{p.supplier}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell><AecTag variant={siteTagVariant(p.site)}>{p.site}</AecTag></TableCell>
                    <TableCell className="text-right font-mono font-bold">£{p.amount.toLocaleString()}</TableCell>
                    <TableCell>{p.due}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell>
                      <AecButton size="xs" onClick={() => { setPayables((prev) => prev.map((x) => x.id === p.id ? { ...x, status: "Paid" } : x)); toast.success(`Payment approved for ${p.id}`); }}>Approve payment</AecButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AecPanel>
        </div>
      )}

      {/* GL */}
      {activeTab === "gl" && (
        <div className="space-y-4">
          <AecPanel title="Journal entries — Sep 2026" icon={<Landmark className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ref</TableHead><TableHead>Date</TableHead><TableHead>Entity</TableHead>
                  <TableHead>Debit</TableHead><TableHead>Credit</TableHead>
                  <TableHead className="text-right">Amount</TableHead><TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {GL_ENTRIES.map((g) => (
                  <TableRow key={g.ref}>
                    <TableCell className="font-mono">{g.ref}</TableCell>
                    <TableCell>{g.date}</TableCell>
                    <TableCell><AecTag variant={siteTagVariant(g.entity)}>{g.entity}</AecTag></TableCell>
                    <TableCell>{g.debit}</TableCell>
                    <TableCell>{g.credit}</TableCell>
                    <TableCell className="text-right font-mono font-bold">£{g.amount.toLocaleString()}</TableCell>
                    <TableCell><StatusBadge status={g.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AecPanel>
          <AecPanel title="Month-end checklist">
            {[["AR reconciled", true], ["AP reconciled", true], ["Payroll posted", true], ["Intercompany eliminations", false], ["FX revaluation", false]].map(([label, done]) => (
              <div key={String(label)} className="flex items-center justify-between border-b border-[color:var(--page-border)] py-2 text-[11.5px] last:border-0">
                <span>{String(label)}</span>
                <StatusBadge status={done ? "Compliant" : "Pending"} />
              </div>
            ))}
            <div className="mt-3 flex justify-end gap-2">
              <AecButton size="sm" onClick={() => toast.success("GL journal posted")}>Post GL journal</AecButton>
              <AecButton size="sm" variant="outline" onClick={() => toast.message("Period close requires all checks to pass")}>Close period</AecButton>
            </div>
          </AecPanel>
        </div>
      )}

      {/* Payroll */}
      {activeTab === "payroll" && (
        <div className="space-y-4">
          <div className="grid gap-2.5 sm:grid-cols-3">
            {PAYROLL_SUMMARY.map((s) => (
              <AecStatCard key={s.site} label={`${s.site} payroll`} value={`${s.currency === "GBP" ? "£" : "€"}${(s.grossPay / 1000).toFixed(0)}k`} sub={`${s.headcount} staff · ${s.period}`} accent={siteTagVariant(s.site) === "blue" ? "brand" : siteTagVariant(s.site) === "amber" ? "teal" : "purple"} />
            ))}
          </div>
          <AecPanel title="Payroll processing — Sep 2026" icon={<Users className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Site</TableHead><TableHead>Headcount</TableHead><TableHead>Gross pay</TableHead><TableHead>Currency</TableHead><TableHead>Period</TableHead><TableHead>Status</TableHead><TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PAYROLL_SUMMARY.map((p) => (
                  <TableRow key={p.site}>
                    <TableCell className="font-semibold">{p.site}</TableCell>
                    <TableCell>{p.headcount}</TableCell>
                    <TableCell className="font-mono font-bold">{p.currency === "GBP" ? "£" : "€"}{p.grossPay.toLocaleString()}</TableCell>
                    <TableCell>{p.currency}</TableCell>
                    <TableCell>{p.period}</TableCell>
                    <TableCell><StatusBadge status={p.status} /></TableCell>
                    <TableCell><AecButton size="xs" onClick={() => toast.success(`${p.site} payroll approved and queued for processing`)}>Approve & process</AecButton></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </AecPanel>
        </div>
      )}
    </div>
  );
}

// ─── CURRENCY INTELLIGENCE ────────────────────────────────────────────────────
export function CurrencyIntelligence() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Currency Intelligence" subtitle="GBP is the group reporting currency; Katowice trades in PLN with EUR-denominated steel contracts." />
      <div className="grid gap-2.5 sm:grid-cols-3">
        <AecStatCard label="GBP / EUR rate" value="1.19" sub="Unfavourable vs budget 1.22" accent="amber" />
        <AecStatCard label="GBP / PLN rate" value="5.14" sub="Favourable vs budget 5.08" accent="teal" />
        <AecStatCard label="EUR exposure (Katowice)" value="€86k" sub="Steel contracts unhedged" accent="brand" />
      </div>
      <AecPanel title="Live FX rates" icon={<ArrowRight className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />}>
        <FxRow pair="GBP / PLN" rate="5.14" change="0.3%" up />
        <FxRow pair="GBP / EUR" rate="1.19" change="0.2%" up={false} />
        <FxRow pair="EUR / PLN" rate="4.32" change="0.1%" up />
      </AecPanel>
      <AecPanel title="AI recommendation" icon={<AlertTriangle className="h-3.5 w-3.5 text-[color:var(--page-amber)]" />}>
        <p className="text-[11.5px] leading-relaxed text-[color:var(--page-muted)]">
          Katowice steel contracts (€86k) currently unhedged. EUR/GBP has moved 2.5% unfavourably in the last 30 days,
          compressing group gross margin by an estimated 0.4pts. Consider forward-cover on next steel order (est. €42k, Dec delivery).
        </p>
        <div className="mt-3 flex gap-2">
          <AecButton size="sm" onClick={() => toast.success("Hedging recommendation sent to Group CFO")}>Forward to CFO</AecButton>
          <AecButton size="sm" variant="outline" onClick={() => toast.message("FX Risk Monitor will alert when rate moves ±1%")}>Set FX alert</AecButton>
        </div>
      </AecPanel>
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────
function FxRow({ pair, rate, change, up }: { pair: string; rate: string; change: string; up: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--page-border)] py-2 last:border-0">
      <span className="flex-1 font-mono text-[11.5px] font-semibold">{pair}</span>
      <span className="font-mono text-[12.5px] font-bold">{rate}</span>
      <span className={cn("inline-flex items-center gap-0.5 text-[11px]", up ? "text-[color:var(--page-success)]" : "text-[color:var(--page-danger)]")}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {change}
      </span>
    </div>
  );
}

function ApprovalFlow({ steps }: { steps: { label: string; status: "complete" | "active" | "pending" }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <div className={cn("flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold",
            s.status === "complete" ? "border-[color:var(--page-success)]/30 bg-[color:var(--page-success)]/5 text-[color:var(--page-success)]"
              : s.status === "active" ? "border-[color:var(--page-accent)]/30 bg-[color:var(--page-accent)]/5 text-[color:var(--page-accent)]"
              : "border-[color:var(--page-border)] text-[color:var(--page-dim)]")}>
            {s.status === "complete" && <CheckCircle className="h-3.5 w-3.5" />}
            {s.label}
          </div>
          {i < steps.length - 1 && <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[color:var(--page-dim)]" />}
        </div>
      ))}
    </div>
  );
}

function DataTable({ headers, rows, monoFirst }: { headers: string[]; rows: string[][]; monoFirst?: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>{headers.map((h) => <TableHead key={h}>{h}</TableHead>)}</TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => (
              <TableCell key={j} className={j === 0 ? (monoFirst ? "font-mono" : "font-semibold") : ""}>
                {j === row.length - 1 ? <StatusBadge status={cell} /> : cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="mb-2.5 border-b border-[color:var(--page-border)] pb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[color:var(--page-accent)]">{title}</p>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] uppercase tracking-wide text-[color:var(--page-muted)]">{label}</Label>
      {children}
    </div>
  );
}
