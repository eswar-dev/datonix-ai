import { useEffect, useMemo } from "react";
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
  PipelineEmptyState,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { cn } from "@/common/lib/utils";
import { Button } from "@/common/components/ui/button";

function ratingBadgeClass(rating: number): string {
  if (rating >= 5) return "border-teal-500/40 bg-teal-500/10 text-teal-800";
  if (rating >= 4) return "border-sky-500/40 bg-sky-500/10 text-sky-800";
  if (rating >= 3) return "border-amber-500/40 bg-amber-500/10 text-amber-800";
  return "border-muted-foreground/30 bg-muted text-muted-foreground";
}

export default function SkillsMatrix() {
  const { skillsMatrix, loadSkillsMatrix, resourcesLoading } = useAecApp();

  useEffect(() => {
    void loadSkillsMatrix();
  }, [loadSkillsMatrix]);

  const skillColumns = useMemo(() => {
    if (!skillsMatrix) return [] as string[];
    const set = new Set<string>();
    for (const person of skillsMatrix.individuals) {
      for (const sk of person.skills) set.add(sk.name);
    }
    for (const ent of skillsMatrix.byEntity) {
      for (const sk of ent.skills) set.add(sk);
    }
    return [...set].sort();
  }, [skillsMatrix]);

  const loading = resourcesLoading && !skillsMatrix;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Skills Matrix"
        subtitle="Skill coverage by entity and individual ratings from the twin API."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Skills Matrix" },
        ]}
        actions={
          <Button size="sm" variant="outline" onClick={() => void loadSkillsMatrix()}>
            Refresh
          </Button>
        }
      />

      {loading && <PipelineLoadingBanner label="Loading skills…" />}

      {!loading && !skillsMatrix ? (
        <PipelineEmptyState>No skills data for this twin yet.</PipelineEmptyState>
      ) : skillsMatrix ? (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            {skillsMatrix.byEntity.map((card) => (
              <Card key={card.entity} className="rounded-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-base">{card.entity || "Entity"}</CardTitle>
                    <Badge variant="outline">{card.coverage}% coverage</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1.5">
                    {card.skills.length ? (
                      card.skills.map((sk) => (
                        <span
                          key={sk}
                          className="rounded bg-muted px-2 py-0.5 text-xs font-medium"
                        >
                          {sk}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No skills listed</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Individual Skill Ratings</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {!skillsMatrix.individuals.length ? (
                <div className="p-6">
                  <PipelineEmptyState>No individual skill ratings.</PipelineEmptyState>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Resource</TableHead>
                      {skillColumns.map((col) => (
                        <TableHead key={col} className="text-center text-xs min-w-[64px]">
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {skillsMatrix.individuals.map((person) => {
                      const byName = new Map(person.skills.map((s) => [s.name, s.rating]));
                      return (
                        <TableRow key={`${person.name}-${person.entity}`}>
                          <TableCell>
                            <div className="font-medium">{person.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {person.role}
                              {person.entity ? ` · ${person.entity}` : ""}
                            </div>
                          </TableCell>
                          {skillColumns.map((col) => {
                            const rating = byName.get(col);
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
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
