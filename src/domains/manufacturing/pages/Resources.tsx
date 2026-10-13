import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Award, BadgeCheck, CheckCircle, Download, Plus, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecPanel, AecProgress, AecStatCard, AecTag } from "@/domains/aec/components/primitives";
import { MfgSparkline, skillClass } from "@/domains/manufacturing/components/MfgUi";
import {
  PEOPLE, SKILL_COLUMNS, SKILL_MATRIX, SKILL_METRICS, SKILL_REVIEWS, siteTagVariant,
} from "@/domains/manufacturing/data";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/common/components/ui/table";
import { cn } from "@/common/lib/utils";

type RTab = "directory" | "skills" | "allocation";

export default function ResourceManagement() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<RTab>("directory");
  const [sharedOnly, setSharedOnly] = useState(false);
  const people = useMemo(() => (sharedOnly ? PEOPLE.filter((p) => p.shared) : PEOPLE), [sharedOnly]);

  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Resource Management"
        subtitle="70 people across Birmingham, Katowice and Coventry — skills, allocation and utilisation."
        actions={
          <>
            <AecButton variant="outline" size="sm">
              <Download className="h-3.5 w-3.5" />
              Export
            </AecButton>
            <AecButton size="sm" onClick={() => navigate("/resources/add")}>
              <UserPlus className="h-3.5 w-3.5" />
              Add resource
            </AecButton>
          </>
        }
      />

      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        <AecStatCard label="Total headcount" value="70" sub="3 sites" />
        <AecStatCard label="Avg utilisation" value="87%" sub="up 3pts vs last month" accent="teal" />
        <AecStatCard label="Shared resources" value="4" sub="Cross-site specialists" accent="purple" />
        <AecStatCard label="Open requisitions" value="3" sub="CNC Setter × 2, QA × 1" accent="amber" />
      </div>

      {/* Tab bar */}
      <div className="flex gap-0.5 border-b border-[color:var(--page-border)]">
        {([["directory", "Team Directory"], ["skills", "Skills & Approvals"], ["allocation", "Shared Allocation"]] as const).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)}
            className={cn("border-b-2 px-4 py-2 text-[11.5px] font-semibold transition-colors",
              tab === id ? "border-[color:var(--page-accent)] text-[color:var(--page-text)]" : "border-transparent text-[color:var(--page-muted)] hover:text-[color:var(--page-text)]")}>
            {label}
          </button>
        ))}
      </div>

      {tab === "directory" && <DirectoryTab people={people} sharedOnly={sharedOnly} setSharedOnly={setSharedOnly} />}
      {tab === "skills" && <SkillsTab />}
      {tab === "allocation" && <AllocationTab />}
    </div>
  );
}

// ─── Directory tab ─────────────────────────────────────────────────────────────
function DirectoryTab({ people, sharedOnly, setSharedOnly }: { people: typeof PEOPLE; sharedOnly: boolean; setSharedOnly: (v: boolean) => void }) {
  return (
    <AecPanel
      title="Team directory"
      actions={
        <div className="flex gap-1.5">
          <AecButton variant={!sharedOnly ? "primary" : "outline"} size="xs" onClick={() => setSharedOnly(false)}>All sites</AecButton>
          <AecButton variant={sharedOnly ? "primary" : "outline"} size="xs" onClick={() => setSharedOnly(true)}>Shared only</AecButton>
        </div>
      }
    >
      <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-3">
        {people.map((p) => (
          <div key={p.name} className="rounded-[8px] border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] p-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold">{p.name}</p>
                <p className="text-[11px] text-[color:var(--page-muted)]">{p.title}</p>
              </div>
              {p.shared && <AecTag variant="purple">Shared</AecTag>}
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              {p.sites.map((s) => <AecTag key={s} variant={siteTagVariant(s)}>{s}</AecTag>)}
            </div>
            <MfgSparkline values={p.spark} color={p.accent === "blue" ? "var(--page-blue)" : p.accent === "purple" ? "var(--page-purple)" : "var(--page-teal)"} />
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-[color:var(--page-muted)]">{p.util}% utilised · {p.note}</p>
              <div className="h-1 w-16 rounded-full bg-[color:var(--page-border)]">
                <div className={cn("h-1 rounded-full", p.accent === "blue" ? "bg-[color:var(--page-blue)]" : p.accent === "purple" ? "bg-[color:var(--page-purple)]" : "bg-[color:var(--page-teal)]")} style={{ width: `${p.util}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AecPanel>
  );
}

// ─── Skills & Approvals tab ────────────────────────────────────────────────────
function SkillsTab() {
  const [reviews, setReviews] = useState(SKILL_REVIEWS);
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ person: "", skill: "", level: "3", evidence: "", approver: "" });

  const approve = (id: string) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "Approved" } : r));
    toast.success("Skill level approved and updated in matrix");
  };
  const reject = (id: string) => {
    setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "Rejected" } : r));
    toast.message("Skill review rejected — person notified");
  };
  const submitSkill = () => {
    if (!newSkill.person || !newSkill.skill) { toast.error("Person and skill are required"); return; }
    setReviews((prev) => [{ id: `sr${Date.now()}`, person: newSkill.person, skill: newSkill.skill, claimed: parseInt(newSkill.level), current: 0, evidence: newSkill.evidence, date: "Today", approver: newSkill.approver || "Site Manager", status: "Pending" }, ...prev]);
    setShowAddSkill(false);
    toast.success("Skill review request submitted");
  };

  const pending = reviews.filter((r) => r.status === "Pending");

  return (
    <div className="space-y-4">
      {/* Skill metrics */}
      <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-5">
        <AecStatCard label="Skills tracked" value={String(SKILL_METRICS.tracked)} />
        <AecStatCard label="Avg rating" value={String(SKILL_METRICS.avgRating)} sub="Out of 5" accent="teal" />
        <AecStatCard label="Pending reviews" value={String(pending.length)} accent="amber" />
        <AecStatCard label="Certified (4+)" value={String(SKILL_METRICS.certified)} accent="brand" />
        <AecStatCard label="Coverage" value={`${SKILL_METRICS.coveragePct}%`} sub="Group average" accent="purple" />
      </div>

      {/* Full skill matrix */}
      <AecPanel
        title="Skill matrix"
        icon={<Award className="h-3.5 w-3.5 text-[color:var(--page-teal)]" />}
        actions={
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-1 text-[10px] text-[color:var(--page-muted)]">
              <span className="inline-flex h-4 w-4 items-center justify-center rounded bg-[color:var(--page-teal)] text-[9px] font-bold text-white">5</span>Expert
              <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded bg-[color:var(--page-border)] text-[9px] font-bold text-[color:var(--page-dim)]">0</span>None
            </div>
            <AecButton size="xs" onClick={() => setShowAddSkill(true)}>
              <Plus className="h-3 w-3" />
              Add skill
            </AecButton>
          </div>
        }
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Site</TableHead>
              {SKILL_COLUMNS.map((c) => <TableHead key={c} className="text-center">{c}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {SKILL_MATRIX.map((row) => (
              <TableRow key={row.name}>
                <TableCell className="font-semibold">
                  {row.name} {row.shared && <AecTag variant="purple" className="ml-1">Shared</AecTag>}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {row.sites.map((s) => <AecTag key={s} variant={siteTagVariant(s)}>{s}</AecTag>)}
                  </div>
                </TableCell>
                {row.skills.map((n, i) => (
                  <TableCell key={i} className="text-center">
                    <span className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded text-[10px] font-bold ${skillClass(n)}`}>{n}</span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AecPanel>

      {/* Add skill form */}
      {showAddSkill && (
        <AecPanel title="Add skill / request review" icon={<BadgeCheck className="h-3.5 w-3.5 text-[color:var(--page-accent)]" />}>
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Person">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={newSkill.person} onChange={(e) => setNewSkill({ ...newSkill, person: e.target.value })}>
                <option value="">Select…</option>
                {PEOPLE.map((p) => <option key={p.name}>{p.name}</option>)}
              </select>
            </Field>
            <Field label="Skill">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={newSkill.skill} onChange={(e) => setNewSkill({ ...newSkill, skill: e.target.value })}>
                <option value="">Select…</option>
                {SKILL_COLUMNS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Claimed level (0–5)">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={newSkill.level} onChange={(e) => setNewSkill({ ...newSkill, level: e.target.value })}>
                {[0, 1, 2, 3, 4, 5].map((n) => <option key={n}>{n} — {["None", "Awareness", "Basic", "Competent", "Proficient", "Expert/Trainer"][n]}</option>)}
              </select>
            </Field>
            <Field label="Approver">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm" value={newSkill.approver} onChange={(e) => setNewSkill({ ...newSkill, approver: e.target.value })}>
                <option value="">Auto-select from org hierarchy</option>
                <option>Site Manager Birmingham</option>
                <option>Aleksandra Nowak</option>
                <option>Group Ops Director</option>
              </select>
            </Field>
          </div>
          <div className="mt-3">
            <Field label="Evidence / supporting notes">
              <Textarea rows={2} placeholder="e.g. City & Guilds L4 cert, course completion date, assessment by…" className="resize-none text-[12.5px]" value={newSkill.evidence} onChange={(e) => setNewSkill({ ...newSkill, evidence: e.target.value })} />
            </Field>
          </div>
          <div className="mt-3 flex justify-end gap-2 border-t border-[color:var(--page-border)] pt-3">
            <AecButton variant="outline" onClick={() => setShowAddSkill(false)}>Cancel</AecButton>
            <AecButton onClick={submitSkill}>Submit for approval</AecButton>
          </div>
        </AecPanel>
      )}

      {/* Approval queue */}
      <AecPanel
        title="Skill approval queue"
        icon={<CheckCircle className="h-3.5 w-3.5 text-[color:var(--page-success)]" />}
        actions={<AecTag variant={pending.length > 0 ? "amber" : "success"}>{pending.length} pending</AecTag>}
      >
        {reviews.length === 0 && <p className="py-6 text-center text-[12px] text-[color:var(--page-muted)]">No skill reviews.</p>}
        {reviews.map((r) => (
          <div key={r.id} className={cn("mb-2 rounded-[8px] border p-3 last:mb-0", r.status === "Pending" ? "border-[color:var(--page-amber)]/30 bg-[color:var(--page-card-2)]" : "border-[color:var(--page-border)] bg-[color:var(--page-card-2)] opacity-70")}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[12.5px] font-bold">{r.person}</p>
                  <AecTag variant="teal">{r.skill}</AecTag>
                  <span className="text-[10.5px] text-[color:var(--page-muted)]">Level {r.current} → <strong>{r.claimed}</strong></span>
                </div>
                <p className="mt-0.5 text-[10.5px] text-[color:var(--page-muted)]">Evidence: {r.evidence}</p>
                <p className="text-[10px] text-[color:var(--page-dim)]">{r.date} · Approver: {r.approver}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <StatusBadge status={r.status} />
                {r.status === "Pending" && (
                  <>
                    <AecButton size="xs" onClick={() => approve(r.id)}>Approve</AecButton>
                    <AecButton size="xs" variant="outline" onClick={() => reject(r.id)}>Reject</AecButton>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </AecPanel>
    </div>
  );
}

// ─── Shared Allocation tab ─────────────────────────────────────────────────────
function AllocationTab() {
  return (
    <div className="space-y-3.5">
      <AllocCard
        name="Marcus Klein"
        role="Senior Maintenance Technician"
        tag={{ label: "Conflict flagged", variant: "amber" as const }}
        left={{ label: "Birmingham", pct: 60, note: "60% · Mon–Wed + on-call weekends", color: "bg-[color:var(--page-blue)]" }}
        right={{ label: "Katowice", pct: 40, note: "40% · Thu–Fri, remote diagnostics", color: "bg-[color:var(--page-amber)]" }}
        alert="AI: Overlapping commitments 23 Sep — BHX breakdown + KTW PM slot. Recommend re-scheduling KTW PM to 26 Sep."
        alertVariant="amber"
      />
      <AllocCard
        name="Priya Chandran"
        role="Supply Chain Analyst"
        tag={{ label: "Shared", variant: "purple" as const }}
        left={{ label: "Birmingham", pct: 55, note: "55% · Group buying, steel & aluminium contracts", color: "bg-[color:var(--page-blue)]" }}
        right={{ label: "Coventry", pct: 45, note: "45% · New-site supplier onboarding", color: "bg-[color:var(--page-purple)]" }}
      />
    </div>
  );
}

function AllocCard({ name, role, tag, left, right, alert, alertVariant }: {
  name: string; role: string;
  tag: { label: string; variant: "amber" | "purple" | "teal" };
  left: { label: string; pct: number; note: string; color: string };
  right: { label: string; pct: number; note: string; color: string };
  alert?: string; alertVariant?: "amber" | "danger";
}) {
  return (
    <AecPanel title={name} icon={<Users className="h-3.5 w-3.5 text-[color:var(--page-purple)]" />} actions={<AecTag variant={tag.variant}>{tag.label}</AecTag>}>
      <p className="mb-3 text-[11px] text-[color:var(--page-muted)]">{role}</p>
      <div className="grid gap-4 md:grid-cols-2">
        {[left, right].map((b) => (
          <div key={b.label}>
            <div className="mb-1 flex justify-between text-[10.5px] text-[color:var(--page-muted)]">
              <span>{b.label}</span>
              <span className="font-mono font-bold">{b.pct}%</span>
            </div>
            <AecProgress value={b.pct} barClassName={b.color} />
            <p className="mt-1 text-[10px] text-[color:var(--page-muted)]">{b.note}</p>
          </div>
        ))}
      </div>
      {alert && (
        <div className={cn("mt-3 flex items-start gap-2 rounded-md border px-3 py-2 text-[11px]",
          alertVariant === "danger" ? "border-[color:var(--page-danger)]/25 bg-[color:var(--page-danger)]/5" : "border-[color:var(--page-amber)]/25 bg-[color:var(--page-amber)]/5")}>
          <span className="font-bold text-[color:var(--page-amber)]">AI: </span>
          <span className="text-[color:var(--page-muted)]">{alert.replace("AI: ", "")}</span>
        </div>
      )}
    </AecPanel>
  );
}

// ─── Add Resource page ─────────────────────────────────────────────────────────
export function AddResource() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <AecPageHeader title="Add Resource" subtitle="Register a new team member and assign site, skills and allocation." />
      <AecPanel icon={<UserPlus className="h-3.5 w-3.5 text-[color:var(--page-accent)]" />}>
        <Section title="Identity">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Full name"><Input placeholder="e.g. Sofia Marchetti" /></Field>
            <Field label="Role / title"><Input placeholder="e.g. Quality Inspector" /></Field>
            <Field label="Employee ID"><Input placeholder="Auto-generated" disabled /></Field>
          </div>
        </Section>
        <Section title="Assignment">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Primary site">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm">
                <option>Birmingham (UK)</option><option>Katowice (Poland)</option><option>Coventry (UK)</option>
              </select>
            </Field>
            <Field label="Shared with">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm">
                <option>None</option><option>Birmingham</option><option>Katowice</option><option>Coventry</option>
              </select>
            </Field>
            <Field label="Shift pattern">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm">
                <option>Days (06:00–14:00)</option><option>Lates (14:00–22:00)</option><option>Continental (4-on-4-off)</option>
              </select>
            </Field>
          </div>
        </Section>
        <Section title="Skills & certifications">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Skills (select all that apply)">
              <div className="flex flex-wrap gap-1.5">
                {SKILL_COLUMNS.map((s) => (
                  <label key={s} className="flex cursor-pointer items-center gap-1.5 rounded border border-[color:var(--page-border)] bg-[color:var(--page-card-2)] px-2.5 py-1.5 text-[11px] hover:border-[color:var(--page-accent)]">
                    <input type="checkbox" className="h-3 w-3 rounded" />
                    {s}
                  </label>
                ))}
              </div>
            </Field>
            <Field label="Certifications / additional notes">
              <Textarea rows={4} placeholder="e.g. CNC 5-axis, ISO 9001 auditing, MIG/TIG welding" className="resize-none text-[12.5px]" />
            </Field>
          </div>
        </Section>
        <Section title="Approval">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Approved by">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm">
                <option>Site Manager Birmingham</option><option>Group Ops Director</option>
              </select>
            </Field>
            <Field label="Start date"><Input type="date" /></Field>
          </div>
        </Section>
        <div className="mt-4 flex justify-end gap-2 border-t border-[color:var(--page-border)] pt-3">
          <AecButton variant="outline" onClick={() => navigate("/resources")}>Cancel</AecButton>
          <AecButton onClick={() => { toast.success("Resource saved — awaiting manager approval"); navigate("/resources"); }}>Save & send for approval</AecButton>
        </div>
      </AecPanel>
    </div>
  );
}

// ─── Skill Matrix standalone page ─────────────────────────────────────────────
export function SkillMatrix() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Skill Matrix" subtitle="Certified competency levels across the group — 0 (none) to 5 (train-the-trainer)." actions={<AecTag variant="purple">Cross-site view</AecTag>} />
      <SkillsTab />
    </div>
  );
}

// ─── Shared Allocation standalone page ────────────────────────────────────────
export function SharedAllocation() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Shared Allocation" subtitle="Specialists co-linked across sites in the multi-twin structure — time split and scheduling conflicts." />
      <AllocationTab />
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
import { StatusBadge } from "@/domains/aec/components/StatusBadge";

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
