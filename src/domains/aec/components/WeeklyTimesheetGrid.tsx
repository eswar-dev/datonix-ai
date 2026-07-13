import { Input } from "@/common/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import type { TimesheetRow } from "@/domains/aec/data/timesheets";

const days = ["mon", "tue", "wed", "thu", "fri"] as const;

export function WeeklyTimesheetGrid({
  rows,
  onChange,
}: {
  rows: TimesheetRow[];
  onChange: (rows: TimesheetRow[]) => void;
}) {
  const update = (index: number, day: typeof days[number], value: number) => {
    const next = rows.map((r, i) => (i === index ? { ...r, [day]: value } : r));
    onChange(next);
  };

  const rowTotal = (row: TimesheetRow) => days.reduce((s, d) => s + row[d], 0);
  const dayTotal = (day: typeof days[number]) => rows.reduce((s, r) => s + r[day], 0);
  const grandTotal = rows.reduce((s, r) => s + rowTotal(r), 0);

  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>Task</TableHead>
            <TableHead className="text-center">Mon</TableHead>
            <TableHead className="text-center">Tue</TableHead>
            <TableHead className="text-center">Wed</TableHead>
            <TableHead className="text-center">Thu</TableHead>
            <TableHead className="text-center">Fri</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={`${row.project}-${row.task}`}>
              <TableCell className="font-medium">{row.project}</TableCell>
              <TableCell className="text-muted-foreground">{row.task}</TableCell>
              {days.map((day) => (
                <TableCell key={day} className="p-1">
                  <Input
                    type="number"
                    min={0}
                    max={12}
                    className="h-8 w-14 text-center text-sm"
                    value={row[day]}
                    onChange={(e) => update(i, day, Number(e.target.value) || 0)}
                  />
                </TableCell>
              ))}
              <TableCell className="text-right font-semibold">{rowTotal(row)}</TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/40 font-semibold">
            <TableCell colSpan={2}>Daily totals</TableCell>
            {days.map((day) => (
              <TableCell key={day} className="text-center">{dayTotal(day)}</TableCell>
            ))}
            <TableCell className="text-right">{grandTotal}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
