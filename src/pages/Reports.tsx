import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Bell, Lightbulb, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { roleData } from "@/data/roleData";

export default function Reports() {
  const { user } = useAuth();
  if (!user) return null;
  const data = roleData[user.role].reports;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      {/* Reports table */}
      <Card className="rounded-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.available.map((r) => (
              <TableRow key={r.name}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px]">{r.category}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">{r.lastRun}</TableCell>
                <TableCell>
                  {r.status === "Alert" ? (
                    <Badge variant="destructive" className="text-[10px] gap-1">
                      <Bell className="h-3 w-3" /> Alert
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-[10px] bg-success/10 text-success border-success/20">
                      Ready
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-button gap-1">
                    <Play className="h-3 w-3" /> Run
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Recent AI Insights */}
      <div>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Lightbulb className="h-4 w-4 text-warning" />
          Recent AI Insights
        </h2>
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-3">
          {data.recentInsights.map((insight, i) => (
            <Card key={i} className="rounded-card p-4 flex items-start gap-3">
              <Lightbulb className="h-4 w-4 text-warning shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed text-muted-foreground">{insight}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
