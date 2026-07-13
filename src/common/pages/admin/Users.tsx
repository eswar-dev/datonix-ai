import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  adminGetUsers,
  adminCreateUser,
  adminUpdateUser,
  adminDeleteUser,
  adminOrganizations,
  adminRoles,
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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/common/components/ui/select";
import { Search, Pencil, Trash2, Plus, Loader2 } from "lucide-react";
import { AdminTableLoadingRow } from "@/common/components/admin/AdminTableLoadingRow";
import { AdminDataCard } from "@/common/components/admin/AdminDataCard";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  rolePrimary: string;
  org: string;
  orgId: string;
  lastActive: string;
  status: string;
  linkedManager: string;
}

const statuses = ["Active", "Inactive"];

function isManagerRole(roleLabel: string) {
  return /manager/i.test(roleLabel);
}

const roleColor: Record<string, string> = {
  Admin: "bg-accent/10 text-accent border-accent/20",
  Manager: "bg-purple/10 text-purple border-purple/20",
  User: "bg-primary/10 text-primary border-primary/20",
  Analyst: "bg-teal/10 text-teal border-teal/20",
  Viewer: "bg-muted text-muted-foreground",
};

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground",
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "",
  orgId: "",
  status: "Active",
  linkedManager: "",
};

function mapUserRow(o: Record<string, unknown>, i: number): User {
  const orgObj = o.organization;
  let orgName = "—";
  let orgId = "";
  if (orgObj && typeof orgObj === "object") {
    const ob = orgObj as Record<string, unknown>;
    orgName = pickStr(ob, ["organization_name"], "—");
    const oid = ob.organization_id ?? ob.id;
    orgId = oid != null && String(oid) !== "" ? String(oid) : "";
  }
  const roleRaw = o.role;
  let roleStr = "—";
  let rolePrimary = "";
  if (Array.isArray(roleRaw) && roleRaw.length > 0) {
    rolePrimary = String(roleRaw[0]);
    roleStr = roleRaw.map((x) => String(x)).join(", ");
  } else if (roleRaw != null && String(roleRaw).trim() !== "") {
    roleStr = String(roleRaw);
    const parts = roleStr.split(",").map((s) => s.trim()).filter(Boolean);
    rolePrimary = parts[0] || roleStr;
  }
  const last = o.last_login;
  return {
    id: pickStr(o, ["id", "user_id", "pk"], String(i)),
    name: pickStr(o, ["username", "name", "full_name"], "—"),
    email: pickStr(o, ["email"], ""),
    role: roleStr,
    rolePrimary,
    org: orgName,
    orgId,
    lastActive: last != null ? String(last) : "—",
    status: o.is_active === false ? "Inactive" : "Active",
    linkedManager: "—",
  };
}

export default function Users() {
  const queryClient = useQueryClient();
  const {
    data: apiUsers,
    isLoading: apiLoading,
    isFetching,
    isPending,
    error: apiError,
  } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const raw = await adminGetUsers({ page: "1", page_size: "500" });
      const rows = extractKeyedArray<Record<string, unknown>>(raw, "users");
      return rows.map((row, i) => mapUserRow(row, i));
    },
    retry: 1,
  });
  const tableRefetching = isFetching && !isPending;

  const [users, setUsers] = useState<User[]>([]);

  const invalidateUserGraph = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "organizations"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "roles"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "user-sessions"] });
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminDeleteUser(id),
    onSuccess: () => invalidateUserGraph(),
  });

  useEffect(() => {
    if (apiUsers !== undefined) setUsers(apiUsers);
  }, [apiUsers]);

  const createMutation = useMutation({
    mutationFn: (fd: FormData) => adminCreateUser(fd),
    onSuccess: () => invalidateUserGraph(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, fd }: { id: string; fd: FormData }) => adminUpdateUser(id, fd),
    onSuccess: () => invalidateUserGraph(),
  });

  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: orgRows = [], isLoading: orgsLoading, error: orgsError } = useQuery({
    queryKey: ["admin", "organizations", "users-dialog"],
    queryFn: async () => {
      const raw = await adminOrganizations({ page: "1", page_size: "500" });
      return extractKeyedArray<Record<string, unknown>>(raw, "organizations");
    },
    staleTime: 60_000,
    enabled: dialogOpen,
  });

  const { data: roleRows = [], isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ["admin", "roles", "users-dialog", form.orgId || "__none__"],
    queryFn: async () => {
      if (!form.orgId) return [];
      const raw = await adminRoles({ page: "1", page_size: "500", o_id: form.orgId });
      return extractKeyedArray<Record<string, unknown>>(raw, "roles");
    },
    enabled: dialogOpen && !!form.orgId,
  });

  const managersList = users.filter((u) => isManagerRole(u.role)).map((u) => u.name);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.org.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const openEdit = (u: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.rolePrimary || u.role,
      orgId: u.orgId,
      status: u.status,
      linkedManager: u.linkedManager === "—" ? "" : u.linkedManager,
    });
    setEditId(u.id);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name?.trim() || !form.email?.trim() || !form.role || !form.orgId) {
      toast.error("Please fill all required fields");
      return;
    }
    if (dialogMode === "add") {
      if (!form.password?.trim()) {
        toast.error("Password is required for new users");
        return;
      }
      const fd = new FormData();
      fd.append("username", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("password", form.password);
      fd.append("organization", form.orgId);
      fd.append("roles", form.role);
      fd.append("status", form.status);
      if (form.linkedManager && form.linkedManager !== "none" && !isManagerRole(form.role)) {
        fd.append("linked_manager", form.linkedManager);
      }
      createMutation.mutate(fd, {
        onSuccess: () => {
          toast.success(`User "${form.name}" added successfully`);
          setDialogOpen(false);
        },
        onError: (e: Error) => toast.error(e.message || "Create failed"),
      });
      return;
    }
    if (editId) {
      const fd = new FormData();
      fd.append("username", form.name.trim());
      fd.append("email", form.email.trim());
      if (form.password.trim()) fd.append("password", form.password);
      fd.append("status", form.status === "Active" ? "True" : "False");
      fd.append("organization", form.orgId);
      fd.append("user_role", form.role);
      updateMutation.mutate(
        { id: editId, fd },
        {
          onSuccess: () => {
            toast.success(`User "${form.name}" updated successfully`);
            setDialogOpen(false);
          },
          onError: (e: Error) => toast.error(e.message || "Update failed"),
        }
      );
    }
  };

  const roleNamesFromApi = roleRows.map((row) =>
    pickStr(row as Record<string, unknown>, ["role"], "")
  ).filter(Boolean);
  const showCurrentRoleFallback =
    Boolean(form.role) &&
    dialogMode === "edit" &&
    !rolesLoading &&
    !roleNamesFromApi.includes(form.role);

  const handleDelete = (id: string) => {
    const u = users.find((x) => x.id === id);
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null);
        toast.success(`User "${u?.name}" deleted`);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <div className="space-y-5">
      {apiError && (
        <p className="text-sm text-destructive">{(apiError as Error).message}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users…"
            className="pl-9 rounded-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={openAdd} className="rounded-button">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <AdminDataCard className="rounded-card" isRefetching={tableRefetching}>
        <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-16">S.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Organization</TableHead>
              <TableHead>Linked Manager</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiLoading && filtered.length === 0 && (
              <AdminTableLoadingRow colSpan={9} label="Loading users…" />
            )}
            {filtered.map((u, i) => (
              <TableRow key={u.id} className="hover:bg-muted/20">
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                      {u.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    {u.name}
                  </div>
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={roleColor[u.role] || "bg-muted text-muted-foreground"}>
                    {u.role}
                  </Badge>
                </TableCell>
                <TableCell>{u.org}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={u.linkedManager !== "—" ? "bg-accent/10 text-accent border-accent/20" : "bg-muted text-muted-foreground"}
                  >
                    {u.linkedManager}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{u.lastActive}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColor[u.status]}>
                    {u.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-accent"
                      onClick={(e) => openEdit(u, e)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(u.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!apiLoading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
      </AdminDataCard>

      {/* Add / Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add New User" : "Edit User"}</DialogTitle>
          </DialogHeader>
          {(orgsError || rolesError) && (
            <p className="text-sm text-destructive">
              {[orgsError, rolesError].filter(Boolean).map((e) => (e as Error).message).join(" · ")}
            </p>
          )}
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Full Name <span className="text-destructive">*</span></Label>
                <Input
                  placeholder="John Doe"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input
                  type="email"
                  placeholder="john@company.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                {dialogMode === "add" ? (
                  <>
                    Password <span className="text-destructive">*</span>
                  </>
                ) : (
                  "New password"
                )}
              </Label>
              <Input
                type="password"
                autoComplete={dialogMode === "add" ? "new-password" : "new-password"}
                placeholder={dialogMode === "add" ? "Required" : "Leave blank to keep current"}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="rounded-input"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Organization <span className="text-destructive">*</span></Label>
                <Select
                  value={form.orgId || undefined}
                  onValueChange={(v) =>
                    setForm((prev) => ({ ...prev, orgId: v, role: "" }))
                  }
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
              <div className="space-y-2">
                <Label>Role <span className="text-destructive">*</span></Label>
                <Select
                  value={form.role || undefined}
                  onValueChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      role: v,
                      linkedManager: isManagerRole(v) ? "" : prev.linkedManager,
                    }))
                  }
                  disabled={!form.orgId || rolesLoading}
                >
                  <SelectTrigger className="rounded-input">
                    <SelectValue
                      placeholder={
                        !form.orgId
                          ? "Select organization first"
                          : rolesLoading
                            ? "Loading roles…"
                            : "Select role"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {showCurrentRoleFallback && (
                      <SelectItem value={form.role}>{form.role} (current)</SelectItem>
                    )}
                    {roleNamesFromApi.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                    {!rolesLoading && form.orgId && roleNamesFromApi.length === 0 && !showCurrentRoleFallback && (
                      <SelectItem value="__no_roles__" disabled>
                        No roles defined for this organization
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="rounded-input"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!isManagerRole(form.role) && (
                <div className="space-y-2">
                  <Label>Linked Manager</Label>
                  <Select
                    value={form.linkedManager || "none"}
                    onValueChange={(v) => setForm({ ...form, linkedManager: v === "none" ? "" : v })}
                  >
                    <SelectTrigger className="rounded-input"><SelectValue placeholder="Select manager" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Manager</SelectItem>
                      {managersList.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              )}
              {createMutation.isPending || updateMutation.isPending
                ? "Saving…"
                : dialogMode === "add"
                  ? "Add User"
                  : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <strong>{users.find((u) => u.id === deleteConfirm)?.name}</strong>? This action cannot be undone.
          </p>
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
