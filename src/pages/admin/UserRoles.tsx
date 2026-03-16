import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface Role {
  id: number;
  name: string;
  permissions: string[];
}

const mockRoles: Role[] = [
  { id: 1, name: "super admin", permissions: ["tenant_Read", "tenant_Create", "tenant_Write", "tenant_Delete", "organization_Read", "organization_Create", "users_Read", "users_Create", "users_Write", "users_Delete", "roles_Read", "roles_Create", "roles_Write", "roles_Delete", "sessions_Read", "sessions_Write", "sessions_Delete", "home_Access", "data_analysis_Access", "visualizations_Access", "missing_value_Access", "ai_models_Access", "kpi_Access"] },
  { id: 2, name: "Admin", permissions: ["tenant_Read", "organization_Read", "users_Read", "users_Write", "roles_Read", "roles_Write", "sessions_Read", "sessions_Write", "home_Access", "data_analysis_Access", "ai_models_Access", "kpi_Access"] },
  { id: 3, name: "kalmar-admin", permissions: ["users_Read", "users_Delete", "roles_Read", "roles_Create", "sessions_Read", "home_Access", "data_analysis_Access", "visualizations_Access"] },
  { id: 4, name: "engineer", permissions: ["home_Access", "data_analysis_Access", "visualizations_Access", "ai_models_Access", "kpi_Access"] },
  { id: 5, name: "employee", permissions: ["home_Access", "data_analysis_Access"] },
];

const adminModules = ["Tenant", "Organization", "Users", "Roles", "Sessions"];
const adminActions = ["Read", "Create", "Write", "Delete"];

const appModules = ["Home", "Data Analysis", "Visualizations", "Missing Value Treatment", "AI Models", "KPI"];

function permKey(module: string, action: string) {
  return `${module.toLowerCase().replace(/ /g, "_")}_${action}`;
}

export default function UserRoles() {
  const [createOpen, setCreateOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<Set<string>>(new Set());

  const togglePerm = (key: string) => {
    setSelectedPerms((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const openCreate = () => {
    setRoleName("");
    setSelectedPerms(new Set());
    setCreateOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button onClick={openCreate} className="rounded-button">
          <Plus className="mr-2 h-4 w-4" /> Add Role
        </Button>
      </div>

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
            {mockRoles.map((role, i) => (
              <TableRow key={role.id} className="hover:bg-muted/20">
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 max-w-lg">
                    {role.permissions.slice(0, 6).map((p) => (
                      <Badge key={p} variant="outline" className="bg-accent/5 text-accent border-accent/20 text-xs font-normal">
                        {p}
                      </Badge>
                    ))}
                    {role.permissions.length > 6 && (
                      <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                        +{role.permissions.length - 6} more
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-accent"><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-end gap-4 border-t px-4 py-3 text-sm text-muted-foreground">
          <span>1-{mockRoles.length} of {mockRoles.length} items</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>‹</Button>
            <Input value={1} className="h-8 w-10 text-center rounded-input" readOnly />
            <Button variant="outline" size="icon" className="h-8 w-8" disabled>›</Button>
          </div>
          <span>10 / page</span>
        </div>
      </Card>

      {/* Create Role Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Role</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Role Name */}
            <div>
              <label className="text-sm font-medium">
                <span className="text-destructive">*</span> Role Name
              </label>
              <Input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name"
                className="mt-1.5 rounded-input"
              />
            </div>

            {/* Permissions */}
            <div>
              <label className="text-sm font-medium">
                <span className="text-destructive">*</span> Permissions
              </label>

              {/* Admin Screens */}
              <div className="mt-4">
                <h4 className="text-sm font-semibold">Admin Screens</h4>
                <p className="text-xs text-muted-foreground mb-3">These screens require full permissions management</p>
                <Card className="rounded-card overflow-hidden border">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead>Module</TableHead>
                        {adminActions.map((a) => (
                          <TableHead key={a} className="text-center w-20">{a}</TableHead>
                        ))}
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
                                <Checkbox
                                  checked={selectedPerms.has(key)}
                                  onCheckedChange={() => togglePerm(key)}
                                  className="mx-auto"
                                />
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>

              {/* Application Screens */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold">Application Screens</h4>
                <p className="text-xs text-muted-foreground mb-3">These screens only require Read/access permission</p>
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
                              <Checkbox
                                checked={selectedPerms.has(key)}
                                onCheckedChange={() => togglePerm(key)}
                                className="mx-auto"
                              />
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
            <Button variant="outline" className="rounded-button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button className="rounded-button" onClick={() => setCreateOpen(false)}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
