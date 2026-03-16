import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";

const mockOrgs = [
  { id: 1, name: "Datonix Corp", tenant: "Admin_ai-priori", members: 24, status: "Active" },
  { id: 2, name: "Acme Inc", tenant: "ai-priori", members: 12, status: "Active" },
  { id: 3, name: "Partner Co", tenant: "Kalmar", members: 8, status: "Inactive" },
];

export default function Organizations() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Button className="rounded-button">
          <Plus className="mr-2 h-4 w-4" /> Add Organization
        </Button>
      </div>

      <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead className="w-20">S.No</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-32">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockOrgs.map((o, i) => (
              <TableRow key={o.id} className="hover:bg-muted/20">
                <TableCell>{i + 1}</TableCell>
                <TableCell className="font-medium">{o.name}</TableCell>
                <TableCell>{o.tenant}</TableCell>
                <TableCell>{o.members}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={o.status === "Active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}>
                    {o.status}
                  </Badge>
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
      </Card>
    </div>
  );
}
