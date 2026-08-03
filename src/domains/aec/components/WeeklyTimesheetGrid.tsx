import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
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
import { emptyTimesheetRow, type TimesheetRow } from "@/domains/aec/data/timesheets";

const days = ["mon", "tue", "wed", "thu", "fri"] as const;

export function WeeklyTimesheetGrid({
  rows,
  onChange,
  projects,
  weekDates,
  readOnly = false,
}: {
  rows: TimesheetRow[];
  onChange: (rows: TimesheetRow[]) => void;
  projects: { id: string; name: string }[];
  weekDates: string[];
  readOnly?: boolean;
}) {
  const update = (index: number, partial: Partial<TimesheetRow>) => {
    onChange(rows.map((r, i) => (i === index ? { ...r, ...partial } : r)));
  };

  const updateDay = (index: number, day: (typeof days)[number], value: number) => {
    update(index, { [day]: value });
  };

  const setProject = (index: number, projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    update(index, { projectId, project: project?.name ?? "" });
  };

  const addRow = () => onChange([...rows, emptyTimesheetRow()]);
  const removeRow = (index: number) => onChange(rows.filter((_, i) => i !== index));

  const rowTotal = (row: TimesheetRow) => days.reduce((s, d) => s + row[d], 0);
  const dayTotal = (day: (typeof days)[number]) => rows.reduce((s, r) => s + r[day], 0);
  const grandTotal = rows.reduce((s, r) => s + rowTotal(r), 0);

  const dayLabel = (i: number) => {
    const date = weekDates[i];
    if (!date) return days[i].toUpperCase();
    const d = new Date(`${date}T12:00:00`);
    return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric" });
  };

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-card border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">Project</TableHead>
              <TableHead className="min-w-[140px]">Task</TableHead>
              {days.map((_, i) => (
                <TableHead key={days[i]} className="text-center whitespace-nowrap">
                  {dayLabel(i)}
                </TableHead>
              ))}
              <TableHead className="text-right">Total</TableHead>
              {!readOnly && <TableHead className="w-10" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={readOnly ? 7 : 8} className="py-8 text-center text-muted-foreground">
                  No rows yet. Add a project row to enter hours.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => (
                <TableRow key={`${row.projectId}-${row.task}-${i}`}>
                  <TableCell className="p-1">
                    {readOnly ? (
                      <span className="font-medium">{row.project || "—"}</span>
                    ) : (
                      <Select value={row.projectId || undefined} onValueChange={(v) => setProject(i, v)}>
                        <SelectTrigger className="h-8">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell className="p-1">
                    {readOnly ? (
                      <span className="text-muted-foreground">{row.task || "—"}</span>
                    ) : (
                      <Input
                        className="h-8"
                        value={row.task}
                        placeholder="Task"
                        onChange={(e) => update(i, { task: e.target.value })}
                      />
                    )}
                  </TableCell>
                  {days.map((day) => (
                    <TableCell key={day} className="p-1">
                      <Input
                        type="number"
                        min={0}
                        max={24}
                        step={0.5}
                        className="h-8 w-14 text-center text-sm"
                        value={row[day]}
                        disabled={readOnly}
                        onChange={(e) => updateDay(i, day, Number(e.target.value) || 0)}
                      />
                    </TableCell>
                  ))}
                  <TableCell className="text-right font-semibold">{rowTotal(row)}</TableCell>
                  {!readOnly && (
                    <TableCell className="p-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => removeRow(i)}
                        aria-label="Remove row"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
            <TableRow className="bg-muted/40 font-semibold">
              <TableCell colSpan={2}>Daily totals</TableCell>
              {days.map((day) => (
                <TableCell key={day} className="text-center">
                  {dayTotal(day)}
                </TableCell>
              ))}
              <TableCell className="text-right">{grandTotal}</TableCell>
              {!readOnly && <TableCell />}
            </TableRow>
          </TableBody>
        </Table>
      </div>
      {!readOnly && (
        <Button type="button" variant="outline" size="sm" onClick={addRow}>
          <Plus className="mr-2 h-4 w-4" />
          Add row
        </Button>
      )}
    </div>
  );
}
