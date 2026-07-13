import { ArrowRight, FileText, FileSpreadsheet } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { Inquiry } from "@/domains/aec/data/inquiries";
import { cn } from "@/common/lib/utils";

interface OpportunityTableProps {
  inquiries: Inquiry[];
  onGenerateProposal: (inquiry: Inquiry) => void;
  onGenerateQuotation: (inquiry: Inquiry) => void;
  onConvert: (inquiry: Inquiry) => void;
}

function scoreColor(score: number) {
  if (score >= 90) return "text-success font-semibold";
  if (score >= 80) return "text-accent font-semibold";
  if (score >= 70) return "text-warning font-semibold";
  return "text-muted-foreground";
}

export function OpportunityTable({ inquiries, onGenerateProposal, onGenerateQuotation, onConvert }: OpportunityTableProps) {
  if (inquiries.length === 0) {
    return (
      <div className="rounded-card border py-12 text-center text-sm text-muted-foreground">
        No inquiries match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead className="text-right">AI Score</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inquiries.map((inq) => (
            <TableRow key={inq.id}>
              <TableCell>
                <p className="font-medium">{inq.client}</p>
                <p className="text-xs text-muted-foreground">{inq.projectName}</p>
              </TableCell>
              <TableCell className="text-muted-foreground">{inq.projectType}</TableCell>
              <TableCell>
                <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-bold">{inq.entity}</span>
              </TableCell>
              <TableCell>
                <StatusBadge
                  status={
                    inq.stageLabel.includes("Proposal")
                      ? "Active"
                      : inq.stageLabel.includes("RFP")
                        ? "At Risk"
                        : "Pending"
                  }
                />
                <span className="ml-1.5 text-xs text-muted-foreground">{inq.stageLabel}</span>
              </TableCell>
              <TableCell className={cn("text-right", scoreColor(inq.score))}>{inq.score}</TableCell>
              <TableCell className="text-right font-medium">{inq.valueDisplay}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {inq.suggestedAction === "Generate Proposal" && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onGenerateProposal(inq)}>
                        <FileText className="mr-1 h-3.5 w-3.5" />
                        Proposal
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onGenerateQuotation(inq)}>
                        <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
                        Quote
                      </Button>
                    </>
                  )}
                  {(inq.suggestedAction === "Convert" || inq.score >= 85) && (
                    <Button variant="outline" size="sm" onClick={() => onConvert(inq)}>
                      Convert
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
