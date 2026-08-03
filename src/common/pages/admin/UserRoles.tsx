import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminRoles,
  adminModifyRole,
  adminPostNewRole,
  adminDeleteRole,
  adminOrganizations,
  extractKeyedArray,
  pickStr,
} from "@/common/api";
import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Checkbox } from "@/common/components/ui/checkbox";
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

interface Role {
  id: string;
  name: string;
  permissions: string[];
  organizationId: string;
}

/** Matches `adminNavItems` in AppSidebar (screen labels). */
const adminModules = ["Tenants", "Organizations", "User Roles", "Users", "User Sessions"];
const adminActions = ["Read", "Create", "Write", "Delete"];

/** Main app nav in AppSidebar (excluding Administration). */
const appModules = ["Data Sources", "Dashboard", "Datonix AI", "Reports", "Decision Intelligence"];

function permKey(module: string, action: string) {
  const m = module.toLowerCase().replace(/ /g, "_");
  const a = action.toLowerCase();
  return `${m}_${a}`;
}

/** Map stored permission strings from older UI versions → current `permKey` values. */
const LEGACY_PERMISSION_ALIASES: Record<string, string> = {
  tenant_Read: "tenants_read",
  tenant_Create: "tenants_create",
  tenant_Write: "tenants_write",
  tenant_Delete: "tenants_delete",
  organization_Read: "organizations_read",
  organization_Create: "organizations_create",
  organization_Write: "organizations_write",
  organization_Delete: "organizations_delete",
  users_Read: "users_read",
  users_Create: "users_create",
  users_Write: "users_write",
  users_Delete: "users_delete",
  roles_Read: "user_roles_read",
  roles_Create: "user_roles_create",
  roles_Write: "user_roles_write",
  roles_Delete: "user_roles_delete",
  sessions_Read: "user_sessions_read",
  sessions_Create: "user_sessions_create",
  sessions_Write: "user_sessions_write",
  sessions_Delete: "user_sessions_delete",
  home_Access: "dashboard_access",
  home_access: "dashboard_access",
  data_analysis_Access: "data_sources_access",
  visualizations_Access: "reports_access",
  missing_value_treatment_Access: "data_sources_access",
  ai_models_Access: "datonix_ai_access",
  kpi_Access: "dashboard_access",
};

function mergePermissionKeysFromApi(raw: string[]): Set<string> {
  const next = new Set<string>();
  for (const p of raw) {
    next.add(p);
    const mapped = LEGACY_PERMISSION_ALIASES[p];
    if (mapped) next.add(mapped);
  }
  return next;
}

function mapRoleRow(o: Record<string, unknown>, i: number): Role {
  const permsRaw = o.permissions ?? o.permission ?? [];
  const perms = Array.isArray(permsRaw)
    ? permsRaw.map(String)
    : typeof permsRaw === "string"
      ? [permsRaw]
      : [];
  const organizationId = pickStr(o, ["organization_id", "organization"], "");
  return {
    id: pickStr(o, ["id", "role_id", "pk"], `row-${i}`),
    name: pickStr(o, ["role", "name", "role_name"], "—"),
    permissions: perms.length ? perms : ["dashboard_access"],
    organizationId,
  };
}

export default function UserRoles() {
  const queryClient = useQueryClient();
  const {
    data: apiRoles,
    isLoading: apiLoading,
    isFetching,
    isPending,
    error: apiError,
  } = useQuery({
    queryKey: ["admin", "roles"],
    queryFn: async () => {
      const raw = await adminRoles({ page: "1", page_size: "500" });
      const rows = extractKeyedArray<Record<string, unknown>>(raw, "roles");
      return rows.map((row, i) => mapRoleRow(row, i));
    },
    retry: 1,
  });
  const tableRefetching = isFetching && !isPending;

  const [roles, setRoles] = useState<Role[]>([]);
  const [organizationId, setOrganizationId] = useState("");

  useEffect(() => {
    if (apiRoles !== undefined) setRoles(apiRoles);
  }, [apiRoles]);

  const invalidateRoleGraph = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "user-sessions"] });
  };

  const modifyMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: FormData }) => adminModifyRole(id, body),
    onSuccess: () => invalidateRoleGraph(),
  });

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => adminPostNewRole(fd),
    onSuccess: () => invalidateRoleGraph(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteRole(id),
    onSuccess: () => invalidateRoleGraph(),
  });
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [roleName, setRoleName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: orgRows = [], isLoading: orgsLoading } = useQuery({
    queryKey: ["admin", "organizations", "roles-dialog"],
    queryFn: async () => {
      const raw = await adminOrganizations({ page: "1", page_size: "500" });
      return extractKeyedArray<Record<string, unknown>>(raw, "organizations");
    },
    staleTime: 60_000,
    enabled: dialogOpen,
  });

  const filtered = roles.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  const togglePerm = (key: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openAdd = () => {
    setRoleName("");
    setSelectedPerms(new Set());
    setOrganizationId("");
    setEditId(null);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const openEdit = (role: Role, e: React.MouseEvent) => {
    e.stopPropagation();
    setRoleName(role.name);
    setSelectedPerms(mergePermissionKeysFromApi(role.permissions));
    setOrganizationId(role.organizationId);
    setEditId(role.id);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!roleName) {
      toast.error("Please enter a role name");
      return;
    }
    const perms = Array.from(selectedPerms);
    if (dialogMode === "add") {
      if (!organizationId.trim()) {
        toast.error("Organization is required");
        return;
      }
      const fd = new FormData();
      fd.append("roles", roleName);
      perms.forEach((p) => fd.append("permissions", p));
      fd.append("organization", organizationId.trim());
      createMutation.mutate(fd, {
        onSuccess: () => {
          toast.success(`Role "${roleName}" created`);
          setDialogOpen(false);
          setOrganizationId("");
        },
        onError: (e: Error) => toast.error(e.message),
      });
    } else if (editId !== null) {
      if (!organizationId.trim()) {
        toast.error("Organization is required");
        return;
      }
      const fd = new FormData();
      perms.forEach((p) => fd.append("permissions", p));
      fd.append("organization_id", organizationId.trim());
      modifyMutation.mutate(
        { id: editId, body: fd },
        {
          onSuccess: () => {
            toast.success(`Role "${roleName}" updated successfully`);
            setDialogOpen(false);
          },
          onError: (e: Error) => toast.error(e.message),
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    const role = roles.find((r) => r.id === id);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
        toast.success(`Role "${role?.name}" deleted`);
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
          <Input placeholder="Search roles…" className="pl-9 rounded-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Button onClick={openAdd} className="rounded-button">
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </div>

      <AdminDataCard className="rounded-card" isRefetching={tableRefetching}>
        <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20">S.No</TableHead>
              <TableHead>Role Name</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiLoading && filtered.length === 0 && (
              <AdminTableLoadingRow colSpan={4} label="Loading roles…" />
            )}
            {filtered.map((role, i) => (
              <TableRow key={role.id} className="hover:bg-muted/20">
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 max-w-lg">
                    {role.permissions.slice(0, 6).map((p) => (
                      <Badge key={p} variant="outline" className="bg-accent/5 text-accent border-accent/20 text-xs font-normal">{p}</Badge>
                    ))}
                    {role.permissions.length > 6 && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">+{role.permissions.length - 6} more</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={(e) => openEdit(role, e)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={(e) => { e.stopPropagation(); setDeleteConfirm(role.id); }}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!apiLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No roles found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
        <div className="flex items-center justify-end gap-4 border-t px-4 py-3 text-sm text-muted-foreground">
          <span>1-{filtered.length} of {filtered.length} items</span>
        </div>
      </Card>
      </AdminDataCard>

      {/* Add / Edit Role Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{dialogMode === "add" ? "Add New Role" : "Edit Role"}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <Label>Role Name <span className="text-destructive">*</span></Label>
              <Input value={roleName} onChange={(e) => setRoleName(e.target.value)} placeholder="Enter role name" className="rounded-input" />
            </div>

            <div className="space-y-2">
              <Label>
                Organization <span className="text-destructive">*</span>
              </Label>
              <Select
                value={organizationId || undefined}
                onValueChange={setOrganizationId}
                disabled={orgsLoading}
              >
                <SelectTrigger className="rounded-input">
                  <SelectValue placeholder={orgsLoading ? "Loading organizations…" : "Select organization"} />
                </SelectTrigger>
                <SelectContent>
                  {orgRows.map((raw) => {
                    const row = raw as Record<string, unknown>;
                    const id = pickStr(row, ["id"], "");
                    const name = pickStr(row, ["name"], id);
                    return (
                      <SelectItem key={id} value={id}>
                        {name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Permissions <span className="text-destructive">*</span></Label>

              {/* Administration — matches sidebar under /admin */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold">Administration</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Same sections as the admin sidebar: full create / read / update / delete style control per screen.
                </p>
                <Card className="rounded-card overflow-hidden border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Module</TableHead>
                        {adminActions.map((a) => <TableHead key={a} className="text-center w-20">{a}</TableHead>)}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {adminModules.map((mod) => (
                        <TableRow key={mod} className="hover:bg-muted/20">
                          <TableCell className="font-medium text-sm">{mod}</TableCell>
                          {adminActions.map((action) => {
                            const key = permKey(mod, action);
                            return (
                              <TableCell key={action} className="text-center">
                                <Checkbox checked={selectedPerms.has(key)} onCheckedChange={() => togglePerm(key)} className="mx-auto" />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>

              {/* Main application — matches primary sidebar (non-admin) */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold">Application</h4>
                <p className="text-xs text-muted-foreground mb-3">
                  Same entries as the main sidebar; each module uses a single Access permission.
                </p>
                <Card className="rounded-card overflow-hidden border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Module</TableHead>
                        <TableHead className="text-center w-24">Access</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {appModules.map((mod) => {
                        const key = permKey(mod, "Access");
                        return (
                          <TableRow key={mod} className="hover:bg-muted/20">
                            <TableCell className="font-medium text-sm">{mod}</TableCell>
                            <TableCell className="text-center">
                              <Checkbox checked={selectedPerms.has(key)} onCheckedChange={() => togglePerm(key)} className="mx-auto" />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button
              variant="outline"
              className="rounded-button"
              disabled={createMutation.isPending || modifyMutation.isPending}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="rounded-button inline-flex items-center"
              disabled={createMutation.isPending || modifyMutation.isPending}
              onClick={handleSave}
            >
              {(createMutation.isPending || modifyMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              )}
              {createMutation.isPending || modifyMutation.isPending
                ? "Saving…"
                : dialogMode === "add"
                  ? "Add Role"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Delete Role</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">Are you sure you want to delete <strong>{roles.find((r) => r.id === deleteConfirm)?.name}</strong>? This action cannot be undone.</p>
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
