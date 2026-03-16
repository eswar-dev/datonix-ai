import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

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

export default function UserRoles() {
  return (
    <div className="space-y-5">
      <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-48">Permission</TableHead>
              {roles.map((r) => (
                <TableHead key={r} className="text-center">{r}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.map((perm) => (
              <TableRow key={perm} className="hover:bg-muted/20">
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
    </div>
  );
}
