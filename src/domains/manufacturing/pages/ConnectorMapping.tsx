import { ArrowRight, Database, Plus } from "lucide-react";
import { toast } from "sonner";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecLivePill, AecPanel, AecProgress, AecTag } from "@/domains/aec/components/primitives";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { CONNECTORS } from "@/domains/manufacturing/data";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";

const sources = [
  { label: "E2 MFG (BHX)", dim: false },
  { label: "Ridder iQ (KTW)", dim: false },
  { label: "Deacom (COV)", dim: true },
  { label: "MES / APS (All)", dim: false },
];
const connectors = [
  { label: "ERP Connector", dim: false },
  { label: "ERP Connector", dim: false },
  { label: "ERP Connector", dim: true },
  { label: "Shop-Floor Connector", dim: false },
];
const modules = [
  { label: "AR / AP / GL", dim: false },
  { label: "Production & Resources", dim: false },
  { label: "Inventory & Logistics", dim: true },
  { label: "Quality / SPC", dim: false },
];

export default function ConnectorMapping() {
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Connector Mapping"
        subtitle="Site ERP / MES / APS / PLM / IoT through generated connectors into Datonix modules."
        actions={
          <AecButton size="sm" onClick={() => toast.success("Add source is available after ERP onboarding")}>
            <Plus className="h-3.5 w-3.5" />
            Add source
          </AecButton>
        }
      />
      <AecPanel title="Data flow map" icon={<Database className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />} actions={<AecLivePill label="Syncing" />}>
        <div className="flex flex-wrap items-stretch gap-3">
          <Col title="Source systems" items={sources} cls="aec-flow-source" />
          <Arrow label="Connectors" />
          <Col title="Connector layer" items={connectors} cls="aec-flow-connector" />
          <Arrow label="Target modules" />
          <Col title="Datonix modules" items={modules} cls="aec-flow-module" />
        </div>
      </AecPanel>
      <AecPanel title="Mapping status">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source system</TableHead>
              <TableHead>Connector</TableHead>
              <TableHead>Target module</TableHead>
              <TableHead>Sites</TableHead>
              <TableHead>Coverage</TableHead>
              <TableHead>Last sync</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {CONNECTORS.map((c) => (
              <TableRow key={c.source + c.target}>
                <TableCell className="font-semibold">{c.source}</TableCell>
                <TableCell><AecTag variant="purple">{c.connector}</AecTag></TableCell>
                <TableCell>{c.target}</TableCell>
                <TableCell>{c.sites}</TableCell>
                <TableCell className="w-28"><AecProgress value={c.coverage} /></TableCell>
                <TableCell className="text-[color:var(--page-muted)]">{c.lastSync}</TableCell>
                <TableCell><StatusBadge status={c.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </AecPanel>
    </div>
  );
}

function Col({ title, items, cls }: { title: string; items: { label: string; dim: boolean }[]; cls: string }) {
  return (
    <div className="flex w-[160px] shrink-0 flex-col gap-1.5">
      <p className="mb-1 text-[9.5px] font-bold uppercase tracking-wide text-[color:var(--page-muted)]">{title}</p>
      {items.map((item, i) => (
        <div key={title + i} className={`rounded-md border px-2.5 py-2 text-center text-[11.5px] font-semibold ${cls} ${item.dim ? "opacity-50" : ""}`}>
          {item.label}
        </div>
      ))}
    </div>
  );
}

function Arrow({ label }: { label: string }) {
  return (
    <div className="flex min-w-[40px] flex-1 flex-col items-center justify-center text-[color:var(--page-dim)]">
      <ArrowRight className="h-5 w-5" />
      <span className="text-[9px] uppercase tracking-wide">{label}</span>
    </div>
  );
}
