import { Sparkles } from "lucide-react";
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
import type { ProjectDraft } from "@/domains/aec/data/projects";
import { architectRecommendations, pmRecommendations } from "@/domains/aec/data/projects";

interface ProjectFormProps {
  draft: ProjectDraft;
  onChange: (partial: Partial<ProjectDraft>) => void;
}

export function ProjectForm({ draft, onChange }: ProjectFormProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card className="rounded-card">
          <CardHeader>
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
              <Select value={draft.entity} onValueChange={(v) => onChange({ entity: v as ProjectDraft["entity"] })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MA">MA — Meridian Architecture</SelectItem>
                  <SelectItem value="ME">ME — Meridian Engineering</SelectItem>
                  <SelectItem value="MC">MC — Meridian Construction</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <Select value={draft.type} onValueChange={(v) => onChange({ type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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

      <div className="space-y-4">
        <Card className="rounded-card border-accent/20 bg-accent/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Sparkles className="h-4 w-4 text-accent" />
              AI Team Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested PM</p>
              {pmRecommendations.map((r) => (
                <div key={r.name} className="mb-2 rounded-lg border bg-card p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-sm font-semibold text-accent">{r.score}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.rationale}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Suggested Architects</p>
              {architectRecommendations.map((r) => (
                <div key={r.name} className="mb-2 rounded-lg border bg-card p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-sm font-semibold text-accent">{r.score}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{r.role}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.rationale}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
