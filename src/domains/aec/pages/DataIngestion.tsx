import { ArrowRight, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { connectors, dataFlowStages } from "@/domains/aec/data/connectors";

export default function DataIngestion() {
  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Data Ingestion"
        subtitle="Source systems, connectors, and Datonix module mappings for the enterprise twin."
        breadcrumb={[
          { label: "Intelligence", href: "/enterprise-twin" },
          { label: "Data Ingestion" },
        ]}
        actions={
          <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-1.5 text-sm">
            <RefreshCw className="h-4 w-4 animate-spin text-accent" />
            <span className="text-muted-foreground">Syncing</span>
            <StatusBadge status="Live" />
          </div>
        }
      />

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Data Flow</CardTitle>
          <p className="text-sm text-muted-foreground">
            Source Systems → Connectors → Datonix Modules
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:justify-between">
            {dataFlowStages.map((stage, stageIdx) => (
              <div key={stage.id} className="flex flex-1 items-center gap-4">
                <div className="flex-1 rounded-lg border bg-card p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {stage.title}
                  </p>
                  <ul className="space-y-2">
                    {stage.items.map((item) => (
                      <li
                        key={item}
                        className="rounded-md bg-muted/50 px-3 py-2 text-sm font-medium"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                {stageIdx < dataFlowStages.length - 1 && (
                  <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground lg:block" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Connector Mapping Status</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source System</TableHead>
                <TableHead>Connector</TableHead>
                <TableHead>Target Module</TableHead>
            <TableHead>Entities</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Coverage</TableHead>
            <TableHead>Last Sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {connectors.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.source}</TableCell>
                  <TableCell>{c.connector}</TableCell>
                  <TableCell>{c.targetModule}</TableCell>
                  <TableCell className="text-muted-foreground">{c.entities}</TableCell>
                  <TableCell>
                    <StatusBadge status={c.status} />
                  </TableCell>
                  <TableCell>{c.coverage}</TableCell>
                  <TableCell className="text-muted-foreground">{c.lastSync}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
