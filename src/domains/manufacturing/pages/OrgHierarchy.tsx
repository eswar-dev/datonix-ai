import { useState } from "react";
import { Network, UserPlus, Users } from "lucide-react";
import { AecPageHeader } from "@/domains/aec/components/AecPageHeader";
import { AecButton, AecPanel, AecTag } from "@/domains/aec/components/primitives";
import { ORG_TREE, type MfgOrgNode } from "@/domains/manufacturing/data";
import { cn } from "@/common/lib/utils";

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export default function OrgHierarchy() {
  const [selected, setSelected] = useState<MfgOrgNode | null>(null);
  return (
    <div className="space-y-4">
      <AecPageHeader
        title="Organisation Hierarchy"
        subtitle="Reporting lines, shift teams and approval chains across all sites."
        actions={
          <>
            <AecButton variant="outline" size="sm">
              <Users className="h-3.5 w-3.5" />
              Team view
            </AecButton>
            <AecButton variant="outline" size="sm">User view</AecButton>
            <AecButton size="sm">
              <UserPlus className="h-3.5 w-3.5" />
              Add member
            </AecButton>
          </>
        }
      />
      <div className="grid gap-3.5 lg:grid-cols-[1.4fr_1fr]">
        <AecPanel title="Hierarchy tree" icon={<Network className="h-3.5 w-3.5 text-[color:var(--page-blue)]" />} actions={<AecTag variant="blue">Group-wide</AecTag>}>
          {ORG_TREE.map((n) => (
            <OrgNode key={n.name} node={n} selected={selected} onSelect={setSelected} />
          ))}
        </AecPanel>
        <AecPanel title="Selected member">
          {selected ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-full bg-[color:var(--page-accent)]/12 text-[15px] font-bold text-[color:var(--page-accent)]">
                {initials(selected.name)}
              </div>
              <p className="text-[14px] font-bold">{selected.name}</p>
              <p className="mt-0.5 text-[11.5px] text-[color:var(--page-muted)]">{selected.role}</p>
              {selected.site.includes(",") && (
                <AecTag variant="purple" className="mt-2">Shared across sites</AecTag>
              )}
              <p className="mt-2.5 text-[11px] text-[color:var(--page-muted)]">Site access: {selected.site}</p>
            </div>
          ) : (
            <p className="py-8 text-center text-[12px] text-[color:var(--page-muted)]">Select a team member to view details</p>
          )}
        </AecPanel>
      </div>
    </div>
  );
}

function OrgNode({
  node,
  selected,
  onSelect,
}: {
  node: MfgOrgNode;
  selected: MfgOrgNode | null;
  onSelect: (n: MfgOrgNode) => void;
}) {
  const active = selected?.name === node.name;
  return (
    <div>
      <button
        type="button"
        onClick={() => onSelect(node)}
        className={cn(
          "mb-1 flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left",
          active
            ? "border-[color:var(--page-teal)] bg-[color:var(--page-teal)]/5"
            : "border-transparent hover:border-[color:var(--page-teal)]/25 hover:bg-[color:var(--page-teal)]/5",
        )}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--page-accent)]/12 text-[10px] font-bold text-[color:var(--page-accent)]">
          {initials(node.name)}
        </span>
        <span>
          <span className="block text-[12px] font-semibold">{node.name}</span>
          <span className="block text-[10px] text-[color:var(--page-muted)]">{node.role}</span>
        </span>
      </button>
      {node.children && (
        <div className="ml-3.5 border-l border-[color:var(--page-border)] pl-3.5">
          {node.children.map((c) => (
            <OrgNode key={c.name} node={c} selected={selected} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}
