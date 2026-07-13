import { useMemo, useState } from "react";
import { CheckCheck } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import { TimesheetApprovalGrid } from "@/domains/aec/components/TimesheetApprovalGrid";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { timesheetWeek } from "@/domains/aec/data/timesheets";
import { toast } from "sonner";

export default function Timesheets() {
  const { timesheetSubmissions, approveTimesheet, rejectTimesheet, bulkApproveTimesheets } = useAecApp();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const pendingCount = useMemo(
    () => timesheetSubmissions.filter((r) => r.status === "Pending").length,
    [timesheetSubmissions]
  );

  const approve = (id: string) => {
    const row = timesheetSubmissions.find((r) => r.id === id);
    approveTimesheet(id);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    toast.success(`Approved timesheet for ${row?.employee}`);
  };

  const reject = (id: string) => {
    const row = timesheetSubmissions.find((r) => r.id === id);
    rejectTimesheet(id);
    setSelected((s) => { const n = new Set(s); n.delete(id); return n; });
    toast.error(`Rejected timesheet for ${row?.employee}`);
  };

  const bulkApprove = () => {
    const ids = [...selected];
    bulkApproveTimesheets(ids);
    toast.success(`Approved ${ids.length} timesheet(s)`);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleAll = (checked: boolean) => {
    if (checked) {
      setSelected(new Set(timesheetSubmissions.filter((r) => r.status === "Pending").map((r) => r.id)));
    } else {
      setSelected(new Set());
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Timesheets"
        subtitle={`Manager approval view — ${timesheetWeek} submissions.`}
        breadcrumb={[
          { label: "Timesheets", href: "/timesheets" },
          { label: "Approvals" },
        ]}
        actions={
          selected.size > 0 && (
            <Button size="sm" onClick={bulkApprove}>
              <CheckCheck className="mr-2 h-4 w-4" />
              Approve Selected ({selected.size})
            </Button>
          )
        }
      />

      <MetricStrip
        metrics={[
          { label: "Pending", value: String(pendingCount) },
          { label: "Approved", value: String(timesheetSubmissions.filter((r) => r.status === "Approved").length) },
          { label: "Rejected", value: String(timesheetSubmissions.filter((r) => r.status === "Rejected").length) },
          { label: "Week", value: timesheetWeek },
        ]}
      />

      <TimesheetApprovalGrid
        rows={timesheetSubmissions}
        selected={selected}
        onToggleSelect={toggleSelect}
        onToggleAll={toggleAll}
        onApprove={approve}
        onReject={reject}
      />
    </div>
  );
}
