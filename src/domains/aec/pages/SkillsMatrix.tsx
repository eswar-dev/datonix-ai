import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import {
  mapSkillReviewQueue,
  mapSkillsFullMatrix,
  mapSkillsOverview,
  type SkillReviewItem,
  type SkillsFullMatrixView,
  type SkillsOverviewView,
} from "@/domains/aec/api/resourcesMappers";
import {
  aecApproveSkillReview,
  aecRejectSkillReview,
  aecSkillReviewQueue,
  aecSkillsFullMatrix,
  aecSkillsMatrix,
  aecSkillsOverview,
  aecUpdateResourceSkills,
} from "@/common/api/aecResources";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import { cn } from "@/common/lib/utils";
import { toast } from "sonner";

function ratingBadgeClass(rating: number): string {
  if (rating >= 5) return "border-teal-500/40 bg-teal-500/10 text-teal-800";
  if (rating >= 4) return "border-sky-500/40 bg-sky-500/10 text-sky-800";
  if (rating >= 3) return "border-amber-500/40 bg-amber-500/10 text-amber-800";
  return "border-muted-foreground/30 bg-muted text-muted-foreground";
}

export default function SkillsMatrix() {
  const { skillsMatrix, loadSkillsMatrix, resourcesLoading, activeTwinId } = useAecApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [overview, setOverview] = useState<SkillsOverviewView | null>(null);
  const [fullMatrix, setFullMatrix] = useState<SkillsFullMatrixView | null>(null);
  const [reviews, setReviews] = useState<SkillReviewItem[]>([]);

  const reloadExtended = useCallback(async () => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) return;
    setLoading(true);
    setError(null);
    try {
      const [overviewRaw, matrixRaw, reviewRaw] = await Promise.all([
        aecSkillsOverview(activeTwinId),
        aecSkillsFullMatrix(activeTwinId),
        aecSkillReviewQueue(activeTwinId),
      ]);
      setOverview(mapSkillsOverview(overviewRaw));
      setFullMatrix(mapSkillsFullMatrix(matrixRaw));
      setReviews(mapSkillReviewQueue(reviewRaw));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load skills");
    } finally {
      setLoading(false);
    }
  }, [activeTwinId]);

  useEffect(() => {
    void loadSkillsMatrix();
    void reloadExtended();
  }, [loadSkillsMatrix, reloadExtended]);

  const allColumns = useMemo(() => {
    if (!fullMatrix) return [];
    return fullMatrix.groups.flatMap((g) => g.columns);
  }, [fullMatrix]);

  const onRatingChange = async (
    resourceId: string,
    skillId: string,
    rating: number
  ) => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) return;
    try {
      await aecUpdateResourceSkills(activeTwinId, resourceId, {
        skills: [{ skillId, rating }],
      });
      toast.success("Skill rating updated");
      await reloadExtended();
      await loadSkillsMatrix();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  const onApproveReview = async (review: SkillReviewItem) => {
    if (!activeTwinId || !isApiTwinId(activeTwinId) || !review.matchedSkillId) {
      toast.error("No matched skill — cannot approve");
      return;
    }
    try {
      await aecApproveSkillReview(activeTwinId, review.id, {
        matchedSkillId: review.matchedSkillId,
        rating: review.suggestedRating,
      });
      toast.success("Skill review approved");
      await reloadExtended();
      await loadSkillsMatrix();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Approve failed");
    }
  };

  const onRejectReview = async (reviewId: string) => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) return;
    try {
      await aecRejectSkillReview(activeTwinId, reviewId);
      toast.success("Skill review rejected");
      await reloadExtended();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Reject failed");
    }
  };

  const legacyColumns = useMemo(() => {
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

  const busy = (resourcesLoading || loading) && !overview && !skillsMatrix;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Skills Matrix"
        subtitle="Overview, rating grid, and review queue from live twin APIs."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Skills Matrix" },
        ]}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void loadSkillsMatrix();
              void reloadExtended();
            }}
          >
            Refresh
          </Button>
        }
      />

      {busy && <PipelineLoadingBanner label="Loading skills…" />}
      <PipelineErrorBanner message={error ?? ""} />

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="matrix">Rating Matrix</TabsTrigger>
          <TabsTrigger value="review">Review Queue ({reviews.length})</TabsTrigger>
          <TabsTrigger value="legacy">Simple View</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {!overview?.categories.length ? (
            <PipelineEmptyState>No skill categories yet.</PipelineEmptyState>
          ) : (
            <div className="grid gap-4 lg:grid-cols-3">
              {overview.categories.map((cat) => (
                <Card key={cat.id} className="rounded-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{cat.title}</CardTitle>
                    {cat.entityCode && (
                      <Badge variant="outline" className="w-fit">
                        {cat.entityCode}
                      </Badge>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {cat.skills.map((sk) => (
                      <div key={sk.skillId} className="flex items-center justify-between text-sm">
                        <span>{sk.name}</span>
                        <span className="text-muted-foreground">
                          {sk.resources} res · {sk.available} avail · {sk.utilPct}% util
                        </span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <Card className="rounded-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Full Rating Matrix</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {!fullMatrix?.people.length ? (
                <div className="p-6">
                  <PipelineEmptyState>No matrix data yet.</PipelineEmptyState>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[180px]">Resource</TableHead>
                      {allColumns.map((col) => (
                        <TableHead key={col.key} className="text-center text-xs min-w-[72px]">
                          {col.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fullMatrix.people.map((person) => (
                      <TableRow key={person.resourceId}>
                        <TableCell>
                          <div className="font-medium">{person.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {person.role} · {person.entityCode}
                          </div>
                        </TableCell>
                        {allColumns.map((col) => {
                          const rating = person.ratings[col.key];
                          return (
                            <TableCell key={col.key} className="text-center p-1">
                              {rating == null ? (
                                <Select
                                  onValueChange={(v) =>
                                    void onRatingChange(person.resourceId, col.skillId, Number(v))
                                  }
                                >
                                  <SelectTrigger className="h-7 w-12 mx-auto border-dashed">
                                    <span className="text-muted-foreground">—</span>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <SelectItem key={n} value={String(n)}>
                                        {n}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <Select
                                  value={String(rating)}
                                  onValueChange={(v) =>
                                    void onRatingChange(person.resourceId, col.skillId, Number(v))
                                  }
                                >
                                  <SelectTrigger className="h-7 w-12 mx-auto p-0 border-0">
                                    <span
                                      className={cn(
                                        "inline-flex h-7 w-7 items-center justify-center rounded border text-xs font-bold",
                                        ratingBadgeClass(rating)
                                      )}
                                    >
                                      {rating}
                                    </span>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {[1, 2, 3, 4, 5].map((n) => (
                                      <SelectItem key={n} value={String(n)}>
                                        {n}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="review" className="mt-4">
          <Card className="rounded-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pending Skill Reviews</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto p-0">
              {reviews.length === 0 ? (
                <div className="p-6">
                  <PipelineEmptyState>No pending skill reviews.</PipelineEmptyState>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Skill</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead className="text-right">Rating</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="font-medium">{r.resourceName}</TableCell>
                        <TableCell>{r.skillName}</TableCell>
                        <TableCell className="text-muted-foreground">{r.source}</TableCell>
                        <TableCell className="text-right">{r.suggestedRating}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void onRejectReview(r.id)}
                            >
                              Reject
                            </Button>
                            <Button size="sm" onClick={() => void onApproveReview(r)}>
                              Approve
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="legacy" className="mt-4 space-y-4">
          {!skillsMatrix ? (
            <PipelineEmptyState>No simple skills data.</PipelineEmptyState>
          ) : (
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
                        {card.skills.map((sk) => (
                          <span
                            key={sk}
                            className="rounded bg-muted px-2 py-0.5 text-xs font-medium"
                          >
                            {sk}
                          </span>
                        ))}
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
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Resource</TableHead>
                        {legacyColumns.map((col) => (
                          <TableHead key={col} className="text-center text-xs">
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
                              <div className="text-xs text-muted-foreground">{person.role}</div>
                            </TableCell>
                            {legacyColumns.map((col) => {
                              const rating = byName.get(col);
                              return (
                                <TableCell key={col} className="text-center">
                                  {rating == null ? "—" : rating}
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
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
