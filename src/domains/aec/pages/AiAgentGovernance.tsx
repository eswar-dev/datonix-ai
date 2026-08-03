import { useEffect, useMemo } from "react";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AgentGovernanceCard } from "@/domains/aec/components/AgentGovernanceCard";
import { PipelineEmptyState, PipelineLoadingBanner } from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import type { GovernanceAgent } from "@/domains/aec/data/agentGovernance";

export default function AiAgentGovernance() {
  const { twinDetail, activeTwinId, loadTwinDetail, twinDetailLoading } = useAecApp();

  useEffect(() => {
    if (activeTwinId && isApiTwinId(activeTwinId) && !twinDetail) {
      void loadTwinDetail(activeTwinId);
    }
  }, [activeTwinId, twinDetail, loadTwinDetail]);

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
        title="AI Agent Governance"
        subtitle={`${agents.length} agents from the Enterprise Twin (read-only — approve/reject APIs not available).`}
        breadcrumb={[{ label: "AI Agent Governance" }]}
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
    </div>
  );
}
