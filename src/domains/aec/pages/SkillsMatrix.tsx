import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import {
  ratingBadgeClass,
  skillCategoryCards,
  skillColumnGroups,
  skillMatrixPeople,
  skillRatingLegend,
} from "@/domains/aec/data/skillsMatrixMock";
import { cn } from "@/common/lib/utils";

function utilClass(pct: number): string {
  if (pct >= 85) return "text-destructive font-semibold";
  if (pct >= 70) return "text-amber-700 font-medium";
  return "text-teal-700 font-medium";
}

function typeBadge(type: string) {
  if (type === "CONTRACTOR") return "border-amber-500/30 bg-amber-500/10 text-amber-800";
  if (type === "FREELANCER") return "border-violet-500/30 bg-violet-500/10 text-violet-800";
  return "border-sky-500/30 bg-sky-500/10 text-sky-800";
}

export default function SkillsMatrix() {
  const allColumns = skillColumnGroups.flatMap((g) => g.columns);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Skills Matrix"
        subtitle="Auto-generated skill categories by company type · Resource coverage and utilisation"
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Skills Matrix" },
        ]}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {skillCategoryCards.map((card) => (
          <Card key={card.id} className="rounded-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{card.title}</CardTitle>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{card.entityCode}</span>
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Skill</TableHead>
                    <TableHead className="text-right">Resources</TableHead>
                    <TableHead className="text-right">Available</TableHead>
                    <TableHead className="text-right">Util%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {card.skills.map((sk) => (
                    <TableRow key={sk.name}>
                      <TableCell className="font-medium">{sk.name}</TableCell>
                      <TableCell className="text-right">{sk.resources}</TableCell>
                      <TableCell className="text-right">{sk.available}</TableCell>
                      <TableCell className={cn("text-right", utilClass(sk.utilPct))}>
                        {sk.utilPct}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-base">Individual Skill Ratings</CardTitle>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {skillRatingLegend.map((l) => (
                <span
                  key={l.rating}
                  className={cn(
                    "inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-semibold",
                    ratingBadgeClass(l.rating)
                  )}
                >
                  {l.rating} · {l.label}
                </span>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2} className="align-bottom min-w-[180px]">
                  Resource
                </TableHead>
                {skillColumnGroups.map((g) => (
                  <TableHead
                    key={g.id}
                    colSpan={g.columns.length}
                    className="text-center border-l"
                  >
                    {g.label}
                  </TableHead>
                ))}
              </TableRow>
              <TableRow>
                {allColumns.map((col) => (
                  <TableHead key={col} className="text-center text-xs font-normal min-w-[64px]">
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {skillMatrixPeople.map((person) => (
                <TableRow key={person.id}>
                  <TableCell>
                    <div className="font-medium">{person.name}</div>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <span>{person.role}</span>
                      <Badge variant="outline" className={`text-[9px] ${typeBadge(person.employmentType)}`}>
                        {person.employmentType === "IN-HOUSE" ? "In-House" : person.employmentType === "CONTRACTOR" ? "Con" : "Fre"}
                      </Badge>
                    </div>
                  </TableCell>
                  {allColumns.map((col) => {
                    const rating = person.ratings[col];
                    return (
                      <TableCell key={col} className="text-center p-1">
                        {rating == null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={cn(
                              "inline-flex h-7 w-7 items-center justify-center rounded border text-xs font-bold",
                              ratingBadgeClass(rating)
                            )}
                          >
                            {rating}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
