import { useQuery } from "@tanstack/react-query";
import { fetchDashboard } from "@/common/api";
import { Card } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import { Skeleton } from "@/common/components/ui/skeleton";
import { Loader2, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/common/contexts/AuthContext";

function DashboardPayload({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return <p className="text-sm text-muted-foreground">No dashboard payload returned.</p>;
  }
  if (typeof data !== "object") {
    return <p className="text-sm">{String(data)}</p>;
  }
  const o = data as Record<string, unknown>;
  const primitives = Object.entries(o).filter(
    ([, v]) => v === null || ["string", "number", "boolean"].includes(typeof v)
  );

  return (
    <div className="space-y-4">
      {primitives.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {primitives.map(([k, v]) => (
            <Card key={k} className="rounded-card p-4">
              <p className="text-xs font-medium text-muted-foreground capitalize">{k.replace(/_/g, " ")}</p>
              <p className="mt-1 text-sm font-semibold break-words">{v === null ? "—" : String(v)}</p>
            </Card>
          ))}
        </div>
      )}
      <Card className="rounded-card p-4">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Full response</p>
        <pre className="max-h-[min(560px,70vh)] overflow-auto rounded-md bg-muted/50 p-3 text-xs leading-relaxed">
          {JSON.stringify(data, null, 2)}
        </pre>
      </Card>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-80 w-full rounded-card" />
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const roleParam = (user?.roleLabel || "CEO").trim() || "CEO";

  const {
    data: dashboardData,
    isLoading,
    isFetching,
    error,
    refetch,
    isError,
  } = useQuery({
    queryKey: ["dashboard", roleParam, user?.apiUserId],
    queryFn: () => fetchDashboard(roleParam, { userId: user?.apiUserId || "" }),
    enabled: !!user,
    retry: 1,
    staleTime: 30_000,
  });

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold">
            <LayoutDashboard className="h-7 w-7 text-accent" />
            Dashboard
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Welcome back, {user.name} · Role: {user.roleLabel} · {user.industry}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-button"
          disabled={isLoading || isFetching}
          onClick={() => refetch()}
        >
          {(isLoading || isFetching) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Refresh
        </Button>
      </div>

      {isLoading && <PageSkeleton />}

      {!isLoading && isError && (
        <Card className="rounded-card border-destructive/30 bg-destructive/5 p-6">
          <p className="text-sm font-medium text-destructive">Could not load dashboard</p>
          <p className="mt-2 text-sm text-muted-foreground">{(error as Error).message}</p>
          <Button className="mt-4 rounded-button" onClick={() => refetch()}>
            Try again
          </Button>
        </Card>
      )}

      {!isLoading && !isError && dashboardData !== undefined && (
        <DashboardPayload data={dashboardData} />
      )}
    </div>
  );
}
