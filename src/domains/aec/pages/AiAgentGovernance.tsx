import { useCallback } from "react";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AgentGovernanceCard } from "@/domains/aec/components/AgentGovernanceCard";
import { AgentAuditLog } from "@/domains/aec/components/AgentAuditLog";
import { ApprovalWorkflowDiagram } from "@/domains/aec/components/ApprovalWorkflowDiagram";
import { approvalWorkflowSteps, type AgentAction } from "@/domains/aec/data/agentGovernance";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { toast } from "sonner";

export default function AiAgentGovernance() {
  const { governanceAgents, auditLog, handleAgentAction } = useAecApp();
  const pendingCount = governanceAgents.filter((a) => a.status === "Pending").length;

  const onAction = useCallback(
    (id: string, action: AgentAction) => {
      handleAgentAction(id, action);
      const agent = governanceAgents.find((a) => a.id === id);
      toast.success(`${agent?.name} — ${action}`);
    },
    [handleAgentAction, governanceAgents]
  );

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="AI Agent Governance"
        subtitle={`${pendingCount} pending approvals — review agent recommendations with full audit trail.`}
        breadcrumb={[{ label: "AI Agent Governance" }]}
      />

      <ApprovalWorkflowDiagram steps={approvalWorkflowSteps} />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {governanceAgents.map((agent) => (
          <AgentGovernanceCard key={agent.id} agent={agent} onAction={onAction} />
        ))}
      </div>

      <AgentAuditLog entries={auditLog} />
    </div>
  );
}
