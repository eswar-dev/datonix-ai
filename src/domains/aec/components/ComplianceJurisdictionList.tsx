import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { AecTag } from "@/domains/aec/components/primitives/AecTag";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  groupRulesByCode,
  ruleListCaption,
  type ComplianceJurisdictionView,
  type ComplianceRuleGroupView,
  type ComplianceRuleView,
} from "@/domains/aec/api/complianceMappers";

interface ComplianceJurisdictionListProps {
  jurisdictions: ComplianceJurisdictionView[];
  onSelectGroup: (group: ComplianceRuleGroupView) => void;
}

function EntityBadges({ codes }: { codes: string[] }) {
  if (codes.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {codes.map((code) => (
        <AecTag key={code} variant="default" className="text-[10px]">
          {code}
        </AecTag>
      ))}
    </div>
  );
}

function RuleRow({
  group,
  entityFallback,
  onSelect,
}: {
  group: ComplianceRuleGroupView;
  entityFallback: string[];
  onSelect: () => void;
}) {
  const entities = group.entityCodes.length > 0 ? group.entityCodes : entityFallback;

  return (
    <button
      type="button"
      onClick={onSelect}
      className="group flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-muted/40"
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <p className="text-sm font-medium leading-snug text-foreground">{group.requirement}</p>
        <p className="text-xs text-muted-foreground">{ruleListCaption(group)}</p>
        <EntityBadges codes={entities} />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={group.status} />
        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </button>
  );
}

function JurisdictionSection({
  jurisdiction,
  defaultOpen = true,
  onSelectGroup,
}: {
  jurisdiction: ComplianceJurisdictionView;
  defaultOpen?: boolean;
  onSelectGroup: (group: ComplianceRuleGroupView) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const groups = groupRulesByCode(jurisdiction.rules);
  const activeCount = groups.filter((g) => /active|enabled|live/i.test(g.status)).length;

  return (
    <section className="overflow-hidden rounded-card border bg-card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-muted/30"
      >
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            !open && "-rotate-90",
          )}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{jurisdiction.label}</p>
          <p className="text-xs text-muted-foreground">
            {groups.length} rule{groups.length === 1 ? "" : "s"} · {activeCount} active
          </p>
        </div>
        {jurisdiction.entityCodes.length > 0 && (
          <div className="hidden shrink-0 sm:block">
            <EntityBadges codes={jurisdiction.entityCodes} />
          </div>
        )}
      </button>

      {open && (
        <div className="border-t divide-y">
          {groups.map((group) => (
            <RuleRow
              key={group.code}
              group={group}
              entityFallback={jurisdiction.entityCodes}
              onSelect={() => {
                const entities =
                  group.entityCodes.length > 0 ? group.entityCodes : jurisdiction.entityCodes;
                onSelectGroup({ ...group, entityCodes: entities });
              }}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function ComplianceJurisdictionList({
  jurisdictions,
  onSelectGroup,
}: ComplianceJurisdictionListProps) {
  return (
    <div className="space-y-3">
      {jurisdictions.map((jurisdiction, index) => (
        <JurisdictionSection
          key={jurisdiction.code}
          jurisdiction={jurisdiction}
          defaultOpen={index < 2}
          onSelectGroup={onSelectGroup}
        />
      ))}
    </div>
  );
}
