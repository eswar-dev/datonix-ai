import { Loader2 } from "lucide-react";
import { cn } from "@/common/lib/utils";

interface AdminDataCardProps {
  children: React.ReactNode;
  className?: string;
  /** True while React Query is refetching existing cached data (e.g. after a mutation). */
  isRefetching: boolean;
}

export function AdminDataCard({ children, className, isRefetching }: AdminDataCardProps) {
  return (
    <div className={cn("relative", className)}>
      {isRefetching && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-[inherit] bg-background/60 backdrop-blur-[1px]"
          aria-busy="true"
          aria-live="polite"
        >
          <Loader2 className="h-9 w-9 animate-spin text-accent" aria-hidden />
        </div>
      )}
      {children}
    </div>
  );
}
