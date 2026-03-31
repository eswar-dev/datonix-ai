import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";

interface Tenant {
  id: number;
  name: string;
  type: string;
}

const initialTenants: Tenant[] = [
  { id: 1, name: "Admin_ai-priori", type: "ai-priori" },
  { id: 2, name: "ai-priori", type: "ai-priori" },
  { id: 3, name: "Kalmar", type: "customer" },
  { id: 4, name: "TechCorp", type: "customer" },
  { id: 5, name: "DataFlow", type: "ai-priori" },
];

const types = ["ai-priori", "customer"];
type SortKey = "id" | "name" | "type";

const emptyForm = { name: "", type: "" };

export default function Tenants() {
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = tenants.filter(
    (t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.type.toLowerCase().includes(search.toLowerCase())
  );

  const sorted = [...filtered].sort((a, b) => {
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

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const openEdit = (t: Tenant, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({ name: t.name, type: t.type });
    setEditId(t.id);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.type) {
      toast.error("Please fill all required fields");
      return;
    }
    if (dialogMode === "add") {
      setTenants((prev) => [...prev, { id: Date.now(), name: form.name, type: form.type }]);
      toast.success(`Tenant "${form.name}" added successfully`);
    } else if (editId !== null) {
      setTenants((prev) => prev.map((t) => t.id === editId ? { ...t, name: form.name, type: form.type } : t));
      toast.success(`Tenant "${form.name}" updated successfully`);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    const tenant = tenants.find((t) => t.id === id);
    setTenants((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirm(null);
    toast.success(`Tenant "${tenant?.name}" deleted`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tenants…" className="pl-9 rounded-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} className="rounded-button">
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20 cursor-pointer select-none" onClick={() => toggleSort("id")}>S.No <SortIcon col="id" /></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("name")}>Name <SortIcon col="name" /></TableHead>
              <TableHead className="cursor-pointer select-none" onClick={() => toggleSort("type")}>Type <SortIcon col="type" /></TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((t, i) => (
              <TableRow key={t.id} className="hover:bg-muted/20">
                <TableCell>{(page - 1) * perPage + i + 1}</TableCell>
                <TableCell className="font-medium">{t.name}</TableCell>
                <TableCell><Badge variant="outline" className="bg-muted/50">{t.type}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={(e) => openEdit(t, e)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(t.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {paginated.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No tenants found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
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

      {/* Add / Edit Tenant Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{dialogMode === "add" ? "Add New Tenant" : "Edit Tenant"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input placeholder="Tenant name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-input" />
            </div>
            <div className="space-y-2">
              <Label>Type <span className="text-destructive">*</span></Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger className="rounded-input"><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-button" onClick={handleSave}>{dialogMode === "add" ? "Add Tenant" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Tenant</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{tenants.find((t) => t.id === deleteConfirm)?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" className="rounded-button" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="rounded-button" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
