import { Loader2 } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

interface AdminTableLoadingRowProps {
  colSpan: number;
  label?: string;
}

export function AdminTableLoadingRow({ colSpan, label = "Loading…" }: AdminTableLoadingRowProps) {
  return (
    <TableRow aria-busy="true">
      <TableCell colSpan={colSpan} className="py-12">
        <div
          className="flex flex-col items-center justify-center gap-3 text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          <Loader2 className="h-8 w-8 shrink-0 animate-spin text-accent" aria-hidden />
          <span className="text-sm">{label}</span>
        </div>
      </TableCell>
    </TableRow>
  );
}
