import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { Badge } from "@/common/components/ui/badge";
import type { OrgMember } from "@/domains/aec/data/orgChart";

function typeBadgeClass(type: OrgMember["type"]) {
  if (type === "IN-HOUSE") return "bg-accent/10 text-accent";
  if (type === "CONTRACTOR") return "bg-purple/10 text-purple";
  return "bg-teal/10 text-teal";
}

function TreeNode({
  member,
  depth,
  selectedId,
  onSelect,
  expanded,
  onToggle,
}: {
  member: OrgMember;
  depth: number;
  selectedId: string | null;
  onSelect: (m: OrgMember) => void;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  const hasChildren = (member.children?.length ?? 0) > 0;
  const isOpen = expanded[member.id] ?? depth < 2;
  const isSelected = selectedId === member.id;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(member)}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-muted/40",
          isSelected && "border-accent bg-accent/5",
          depth > 0 && "ml-6 mt-2"
        )}
      >
        {hasChildren ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggle(member.id);
            }}
            onKeyDown={(e) => e.key === "Enter" && onToggle(member.id)}
            className="shrink-0"
          >
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        ) : (
          <span className="w-4" />
        )}
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold">
          {member.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{member.name}</p>
          <p className="truncate text-xs text-muted-foreground">{member.title}</p>
        </div>
        <Badge variant="outline" className={cn("shrink-0 text-[10px]", typeBadgeClass(member.type))}>
          {member.type}
        </Badge>
        <span className="shrink-0 text-xs text-muted-foreground">{member.entity}</span>
      </button>
      {hasChildren && isOpen && member.children?.map((child) => (
        <TreeNode
          key={child.id}
          member={child}
          depth={depth + 1}
          selectedId={selectedId}
          onSelect={onSelect}
          expanded={expanded}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

export function OrgHierarchyTree({
  root,
  selectedId,
  onSelect,
}: {
  root: OrgMember;
  selectedId: string | null;
  onSelect: (member: OrgMember) => void;
}) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ dc: true, sm: true });
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-1">
      <TreeNode
        member={root}
        depth={0}
        selectedId={selectedId}
        onSelect={onSelect}
        expanded={expanded}
        onToggle={toggle}
      />
    </div>
  );
}
