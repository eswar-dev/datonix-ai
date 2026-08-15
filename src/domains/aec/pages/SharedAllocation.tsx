import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/common/components/ui/button";
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
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { CrossEntityAllocationTable } from "@/domains/aec/components/CrossEntityAllocationTable";
import {
  PipelineEmptyState,
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { aecCreateAllocation, aecUpdateAllocation } from "@/common/api/aecResources";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import { toast } from "sonner";

export default function SharedAllocation() {
  const {
    allocations,
    loadAllocations,
    resourcesLoading,
    activeTwin,
    activeTwinId,
    resources,
    projects,
  } = useAecApp();
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    resourceId: "",
    projectId: "",
    billingOrganizationId: "",
    allocationPct: "50",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
  });

  useEffect(() => {
    void loadAllocations();
  }, [loadAllocations]);

  const loading = resourcesLoading && !allocations.length;

  const submitAllocation = async () => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) return;
    if (!form.resourceId || !form.projectId || !form.billingOrganizationId) {
      toast.error("Select resource, project, and billing entity");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await aecCreateAllocation(activeTwinId, {
        resourceId: form.resourceId,
        projectId: form.projectId,
        billingOrganizationId: form.billingOrganizationId,
        allocationPct: Number(form.allocationPct),
        startDate: form.startDate,
        ...(form.endDate ? { endDate: form.endDate } : {}),
      });
      toast.success("Allocation created");
      setShowForm(false);
      await loadAllocations();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Create failed";
      setError(msg);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  };

  const updatePct = async (allocationId: string, pct: number) => {
    if (!activeTwinId || !isApiTwinId(activeTwinId)) return;
    try {
      await aecUpdateAllocation(activeTwinId, allocationId, { allocationPct: pct });
      toast.success("Allocation updated");
      await loadAllocations();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Shared Allocation"
        subtitle="Cross-entity resource sharing and cost split from live allocations."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Shared Allocation" },
        ]}
        actions={
          <Button size="sm" onClick={() => setShowForm((v) => !v)}>
            <Plus className="mr-2 h-4 w-4" />
            New Allocation
          </Button>
        }
      />

      <Card className="rounded-card border-accent/20 bg-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cost Split Explanation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            When a resource from one entity works on another entity&apos;s project, costs are split
            based on allocation percentage. The home entity retains overhead; the host entity bears
            project delivery cost.
          </p>
          <p className="font-medium text-foreground">
            Reporting currency: {activeTwin.reportingCurrency || "GBP"}
          </p>
        </CardContent>
      </Card>

      {showForm && (
        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Create allocation</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Resource</Label>
              <Select
                value={form.resourceId}
                onValueChange={(v) => setForm((f) => ({ ...f, resourceId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select resource" />
                </SelectTrigger>
                <SelectContent>
                  {resources.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name} ({r.entity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Project</Label>
              <Select
                value={form.projectId}
                onValueChange={(v) => setForm((f) => ({ ...f, projectId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Billing entity</Label>
              <Select
                value={form.billingOrganizationId}
                onValueChange={(v) => setForm((f) => ({ ...f, billingOrganizationId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Billing org" />
                </SelectTrigger>
                <SelectContent>
                  {activeTwin.entities.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.code} — {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Allocation %</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={form.allocationPct}
                onChange={(e) => setForm((f) => ({ ...f, allocationPct: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>End date (optional)</Label>
              <Input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </div>
            <div className="flex items-end gap-2 sm:col-span-2">
              <Button onClick={() => void submitAllocation()} disabled={busy}>
                Save
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading && <PipelineLoadingBanner label="Loading allocations…" />}
      <PipelineErrorBanner message={error ?? ""} />

      {!loading && !allocations.length ? (
        <PipelineEmptyState>No cross-entity allocations for this twin.</PipelineEmptyState>
      ) : (
        <CrossEntityAllocationTable rows={allocations} onUpdatePct={updatePct} />
      )}
    </div>
  );
}
