import { cn } from "@/common/lib/utils";
import { Building2, HardHat, User } from "lucide-react";
import type { ResourceType } from "@/domains/aec/data/orgChart";

const options: { type: ResourceType; label: string; description: string; icon: typeof User }[] = [
  { type: "IN-HOUSE", label: "In-House Employee", description: "Salary, benefits, full-time allocation", icon: User },
  { type: "CONTRACTOR", label: "Contractor", description: "Daily rate, framework agreement, expiry tracking", icon: HardHat },
  { type: "FREELANCER", label: "Freelancer", description: "Hourly rate, ad-hoc engagement", icon: Building2 },
];

export function ResourceTypeSelector({
  value,
  onChange,
}: {
  value: ResourceType;
  onChange: (type: ResourceType) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.type;
        return (
          <button
            key={opt.type}
            type="button"
            onClick={() => onChange(opt.type)}
            aria-pressed={selected}
            className={cn(
              "relative h-full rounded-[9px] border p-4 text-left transition-colors",
              selected
                ? "border-[color:var(--page-accent)] bg-[color:var(--page-accent)]/8"
                : "border-[color:var(--page-border)] bg-[color:var(--page-card)] hover:border-[color:var(--page-muted)]/50 hover:bg-[color:var(--page-row-hover)]",
            )}
          >
            {selected && (
              <span className="absolute inset-x-0 top-0 h-0.5 rounded-t-[9px] bg-[color:var(--page-accent)]" />
            )}
            <Icon
              className={cn(
                "mb-2 h-5 w-5",
                selected ? "text-[color:var(--page-accent)]" : "text-[color:var(--page-muted)]",
              )}
            />
            <p className="text-sm font-semibold text-[color:var(--page-text)]">{opt.label}</p>
            <p className="mt-1 text-xs text-[color:var(--page-muted)]">{opt.description}</p>
          </button>
        );
      })}
    </div>
  );
}
