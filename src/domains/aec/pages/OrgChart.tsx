import { useEffect, useState } from "react";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MemberProfilePanel } from "@/domains/aec/components/MemberProfilePanel";
import { OrgHierarchyTree } from "@/domains/aec/components/OrgHierarchyTree";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { OrgMember } from "@/domains/aec/data/orgChart";
import { flattenOrgMembers } from "@/domains/aec/data/orgChart";
import { Button } from "@/common/components/ui/button";

export default function OrgChart() {
  const { orgChartRoot, orgChartLoading, orgChartError, loadOrgChart } = useAecApp();
  const [selected, setSelected] = useState<OrgMember | null>(null);

  useEffect(() => {
    void loadOrgChart();
  }, [loadOrgChart]);

  useEffect(() => {
    setSelected(null);
  }, [orgChartRoot]);

  const count = orgChartRoot ? flattenOrgMembers(orgChartRoot).length : 0;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Organization Chart"
        subtitle={count ? `${count} resources in hierarchy` : "Hierarchy of resources by reporting manager."}
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Organization Chart" },
        ]}
        actions={
          <Button size="sm" variant="outline" onClick={() => void loadOrgChart()} disabled={orgChartLoading}>
            Refresh
          </Button>
        }
      />

      {orgChartLoading && <PipelineLoadingBanner label="Loading organization chart…" />}
      <PipelineErrorBanner message={orgChartError ?? ""} />

      {!orgChartLoading && !orgChartRoot ? (
        <PipelineEmptyState>No org hierarchy for this twin yet.</PipelineEmptyState>
      ) : orgChartRoot ? (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <OrgHierarchyTree root={orgChartRoot} selectedId={selected?.id ?? null} onSelect={setSelected} />
          <MemberProfilePanel member={selected?.id === "__org_root__" ? null : selected} />
        </div>
      ) : null}
    </div>
  );
}
