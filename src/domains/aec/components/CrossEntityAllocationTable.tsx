import { Input } from "@/common/components/ui/input";
import { Button } from "@/common/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import type { CrossEntityAllocation } from "@/domains/aec/data/resources";

export function CrossEntityAllocationTable({
  rows,
  onUpdatePct,
}: {
  rows: CrossEntityAllocation[];
  onUpdatePct?: (allocationId: string, pct: number) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Home Entity</TableHead>
            <TableHead>Allocated To</TableHead>
            <TableHead className="text-right">Allocation</TableHead>
            <TableHead className="text-right">Home %</TableHead>
            <TableHead className="text-right">Host %</TableHead>
            {onUpdatePct && <TableHead className="text-right">Edit %</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id ?? `${row.resource}-${row.allocatedTo}`}>
              <TableCell className="font-medium">{row.resource}</TableCell>
              <TableCell className="text-xs">{row.type}</TableCell>
              <TableCell>{row.homeEntity}</TableCell>
              <TableCell className="text-muted-foreground">{row.allocatedTo}</TableCell>
              <TableCell className="text-right">{row.allocationPct}%</TableCell>
              <TableCell className="text-right">{row.costSplitHome}%</TableCell>
              <TableCell className="text-right">{row.costSplitHost}%</TableCell>
              {onUpdatePct && row.id && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Input
                      type="number"
                      className="h-8 w-16"
                      defaultValue={row.allocationPct}
                      id={`pct-${row.id}`}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const el = document.getElementById(`pct-${row.id}`) as HTMLInputElement;
                        const pct = Number(el?.value);
                        if (Number.isFinite(pct)) onUpdatePct(row.id!, pct);
                      }}
                    >
                      Save
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
