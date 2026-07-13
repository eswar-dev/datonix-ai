import { cn } from "@/common/lib/utils";
import { Badge } from "@/common/components/ui/badge";

const statusStyles: Record<string, string> = {
  Live: "bg-success/15 text-success border-success/30",
  Active: "bg-success/15 text-success border-success/30",
  "On Track": "bg-success/15 text-success border-success/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Partial: "bg-warning/15 text-warning border-warning/30",
  Pending: "bg-warning/15 text-warning border-warning/30",
  Draft: "bg-muted text-muted-foreground border-border",
  "At Risk": "bg-destructive/15 text-destructive border-destructive/30",
  Critical: "bg-destructive/15 text-destructive border-destructive/30",
  Escalate: "bg-destructive/15 text-destructive border-destructive/30",
  Good: "bg-success/15 text-success border-success/30",
  Behind: "bg-destructive/15 text-destructive border-destructive/30",
  Paused: "bg-muted text-muted-foreground border-border",
  Approve: "bg-success/15 text-success border-success/30",
  Approved: "bg-success/15 text-success border-success/30",
  Modify: "bg-warning/15 text-warning border-warning/30",
  Modified: "bg-warning/15 text-warning border-warning/30",
  Reject: "bg-muted text-muted-foreground border-border",
  Rejected: "bg-muted text-muted-foreground border-border",
  Paid: "bg-success/15 text-success border-success/30",
  Overdue: "bg-destructive/15 text-destructive border-destructive/30",
  Due: "bg-warning/15 text-warning border-warning/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("text-[11px] font-medium", statusStyles[status] ?? "", className)}
    >
      {status}
    </Badge>
  );
}
