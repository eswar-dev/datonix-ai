import { AecTag } from "@/domains/aec/components/primitives/AecTag";
import { cn } from "@/common/lib/utils";

function statusVariant(status: string): "success" | "amber" | "danger" | "blue" | "default" {
  const s = status.toLowerCase();
  if (s.includes("live") || s.includes("active") || s.includes("synced") || s.includes("complete")) {
    return "success";
  }
  if (s.includes("pending") || s.includes("progress") || s.includes("warn")) {
    return "amber";
  }
  if (s.includes("error") || s.includes("fail") || s.includes("offline")) {
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
