import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, LogOut, ArrowLeft } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { useSidebarState } from "@/common/hooks/use-sidebar-state";
import { useAuth } from "@/common/contexts/AuthContext";
import { useDomain } from "@/common/contexts/DomainContext";
import { adminNavItems } from "@/common/config/adminNav";
import type { DomainNavItem } from "@/domains/types";
import { useAecApp } from "@/domains/aec/context/AecAppContext";

const PARENT_PATHS = [
  "/data-ingestion",
  "/projects",
  "/resources/planning",
  "/timesheets",
  "/accounting",
] as const;

function NavBadge({ item }: { item: DomainNavItem }) {
  if (item.badge === undefined) return null;
  if (item.badgeType === "new") return null;
  const isCount = item.badgeType === "count" || typeof item.badge === "number";
  return (
    <span
      className={cn(
        "ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold",
        isCount ? "bg-[#F5A623] text-[#1a2a3a]" : "bg-[#00C4A7] text-[#1a2a3a]",
      )}
    >
      {item.badge}
    </span>
  );
}

function isPathActive(pathname: string, path: string): boolean {
  if (path === "/projects") return pathname === "/projects";
  if (path === "/resources/planning") {
    return pathname === "/resources/planning" || pathname === "/resources/add";
  }
  return pathname === path || pathname.startsWith(`${path}/`);
}

function applyBadges(items: DomainNavItem[], badges: ReturnType<typeof useAecApp>["navBadges"]) {
  const badgeMap: Record<string, number | undefined> = {
    "/customer-inquiries": badges.inquiries,
    "/timesheets": badges.timesheets,
    "/ai-agents": badges.agents,
  };
  return items.map((item) => {
    const count = badgeMap[item.path];
    if (count !== undefined && count > 0) {
      return { ...item, badge: count, badgeType: "count" as const };
    }
    if (item.badgeType === "live") return item;
    return { ...item, badge: undefined, badgeType: undefined };
  });
}

function NavItemLink({
  item,
  active,
  parentActive,
  collapsed,
  nested,
}: {
  item: DomainNavItem;
  active: boolean;
  parentActive: boolean;
  collapsed: boolean;
  nested?: boolean;
}) {
  const highlighted = active || parentActive;
  return (
    <Link
      to={item.path}
      title={item.title}
      className={cn(
        "flex items-center gap-2.5 text-[11.5px] font-medium transition-colors",
        nested ? "py-1.5 pl-[22px] pr-3.5" : "mx-1 rounded-lg py-1.5 px-3",
        highlighted
          ? "bg-[color:var(--shell-nav-active)] font-semibold text-white"
          : "text-[color:var(--shell-nav-text)] hover:bg-[color:var(--shell-nav-hover)] hover:text-[color:var(--shell-text)]",
      )}
    >
      <item.icon className={cn("shrink-0", nested ? "h-3 w-3" : "h-[15px] w-[15px]")} />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.title}</span>
          <NavBadge item={item} />
        </>
      )}
    </Link>
  );
}

export function AecSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const domain = useDomain();
  const { navBadges, activeTwin } = useAecApp();
  const pathname = location.pathname;
  const isAdminRoute = pathname.startsWith("/admin");

  const items = useMemo(() => applyBadges(domain.nav, navBadges), [domain.nav, navBadges]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, DomainNavItem[]>();
    for (const item of items) {
      if (item.parentPath) {
        const list = map.get(item.parentPath) ?? [];
        list.push(item);
        map.set(item.parentPath, list);
      }
    }
    return map;
  }, [items]);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const userClosedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setExpanded((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const parent of PARENT_PATHS) {
        if (userClosedRef.current.has(parent)) continue;
        const children = childrenByParent.get(parent) ?? [];
        const childActive = children.some((c) => isPathActive(pathname, c.path));
        const parentActive = isPathActive(pathname, parent);
        if ((childActive || parentActive) && !next[parent]) {
          next[parent] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [pathname, childrenByParent]);

  useEffect(() => {
    for (const parent of PARENT_PATHS) {
      const children = childrenByParent.get(parent) ?? [];
      const childActive = children.some((c) => isPathActive(pathname, c.path));
      const parentActive = isPathActive(pathname, parent);
      if (!childActive && !parentActive) {
        userClosedRef.current.delete(parent);
      }
    }
  }, [pathname, childrenByParent]);

  const toggleGroup = (path: string) => {
    setExpanded((prev) => {
      const isOpen = prev[path] ?? false;
      if (isOpen) {
        userClosedRef.current.add(path);
        return { ...prev, [path]: false };
      }
      userClosedRef.current.delete(path);
      return { ...prev, [path]: true };
    });
  };

  const groups = useMemo(() => {
    const result: { label: string | null; entries: DomainNavItem[] }[] = [];
    for (const item of items) {
      if (item.nested) continue;
      const label = item.group ?? null;
      const last = result[result.length - 1];
      if (last && last.label === label) last.entries.push(item);
      else result.push({ label, entries: [item] });
    }
    return result;
  }, [items]);

  const renderEntry = (item: DomainNavItem) => {
    const children = childrenByParent.get(item.path) ?? [];
    const hasChildren = children.length > 0;
    const active = isPathActive(pathname, item.path);
    const parentActive =
      !active && children.some((c) => isPathActive(pathname, c.path));
    const isOpen = expanded[item.path] ?? false;

    if (!hasChildren || collapsed) {
      return (
        <NavItemLink
          key={`${item.path}-${item.title}`}
          item={item}
          active={active}
          parentActive={parentActive}
          collapsed={collapsed}
        />
      );
    }

    return (
      <div key={`${item.path}-${item.title}`}>
        <div className="flex items-stretch">
          <div className="min-w-0 flex-1">
            <NavItemLink
              item={item}
              active={active}
              parentActive={parentActive}
              collapsed={collapsed}
            />
          </div>
          {!collapsed && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleGroup(item.path);
              }}
              className="flex w-8 shrink-0 items-center justify-center text-[color:var(--shell-nav-label)] hover:text-[color:var(--shell-text)]"
              aria-label={`Toggle ${item.title}`}
            >
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", isOpen && "rotate-180")}
              />
            </button>
          )}
        </div>
        {!collapsed && (
          <div
            className={cn(
              "overflow-hidden transition-all duration-200",
              isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0",
            )}
          >
            {children.map((child) => (
              <NavItemLink
                key={child.path}
                item={child}
                active={isPathActive(pathname, child.path)}
                parentActive={false}
                collapsed={collapsed}
                nested
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-[color:var(--shell-sidebar-border)] bg-[color:var(--shell-sidebar)] transition-all duration-200",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded",
      )}
    >
      {isAdminRoute && (
        <div className="px-2 pt-3 pb-1">
          <button
            type="button"
            onClick={() => navigate(domain.defaultRoute ?? "/enterprise-twin")}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[color:var(--shell-nav-text)] transition-colors hover:bg-[color:var(--shell-nav-hover)] hover:text-[color:var(--shell-text)]",
              collapsed && "justify-center px-2",
            )}
            title="Back to Home"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Back to Home</span>}
          </button>
        </div>
      )}

      <nav className="flex-1 overflow-y-auto py-2">
        {isAdminRoute ? (
          <div className="px-1">
            {!collapsed && (
              <p className="px-3.5 pb-1 pt-2.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--shell-nav-label)]">
                Administration
              </p>
            )}
            {adminNavItems.map((item) => (
              <NavItemLink
                key={item.path}
                item={item}
                active={pathname === item.path}
                parentActive={false}
                collapsed={collapsed}
              />
            ))}
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={gi} className={gi > 0 ? "mt-1" : ""}>
              {!collapsed && group.label && (
                <p className="px-3.5 pb-1 pt-2.5 text-[9px] font-bold uppercase tracking-[0.18em] text-[color:var(--shell-nav-label)]">
                  {group.label}
                </p>
              )}
              {group.entries.map(renderEntry)}
            </div>
          ))
        )}
      </nav>

      {!collapsed && !isAdminRoute && (
        <div className="border-t border-[color:var(--shell-sidebar-border)] px-2.5 py-2.5">
          <div className="rounded-lg border border-[#00C4A7]/18 bg-[#00C4A7]/6 px-2.5 py-2">
            <p className="text-[8.5px] font-bold uppercase tracking-wider text-[#00C4A7]">
              Active Entity
            </p>
            <p className="mt-0.5 text-[11px] font-semibold text-[color:var(--shell-text)]">
              {activeTwin.entities[0]?.name ?? "Select entity"}
            </p>
            <p className="text-[9px] text-[color:var(--shell-muted)]">
              {activeTwin.name} · {activeTwin.reportingCurrency}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className={cn(
          "flex items-center gap-3 border-t border-[color:var(--shell-sidebar-border)] px-4 py-3 text-sm font-medium text-[color:var(--shell-nav-text)] hover:bg-[color:var(--shell-nav-hover)]",
          collapsed && "justify-center px-2",
        )}
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>

      <button
        type="button"
        onClick={toggle}
        className="flex h-10 items-center justify-center border-t border-[color:var(--shell-sidebar-border)] text-[color:var(--shell-nav-text)] hover:bg-[color:var(--shell-nav-hover)]"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
