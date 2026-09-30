import { AecTag } from "@/domains/aec/components/primitives/AecTag";
import { cn } from "@/common/lib/utils";

function statusVariant(status: string): "success" | "amber" | "danger" | "blue" | "default" {
  const s = status.toLowerCase();
  if (s.includes("live") || s.includes("active") || s.includes("synced") || s.includes("complete") || s.includes("good") || s.includes("compliant") || s.includes("certified") || s === "ok") {
    return "success";
  }
  if (s.includes("pending") || s.includes("progress") || s.includes("warn") || s.includes("watch") || s.includes("partial") || s.includes("configur") || s.includes("review") || s.includes("open") || s.includes("low")) {
    return "amber";
  }
  if (s.includes("error") || s.includes("fail") || s.includes("offline") || s.includes("critical") || s.includes("blocked") || s.includes("overdue")) {
    return "danger";
  }
  if (s.includes("draft") || s.includes("new")) {
    return "blue";
  }
  return "default";
}

export function StatusBadge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <AecTag variant={statusVariant(status)} className={cn(className)}>
      {status}
    </AecTag>
  );
}
