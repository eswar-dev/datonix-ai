import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Download, Search, Shield } from "lucide-react";

const mockUsers = [
  { id: "1", name: "Jane Doe", email: "jane@datonix.com", role: "Admin", org: "Datonix Corp", lastActive: "2 hours ago", status: "Active" },
  { id: "2", name: "John Smith", email: "john@acme.com", role: "Analyst", org: "Acme Inc", lastActive: "1 day ago", status: "Active" },
  { id: "3", name: "Sarah Lee", email: "sarah@acme.com", role: "Viewer", org: "Acme Inc", lastActive: "5 days ago", status: "Inactive" },
  { id: "4", name: "Mike Chen", email: "mike@partner.co", role: "Manager", org: "Partner Co", lastActive: "3 hours ago", status: "Active" },
];

const permissions = ["View Data", "Upload Data", "Run Bot", "Generate Reports", "Decision Intel", "Manage Users", "Audit Log"];
const roles = ["Admin", "Manager", "Analyst", "Viewer"];
const permMatrix: Record<string, Record<string, boolean>> = {
  "View Data": { Admin: true, Manager: true, Analyst: true, Viewer: true },
  "Upload Data": { Admin: true, Manager: true, Analyst: true, Viewer: false },
  "Run Bot": { Admin: true, Manager: true, Analyst: true, Viewer: false },
  "Generate Reports": { Admin: true, Manager: true, Analyst: false, Viewer: false },
  "Decision Intel": { Admin: true, Manager: true, Analyst: false, Viewer: false },
  "Manage Users": { Admin: true, Manager: false, Analyst: false, Viewer: false },
  "Audit Log": { Admin: true, Manager: true, Analyst: false, Viewer: false },
};

const auditLog = [
  { ts: "2026-03-16 14:32", user: "Jane Doe", action: "Created report", resource: "Q4 Revenue Analysis", ip: "192.168.1.1" },
  { ts: "2026-03-16 12:15", user: "John Smith", action: "Uploaded dataset", resource: "inventory_feed.json", ip: "10.0.0.22" },
  { ts: "2026-03-15 09:44", user: "Jane Doe", action: "Updated role", resource: "Sarah Lee → Viewer", ip: "192.168.1.1" },
  { ts: "2026-03-14 16:20", user: "Mike Chen", action: "Deleted dataset", resource: "old_data.csv", ip: "172.16.0.5" },
];

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

export default function Admin() {
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteStep, setInviteStep] = useState(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-2xl font-semibold">
          <Shield className="h-6 w-6" />
          Administration
        </h1>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="rounded-button">
          <TabsTrigger value="users" className="rounded-button">Users</TabsTrigger>
          <TabsTrigger value="roles" className="rounded-button">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="audit" className="rounded-button">Audit Log</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search users…" className="pl-9 rounded-input" />
            </div>
            <Button onClick={() => { setInviteOpen(true); setInviteStep(1); }} className="rounded-button">
              <UserPlus className="mr-2 h-4 w-4" /> Invite User
            </Button>
          </div>

          <Card className="rounded-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockUsers.map((u) => (
                  <TableRow key={u.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedUser(u)}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        {u.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      {u.name}
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleColor[u.role]}>{u.role}</Badge>
                    </TableCell>
                    <TableCell>{u.org}</TableCell>
                    <TableCell className="text-muted-foreground">{u.lastActive}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusColor[u.status]}>{u.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <Card className="rounded-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Permission</TableHead>
                  {roles.map((r) => (
                    <TableHead key={r} className="text-center">{r}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map((perm) => (
                  <TableRow key={perm}>
                    <TableCell className="font-medium text-sm">{perm}</TableCell>
                    {roles.map((role) => (
                      <TableCell key={role} className="text-center">
                        <Checkbox checked={permMatrix[perm][role]} className="mx-auto" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search audit log…" className="pl-9 rounded-input" />
            </div>
            <Button variant="outline" className="rounded-button">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          <Card className="rounded-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs font-mono">{entry.ts}</TableCell>
                    <TableCell>{entry.user}</TableCell>
                    <TableCell>{entry.action}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.resource}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{entry.ip}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* User detail drawer */}
      <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <SheetContent className="w-[480px] sm:max-w-[480px]">
          <SheetHeader>
            <SheetTitle>{selectedUser?.name}</SheetTitle>
          </SheetHeader>
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

      {/* Invite modal */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite User — Step {inviteStep} of 2</DialogTitle>
          </DialogHeader>
          {inviteStep === 1 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Enter email addresses (one per line for bulk invite).</p>
              <textarea
                className="w-full rounded-input border bg-background p-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                rows={4}
                placeholder="user@example.com&#10;another@example.com"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Assign a role to the invited users.</p>
              <Select>
                <SelectTrigger className="rounded-input">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r} value={r.toLowerCase()}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter className="gap-2">
            {inviteStep > 1 && (
              <Button variant="outline" className="rounded-button" onClick={() => setInviteStep(1)}>Back</Button>
            )}
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
