import { useNavigate } from "react-router-dom";
import { ClipboardPlus, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecPanel, AecStatCard } from "@/domains/aec/components/primitives";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { INQUIRIES, TIMESHEETS, WORK_ORDERS } from "@/domains/manufacturing/data";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";

export function CustomerInquiries() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Customer Inquiries" subtitle="4 open inquiries across the group." />
      <AecPanel>
        <DataTable
          headers={["Customer", "Subject", "Site", "Raised", "Status"]}
          rows={INQUIRIES.map((r) => [r.customer, r.subject, r.site, r.raised, r.status])}
        />
      </AecPanel>
    </div>
  );
}

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
      <AecPanel>
        <DataTable
          headers={["WO #", "Customer", "Site", "Stage", "Due", "Status"]}
          rows={WORK_ORDERS.map((r) => [r.id, r.customer, r.site, r.stage, r.due, r.status])}
          monoFirst
        />
      </AecPanel>
    </div>
  );
}

export function CreateWorkOrder() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <AecPageHeader title="Create Work Order" subtitle="Release a new work order to a site's production schedule." />
      <AecPanel>
        <p className="mb-2.5 border-b border-[color:var(--page-border)] pb-1.5 text-[10.5px] font-bold uppercase tracking-wide text-[color:var(--page-accent)]">Order details</p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-[color:var(--page-muted)]">Customer</Label>
            <Input placeholder="e.g. Ashford Rail Components" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-[color:var(--page-muted)]">Site</Label>
            <select className="h-9 w-full rounded-md border border-[color:var(--page-border)] bg-[color:var(--page-card)] px-2 text-sm">
              <option>Birmingham (UK)</option>
              <option>Katowice (Poland)</option>
              <option>Coventry (UK)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase text-[color:var(--page-muted)]">Due date</Label>
            <Input type="date" />
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t border-[color:var(--page-border)] pt-3">
          <AecButton variant="outline" onClick={() => navigate("/work-orders")}>Cancel</AecButton>
          <AecButton onClick={() => { toast.success("Work order WO-2310 created"); navigate("/work-orders"); }}>Create work order</AecButton>
        </div>
      </AecPanel>
    </div>
  );
}

export function RoutingBuilder() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <AecPageHeader title="Routing Builder" subtitle="Define the operation sequence a part follows through the shop floor." />
      <AecPanel>
        <p className="py-10 text-center text-[12px] text-[color:var(--page-muted)]">
          Routing templates are built per part family and reused across work orders.
        </p>
        <div className="flex justify-center">
          <AecButton onClick={() => navigate("/site-twin")}>Open site production line</AecButton>
        </div>
      </AecPanel>
    </div>
  );
}

export function ShiftTimesheets() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Shift & Timesheets" subtitle="5 timesheets pending approval." />
      <AecPanel>
        <DataTable
          headers={["Name", "Site", "Week", "Hours", "Status"]}
          rows={TIMESHEETS.map((r) => [r.name, r.site, r.week, r.hours, r.status])}
        />
      </AecPanel>
    </div>
  );
}

export function BillingAccounting() {
  return (
    <div className="space-y-4">
      <AecPageHeader title="Billing & Accounting" subtitle="AR, AP, GL and payroll across three entities." />
      <div className="grid gap-2.5 sm:grid-cols-3">
        <AecStatCard label="AR outstanding" value="£486k" sub="18 open invoices" accent="brand" />
        <AecStatCard label="AP due (30d)" value="£211k" sub="Steel, aluminium, energy" accent="amber" />
        <AecStatCard label="GL entities reconciled" value="3/3" sub="As of yesterday close" accent="teal" />
      </div>
    </div>
  );
}

export function CurrencyIntelligence() {
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Currency Intelligence"
        subtitle="GBP is the group reporting currency; Katowice trades in PLN with EUR-denominated steel contracts."
      />
      <AecPanel>
        <FxRow pair="GBP / PLN" rate="5.14" change="0.3%" up />
        <FxRow pair="GBP / EUR" rate="1.19" change="0.2%" up={false} />
      </AecPanel>
    </div>
  );
}

function FxRow({ pair, rate, change, up }: { pair: string; rate: string; change: string; up: boolean }) {
  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--page-border)] py-2 last:border-0">
      <span className="flex-1 font-mono text-[11.5px] font-semibold">{pair}</span>
      <span className="font-mono text-[12.5px] font-bold">{rate}</span>
      <span className={`inline-flex items-center gap-0.5 text-[11px] ${up ? "text-[color:var(--page-success)]" : "text-[color:var(--page-danger)]"}`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {change}
      </span>
    </div>
  );
}

function DataTable({
  headers,
  rows,
  monoFirst,
}: {
  headers: string[];
  rows: string[][];
  monoFirst?: boolean;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((h) => <TableHead key={h}>{h}</TableHead>)}
        </TableRow>
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
