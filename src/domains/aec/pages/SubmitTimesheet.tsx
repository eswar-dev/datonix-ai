import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Send } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { WeeklyTimesheetGrid } from "@/domains/aec/components/WeeklyTimesheetGrid";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { useAuth } from "@/common/contexts/AuthContext";
import { timesheetWeek, weeklyTimesheetTemplate, type TimesheetRow } from "@/domains/aec/data/timesheets";
import { toast } from "sonner";

export default function SubmitTimesheet() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { submitTimesheet, activeTwin } = useAecApp();
  const [rows, setRows] = useState<TimesheetRow[]>(weeklyTimesheetTemplate);

  const total = rows.reduce((s, r) => s + r.mon + r.tue + r.wed + r.thu + r.fri, 0);
  const billable = total;
  const projects = [...new Set(rows.map((r) => r.project))].join(", ");

  const handleSubmit = () => {
    if (total === 0) {
      toast.error("Enter at least some hours before submitting");
      return;
    }
    submitTimesheet({
      employee: user?.name ?? "Current User",
      entity: activeTwin.entities[0]?.code ?? "MA",
      week: timesheetWeek,
      totalHours: total,
      billableHours: billable,
      projects,
    });
    toast.success(`${timesheetWeek} timesheet submitted for approval`);
    navigate("/timesheets");
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Submit Timesheet"
        subtitle={`Weekly time entry by project and task — ${timesheetWeek}.`}
        breadcrumb={[
          { label: "Timesheets", href: "/timesheets" },
          { label: "Submit Timesheet" },
        ]}
        actions={
          <Button size="sm" onClick={handleSubmit}>
            <Send className="mr-2 h-4 w-4" />
            Submit for Approval
          </Button>
        }
      />

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Week 24 — {projects}</CardTitle>
        </CardHeader>
        <CardContent>
          <WeeklyTimesheetGrid rows={rows} onChange={setRows} />
          <p className="mt-4 text-sm text-muted-foreground">
            Total hours this week: <span className="font-semibold text-foreground">{total}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
