import { Sparkles, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import type { ProjectDraft, StaffRecommendation } from "@/domains/aec/data/projects";
import type { TwinEntity } from "@/domains/aec/data/meridian";

interface ProjectFormProps {
  draft: ProjectDraft;
  onChange: (partial: Partial<ProjectDraft>) => void;
  entities?: TwinEntity[];
  recommendations?: StaffRecommendation[];
  recommendationsLoading?: boolean;
}

export function ProjectForm({
  draft,
  onChange,
  entities = [],
  recommendations = [],
  recommendationsLoading = false,
}: ProjectFormProps) {
  const pmRecs = recommendations.filter((r) => /manager|pm/i.test(r.role));
  const otherRecs = recommendations.filter((r) => !/manager|pm/i.test(r.role));

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Project Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Project Name</Label>
              <Input id="name" value={draft.name} onChange={(e) => onChange({ name: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client">Client</Label>
              <Input id="client" value={draft.client} onChange={(e) => onChange({ client: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Entity</Label>
              <Select
                value={draft.entity || undefined}
                onValueChange={(v) => {
                  const match = entities.find((e) => e.code === v);
                  onChange({
                    entity: v,
                    entityId: match?.id,
                    currency: match?.currency || draft.currency,
                  });
                }}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select entity" /></SelectTrigger>
                <SelectContent>
                  {entities.length ? (
                    entities.map((e) => (
                      <SelectItem key={e.id || e.code} value={e.code}>
                        {e.code} — {e.name}
                      </SelectItem>
                    ))
                  ) : draft.entity ? (
                    <SelectItem value={draft.entity}>{draft.entity}</SelectItem>
                  ) : (
                    <SelectItem value="__none" disabled>
                      No entities on this twin
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={draft.type} onValueChange={(v) => onChange({ type: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Commercial", "Residential", "Mixed Use", "Healthcare", "Industrial", "Civic", "Education"].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Billing Type</Label>
              <Select value={draft.billingType} onValueChange={(v) => onChange({ billingType: v as ProjectDraft["billingType"] })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lump Sum">Lump Sum</SelectItem>
                  <SelectItem value="Milestone">Milestone</SelectItem>
                  <SelectItem value="T&M">T&M</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={draft.currency} onValueChange={(v) => onChange({ currency: v })}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="AED">AED</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input
                id="budget"
                type="number"
                value={draft.budget || ""}
                onChange={(e) => onChange({ budget: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="start">Start Date</Label>
              <Input id="start" type="date" value={draft.startDate} onChange={(e) => onChange({ startDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end">End Date</Label>
              <Input id="end" type="date" value={draft.endDate} onChange={(e) => onChange({ endDate: e.target.value })} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4 lg:sticky lg:top-4">
        <Card className="rounded-card border-accent/20 bg-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-accent" />
              AI Team Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recommendationsLoading ? (
              <div className="flex items-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : !recommendations.length ? (
              <p className="py-2 text-sm text-muted-foreground">
                No recommendations yet. Select type/entity or ensure resources exist on this twin.
              </p>
            ) : (
              <>
                {pmRecs.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested PM</p>
                    {pmRecs.map((r) => (
                      <button
                        key={`${r.name}-${r.role}`}
                        type="button"
                        className="mb-2 w-full rounded-lg border bg-card p-3 text-left transition-colors hover:bg-muted/40"
                        onClick={() => onChange({ projectManager: r.name })}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium">{r.name}</span>
                          <span className="shrink-0 text-sm font-semibold tabular-nums text-accent">{r.score}</span>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">{r.role}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{r.rationale}</p>
                      </button>
                    ))}
                  </div>
                )}
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {pmRecs.length ? "Suggested Team" : "Suggested Resources"}
                  </p>
                  {(otherRecs.length ? otherRecs : recommendations).map((r) => (
                    <div key={`${r.name}-${r.role}`} className="mb-2 rounded-lg border bg-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium">{r.name}</span>
                        <span className="shrink-0 text-sm font-semibold tabular-nums text-accent">{r.score}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">{r.role}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{r.rationale}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
