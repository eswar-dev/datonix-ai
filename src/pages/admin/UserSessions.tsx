import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserSessions, extractKeyedArray, pickStr } from "@/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { AdminTableLoadingRow } from "@/components/admin/AdminTableLoadingRow";
import { AdminDataCard } from "@/components/admin/AdminDataCard";

interface SessionRow {
  sessionId: string;
  userName: string;
  userEmail: string;
  orgName: string;
  loginTime: string;
  logoutTime: string;
  ip: string;
  device: string;
  status: string;
}

function mapSession(o: Record<string, unknown>): SessionRow {
  return {
    sessionId: pickStr(o, ["id"], "—"),
    userName: pickStr(o, ["userName"], "—"),
    userEmail: pickStr(o, ["userEmail"], "—"),
    orgName: pickStr(o, ["orgName"], "—"),
    loginTime: pickStr(o, ["loginTime"], "—"),
    logoutTime: pickStr(o, ["logoutTime"], "—"),
    ip: pickStr(o, ["ipAddress"], "—"),
    device: pickStr(o, ["deviceInfo"], "—"),
    status: pickStr(o, ["status"], "—"),
  };
}

export default function UserSessions() {
  const [search, setSearch] = useState("");

  const { data, isLoading, isPending, error, refetch, isFetching } = useQuery({
    queryKey: ["admin", "user-sessions", "1"],
    queryFn: () => fetchUserSessions({ page: "1", page_size: "100" }),
    retry: 1,
  });
  const tableRefetching = isFetching && !isPending;

  const sessions: SessionRow[] = useMemo(() => {
    const raw = data as Record<string, unknown> | undefined;
    if (!raw) return [];
    const list = extractKeyedArray<Record<string, unknown>>(raw, "sessions");
    return list.map(mapSession);
  }, [data]);

  const filtered = sessions.filter(
    (s) =>
      s.userName.toLowerCase().includes(search.toLowerCase()) ||
      s.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      s.ip.includes(search)
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search sessions…"
            className="pl-9 rounded-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-button"
          disabled={isLoading || isFetching}
          onClick={() => refetch()}
        >
          {(isLoading || isFetching) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Refresh
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{(error as Error).message}</p>
      )}

      <AdminDataCard className="rounded-card" isRefetching={tableRefetching}>
        <Card className="rounded-card overflow-hidden border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Login</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Org</TableHead>
              <TableHead>IP</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Logout</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <AdminTableLoadingRow colSpan={7} label="Loading sessions…" />
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No sessions found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((s) => (
                <TableRow key={`${s.sessionId}-${s.loginTime}`} className="hover:bg-muted/20">
                  <TableCell className="text-xs font-mono whitespace-nowrap">{s.loginTime}</TableCell>
                  <TableCell>{s.userName}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{s.userEmail}</TableCell>
                  <TableCell className="text-xs">{s.orgName}</TableCell>
                  <TableCell className="text-xs font-mono">{s.ip}</TableCell>
                  <TableCell className="text-xs">{s.status}</TableCell>
                  <TableCell className="text-xs font-mono whitespace-nowrap">{s.logoutTime || "—"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
      </AdminDataCard>
    </div>
  );
}
