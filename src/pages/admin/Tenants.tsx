import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminTenants,
  adminCreateTenants,
  adminDeleteTenant,
  adminUpdateTenant,
  extractKeyedArray,
  pickStr,
  pickNum,
} from "@/api";
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
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Search, Loader2 } from "lucide-react";
import { AdminTableLoadingRow } from "@/components/admin/AdminTableLoadingRow";
import { AdminDataCard } from "@/components/admin/AdminDataCard";
import { toast } from "sonner";

interface Tenant {
  id: number;
  name: string;
  type: string;
  timeout?: string;
}

const types = ["ai-priori", "customer"];
type SortKey = "id" | "name" | "type";

const emptyForm = { name: "", type: "", timeout: "3600" };

function mapTenantRow(o: Record<string, unknown>, i: number): Tenant {
  return {
    id: pickNum(o, ["id", "tenant_id", "pk"], i + 1),
    name: pickStr(o, ["name", "tenant_name", "title"], "—"),
    type: pickStr(o, ["type", "tenant_type"], "—"),
    timeout: pickStr(o, ["timeout"], ""),
  };
}

export default function Tenants() {
  const queryClient = useQueryClient();
  const {
    data: apiTenants,
    isLoading: apiLoading,
    isFetching,
    isPending,
    error: apiError,
  } = useQuery({
    queryKey: ["admin", "tenants"],
    queryFn: async () => {
      const raw = await adminTenants({ page: "1", page_size: "500" });
      const rows = extractKeyedArray<Record<string, unknown>>(raw, "tenants");
      return rows.map((row, i) => mapTenantRow(row, i));
    },
    retry: 1,
  });
  const tableRefetching = isFetching && !isPending;

  const [tenants, setTenants] = useState<Tenant[]>([]);

  useEffect(() => {
    if (apiTenants !== undefined) setTenants(apiTenants);
  }, [apiTenants]);

  const invalidateTenantGraph = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "user-sessions"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; type: string; timeout: string }) =>
      adminCreateTenants({
        tenant_name: payload.name,
        tenant_type: payload.type,
        timeout: payload.timeout,
      }),
    onSuccess: () => invalidateTenantGraph(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminDeleteTenant(String(id)),
    onSuccess: () => invalidateTenantGraph(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; name: string; type: string; timeout: string }) =>
      adminUpdateTenant(String(payload.id), {
        tenant_name: payload.name,
        tenant_type: payload.type,
        tenant_timeout: payload.timeout,
      }),
    onSuccess: () => invalidateTenantGraph(),
  });
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
    setForm({ ...emptyForm });
    setEditId(null);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const openEdit = (t: Tenant, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({ name: t.name, type: t.type, timeout: t.timeout || "3600" });
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
      createMutation.mutate(
        { name: form.name, type: form.type, timeout: form.timeout || "3600" },
        {
          onSuccess: () => {
            toast.success(`Tenant "${form.name}" added successfully`);
            setDialogOpen(false);
          },
          onError: (e: Error) => toast.error(e.message || "Create failed"),
        }
      );
    } else if (editId !== null) {
      updateMutation.mutate(
        { id: editId, name: form.name, type: form.type, timeout: form.timeout || "3600" },
        {
          onSuccess: () => {
            toast.success(`Tenant "${form.name}" updated successfully`);
            setDialogOpen(false);
          },
          onError: (e: Error) => toast.error(e.message),
        }
      );
    }
  };

  const handleDelete = (id: number) => {
    const tenant = tenants.find((t) => t.id === id);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
        toast.success(`Tenant "${tenant?.name}" deleted`);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-5">
      {apiError && (
        <p className="text-sm text-destructive">
          {(apiError as Error).message}
        </p>
      )}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tenants…" className="pl-9 rounded-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} className="rounded-button">
          <Plus className="mr-2 h-4 w-4" /> Add Tenant
        </Button>
      </div>

      <AdminDataCard className="rounded-card" isRefetching={tableRefetching}>
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
            {apiLoading && paginated.length === 0 && (
              <AdminTableLoadingRow colSpan={4} label="Loading tenants…" />
            )}
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
            {!apiLoading && paginated.length === 0 && (
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
      </AdminDataCard>

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
            <div className="space-y-2">
              <Label>Timeout (seconds)</Label>
              <Input
                placeholder="3600"
                value={form.timeout}
                onChange={(e) => setForm({ ...form, timeout: e.target.value })}
                className="rounded-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              className="rounded-button"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-button inline-flex items-center"
              disabled={createMutation.isPending || updateMutation.isPending}
              onClick={handleSave}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              )}
              {createMutation.isPending || updateMutation.isPending
                ? "Saving…"
                : dialogMode === "add"
                  ? "Add Tenant"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Tenant</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{tenants.find((t) => t.id === deleteConfirm)?.name}</strong>? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" className="rounded-button" disabled={deleteMutation.isPending} onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button
              variant="destructive"
              className="rounded-button inline-flex items-center"
              disabled={deleteMutation.isPending}
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />}
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
