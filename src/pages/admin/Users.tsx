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
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { UserPlus, Search, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  org: string;
  lastActive: string;
  status: string;
  linkedManager: string;
}

const initialUsers: User[] = [
  { id: "1", name: "Alex Chen", email: "alex@meridianarchitects.com", role: "User", org: "Meridian Architects", lastActive: "2 hours ago", status: "Active", linkedManager: "Victoria Hayes" },
  { id: "2", name: "Priya Sharma", email: "priya@meridianarchitects.com", role: "User", org: "Meridian Architects", lastActive: "1 day ago", status: "Active", linkedManager: "Victoria Hayes" },
  { id: "3", name: "Victoria Hayes", email: "victoria@meridianarchitects.com", role: "Manager", org: "Meridian Architects", lastActive: "Now", status: "Active", linkedManager: "—" },
  { id: "4", name: "Sarah Okafor", email: "sarah@precisionmfg.com", role: "User", org: "Precision Manufacturing", lastActive: "3 hours ago", status: "Active", linkedManager: "Rajesh Patel" },
  { id: "5", name: "David Kim", email: "david@precisionmfg.com", role: "User", org: "Precision Manufacturing", lastActive: "5 hours ago", status: "Active", linkedManager: "Rajesh Patel" },
  { id: "6", name: "Rajesh Patel", email: "rajesh@precisionmfg.com", role: "Manager", org: "Precision Manufacturing", lastActive: "30m ago", status: "Active", linkedManager: "—" },
  { id: "7", name: "James Whitfield", email: "james@urbanretail.com", role: "User", org: "Urban Retail", lastActive: "1 hour ago", status: "Active", linkedManager: "Linda Nakamura" },
  { id: "8", name: "Sophie Clark", email: "sophie@urbanretail.com", role: "User", org: "Urban Retail", lastActive: "2 days ago", status: "Inactive", linkedManager: "Linda Nakamura" },
  { id: "9", name: "Linda Nakamura", email: "linda@urbanretail.com", role: "Manager", org: "Urban Retail", lastActive: "1h ago", status: "Active", linkedManager: "—" },
];

const roles = ["User", "Manager", "Admin", "Analyst", "Viewer"];
const orgs = ["Meridian Architects", "Precision Manufacturing", "Urban Retail"];
const statuses = ["Active", "Inactive"];

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

const emptyForm = { name: "", email: "", role: "", org: "", status: "Active", linkedManager: "" };

export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const managersList = users.filter((u) => u.role === "Manager").map((u) => u.name);

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
      role: u.role,
      org: u.org,
      status: u.status,
      linkedManager: u.linkedManager === "—" ? "" : u.linkedManager,
    });
    setEditId(u.id);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.role || !form.org) {
      toast.error("Please fill all required fields");
      return;
    }
    if (dialogMode === "add") {
      const newUser: User = {
        id: String(Date.now()),
        name: form.name,
        email: form.email,
        role: form.role,
        org: form.org,
        status: form.status,
        lastActive: "Just now",
        linkedManager: form.role === "Manager" ? "—" : (form.linkedManager || "—"),
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success(`User "${form.name}" added successfully`);
    } else if (editId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editId
            ? {
                ...u,
                name: form.name,
                email: form.email,
                role: form.role,
                org: form.org,
                status: form.status,
                linkedManager: form.role === "Manager" ? "—" : (form.linkedManager || "—"),
              }
            : u
        )
      );
      toast.success(`User "${form.name}" updated successfully`);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const user = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    setDeleteConfirm(null);
    toast.success(`User "${user?.name}" deleted`);
  };

  return (
    <div className="space-y-5">
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add / Edit User Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === "add" ? "Add New User" : "Edit User"}</DialogTitle>
          </DialogHeader>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role <span className="text-destructive">*</span></Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v, linkedManager: v === "Manager" ? "" : form.linkedManager })}>
                  <SelectTrigger className="rounded-input"><SelectValue placeholder="Select role" /></SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Organization <span className="text-destructive">*</span></Label>
                <Select value={form.org} onValueChange={(v) => setForm({ ...form, org: v })}>
                  <SelectTrigger className="rounded-input"><SelectValue placeholder="Select organization" /></SelectTrigger>
                  <SelectContent>
                    {orgs.map((o) => (
                      <SelectItem key={o} value={o}>{o}</SelectItem>
                    ))}
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
              {form.role !== "Manager" && (
                <div className="space-y-2">
                  <Label>Linked Manager</Label>
                  <Select value={form.linkedManager} onValueChange={(v) => setForm({ ...form, linkedManager: v })}>
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
            <Button variant="outline" className="rounded-button" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="rounded-button" onClick={handleSave}>
              {dialogMode === "add" ? "Add User" : "Save Changes"}
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
            <Button variant="outline" className="rounded-button" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" className="rounded-button" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
