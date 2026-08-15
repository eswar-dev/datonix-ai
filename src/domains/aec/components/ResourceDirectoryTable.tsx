import { useState } from "react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { ResourceRecord } from "@/domains/aec/data/resources";
import { cn } from "@/common/lib/utils";

const statusMap: Record<ResourceRecord["status"], string> = {
  Over: "At Risk",
  Good: "Active",
  Bench: "Pending",
  "At Risk": "At Risk",
};

export function ResourceDirectoryTable({
  resources,
  onArchive,
  onUpdate,
}: {
  resources: ResourceRecord[];
  onArchive?: (resource: ResourceRecord) => void;
  onUpdate?: (
    resource: ResourceRecord,
    body: { name: string; designation: string; department: string; costRate?: number; billRate?: number }
  ) => Promise<void>;
}) {
  const [editing, setEditing] = useState<ResourceRecord | null>(null);
  const [form, setForm] = useState({
    name: "",
    designation: "",
    department: "",
    costRate: "",
    billRate: "",
  });
  const [busy, setBusy] = useState(false);

  if (resources.length === 0) {
    return (
      <div className="rounded-card border py-12 text-center text-sm text-muted-foreground">
        No resources match the current filters.
      </div>
    );
  }

  const openEdit = (r: ResourceRecord) => {
    setEditing(r);
    setForm({
      name: r.name,
      designation: r.designation,
      department: r.department,
      costRate: "",
      billRate: "",
    });
  };

  const save = async () => {
    if (!editing || !onUpdate) return;
    setBusy(true);
    try {
      await onUpdate(editing, {
        name: form.name,
        designation: form.designation,
        department: form.department,
        costRate: form.costRate ? Number(form.costRate) : undefined,
        billRate: form.billRate ? Number(form.billRate) : undefined,
      });
      setEditing(null);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto rounded-card border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Entity</TableHead>
              <TableHead>Designation</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Bill</TableHead>
              <TableHead className="text-right">Util %</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell className="text-xs">{r.type}</TableCell>
                <TableCell>{r.entity}</TableCell>
                <TableCell className="text-muted-foreground">{r.designation}</TableCell>
                <TableCell className="text-sm">{r.costRate}</TableCell>
                <TableCell className="text-sm">{r.billRate}</TableCell>
                <TableCell
                  className={cn(
                    "text-right font-semibold",
                    r.utilization >= 95 && "text-destructive",
                    r.utilization < 70 && "text-muted-foreground"
                  )}
                >
                  {r.utilization}%
                </TableCell>
                <TableCell>
                  <StatusBadge status={statusMap[r.status]} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {onUpdate && (
                      <Button size="sm" variant="outline" onClick={() => openEdit(r)}>
                        Edit
                      </Button>
                    )}
                    {onArchive && (
                      <Button size="sm" variant="outline" onClick={() => onArchive(r)}>
                        Archive
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit resource</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Designation</Label>
              <Input
                value={form.designation}
                onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Cost rate (number)</Label>
                <Input
                  type="number"
                  value={form.costRate}
                  onChange={(e) => setForm((f) => ({ ...f, costRate: e.target.value }))}
                  placeholder="optional"
                />
              </div>
              <div className="space-y-2">
                <Label>Bill rate (number)</Label>
                <Input
                  type="number"
                  value={form.billRate}
                  onChange={(e) => setForm((f) => ({ ...f, billRate: e.target.value }))}
                  placeholder="optional"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditing(null)}>
                Cancel
              </Button>
              <Button onClick={() => void save()} disabled={busy}>
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
