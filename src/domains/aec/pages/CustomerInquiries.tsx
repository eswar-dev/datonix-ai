import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
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
import { Label } from "@/common/components/ui/label";
import { Slider } from "@/common/components/ui/slider";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { MetricStrip } from "@/domains/aec/components/MetricStrip";
import { OpportunityTable } from "@/domains/aec/components/OpportunityTable";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import {
  proposalTemplate,
  quotationTemplate,
  type Inquiry,
  type InquiryEntity,
  type InquiryStage,
} from "@/domains/aec/data/inquiries";
import { toast } from "sonner";

export default function CustomerInquiries() {
  const navigate = useNavigate();
  const { inquiries, inquiryMetrics: metrics, setDraftFromInquiry } = useAecApp();
  const [entityFilter, setEntityFilter] = useState<InquiryEntity | "all">("all");
  const [stageFilter, setStageFilter] = useState<InquiryStage | "all">("all");
  const [scoreRange, setScoreRange] = useState([60, 100]);
  const [proposalInquiry, setProposalInquiry] = useState<Inquiry | null>(null);
  const [quotationInquiry, setQuotationInquiry] = useState<Inquiry | null>(null);

  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      if (entityFilter !== "all" && inq.entity !== entityFilter) return false;
      if (stageFilter !== "all" && inq.stage !== stageFilter) return false;
      if (inq.score < scoreRange[0] || inq.score > scoreRange[1]) return false;
      return true;
    });
  }, [inquiries, entityFilter, stageFilter, scoreRange]);

  const handleGenerateProposal = (inquiry: Inquiry) => {
    setProposalInquiry(inquiry);
    toast.success(`Proposal draft generated for ${inquiry.client}`);
  };

  const handleGenerateQuotation = (inquiry: Inquiry) => {
    setQuotationInquiry(inquiry);
    toast.success(`Quotation generated for ${inquiry.client}`);
  };

  const handleConvert = (inquiry: Inquiry) => {
    setDraftFromInquiry(inquiry);
    navigate(
      `/projects/create?client=${encodeURIComponent(inquiry.client)}&entity=${inquiry.entity}&value=${inquiry.valueGbp}&name=${encodeURIComponent(inquiry.projectName)}`
    );
  };

  const template = proposalInquiry ? proposalTemplate(proposalInquiry) : null;
  const quotation = quotationInquiry ? quotationTemplate(quotationInquiry) : null;

  return (
    <div className="space-y-6">
      <AecPageHeader
        title="Customer Inquiries"
        subtitle="Pipeline opportunities, proposal generation, and project conversion."
        breadcrumb={[
          { label: "Pipeline", href: "/customer-inquiries" },
          { label: "Customer Inquiries" },
        ]}
      />

      <MetricStrip
        metrics={[
          { label: "Active Inquiries", value: String(metrics.activeInquiries) },
          { label: "Proposals", value: String(metrics.proposals) },
          { label: "Pipeline Value", value: `£${(metrics.pipelineGbp / 1000).toFixed(0)}K` },
          { label: "Win Rate", value: `${metrics.winRatePct}%`, trend: "up", change: "+4%" },
        ]}
      />

      <Card className="rounded-card">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v as InquiryEntity | "all")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                <SelectItem value="MA">MA</SelectItem>
                <SelectItem value="ME">ME</SelectItem>
                <SelectItem value="MC">MC</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Stage</Label>
            <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as InquiryStage | "all")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {(["Inquiry", "Qualification", "Proposal", "Negotiation"] as InquiryStage[]).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Score range: {scoreRange[0]} – {scoreRange[1]}</Label>
            <Slider min={50} max={100} step={1} value={scoreRange} onValueChange={setScoreRange} />
          </div>
        </CardContent>
      </Card>

      <OpportunityTable
        inquiries={filtered}
        onGenerateProposal={handleGenerateProposal}
        onGenerateQuotation={handleGenerateQuotation}
        onConvert={handleConvert}
      />

      <Dialog open={!!proposalInquiry} onOpenChange={(open) => !open && setProposalInquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Inbox className="h-5 w-5 text-accent" />
              {template?.title}
            </DialogTitle>
          </DialogHeader>
          {template && (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">{template.summary}</p>
              <dl className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                <div><dt className="text-muted-foreground">Client</dt><dd className="font-medium">{template.client}</dd></div>
                <div><dt className="text-muted-foreground">Entity</dt><dd className="font-medium">{template.entity}</dd></div>
                <div><dt className="text-muted-foreground">Fee</dt><dd className="font-medium">{template.value}</dd></div>
              </dl>
              <div>
                <p className="mb-2 font-medium">Template sections</p>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  {template.sections.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!quotationInquiry} onOpenChange={(open) => !open && setQuotationInquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-accent" />
              {quotation?.title}
            </DialogTitle>
          </DialogHeader>
          {quotation && (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-2 gap-2 rounded-lg border p-3">
                <div><dt className="text-muted-foreground">Reference</dt><dd className="font-mono font-medium">{quotation.reference}</dd></div>
                <div><dt className="text-muted-foreground">Valid until</dt><dd className="font-medium">{quotation.validUntil}</dd></div>
                <div><dt className="text-muted-foreground">Client</dt><dd className="font-medium">{quotation.client}</dd></div>
                <div><dt className="text-muted-foreground">Entity</dt><dd className="font-medium">{quotation.entity}</dd></div>
              </dl>
              <div className="rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left font-medium">Description</th>
                      <th className="p-2 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.lineItems.map((line, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="p-2 text-muted-foreground">{line.description}</td>
                        <td className="p-2 text-right font-medium">£{line.amount.toLocaleString()}</td>
                      </tr>
                    ))}
                    <tr>
                      <td className="p-2 font-semibold">Total</td>
                      <td className="p-2 text-right font-semibold">£{quotation.total.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">{quotation.terms}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
