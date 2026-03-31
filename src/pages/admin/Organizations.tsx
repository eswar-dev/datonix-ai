import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";

interface Org {
  id: number;
  name: string;
  tenant: string;
  members: number;
  status: string;
}

const tenants = ["Admin_ai-priori", "ai-priori", "Kalmar", "TechCorp", "DataFlow"];
const statuses = ["Active", "Inactive"];

const initialOrgs: Org[] = [
  { id: 1, name: "Datonix Corp", tenant: "Admin_ai-priori", members: 24, status: "Active" },
  { id: 2, name: "Acme Inc", tenant: "ai-priori", members: 12, status: "Active" },
  { id: 3, name: "Partner Co", tenant: "Kalmar", members: 8, status: "Inactive" },
];

const emptyForm = { name: "", tenant: "", status: "Active" };

export default function Organizations() {
  const [orgs, setOrgs] = useState<Org[]>(initialOrgs);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const filtered = orgs.filter(
    (o) => o.name.toLowerCase().includes(search.toLowerCase()) || o.tenant.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const openEdit = (o: Org, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({ name: o.name, tenant: o.tenant, status: o.status });
    setEditId(o.id);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.tenant) {
      toast.error("Please fill all required fields");
      return;
    }
    if (dialogMode === "add") {
      setOrgs((prev) => [...prev, { id: Date.now(), name: form.name, tenant: form.tenant, members: 0, status: form.status }]);
      toast.success(`Organization "${form.name}" added successfully`);
    } else if (editId !== null) {
      setOrgs((prev) => prev.map((o) => o.id === editId ? { ...o, name: form.name, tenant: form.tenant, status: form.status } : o));
      toast.success(`Organization "${form.name}" updated successfully`);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: number) => {
    const org = orgs.find((o) => o.id === id);
    setOrgs((prev) => prev.filter((o) => o.id !== id));
    setDeleteConfirm(null);
    toast.success(`Organization "${org?.name}" deleted`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search organizations…" className="pl-9 rounded-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} className="rounded-button">
          <Plus className="mr-2 h-4 w-4" /> Add Organization
        </Button>
      </div>

      <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20">S.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((o, i) => (
              <TableRow key={o.id} className="hover:bg-muted/20">
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">{o.name}</TableCell>
                <TableCell>{o.tenant}</TableCell>
                <TableCell>{o.members}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={o.status === "Active" ? "bg-success/10 text-success border-success/20" : "bg-muted text-muted-foreground"}>
                    {o.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={(e) => openEdit(o, e)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(o.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No organizations found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add / Edit Organization Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{dialogMode === "add" ? "Add New Organization" : "Edit Organization"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Name <span className="text-destructive">*</span></Label>
              <Input placeholder="Organization name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-input" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tenant <span className="text-destructive">*</span></Label>
                <Select value={form.tenant} onValueChange={(v) => setForm({ ...form, tenant: v })}>
                  <SelectTrigger className="rounded-input"><SelectValue placeholder="Select tenant" /></SelectTrigger>
                  <SelectContent>
                    {tenants.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-input"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-button" onClick={handleSave}>{dialogMode === "add" ? "Add Organization" : "Save Changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Organization</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{orgs.find((o) => o.id === deleteConfirm)?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" className="rounded-button" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="rounded-button" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
