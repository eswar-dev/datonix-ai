import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminOrganizations,
  adminCreateOrganizations,
  adminTenants,
  adminDeleteOrganization,
  adminUpdateOrganization,
  extractKeyedArray,
  pickStr,
} from "@/common/api";
import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/common/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/common/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { AdminTableLoadingRow } from "@/common/components/admin/AdminTableLoadingRow";
import { AdminDataCard } from "@/common/components/admin/AdminDataCard";
import { toast } from "sonner";

interface Org {
  id: string;
  name: string;
  tenant: string;
  tenantId: string;
  status: string;
}

const statuses = ["Active", "Inactive"];

const emptyForm = { name: "", tenantId: "", status: "Active" };

function mapOrgRow(
  o: Record<string, unknown>,
  i: number,
  tenantNameById: Map<string, string>
): Org {
  const t = o.tenant as Record<string, unknown> | undefined;
  const tenantId = t
    ? pickStr(t, ["Tenant Id", "tenant_id", "id"], "")
    : pickStr(o, ["tenant_id", "tenant"], "");
  const tenantLabel = t
    ? pickStr(t, ["Tenant Name", "tenant_name", "name"], "—")
    : tenantNameById.get(tenantId) || "—";
  return {
    id: pickStr(o, ["id"], String(i)),
    name: pickStr(o, ["name", "organization_name"], "—"),
    tenant: tenantLabel,
    tenantId,
    status: (() => {
      const s = pickStr(o, ["status"], "active");
      return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
    })(),
  };
}

export default function Organizations() {
  const queryClient = useQueryClient();

  const { data: tenantOptions } = useQuery({
    queryKey: ["admin", "tenants", "dropdown"],
    queryFn: async () => {
      const raw = await adminTenants({ page: "1", page_size: "500" });
      return extractKeyedArray<Record<string, unknown>>(raw, "tenants");
    },
    staleTime: 60_000,
  });

  const tenantNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of tenantOptions ?? []) {
      const id = pickStr(row, ["id", "tenant_id"], "");
      const name = pickStr(row, ["name", "tenant_name"], "");
      if (id) map.set(id, name || id);
    }
    return map;
  }, [tenantOptions]);

  const {
    data: apiOrgs,
    isLoading: apiLoading,
    isFetching,
    isPending,
    error: apiError,
  } = useQuery({
    queryKey: ["admin", "organizations", tenantNameById.size],
    queryFn: async () => {
      const raw = await adminOrganizations({ page: "1", page_size: "500" });
      const rows = extractKeyedArray<Record<string, unknown>>(raw, "organizations");
      return rows.map((row, i) => mapOrgRow(row, i, tenantNameById));
    },
    retry: 1,
  });
  const tableRefetching = isFetching && !isPending;

  const [orgs, setOrgs] = useState<Org[]>([]);

  useEffect(() => {
    if (apiOrgs !== undefined) setOrgs(apiOrgs);
  }, [apiOrgs]);

  const invalidateOrgGraph = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "user-sessions"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: { name: string; tenantId: string }) =>
      adminCreateOrganizations({
        tenant_id: payload.tenantId,
        name: payload.name,
        status: "active",
      }),
    onSuccess: () => invalidateOrgGraph(),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; name: string; tenantId: string; status: string }) =>
      adminUpdateOrganization(payload.id, {
        name: payload.name,
        status: payload.status,
      }),
    onSuccess: () => invalidateOrgGraph(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteOrganization(id),
    onSuccess: () => invalidateOrgGraph(),
  });
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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
    setForm({ name: o.name, tenantId: o.tenantId, status: o.status });
    setEditId(o.id);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.tenantId) {
      toast.error("Please fill all required fields");
      return;
    }
    if (dialogMode === "add") {
      createMutation.mutate(
        { name: form.name, tenantId: form.tenantId },
        {
          onSuccess: () => {
            toast.success(`Organization "${form.name}" added successfully`);
            setDialogOpen(false);
          },
          onError: (e: Error) => toast.error(e.message || "Create failed"),
        }
      );
    } else if (editId !== null) {
      updateMutation.mutate(
        { id: editId, name: form.name, tenantId: form.tenantId, status: form.status },
        {
          onSuccess: () => {
            toast.success(`Organization "${form.name}" updated successfully`);
            setDialogOpen(false);
          },
          onError: (e: Error) => toast.error(e.message),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    const org = orgs.find((o) => o.id === id);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
        toast.success(`Organization "${org?.name}" deleted`);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-5">
      {apiError && <p className="text-sm text-destructive">{(apiError as Error).message}</p>}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search organizations…" className="pl-9 rounded-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} className="rounded-button">
          <Plus className="mr-2 h-4 w-4" /> Add Organization
        </Button>
      </div>

      <AdminDataCard className="rounded-card" isRefetching={tableRefetching}>
        <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20">S.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiLoading && filtered.length === 0 && (
              <AdminTableLoadingRow colSpan={5} label="Loading organizations…" />
            )}
            {filtered.map((o, i) => (
              <TableRow key={o.id} className="hover:bg-muted/20">
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">{o.name}</TableCell>
                <TableCell>{o.tenant}</TableCell>
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
            {!apiLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No organizations found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      </AdminDataCard>

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
                <Select value={form.tenantId} onValueChange={(v) => setForm({ ...form, tenantId: v })}>
                  <SelectTrigger className="rounded-input"><SelectValue placeholder="Select tenant" /></SelectTrigger>
                  <SelectContent>
                    {(tenantOptions ?? []).map((t) => {
                      const row = t as Record<string, unknown>;
                      const id = pickStr(row, ["id"], "");
                      const name = pickStr(row, ["name"], id);
                      return (
                        <SelectItem key={id} value={id}>{name}</SelectItem>
                      );
                    })}
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
                  ? "Add Organization"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Organization</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{orgs.find((o) => o.id === deleteConfirm)?.name}</strong>? This action cannot be undone.</p>
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
