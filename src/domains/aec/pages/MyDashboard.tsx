import { useEffect } from "react";
import { useAuth } from "@/common/contexts/AuthContext";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MyDashboardWidgets } from "@/domains/aec/components/MyDashboardWidgets";
import { PipelineLoadingBanner } from "@/domains/aec/components/PipelineUi";
import { useAecApp, useAecDashboardData } from "@/domains/aec/context/AecAppContext";

export default function MyDashboard() {
  const { user } = useAuth();
  const data = useAecDashboardData();
  const {
    activeTwinId,
    refreshTimesheets,
    refreshExpenses,
    refreshResources,
    refreshPipeline,
    timesheetsLoading,
    expensesLoading,
    resourcesLoading,
    pipelineLoading,
  } = useAecApp();
  const isManagerView = data.teamUtilization.length > 0;
  const loading = timesheetsLoading || expensesLoading || resourcesLoading || pipelineLoading;

  useEffect(() => {
    if (!activeTwinId) return;
    void refreshPipeline();
    void refreshTimesheets();
    void refreshExpenses();
    void refreshResources();
    // Intentionally only re-fetch when twin changes — refresh* identities change after load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTwinId]);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="My Dashboard"
        subtitle={
          isManagerView
            ? `Team view for ${user?.name ?? "Manager"} — pending approvals and utilization.`
            : `Personal workspace for ${user?.name ?? "you"} — projects and pending approvals.`
        }
        breadcrumb={[{ label: "My Dashboard" }]}
      />

      {loading && <PipelineLoadingBanner label="Loading dashboard…" />}

      <MyDashboardWidgets data={data} isManagerView={isManagerView} />
    </div>
  );
}
