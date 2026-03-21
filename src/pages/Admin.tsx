import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { UserPlus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

export default function Admin() {
  const { user } = useAuth();
  if (!user) return null;
  const data = roleData[user.role].administration;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Administration</h1>
        <Button className="rounded-button gap-2">
          <UserPlus className="h-4 w-4" /> Invite User
        </Button>
      </div>

      {/* Plan & Data Quality */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-card p-5">
          <p className="text-xs text-muted-foreground">Current Plan</p>
          <p className="text-lg font-semibold mt-1">{data.plan}</p>
        </Card>
        <Card className="rounded-card p-5">
          <p className="text-xs text-muted-foreground">Data Quality Score</p>
          <p className="text-lg font-semibold mt-1">{data.dataQuality}%</p>
        </Card>
      </div>

      {/* Team Members */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Team Members</h2>
        <Card className="rounded-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.users.map((u) => (
                <TableRow key={u.name}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-muted-foreground">{u.role}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <div className={`h-2 w-2 rounded-full ${u.status === "Active" ? "bg-emerald-400" : "bg-gray-400"}`} />
                      <span className="text-sm">{u.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{u.lastLogin}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      {/* Active Integrations */}
      <div>
        <h2 className="mb-3 text-sm font-semibold">Active Integrations</h2>
        <div className="flex flex-wrap gap-2">
          {data.integrations.map((name) => (
            <Badge key={name} variant="secondary" className="text-xs">{name}</Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
