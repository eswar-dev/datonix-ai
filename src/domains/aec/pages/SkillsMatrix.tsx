import { useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
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

function ratingColor(r: number) {
  if (r >= 4) return "text-success font-semibold";
  if (r >= 3) return "text-accent";
  return "text-muted-foreground";
}

export default function SkillsMatrix() {
  const { skillsMatrix, loadSkillsMatrix, resourcesLoading } = useAecApp();

  useEffect(() => {
    void loadSkillsMatrix();
  }, [loadSkillsMatrix]);

  const skillColumns = useMemo(() => {
    const names = new Set<string>();
    for (const person of skillsMatrix?.individuals ?? []) {
      for (const s of person.skills) names.add(s.name);
    }
    return [...names];
  }, [skillsMatrix]);

  const loading = resourcesLoading && !skillsMatrix;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Skills Matrix"
        subtitle="Entity skill coverage and individual ratings from the twin API."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Skills Matrix" },
        ]}
      />

      {loading && <PipelineLoadingBanner label="Loading skills…" />}

      {!loading && !skillsMatrix?.byEntity.length && !skillsMatrix?.individuals.length ? (
        <PipelineEmptyState>No skills data for this twin yet.</PipelineEmptyState>
      ) : null}

      {(skillsMatrix?.byEntity ?? []).map((table) => (
        <Card key={table.entity} className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{table.entity}</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill</TableHead>
                  <TableHead className="text-right">Coverage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.skills.length ? (
                  table.skills.map((skill) => (
                    <TableRow key={skill}>
                      <TableCell className="font-medium">{skill}</TableCell>
                      <TableCell className="text-right tabular-nums">{table.coverage}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-muted-foreground">
                      No skills tagged for this entity.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}

      {(skillsMatrix?.individuals.length ?? 0) > 0 && (
        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Individual Skill Ratings (1–5)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Role</TableHead>
                  {skillColumns.map((name) => (
                    <TableHead key={name} className="text-center">{name}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {skillsMatrix!.individuals.map((person) => {
                  const byName = new Map(person.skills.map((s) => [s.name, s.rating]));
                  return (
                    <TableRow key={`${person.name}-${person.entity}`}>
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>{person.entity}</TableCell>
                      <TableCell className="text-muted-foreground">{person.role}</TableCell>
                      {skillColumns.map((name) => {
                        const rating = byName.get(name);
                        return (
                          <TableCell key={name} className={cn("text-center tabular-nums", rating != null && ratingColor(rating))}>
                            {rating ?? "—"}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
