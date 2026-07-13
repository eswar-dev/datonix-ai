import { useState } from "react";
import { AlertTriangle, History } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { RateCardTable } from "@/domains/aec/components/RateCardTable";
import { RevisionTimeline } from "@/domains/aec/components/RevisionTimeline";
import {
  contractorRateCards,
  inHouseRateCards,
  marcusKleinExpiry,
  pendingRevisions,
  rateRevisions,
} from "@/domains/aec/data/rateCards";

export default function RateCards() {
  const [revisionsOpen, setRevisionsOpen] = useState(false);

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Rate Cards"
        subtitle="In-house salary rates and contractor/freelancer daily rates with revision history."
        breadcrumb={[
          { label: "Resources", href: "/resources/planning" },
          { label: "Rate Cards" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => setRevisionsOpen(true)}>
            <History className="mr-2 h-4 w-4" />
            Revisions
          </Button>
        }
      />

      {pendingRevisions > 0 && (
        <div className="rounded-lg border border-warning/40 bg-warning/5 px-4 py-3 text-sm">
          <span className="font-medium text-warning">{pendingRevisions} pending rate revisions</span>
          <span className="text-muted-foreground"> — awaiting CFO approval</span>
        </div>
      )}

      <div className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
        <div className="text-sm">
          <p className="font-semibold text-destructive">
            {marcusKleinExpiry.name} — contract expires in {marcusKleinExpiry.daysRemaining} days
          </p>
          <p className="text-muted-foreground">
            {marcusKleinExpiry.role} · ends {marcusKleinExpiry.contractEnd}. Renew or reassign before Kings Cross structural phase completes.
          </p>
        </div>
      </div>

      <Tabs defaultValue="in-house">
        <TabsList>
          <TabsTrigger value="in-house">In-House</TabsTrigger>
          <TabsTrigger value="contractor">Contractor / Freelancer</TabsTrigger>
        </TabsList>
        <TabsContent value="in-house" className="mt-4">
          <RateCardTable rows={inHouseRateCards} />
        </TabsContent>
        <TabsContent value="contractor" className="mt-4">
          <RateCardTable rows={contractorRateCards} />
        </TabsContent>
      </Tabs>

      <Dialog open={revisionsOpen} onOpenChange={setRevisionsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rate Card Revision History</DialogTitle>
          </DialogHeader>
          <RevisionTimeline revisions={rateRevisions} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
