import { ChevronRight } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { StatusBadge } from "./StatusBadge";
import type { EntityTreeNode } from "@/domains/aec/data/enterpriseTwin";

function TreeNode({ node, depth = 0 }: { node: EntityTreeNode; depth?: number }) {
  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-card px-3 py-2",
          depth > 0 && "ml-6 mt-2"
        )}
      >
        {depth > 0 && <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {node.code && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold">{node.code}</span>
          )}
          <span className="text-sm font-medium">{node.name}</span>
          {node.staffCount !== undefined && (
            <span className="text-xs text-muted-foreground">{node.staffCount} staff</span>
          )}
          {node.status && <StatusBadge status={node.status} />}
        </div>
      </div>
      {node.children?.map((child) => (
        <TreeNode key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function EntityTree({ root }: { root: EntityTreeNode }) {
  return (
    <div className="space-y-1">
      <TreeNode node={root} />
    </div>
  );
}
