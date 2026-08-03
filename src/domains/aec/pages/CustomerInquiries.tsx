import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileSpreadsheet, Loader2 } from "lucide-react";
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
import {
  PipelineErrorBanner,
  PipelineLoadingBanner,
} from "@/domains/aec/components/PipelineUi";
import { useAecApp } from "@/domains/aec/context/AecAppContext";
import type { Inquiry, InquiryEntity, InquiryStage } from "@/domains/aec/data/inquiries";
import { toast } from "sonner";

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" ? (v as Record<string, unknown>) : {};
}

export default function CustomerInquiries() {
  const navigate = useNavigate();
  const {
    inquiries,
    inquiryMetrics: metrics,
    activeTwin,
    setDraftFromInquiry,
    pipelineLoading,
    pipelineError,
    refreshPipeline,
    generateInquiryProposal,
    generateInquiryQuotation,
    convertInquiryToProject,
  } = useAecApp();
  const [entityFilter, setEntityFilter] = useState<InquiryEntity | "all">("all");
  const [stageFilter, setStageFilter] = useState<InquiryStage | "all">("all");
  const [scoreRange, setScoreRange] = useState([0, 100]);
  const [proposalInquiry, setProposalInquiry] = useState<Inquiry | null>(null);
  const [quotationInquiry, setQuotationInquiry] = useState<Inquiry | null>(null);
  const [proposalData, setProposalData] = useState<Record<string, unknown> | null>(null);
  const [quotationData, setQuotationData] = useState<Record<string, unknown> | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    void refreshPipeline();
  }, [refreshPipeline]);

  const entityOptions = useMemo(() => {
    const fromTwin = activeTwin.entities.map((e) => e.code).filter(Boolean);
    const fromData = inquiries.map((i) => i.entity).filter(Boolean);
    return [...new Set([...fromTwin, ...fromData])];
  }, [activeTwin.entities, inquiries]);

  const filtered = useMemo(() => {
    return inquiries.filter((inq) => {
      if (entityFilter !== "all" && inq.entity !== entityFilter) return false;
      if (stageFilter !== "all" && inq.stage !== stageFilter) return false;
      if (inq.score < scoreRange[0] || inq.score > scoreRange[1]) return false;
      return true;
    });
  }, [inquiries, entityFilter, stageFilter, scoreRange]);

  const handleGenerateProposal = async (inquiry: Inquiry) => {
    setActionLoading(true);
    setProposalInquiry(inquiry);
    setProposalData(null);
    try {
      const data = asRecord(await generateInquiryProposal(inquiry));
      setProposalData(data);
      toast.success(`Proposal generated for ${inquiry.client}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Proposal generation failed");
      setProposalInquiry(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateQuotation = async (inquiry: Inquiry) => {
    setActionLoading(true);
    setQuotationInquiry(inquiry);
    setQuotationData(null);
    try {
      const data = asRecord(await generateInquiryQuotation(inquiry));
      setQuotationData(data);
      toast.success(`Quotation generated for ${inquiry.client}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Quotation generation failed");
      setQuotationInquiry(null);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConvert = async (inquiry: Inquiry) => {
    setDraftFromInquiry(inquiry);
    if (inquiry.stage === "Won") {
      setActionLoading(true);
      try {
        const projectId = await convertInquiryToProject(inquiry);
        if (projectId) {
          navigate("/projects/wbs");
          return;
        }
      } finally {
        setActionLoading(false);
      }
    }
    navigate(
      `/projects/create?client=${encodeURIComponent(inquiry.client)}&entity=${encodeURIComponent(inquiry.entity)}&value=${inquiry.valueGbp}&name=${encodeURIComponent(inquiry.projectName)}&inquiryId=${inquiry.id}${inquiry.entityId ? `&entityId=${inquiry.entityId}` : ""}`
    );
  };

  const proposalTitle = String(proposalData?.title ?? "Proposal");
  const proposalSections = Array.isArray(proposalData?.sections)
    ? (proposalData.sections as string[])
    : [];
  const proposalContent = asRecord(proposalData?.sectionContent ?? {});
  const quotationRef = String(quotationData?.reference ?? "—");
  const quotationTotal = String(quotationData?.total ?? "—");
  const quotationItems = Array.isArray(quotationData?.lineItems)
    ? (quotationData.lineItems as { description?: string; amount?: string | number }[])
    : [];

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

      {pipelineLoading && <PipelineLoadingBanner label="Syncing inquiries from API…" />}
      <PipelineErrorBanner message={pipelineError ?? ""} />

      <MetricStrip
        metrics={[
          { label: "Active Inquiries", value: String(metrics.activeInquiries) },
          { label: "Proposals", value: String(metrics.proposals) },
          { label: "Pipeline Value", value: `£${(metrics.pipelineGbp / 1000).toFixed(0)}K` },
          { label: "Win Rate", value: `${metrics.winRatePct}%` },
        ]}
      />

      <Card className="rounded-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Entity</Label>
            <Select value={entityFilter} onValueChange={(v) => setEntityFilter(v as InquiryEntity | "all")}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All entities" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                {entityOptions.map((code) => (
                  <SelectItem key={code} value={code}>{code}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Stage</Label>
            <Select value={stageFilter} onValueChange={(v) => setStageFilter(v as InquiryStage | "all")}>
              <SelectTrigger className="w-full"><SelectValue placeholder="All stages" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All stages</SelectItem>
                {(["Inquiry", "Qualification", "Proposal", "Negotiation", "Won", "Lost"] as InquiryStage[]).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>AI Score {scoreRange[0]}–{scoreRange[1]}</Label>
            <div className="flex h-10 items-center px-1">
              <Slider min={0} max={100} step={1} value={scoreRange} onValueChange={setScoreRange} />
            </div>
          </div>
        </CardContent>
      </Card>

      <OpportunityTable
        inquiries={filtered}
        onGenerateProposal={(inq) => void handleGenerateProposal(inq)}
        onGenerateQuotation={(inq) => void handleGenerateQuotation(inq)}
        onConvert={(inq) => void handleConvert(inq)}
      />

      <Dialog open={!!proposalInquiry} onOpenChange={(o) => !o && setProposalInquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{proposalTitle}</DialogTitle>
          </DialogHeader>
          {actionLoading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating…
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-3 overflow-y-auto text-sm">
              {proposalSections.map((section) => (
                <div key={section}>
                  <p className="font-medium">{section}</p>
                  <p className="mt-1 text-muted-foreground">
                    {String(proposalContent[section] ?? proposalData?.summary ?? "")}
                  </p>
                </div>
              ))}
              {!proposalSections.length && (
                <p className="text-muted-foreground">{String(proposalData?.summary ?? "Proposal ready.")}</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!quotationInquiry} onOpenChange={(o) => !o && setQuotationInquiry(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4 shrink-0" />
              <span className="truncate">Quotation {quotationRef}</span>
            </DialogTitle>
          </DialogHeader>
          {actionLoading ? (
            <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Generating…
            </div>
          ) : (
            <div className="max-h-[60vh] space-y-2 overflow-y-auto text-sm">
              {quotationItems.map((item, i) => (
                <div key={i} className="flex items-start justify-between gap-4 border-b border-border/60 pb-2">
                  <span className="min-w-0 flex-1">{String(item.description ?? "Line item")}</span>
                  <span className="shrink-0 font-medium tabular-nums">{String(item.amount ?? "")}</span>
                </div>
              ))}
              <div className="flex items-center justify-between pt-2 font-semibold">
                <span>Total</span>
                <span className="tabular-nums">{quotationTotal}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
