import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Progress } from "@/common/components/ui/progress";
import { StatusBadge } from "./StatusBadge";
import type { OrgMember } from "@/domains/aec/data/orgChart";

const utilStatus = (u: number) => (u >= 95 ? "At Risk" : u >= 70 ? "Active" : "Pending");

export function MemberProfilePanel({ member }: { member: OrgMember | null }) {
  if (!member) {
    return (
      <Card className="rounded-card h-full">
        <CardContent className="flex h-full min-h-[280px] items-center justify-center text-sm text-muted-foreground">
          Select a team member to view profile, allocation, and rates.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {member.initials}
          </div>
          <div>
            <CardTitle className="text-base">{member.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{member.title}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={member.type === "IN-HOUSE" ? "Active" : member.type === "CONTRACTOR" ? "Partial" : "Pending"} />
          <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">{member.entity}</span>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-muted-foreground">Cost rate</dt>
            <dd className="font-medium">{member.costRate}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Bill rate</dt>
            <dd className="font-medium">{member.billRate}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-muted-foreground">Allocation</dt>
            <dd className="font-medium">{member.allocation}</dd>
          </div>
        </dl>
        <div>
          <div className="mb-1 flex justify-between text-xs">
            <span className="text-muted-foreground">Utilization</span>
            <span className="font-medium">{member.utilization}%</span>
          </div>
          <Progress value={member.utilization} className="h-2" />
          <div className="mt-1">
            <StatusBadge status={utilStatus(member.utilization)} />
          </div>
        </div>
        <div>
          <p className="mb-1 text-xs font-medium text-muted-foreground">Projects</p>
          <ul className="space-y-1">
            {member.projects.map((p) => (
              <li key={p} className="text-sm">{p}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
