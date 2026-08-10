import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Button } from "@/common/components/ui/button";
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
import { RateCardTable } from "@/domains/aec/components/RateCardTable";
import {
  PipelineEmptyState,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { RateCardRow } from "@/domains/aec/data/rateCards";

export default function RateCards() {
  const {
    rateCards,
    loadRateCards,
    rateCardPendingRevisions,
    loadRateCardPendingRevisions,
    approveRateCard,
    resourcesLoading,
  } = useAecApp();
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    void loadRateCards();
    void loadRateCardPendingRevisions();
  }, [loadRateCards, loadRateCardPendingRevisions]);

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
        status: /pending/i.test(c.status)
          ? "Pending"
          : /expir/i.test(c.status)
            ? "Expired"
            : "Active",
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
    } catch {
      /* toasted */
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Rate Cards"
        subtitle="Live cost and bill rates · Pending revisions from the twin API."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Rate Cards" },
        ]}
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              void loadRateCards();
              void loadRateCardPendingRevisions();
            }}
          >
            Refresh
          </Button>
        }
      />

      {loading && <PipelineLoadingBanner label="Loading rate cards…" />}

      {rateCardPendingRevisions.length > 0 && (
        <Card className="rounded-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Pending revisions ({rateCardPendingRevisions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Resource</TableHead>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rateCardPendingRevisions.map((rev) => (
                  <TableRow key={rev.id}>
                    <TableCell className="font-medium">{rev.resourceName}</TableCell>
                    <TableCell className="text-muted-foreground">{rev.fromValue}</TableCell>
                    <TableCell>{rev.toValue}</TableCell>
                    <TableCell>{rev.status}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        disabled={busyId === rev.id}
                        onClick={() => void onApprove(rev.id)}
                      >
                        Approve
                      </Button>
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
          <TabsContent value="in-house" className="mt-4">
            {inHouse.length ? (
              <RateCardTable rows={inHouse} />
            ) : (
              <PipelineEmptyState>No in-house rate cards.</PipelineEmptyState>
            )}
          </TabsContent>
          <TabsContent value="contractor" className="mt-4">
            {contractor.length ? (
              <RateCardTable rows={contractor} />
            ) : (
              <PipelineEmptyState>No contractor/freelancer rate cards.</PipelineEmptyState>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
