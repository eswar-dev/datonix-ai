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
import { Search, Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  title: string;
  lastActive: string;
  status: "Active" | "Inactive";
}

const initialUsers: User[] = [
  { id: "1", name: "Alex Chen",       email: "alex@datapx1.com",    title: "Operations Lead",      lastActive: "Now",       status: "Active" },
  { id: "2", name: "Priya Sharma",    email: "priya@datapx1.com",   title: "Maintenance Engineer", lastActive: "12m ago",   status: "Active" },
  { id: "3", name: "Sarah Okafor",    email: "sarah@datapx1.com",   title: "Plant Supervisor",     lastActive: "1h ago",    status: "Active" },
  { id: "4", name: "David Kim",       email: "david@datapx1.com",   title: "Reliability Engineer", lastActive: "3h ago",    status: "Active" },
  { id: "5", name: "James Whitfield", email: "james@datapx1.com",   title: "Production Analyst",   lastActive: "Yesterday", status: "Active" },
  { id: "6", name: "Sophie Clark",    email: "sophie@datapx1.com",  title: "Quality Inspector",    lastActive: "2 days ago", status: "Inactive" },
];

const titles = [
  "Operations Lead",
  "Maintenance Engineer",
  "Plant Supervisor",
  "Reliability Engineer",
  "Production Analyst",
  "Quality Inspector",
  "Process Engineer",
];
const statuses: User["status"][] = ["Active", "Inactive"];

const statusColor: Record<User["status"], string> = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground",
};

const emptyForm = { name: "", email: "", title: "", status: "Active" as User["status"] };

export default function Users() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.title.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setDialogMode("add");
    setDialogOpen(true);
  };

  const openEdit = (u: User, e: React.MouseEvent) => {
    e.stopPropagation();
    setForm({ name: u.name, email: u.email, title: u.title, status: u.status });
    setEditId(u.id);
    setDialogMode("edit");
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.title) {
      toast.error("Please fill all required fields");
      return;
    }
    if (dialogMode === "add") {
      const newUser: User = {
        id: String(Date.now()),
        name: form.name,
        email: form.email,
        title: form.title,
        status: form.status,
        lastActive: "Just now",
      };
      setUsers((prev) => [...prev, newUser]);
      toast.success(`User "${form.name}" added`);
    } else if (editId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editId
            ? { ...u, name: form.name, email: form.email, title: form.title, status: form.status }
            : u
        )
      );
      toast.success(`User "${form.name}" updated`);
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
              <TableHead>Title</TableHead>
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
                <TableCell className="text-muted-foreground">{u.title}</TableCell>
                <TableCell className="text-muted-foreground">{u.lastActive}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={statusColor[u.status]}>{u.status}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent" onClick={(e) => openEdit(u, e)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(u.id); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

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
                  placeholder="john@datapx1.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Select value={form.title} onValueChange={(v) => setForm({ ...form, title: v })}>
                  <SelectTrigger className="rounded-input"><SelectValue placeholder="Select title" /></SelectTrigger>
                  <SelectContent>
                    {titles.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as User["status"] })}>
                  <SelectTrigger className="rounded-input"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
