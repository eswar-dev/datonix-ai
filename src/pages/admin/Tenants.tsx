import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";

const mockTenants = [
  { id: 1, name: "Admin_ai-priori", type: "ai-priori" },
  { id: 2, name: "ai-priori", type: "ai-priori" },
  { id: 3, name: "Kalmar", type: "customer" },
  { id: 4, name: "TechCorp", type: "customer" },
  { id: 5, name: "DataFlow", type: "ai-priori" },
];

type SortKey = "id" | "name" | "type";

export default function Tenants() {
  const [addOpen, setAddOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const sorted = [...mockTenants].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv));
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="inline-flex flex-col ml-1 opacity-40">
      <ChevronUp className={`h-3 w-3 ${sortKey === col && sortAsc ? "opacity-100 text-accent" : ""}`} />
      <ChevronDown className={`h-3 w-3 -mt-1 ${sortKey === col && !sortAsc ? "opacity-100 text-accent" : ""}`} />
    </span>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button onClick={() => setAddOpen(true)} className="rounded-button">
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20 cursor-pointer select-none" onClick={() => toggleSort("id")}>
                S.No <SortIcon col="id" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>
                Name <SortIcon col="name" />
              </TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("type")}>
                Type <SortIcon col="type" />
              </TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((t, i) => (
              <TableRow key={t.id} className="hover:bg-muted/20">
                <TableCell>{(page - 1) * perPage + i + 1}</TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="bg-muted/50">{t.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent hover:text-accent/80">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive/80">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-4 border-t px-4 py-3 text-sm text-muted-foreground">
          <span>1-{Math.min(paginated.length, sorted.length)} of {sorted.length} items</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(page - 1)}>‹</Button>
            <Input value={page} className="h-8 w-10 text-center rounded-input" readOnly />
            <Button variant="outline" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>›</Button>
          </div>
          <span>{perPage} / page</span>
        </div>
      </Card>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tenant</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="Tenant name" className="mt-1 rounded-input" />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select>
                <SelectTrigger className="mt-1 rounded-input">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ai-priori">ai-priori</SelectItem>
                  <SelectItem value="customer">customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-button" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="rounded-button" onClick={() => setAddOpen(false)}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
