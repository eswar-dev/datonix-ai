import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import type { ConnectorMapping } from "@/domains/aec/data/connectors";

export function ConnectorMappingTable({ connectors }: { connectors: ConnectorMapping[] }) {
  return (
    <div className="overflow-x-auto rounded-card border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Source</TableHead>
            <TableHead>Connector</TableHead>
            <TableHead>Target Module</TableHead>
            <TableHead>Entities</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Coverage</TableHead>
            <TableHead>Last Sync</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {connectors.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                No connectors configured.
              </TableCell>
            </TableRow>
          ) : (
            connectors.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.source}</TableCell>
                <TableCell>{c.connector}</TableCell>
                <TableCell>{c.targetModule}</TableCell>
                <TableCell className="text-muted-foreground">{c.entities}</TableCell>
                <TableCell>
                  <StatusBadge status={c.status} />
                </TableCell>
                <TableCell>{c.coverage}</TableCell>
                <TableCell className="text-muted-foreground">{c.lastSync}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div className="border-t px-4 py-2 text-right">
        <Link to="/data-ingestion" className="text-xs font-medium text-accent hover:underline">
          Manage connectors →
        </Link>
      </div>
    </div>
  );
}
