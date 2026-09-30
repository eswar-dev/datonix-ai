import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecPanel, AecProgress, AecStatCard, AecTag } from "@/domains/aec/components/primitives";
import { MfgSparkline, skillClass } from "@/domains/manufacturing/components/MfgUi";
import { PEOPLE, SKILL_COLUMNS, SKILL_MATRIX, siteTagVariant } from "@/domains/manufacturing/data";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";

export default function ResourceManagement() {
  const navigate = useNavigate();
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
      <AecPanel
        title="Team directory"
        actions={
          <div className="flex gap-1.5">
            <AecButton variant={sharedOnly ? "outline" : "primary"} size="xs" onClick={() => setSharedOnly(false)}>All sites</AecButton>
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
              <MfgSparkline
                values={p.spark}
                color={p.accent === "blue" ? "var(--page-blue)" : p.accent === "purple" ? "var(--page-purple)" : "var(--page-teal)"}
              />
              <p className="mt-2 text-[10px] text-[color:var(--page-muted)]">{p.util}% utilised this week · {p.note}</p>
            </div>
          ))}
        </div>
      </AecPanel>
    </div>
  );
}

export function AddResource() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <AecPageHeader title="Add Resource" subtitle="Register a new team member and assign site, skills and allocation." />
      <AecPanel>
        <Section title="Identity">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Full name"><Input placeholder="e.g. Sofia Marchetti" /></Field>
            <Field label="Role / title"><Input placeholder="e.g. Quality Inspector" /></Field>
            <Field label="Employee ID"><Input placeholder="Auto-generated" /></Field>
          </div>
        </Section>
        <Section title="Assignment">
          <div className="grid gap-3 md:grid-cols-3">
            <Field label="Primary site">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm">
                <option>Birmingham (UK)</option>
                <option>Katowice (Poland)</option>
                <option>Coventry (UK)</option>
              </select>
            </Field>
            <Field label="Shared with">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm">
                <option>None</option>
                <option>Birmingham</option>
                <option>Katowice</option>
                <option>Coventry</option>
              </select>
            </Field>
            <Field label="Shift pattern">
              <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm">
                <option>Days (06:00–14:00)</option>
                <option>Lates (14:00–22:00)</option>
                <option>Continental (4-on-4-off)</option>
              </select>
            </Field>
          </div>
        </Section>
        <Section title="Skills & certifications">
          <Field label="Skills (comma separated)">
            <Textarea placeholder="e.g. CNC 5-axis, ISO 9001 auditing, MIG/TIG welding" />
          </Field>
        </Section>
        <div className="mt-4 flex justify-end gap-2 border-t border-[color:var(--page-border)] pt-3">
          <AecButton variant="outline" onClick={() => navigate("/resources")}>Cancel</AecButton>
          <AecButton onClick={() => { toast.success("Resource saved"); navigate("/resources"); }}>Save resource</AecButton>
        </div>
      </AecPanel>
    </div>
  );
}

export function SkillMatrix() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Skill Matrix" subtitle="Certified competency levels across the group — 0 (none) to 5 (train-the-trainer)." actions={<AecTag variant="purple">Cross-site view</AecTag>} />
      <AecPanel>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Site</TableHead>
              {SKILL_COLUMNS.map((c) => <TableHead key={c}>{c}</TableHead>)}
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
                  <TableCell key={i}>
                    <span className={`inline-flex h-[26px] w-[26px] items-center justify-center rounded text-[10px] font-bold ${skillClass(n)}`}>{n}</span>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AecPanel>
    </div>
  );
}

export function SharedAllocation() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Shared Allocation" subtitle="Specialists co-linked across sites in the multi-twin structure — time split and scheduling conflicts." />
      <Alloc
        name="Marcus Klein — Senior Maintenance Technician"
        left={{ label: "Birmingham allocation", pct: 60, note: "60% · Mon–Wed, plus on-call weekends", color: "bg-[color:var(--page-blue)]" }}
        right={{ label: "Katowice allocation", pct: 40, note: "40% · Thu–Fri, remote diagnostics support", color: "bg-[color:var(--page-amber)]" }}
        copy="Covers CNC and robotics cell breakdowns at both sites — Katowice has no in-house robotics-certified technician, so Thursday/Friday visits are scheduled around preventive windows. Flagged by the Resource Overload Agent when a Birmingham breakdown and a Katowice PM slot land in the same week."
      />
      <Alloc
        name="Priya Chandran — Supply Chain Analyst"
        left={{ label: "Birmingham allocation", pct: 55, note: "55% · Group buying, steel & aluminium contracts", color: "bg-[color:var(--page-blue)]" }}
        right={{ label: "Coventry allocation", pct: 45, note: "45% · New-site supplier onboarding", color: "bg-[color:var(--page-purple)]" }}
        copy="Runs group-level supplier negotiations from Birmingham while onboarding Coventry's supplier base as the newest site ramps up — a group role rather than a single-site one."
      />
    </div>
  );
}

function Alloc({
  name,
  left,
  right,
  copy,
}: {
  name: string;
  left: { label: string; pct: number; note: string; color: string };
  right: { label: string; pct: number; note: string; color: string };
  copy: string;
}) {
  return (
    <AecPanel title={name} actions={<AecTag variant="purple">Shared</AecTag>}>
      <div className="mb-3 grid gap-4 md:grid-cols-2">
        {[left, right].map((b) => (
          <div key={b.label}>
            <p className="mb-1 text-[10.5px] text-[color:var(--page-muted)]">{b.label}</p>
            <AecProgress value={b.pct} barClassName={b.color} />
            <p className="mt-1 text-[10.5px] text-[color:var(--page-muted)]">{b.note}</p>
          </div>
        ))}
      </div>
      <p className="text-[11.5px] leading-relaxed text-[color:var(--page-muted)]">{copy}</p>
    </AecPanel>
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
