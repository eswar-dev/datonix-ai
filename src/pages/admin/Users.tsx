import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Search, Pencil, Trash2 } from "lucide-react";

const mockUsers = [
  { id: "1", name: "Jane Doe", email: "jane@datonix.com", role: "Admin", org: "Datonix Corp", lastActive: "2 hours ago", status: "Active", linkedManager: "Victoria Hayes" },
  { id: "2", name: "John Smith", email: "john@acme.com", role: "Analyst", org: "Acme Inc", lastActive: "1 day ago", status: "Active", linkedManager: "Rajesh Patel" },
  { id: "3", name: "Sarah Lee", email: "sarah@acme.com", role: "Viewer", org: "Acme Inc", lastActive: "5 days ago", status: "Inactive", linkedManager: "—" },
  { id: "4", name: "Mike Chen", email: "mike@partner.co", role: "Manager", org: "Partner Co", lastActive: "3 hours ago", status: "Active", linkedManager: "Linda Nakamura" },
];

const roles = ["Admin", "Manager", "Analyst", "Viewer"];
const managers = ["Victoria Hayes", "Rajesh Patel", "Linda Nakamura"];

const roleColor: Record<string, string> = {
  Admin: "bg-accent/10 text-accent border-accent/20",
  Manager: "bg-purple/10 text-purple border-purple/20",
  Analyst: "bg-teal/10 text-teal border-teal/20",
  Viewer: "bg-muted text-muted-foreground",
};

const statusColor: Record<string, string> = {
  Active: "bg-success/10 text-success border-success/20",
  Inactive: "bg-muted text-muted-foreground",
};

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteStep, setInviteStep] = useState(1);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search users…" className="pl-9 rounded-input" />
        </div>
        <Button onClick={() => { setInviteOpen(true); setInviteStep(1); }} className="rounded-button">
          <UserPlus className="mr-2 h-4 w-4" /> Invite User
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
            {mockUsers.map((u, i) => (
              <TableRow key={u.id} className="hover:bg-muted/20 cursor-pointer" onClick={() => setSelectedUser(u)}>
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold shrink-0">
                    {u.name.split(" ").map((n) => n[0]).join("")}
                  </div>
                  {u.name}
                </TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Badge variant="outline" className={roleColor[u.role]}>{u.role}</Badge></TableCell>
                <TableCell>{u.org}</TableCell>
                <TableCell className="text-muted-foreground">{u.lastActive}</TableCell>
                <TableCell><Badge variant="outline" className={statusColor[u.status]}>{u.status}</Badge></TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader><SheetTitle>{selectedUser?.name}</SheetTitle></SheetHeader>
          {selectedUser && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-lg font-semibold">
                  {selectedUser.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Card className="rounded-card p-4">
                  <p className="text-xs text-muted-foreground">Role</p>
                  <Badge variant="outline" className={`mt-1 ${roleColor[selectedUser.role]}`}>{selectedUser.role}</Badge>
                </Card>
                <Card className="rounded-card p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="outline" className={`mt-1 ${statusColor[selectedUser.status]}`}>{selectedUser.status}</Badge>
                </Card>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-button">Reset Password</Button>
                <Button variant="destructive" className="flex-1 rounded-button">Revoke Access</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Invite User — Step {inviteStep} of 2</DialogTitle></DialogHeader>
          {inviteStep === 1 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Enter email addresses (one per line).</p>
              <textarea className="w-full rounded-input border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" rows={4} placeholder={"user@example.com\nanother@example.com"} />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Assign a role to the invited users.</p>
              <Select>
                <SelectTrigger className="rounded-input"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  {roles.map((r) => <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="gap-2">
            {inviteStep > 1 && <Button variant="outline" className="rounded-button" onClick={() => setInviteStep(1)}>Back</Button>}
            {inviteStep === 1 ? (
              <Button className="rounded-button" onClick={() => setInviteStep(2)}>Next</Button>
            ) : (
              <Button className="rounded-button" onClick={() => setInviteOpen(false)}>Send Invites</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
