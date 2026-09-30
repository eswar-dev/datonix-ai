import { useNavigate } from "react-router-dom";
import { GitBranchPlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import { AecButton } from "@/domains/aec/components/primitives";
import { TWINS } from "@/domains/manufacturing/data";
import { cn } from "@/common/lib/utils";

export default function MultiTwinManager() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Multi-Twin Manager"
        subtitle="Create, switch and manage enterprise twins across manufacturing groups."
        actions={
          <AecButton size="sm" onClick={() => navigate("/enterprise-twin")}>
            <Plus className="h-3.5 w-3.5" />
            Create new twin
          </AecButton>
        }
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TWINS.map((twin) => (
          <div
            key={twin.id}
            className={cn(
              "rounded-[9px] border bg-[color:var(--page-card)] p-4",
              twin.active
                ? "border-[color:var(--page-teal)] ring-1 ring-[color:var(--page-teal)]/20"
                : "border-[color:var(--page-border)]",
            )}
          >
            <div className="mb-3 flex items-start gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[color:var(--page-accent)]/10">
                <GitBranchPlus className="h-4 w-4 text-[color:var(--page-accent)]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold">{twin.name}</p>
                <p className="text-[10px] text-[color:var(--page-muted)]">{twin.subtitle}</p>
              </div>
              <StatusBadge status={twin.active ? "Live" : twin.status} />
            </div>
            <div className="mb-3 grid grid-cols-3 gap-1.5">
              {[
                [twin.sites, "Sites"],
                [twin.staff, "Staff"],
                [twin.workOrders, "Work orders"],
              ].map(([v, l]) => (
                <div key={String(l)} className="rounded-md bg-[color:var(--page-card-2)] py-1.5 text-center">
                  <p className="text-[15px] font-bold">{v}</p>
                  <p className="text-[9.5px] text-[color:var(--page-muted)]">{l}</p>
                </div>
              ))}
            </div>
            <AecButton
              className="w-full"
              variant={twin.active ? "primary" : "outline"}
              size="sm"
              onClick={() => {
                toast.success(`${twin.name} is the active twin`);
                navigate("/enterprise-twin");
              }}
            >
              {twin.active ? "Currently active twin" : "Switch to this twin"}
            </AecButton>
          </div>
        ))}
        <button
          type="button"
          onClick={() => navigate("/enterprise-twin")}
          className="flex min-h-[160px] flex-col items-center justify-center rounded-[9px] border border-dashed border-[color:var(--page-border)] bg-[color:var(--page-card)] text-[color:var(--page-muted)] hover:border-[color:var(--page-accent)] hover:text-[color:var(--page-text)]"
        >
          <Plus className="mb-2 h-7 w-7" />
          <p className="text-[12.5px] font-semibold">Create new enterprise twin</p>
          <p className="mt-1 text-[10.5px] text-[color:var(--page-dim)]">Generate from prompt</p>
        </button>
      </div>
    </div>
  );
}
