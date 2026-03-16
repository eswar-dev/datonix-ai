import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Download } from "lucide-react";

const auditLog = [
  { ts: "2026-03-16 14:32", user: "Jane Doe", action: "Created report", resource: "Q4 Revenue Analysis", ip: "192.168.1.1" },
  { ts: "2026-03-16 12:15", user: "John Smith", action: "Uploaded dataset", resource: "inventory_feed.json", ip: "10.0.0.22" },
  { ts: "2026-03-15 09:44", user: "Jane Doe", action: "Updated role", resource: "Sarah Lee → Viewer", ip: "192.168.1.1" },
  { ts: "2026-03-14 16:20", user: "Mike Chen", action: "Deleted dataset", resource: "old_data.csv", ip: "172.16.0.5" },
];

export default function UserSessions() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search sessions…" className="pl-9 rounded-input" />
        </div>
        <Button variant="outline" className="rounded-button">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLog.map((entry, i) => (
              <TableRow key={i} className="hover:bg-muted/20">
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
    </div>
  );
}
