import { Bell, Briefcase, Calendar, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Progress } from "@/common/components/ui/progress";
import { StatusBadge } from "./StatusBadge";

interface DashboardProject {
  name: string;
  role: string;
  progress: number;
  health: "Good" | "At Risk";
}

interface DashboardData {
  utilizationPct: number;
  leaveBalanceDays: number;
  myProjects: DashboardProject[];
  pendingApprovals: { type: string; label: string; count: number }[];
  agentNotifications: { agent: string; message: string; time: string }[];
  teamUtilization: { name: string; utilization: number; entity: string }[];
}

interface MyDashboardWidgetsProps {
  data: DashboardData;
  isManagerView?: boolean;
}

export function MyDashboardWidgets({ data, isManagerView }: MyDashboardWidgetsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4" />
            {isManagerView ? "Team Projects" : "My Projects"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.myProjects.map((p) => (
            <div key={p.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.role}</p>
                </div>
                <StatusBadge status={p.health} />
              </div>
              <Progress value={p.progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">{p.progress}% complete</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle2 className="h-4 w-4" />
            Pending Approvals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.pendingApprovals.map((a) => (
            <div key={a.type} className="flex items-center justify-between rounded-lg border px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{a.type}</span>
                <span className="text-sm">{a.label}</span>
              </div>
              <span className="text-sm font-semibold">{a.count}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {isManagerView && data.teamUtilization.length > 0 ? (
        <Card className="rounded-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4" />
              Team Utilization
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.teamUtilization.map((r) => (
              <div key={r.name} className="rounded-lg border px-3 py-2">
                <p className="font-medium text-sm">{r.name}</p>
                <p className="text-xs text-muted-foreground">{r.entity}</p>
                <p className={`mt-1 text-lg font-semibold ${r.utilization > 90 ? "text-destructive" : "text-accent"}`}>
                  {r.utilization}%
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              My Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Utilization</p>
              <p className="text-2xl font-semibold text-accent">{data.utilizationPct}%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Leave Balance</p>
              <p className="text-2xl font-semibold">{data.leaveBalanceDays} days</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={`rounded-card ${isManagerView ? "" : ""}`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" />
            Agent Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.agentNotifications.map((n, i) => (
            <div key={i} className="rounded-lg border px-3 py-2">
              <p className="text-xs font-medium text-accent">{n.agent}</p>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{n.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
