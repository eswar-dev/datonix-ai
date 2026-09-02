import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, ShieldCheck } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/common/components/ui/sheet";
import { Button } from "@/common/components/ui/button";
import { AecTag } from "@/domains/aec/components/primitives/AecTag";
import { StatusBadge } from "@/domains/aec/components/StatusBadge";
import {
  modulePathForKey,
  type ComplianceRuleView,
} from "@/domains/aec/api/complianceMappers";

interface ComplianceRuleDetailSheetProps {
  rule: ComplianceRuleView | null;
  entityCodes?: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-1 py-3">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="text-sm text-foreground">{value}</div>
    </div>
  );
}

export function ComplianceRuleDetailSheet({
  rule,
  entityCodes = [],
  open,
  onOpenChange,
}: ComplianceRuleDetailSheetProps) {
  const modulePath = rule ? modulePathForKey(rule.moduleKey) : undefined;
  const entities =
    entityCodes.length > 0 ? entityCodes : rule?.entityCode ? [rule.entityCode] : [];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        {rule ? (
          <>
            <SheetHeader className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0 space-y-1">
                  <SheetTitle className="text-base font-semibold leading-snug">
                    {rule.requirement}
                  </SheetTitle>
                  <SheetDescription className="font-mono text-[11px] text-muted-foreground">
                    {rule.code}
                  </SheetDescription>
                </div>
              </div>
              <StatusBadge status={rule.status} />
            </SheetHeader>

            <div className="mt-2 divide-y rounded-lg border bg-muted/20 px-4">
              <DetailRow label="Jurisdiction" value={rule.jurisdiction} />
              <DetailRow
                label="Entities"
                value={
                  entities.length > 0 ? (
                    <span className="inline-flex flex-wrap gap-1.5">
                      {entities.map((code) => (
                        <AecTag key={code} variant="default">
                          {code}
                        </AecTag>
                      ))}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">All entities in jurisdiction</span>
                  )
                }
              />
              <DetailRow label="Description" value={rule.description || "—"} />
              <DetailRow
                label="Application"
                value={rule.autoApply ? "Auto-applied when active" : "Manual"}
              />
              <DetailRow label="Module" value={rule.moduleLabel} />
              <DetailRow label="Applies to" value={rule.enforcement} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {modulePath ? (
                <Button size="sm" asChild>
                  <Link to={modulePath} onClick={() => onOpenChange(false)}>
                    Open {rule.moduleLabel}
                    <ExternalLink className="ml-2 h-3.5 w-3.5" />
                  </Link>
                </Button>
              ) : null}
              <Button variant="outline" size="sm" asChild>
                <Link to="/enterprise-twin" onClick={() => onOpenChange(false)}>
                  Enterprise Twin
                </Link>
              </Button>
            </div>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
