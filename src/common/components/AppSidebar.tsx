import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, LogOut } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { useSidebarState } from "@/common/hooks/use-sidebar-state";
import { useAuth } from "@/common/contexts/AuthContext";
import { useDomain } from "@/common/contexts/DomainContext";
import { adminNavItems } from "@/common/config/adminNav";
import type { DomainNavItem } from "@/domains/types";
import { useAecApp } from "@/domains/aec/context/AecAppContext";

const SIDEBAR_BG = "#0F1420";
const NAV_MUTED = "#7A8099";
const NAV_ACTIVE_BG = "rgba(232, 68, 46, 0.08)";
const NAV_ACTIVE_BORDER = "#E8442E";
const LABEL_COLOR = "#4A5168";

function NavBadge({ item }: { item: DomainNavItem }) {
  if (item.badge === undefined) return null;
  const isCount = item.badgeType === "count" || typeof item.badge === "number";
  const isLive = item.badgeType === "live";
  const isNew = item.badgeType === "new";

  return (
    <span
      className="ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold"
      style={{
        background: isCount ? "#F5A623" : isLive || isNew ? "#00C4A7" : "#E8442E",
        color: isCount ? "#0A0E17" : "#0A0E17",
      }}
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

function NavLink({
  item,
  active,
  parentActive,
  collapsed,
}: {
  item: DomainNavItem;
  active: boolean;
  parentActive: boolean;
  collapsed: boolean;
}) {
  const highlighted = active || parentActive;

  return (
    <Link
      to={item.path}
      title={item.title}
      className={cn(
        "group flex items-center gap-2.5 text-[11.5px] font-medium transition-colors",
        item.nested ? "py-1.5 pl-[22px] pr-3.5" : "py-1.5 px-3.5",
        highlighted ? "font-semibold text-[#E8EAF0]" : "text-[#7A8099] hover:text-[#E8EAF0]",
      )}
      style={{
        borderLeft: `2px solid ${highlighted ? NAV_ACTIVE_BORDER : "transparent"}`,
        background: highlighted ? NAV_ACTIVE_BG : undefined,
      }}
    >
      <item.icon
        className={cn("shrink-0", item.nested ? "h-3 w-3" : "h-[15px] w-[15px]")}
        style={{ color: highlighted ? "#E8EAF0" : NAV_MUTED }}
      />
      {!collapsed && (
        <>
          <span className="min-w-0 flex-1 truncate">{item.title}</span>
          <NavBadge item={item} />
        </>
      )}
    </Link>
  );
}

function applyAecBadges(items: DomainNavItem[], badges: ReturnType<typeof useAecApp>["navBadges"]): DomainNavItem[] {
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
    if (item.badgeType === "live" || item.badgeType === "new") {
      return item;
    }
    return { ...item, badge: undefined, badgeType: undefined };
  });
}

function DomainNav({ items, collapsed }: { items: DomainNavItem[]; collapsed: boolean }) {
  const location = useLocation();
  const pathname = location.pathname;

  const childParentMap = new Map<string, string>();
  for (const item of items) {
    if (item.parentPath) childParentMap.set(item.path, item.parentPath);
  }

  const hasGroups = items.some((item) => item.group);

  const renderItem = (item: DomainNavItem) => {
    const active = isPathActive(pathname, item.path);
    const parentActive =
      !active &&
      items.some(
        (child) =>
          child.parentPath === item.path &&
          (pathname === child.path || pathname.startsWith(`${child.path}/`)),
      );
    return (
      <NavLink
        key={`${item.path}-${item.title}`}
        item={item}
        active={active}
        parentActive={parentActive}
        collapsed={collapsed}
      />
    );
  };

  if (!hasGroups) {
    return <>{items.map(renderItem)}</>;
  }

  const groups: { label: string | null; items: DomainNavItem[] }[] = [];
  for (const item of items) {
    const label = item.group ?? null;
    const last = groups[groups.length - 1];
    if (last && last.label === label) {
      last.items.push(item);
    } else {
      groups.push({ label, items: [item] });
    }
  }

  return (
    <>
      {groups.map((group, gi) => (
        <div key={gi} className={gi > 0 ? "mt-1" : ""}>
          {!collapsed && group.label && (
            <p
              className="px-3.5 pb-1 pt-2.5 text-[9px] font-bold uppercase tracking-[0.18em]"
              style={{ color: LABEL_COLOR }}
            >
              {group.label}
            </p>
          )}
          {group.items.map(renderItem)}
        </div>
      ))}
    </>
  );
}

function AecSidebarNav({ collapsed }: { collapsed: boolean }) {
  const domain = useDomain();
  const { navBadges, activeTwin } = useAecApp();
  const items = applyAecBadges(domain.nav, navBadges);
  return <DomainNav items={items} collapsed={collapsed} />;
}

function AecEntitySwitcher({ collapsed }: { collapsed: boolean }) {
  const { activeTwin } = useAecApp();
  const entity = activeTwin.entities[0];

  if (collapsed) return null;

  return (
    <div
      className="rounded-lg border px-2.5 py-2"
      style={{
        background: "rgba(0, 196, 167, 0.06)",
        borderColor: "rgba(0, 196, 167, 0.18)",
      }}
    >
      <p className="text-[8.5px] font-bold uppercase tracking-wider text-teal">Active Entity</p>
      <p className="mt-0.5 text-[11px] font-semibold text-[#E8EAF0]">
        {entity?.name ?? "Select entity"}
      </p>
      <p className="text-[9px] text-[#7A8099]">
        {activeTwin.name} · {activeTwin.reportingCurrency}
      </p>
    </div>
  );
}

export function AppSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const domain = useDomain();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isAec = domain.id === "aec" && !isAdminRoute;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r transition-all duration-200",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded",
      )}
      style={{ background: SIDEBAR_BG, borderColor: "#1E2840" }}
    >
      {isAdminRoute && (
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={() => navigate(domain.defaultRoute ?? "/dashboard")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/[0.03]"
            style={{ color: NAV_MUTED }}
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
            {adminNavItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  item={item}
                  active={active}
                  parentActive={false}
                  collapsed={collapsed}
                />
              );
            })}
          </div>
        ) : isAec ? (
          <AecSidebarNav collapsed={collapsed} />
        ) : (
          <div className="px-1">
            <DomainNav items={domain.nav} collapsed={collapsed} />
          </div>
        )}
      </nav>

      {isAec && (
        <div className="border-t px-2.5 py-2.5" style={{ borderColor: "#1E2840" }}>
          <AecEntitySwitcher collapsed={collapsed} />
        </div>
      )}

      <button
        onClick={handleLogout}
        className={cn(
          "flex items-center gap-3 border-t px-4 py-3 text-sm font-medium transition-colors hover:bg-white/[0.03]",
          collapsed ? "justify-center px-2" : "",
        )}
        style={{ color: NAV_MUTED, borderColor: "#1E2840" }}
        title="Sign Out"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>

      <button
        onClick={toggle}
        className="flex h-10 items-center justify-center border-t transition-colors hover:bg-white/[0.03]"
        style={{ color: NAV_MUTED, borderColor: "#1E2840" }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
