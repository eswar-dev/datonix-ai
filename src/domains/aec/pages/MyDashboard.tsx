import { useEffect } from "react";
import { useAuth } from "@/common/contexts/AuthContext";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MyDashboardWidgets } from "@/domains/aec/components/MyDashboardWidgets";
import {
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp, useAecDashboardData } from "@/domains/aec/context/AecAppContext";
import { Button } from "@/common/components/ui/button";

export default function MyDashboard() {
  const { user } = useAuth();
  const data = useAecDashboardData();
  const {
    activeTwinId,
    loadMyDashboard,
    dashboardsLoading,
    dashboardsError,
  } = useAecApp();
  const isManagerView = data.teamUtilization.length > 0;

  useEffect(() => {
    if (!activeTwinId) return;
    void loadMyDashboard();
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
        actions={
          <Button size="sm" variant="outline" onClick={() => void loadMyDashboard()} disabled={dashboardsLoading}>
            Refresh
          </Button>
        }
      />

      {dashboardsLoading && <PipelineLoadingBanner label="Loading dashboard…" />}
      <PipelineErrorBanner message={dashboardsError ?? ""} />

      <MyDashboardWidgets data={data} isManagerView={isManagerView} />
    </div>
  );
}
