import { useAuth } from "@/common/contexts/AuthContext";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MyDashboardWidgets } from "@/domains/aec/components/MyDashboardWidgets";
import { useAecDashboardData } from "@/domains/aec/context/AecAppContext";

export default function MyDashboard() {
  const { user } = useAuth();
  const data = useAecDashboardData();
  const isManagerView = data.teamUtilization.length > 0;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="My Dashboard"
        subtitle={
          isManagerView
            ? `Team view for ${user?.name ?? "Manager"} — pending approvals and utilization across your reports.`
            : `Personal workspace for ${user?.name ?? "you"} — projects, approvals, and agent notifications.`
        }
        breadcrumb={[{ label: "My Dashboard" }]}
      />

      <MyDashboardWidgets data={data} isManagerView={isManagerView} />
    </div>
  );
}
