import { useEffect, useMemo, useState } from "react";
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
import { AgentGovernanceCard } from "@/domains/aec/components/AgentGovernanceCard";
import { PipelineEmptyState, PipelineLoadingBanner } from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import type { GovernanceAgent } from "@/domains/aec/data/agentGovernance";
import type { ReportTableRow } from "@/domains/aec/data/reports";

export default function AiAgentGovernance() {
  const { twinDetail, activeTwinId, loadTwinDetail, twinDetailLoading, runReport, reportsLoading } =
    useAecApp();
  const [auditRows, setAuditRows] = useState<ReportTableRow[]>([]);

  useEffect(() => {
    if (activeTwinId && isApiTwinId(activeTwinId) && !twinDetail) {
      void loadTwinDetail(activeTwinId);
    }
  }, [activeTwinId, twinDetail, loadTwinDetail]);

  useEffect(() => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) return;
    void runReport("agent-audit").then((rows) => setAuditRows(rows));
  }, [activeTwinId, runReport]);

  const agents: GovernanceAgent[] = useMemo(() => {
    return (twinDetail?.agents ?? []).map((a) => ({
      id: a.id,
      name: a.name,
      trigger: a.trigger,
      recommendation: `${a.layer} agent · status ${a.status}`,
      confidence: a.confidence || 0,
      status: a.status === "Active" ? ("Approve" as const) : ("Pending" as const),
      entity: a.layer,
    }));
  }, [twinDetail?.agents]);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Decision Intelligence"
        subtitle={`${agents.length} agents from Enterprise Twin · audit trail from reports/agent-audit`}
        breadcrumb={[
          { label: "Decision Intelligence", href: "/ai-agents" },
          { label: "Agent Governance" },
        ]}
      />

      {twinDetailLoading && <PipelineLoadingBanner label="Loading twin agents…" />}

      {!twinDetailLoading && agents.length === 0 ? (
        <PipelineEmptyState>
          No agents on this twin yet. Publish or open a twin that includes generated agents.
        </PipelineEmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {agents.map((agent) => (
            <AgentGovernanceCard key={agent.id} agent={agent} readOnly />
          ))}
        </div>
      )}

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Agent action audit</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {reportsLoading && auditRows.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Loading audit trail…</p>
          ) : auditRows.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No agent audit entries yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity type</TableHead>
                  <TableHead>Entity ID</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>{row.entity}</TableCell>
                    <TableCell className="font-mono text-xs">{row.project}</TableCell>
                    <TableCell>{row.metric}</TableCell>
                    <TableCell className="text-muted-foreground">{row.value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
