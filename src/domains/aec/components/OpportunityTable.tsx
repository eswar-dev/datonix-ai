import { ArrowRight, FileText, FileSpreadsheet, Trash2 } from "lucide-react";
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
import { StatusBadge } from "./StatusBadge";
import { PipelineEmptyState } from "./PipelineUi";
import type { Inquiry, InquiryStage } from "@/domains/aec/data/inquiries";
import { cn } from "@/common/lib/utils";

const STAGES: InquiryStage[] = [
  "Inquiry",
  "Qualification",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
];

interface OpportunityTableProps {
  inquiries: Inquiry[];
  onGenerateProposal: (inquiry: Inquiry) => void;
  onGenerateQuotation: (inquiry: Inquiry) => void;
  onConvert: (inquiry: Inquiry) => void;
  onStageChange?: (inquiry: Inquiry, stage: string) => void;
  onDelete?: (inquiry: Inquiry) => void;
}

function scoreColor(score: number) {
  if (score >= 90) return "text-success font-semibold";
  if (score >= 80) return "text-accent font-semibold";
  if (score >= 70) return "text-warning font-semibold";
  return "text-muted-foreground";
}

function stageBadge(stageLabel: string, stage: string) {
  if (stage === "Won") return "Active";
  if (stage === "Lost") return "Inactive";
  if (stageLabel.includes("Proposal") || stage === "Proposal") return "Active";
  if (stageLabel.includes("RFP") || stage === "Negotiation") return "At Risk";
  return "Pending";
}

export function OpportunityTable({
  inquiries,
  onGenerateProposal,
  onGenerateQuotation,
  onConvert,
  onStageChange,
  onDelete,
}: OpportunityTableProps) {
  if (inquiries.length === 0) {
    return <PipelineEmptyState>No inquiries match the current filters.</PipelineEmptyState>;
  }

  return (
    <div className="overflow-hidden rounded-card border">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[180px]">Client</TableHead>
              <TableHead className="min-w-[110px]">Type</TableHead>
              <TableHead className="w-[72px]">Entity</TableHead>
              <TableHead className="min-w-[160px]">Stage</TableHead>
              <TableHead className="w-[88px] text-right">AI Score</TableHead>
              <TableHead className="w-[100px] text-right">Value</TableHead>
              <TableHead className="min-w-[280px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inq) => {
              const showProposal =
                inq.suggestedAction === "Generate Proposal" ||
                inq.stage === "Inquiry" ||
                inq.stage === "Qualification" ||
                inq.stage === "Proposal";
              const showConvert =
                inq.suggestedAction === "Convert" ||
                inq.stage === "Won" ||
                inq.stage === "Negotiation" ||
                inq.score >= 85;

              return (
                <TableRow key={inq.id}>
                  <TableCell className="align-middle">
                    <p className="font-medium leading-snug">{inq.client}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{inq.projectName}</p>
                  </TableCell>
                  <TableCell className="align-middle text-muted-foreground">{inq.projectType}</TableCell>
                  <TableCell className="align-middle">
                    <span className="inline-flex rounded bg-muted px-1.5 py-0.5 text-xs font-bold tracking-wide">
                      {inq.entity}
                    </span>
                  </TableCell>
                  <TableCell className="align-middle">
                    {onStageChange ? (
                      <Select
                        value={inq.stage}
                        onValueChange={(v) => onStageChange(inq, v)}
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex flex-col gap-1">
                        <StatusBadge status={stageBadge(inq.stageLabel, inq.stage)} />
                        <span className="text-xs text-muted-foreground">{inq.stageLabel}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className={cn("align-middle text-right tabular-nums", scoreColor(inq.score))}>
                    {inq.score}
                  </TableCell>
                  <TableCell className="align-middle text-right font-medium tabular-nums">
                    {inq.valueDisplay}
                  </TableCell>
                  <TableCell className="align-middle text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {showProposal && (
                        <>
                          <Button variant="ghost" size="sm" className="h-8" onClick={() => onGenerateProposal(inq)}>
                            <FileText className="mr-1 h-3.5 w-3.5" />
                            Proposal
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8" onClick={() => onGenerateQuotation(inq)}>
                            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                            Quote
                          </Button>
                        </>
                      )}
                      {showConvert && (
                        <Button variant="outline" size="sm" className="h-8" onClick={() => onConvert(inq)}>
                          Convert
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-destructive"
                          onClick={() => onDelete(inq)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
