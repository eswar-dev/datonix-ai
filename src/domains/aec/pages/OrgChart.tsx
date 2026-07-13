import { useState } from "react";
import { Network } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { OrgHierarchyTree } from "@/domains/aec/components/OrgHierarchyTree";
import { MemberProfilePanel } from "@/domains/aec/components/MemberProfilePanel";
import { orgChartRoot, orgMemberCount, type OrgMember } from "@/domains/aec/data/orgChart";

export default function OrgChart() {
  const [selected, setSelected] = useState<OrgMember | null>(orgChartRoot.children?.[0]?.children?.[1] ?? null);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Organization Chart"
        subtitle={`Meridian Group hierarchy — ${orgMemberCount} resources across MA, ME, and MC.`}
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Organization Chart" },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Network className="h-4 w-4 text-accent" />
              Hierarchy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrgHierarchyTree root={orgChartRoot} selectedId={selected?.id ?? null} onSelect={setSelected} />
          </CardContent>
        </Card>
        <MemberProfilePanel member={selected} />
      </div>
    </div>
  );
}
