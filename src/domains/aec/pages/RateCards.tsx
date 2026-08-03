import { useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { RateCardTable } from "@/domains/aec/components/RateCardTable";
import {
  PipelineEmptyState,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { RateCardRow } from "@/domains/aec/data/rateCards";

export default function RateCards() {
  const { rateCards, loadRateCards, resourcesLoading } = useAecApp();

  useEffect(() => {
    void loadRateCards();
  }, [loadRateCards]);

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

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Rate Cards"
        subtitle="Live cost and bill rates from the twin API. Revision history requires a backend endpoint."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Rate Cards" },
        ]}
      />

      {loading && <PipelineLoadingBanner label="Loading rate cards…" />}

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
