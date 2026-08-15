import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
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
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { RateCardTable } from "@/domains/aec/components/RateCardTable";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import {
  PipelineEmptyState,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import { aecUpdateRateCard } from "@/common/api/aecResources";
import { isApiTwinId } from "@/domains/aec/api/pipelineCache";
import type { RateCardRow } from "@/domains/aec/data/rateCards";

export default function RateCards() {
  const {
    rateCards,
    resources,
    activeTwinId,
    loadRateCards,
    rateCardPendingRevisions,
    loadRateCardPendingRevisions,
    approveRateCard,
    createRateCardRevision,
    loadRateCardSummary,
    rateCardExpiry,
    loadRateCardExpiry,
    loadRateCardHistory,
    resourcesLoading,
    refreshResources,
  } = useAecApp();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyRows, setHistoryRows] = useState<Record<string, unknown>[]>([]);
  const [historyTitle, setHistoryTitle] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ hourlyCostRate: "", hourlyBillingRate: "", notes: "" });
  const [summary, setSummary] = useState<{
    inHouseRateCards: number;
    contractorRateCards: number;
    freelancerRateCards: number;
    pendingRevisions: number;
  } | null>(null);
  const [form, setForm] = useState({
    resourceId: "",
    effectiveDate: new Date().toISOString().slice(0, 10),
    hourlyCostRate: "",
    hourlyBillingRate: "",
    notes: "",
  });

  useEffect(() => {
    void loadRateCards();
    void loadRateCardPendingRevisions();
    void loadRateCardExpiry();
    void refreshResources();
    void loadRateCardSummary().then(setSummary);
  }, [loadRateCards, loadRateCardPendingRevisions, loadRateCardExpiry, refreshResources, loadRateCardSummary]);

  const rows: RateCardRow[] = useMemo(
    () =>
      rateCards.map((c) => ({
        id: c.id,
        role: c.role,
        entity: c.entity,
        type: c.type,
        costRate: c.costRate,
        billRate: c.billRate,
        effectiveFrom: c.effectiveFrom,
        status: /pending/i.test(c.status) ? "Pending" : /expir/i.test(c.status) ? "Expired" : "Active",
      })),
    [rateCards]
  );

  const inHouse = rows.filter((r) => r.type === "IN-HOUSE");
  const contractor = rows.filter((r) => r.type !== "IN-HOUSE");
  const loading = resourcesLoading && !rateCards.length;

  const onApprove = async (id: string) => {
    setBusyId(id);
    try {
      await approveRateCard(id);
      toast.success("Rate card approved");
      setSummary(await loadRateCardSummary());
    } catch {
      /* toasted */
    } finally {
      setBusyId(null);
    }
  };

  const onCreate = async () => {
    if (!form.resourceId || !form.effectiveDate) {
      toast.error("Resource and effective date are required");
      return;
    }
    setBusyId("create");
    try {
      await createRateCardRevision({
        resourceId: form.resourceId,
        effectiveDate: form.effectiveDate,
        hourlyCostRate: form.hourlyCostRate ? Number(form.hourlyCostRate) : undefined,
        hourlyBillingRate: form.hourlyBillingRate ? Number(form.hourlyBillingRate) : undefined,
        notes: form.notes || undefined,
      });
      toast.success("Rate card revision created");
      setShowCreate(false);
      setSummary(await loadRateCardSummary());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Create failed");
    } finally {
      setBusyId(null);
    }
  };

  const openHistory = async (resourceId: string, name: string) => {
    setHistoryTitle(name);
    setHistoryOpen(true);
    setHistoryRows((await loadRateCardHistory(resourceId)) as Record<string, unknown>[]);
  };

  const saveEdit = async () => {
    if (!editId || !activeTwinId || !isApiTwinId(activeTwinId)) return;
    setBusyId(editId);
    try {
      const body: Record<string, unknown> = {};
      if (editForm.hourlyCostRate) body.hourlyCostRate = Number(editForm.hourlyCostRate);
      if (editForm.hourlyBillingRate) body.hourlyBillingRate = Number(editForm.hourlyBillingRate);
      if (editForm.notes) body.notes = editForm.notes;
      await aecUpdateRateCard(activeTwinId, editId, body);
      await Promise.all([loadRateCards(), loadRateCardPendingRevisions()]);
      toast.success("Rate card updated");
      setEditId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Rate Cards"
        subtitle="Live cost and bill rates · Revisions, approvals, history, and expiry."
        breadcrumb={[{ label: "Resources", href: "/resources/planning" }, { label: "Rate Cards" }]}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { void loadRateCards(); void loadRateCardPendingRevisions(); void loadRateCardExpiry(); void loadRateCardSummary().then(setSummary); }}>Refresh</Button>
            <Button size="sm" onClick={() => setShowCreate((v) => !v)}>New Revision</Button>
          </div>
        }
      />

      {loading && <PipelineLoadingBanner label="Loading rate cards…" />}

      {summary && (
        <MetricStrip metrics={[
          { label: "In-house", value: String(summary.inHouseRateCards) },
          { label: "Contractor", value: String(summary.contractorRateCards) },
          { label: "Freelancer", value: String(summary.freelancerRateCards) },
          { label: "Pending revisions", value: String(summary.pendingRevisions) },
        ]} />
      )}

      {showCreate && (
        <Card className="rounded-card">
          <CardHeader className="pb-3"><CardTitle className="text-base">Create rate card revision</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Resource</Label>
              <Select value={form.resourceId} onValueChange={(v) => setForm((f) => ({ ...f, resourceId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select resource" /></SelectTrigger>
                <SelectContent>
                  {resources.map((r) => (
                    <SelectItem key={r.resourceId || r.id} value={r.resourceId || r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Effective date</Label>
              <Input type="date" value={form.effectiveDate} onChange={(e) => setForm((f) => ({ ...f, effectiveDate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Hourly cost</Label>
              <Input type="number" value={form.hourlyCostRate} onChange={(e) => setForm((f) => ({ ...f, hourlyCostRate: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Hourly bill</Label>
              <Input type="number" value={form.hourlyBillingRate} onChange={(e) => setForm((f) => ({ ...f, hourlyBillingRate: e.target.value }))} />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => void onCreate()} disabled={busyId === "create"}>Create</Button>
              <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {rateCardExpiry.length > 0 && (
        <Card className="rounded-card">
          <CardHeader className="pb-3"><CardTitle className="text-base">Expiring contracts ({rateCardExpiry.length})</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Resource</TableHead><TableHead>Contract end</TableHead><TableHead className="text-right">Days left</TableHead></TableRow></TableHeader>
              <TableBody>
                {rateCardExpiry.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.resourceName}</TableCell>
                    <TableCell>{row.contractEndDate}</TableCell>
                    <TableCell className="text-right">{row.daysRemaining}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {rateCardPendingRevisions.length > 0 && (
        <Card className="rounded-card">
          <CardHeader className="pb-3"><CardTitle className="text-base">Pending revisions ({rateCardPendingRevisions.length})</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader><TableRow><TableHead>Resource</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {rateCardPendingRevisions.map((rev) => (
                  <TableRow key={rev.id}>
                    <TableCell className="font-medium">{rev.resourceName}</TableCell>
                    <TableCell className="text-muted-foreground">{rev.fromValue}</TableCell>
                    <TableCell>{rev.toValue}</TableCell>
                    <TableCell>{rev.status}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="sm" variant="outline" onClick={() => void openHistory(rev.resourceId, rev.resourceName)}>History</Button>
                        <Button size="sm" variant="outline" onClick={() => { setEditId(rev.id); setEditForm({ hourlyCostRate: "", hourlyBillingRate: "", notes: "" }); }}>Edit</Button>
                        <Button size="sm" disabled={busyId === rev.id} onClick={() => void onApprove(rev.id)}>Approve</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {!loading && !rows.length ? (
        <PipelineEmptyState>No rate cards for this twin yet.</PipelineEmptyState>
      ) : (
        <Tabs defaultValue="in-house">
          <TabsList>
            <TabsTrigger value="in-house">In-House ({inHouse.length})</TabsTrigger>
            <TabsTrigger value="contractor">Contractor / Freelancer ({contractor.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="in-house" className="mt-4">{inHouse.length ? <RateCardTable rows={inHouse} /> : <PipelineEmptyState>No in-house rate cards.</PipelineEmptyState>}</TabsContent>
          <TabsContent value="contractor" className="mt-4">{contractor.length ? <RateCardTable rows={contractor} /> : <PipelineEmptyState>No contractor/freelancer rate cards.</PipelineEmptyState>}</TabsContent>
        </Tabs>
      )}

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Rate history — {historyTitle}</DialogTitle></DialogHeader>
          {historyRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No history.</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto text-sm">
              {historyRows.map((row, i) => (
                <div key={String(row.id ?? i)} className="rounded border px-3 py-2">
                  <p className="font-medium">{String(row.status ?? "Revision")}</p>
                  <p className="text-muted-foreground">
                    Eff. {String(row.effectiveDate ?? "—")} · cost {String(row.hourlyCostRate ?? row.internalCostRateHourly ?? "—")} · bill {String(row.hourlyBillingRate ?? row.billingRateHourly ?? "—")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!editId} onOpenChange={(o) => !o && setEditId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit pending rate card</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-2"><Label>Hourly cost</Label><Input type="number" value={editForm.hourlyCostRate} onChange={(e) => setEditForm((f) => ({ ...f, hourlyCostRate: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Hourly bill</Label><Input type="number" value={editForm.hourlyBillingRate} onChange={(e) => setEditForm((f) => ({ ...f, hourlyBillingRate: e.target.value }))} /></div>
            <div className="space-y-2"><Label>Notes</Label><Input value={editForm.notes} onChange={(e) => setEditForm((f) => ({ ...f, notes: e.target.value }))} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditId(null)}>Cancel</Button>
              <Button onClick={() => void saveEdit()} disabled={busyId === editId}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
