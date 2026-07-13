import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { cn } from "@/common/lib/utils";

interface StatementLine {
  line: string;
  amount: number;
  type: "revenue" | "cost" | "total" | "margin";
}

export function ProfitabilityStatement({ lines, currency }: { lines: StatementLine[]; currency: string }) {
  const symbol = currency === "AED" ? "AED " : "£";

  const formatAmount = (line: StatementLine) => {
    if (line.type === "margin") return `${line.amount}%`;
    const abs = Math.abs(line.amount);
    const formatted = abs.toLocaleString();
    if (line.type === "revenue") return `${symbol}${formatted}`;
    if (line.type === "cost") return `(${symbol}${formatted})`;
    return `${symbol}${formatted}`;
  };

  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Line Item</TableHead>
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lines.map((line) => (
            <TableRow
              key={line.line}
              className={cn(line.type === "total" && "bg-muted/50 font-semibold")}
            >
              <TableCell>{line.line}</TableCell>
              <TableCell
                className={cn(
                  "text-right font-medium",
                  line.type === "revenue" && "text-success",
                  line.type === "cost" && "text-destructive",
                  line.type === "total" && "text-accent"
                )}
              >
                {formatAmount(line)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
