import { cn } from "@/common/lib/utils";
import { Card } from "@/common/components/ui/card";
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
            className={cn("text-left", selected && "ring-2 ring-accent ring-offset-2 rounded-card")}
          >
            <Card className={cn("rounded-card p-4 h-full", selected && "border-accent bg-accent/5")}>
              <Icon className={cn("mb-2 h-5 w-5", selected ? "text-accent" : "text-muted-foreground")} />
              <p className="font-medium text-sm">{opt.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{opt.description}</p>
            </Card>
          </button>
        );
      })}
    </div>
  );
}
