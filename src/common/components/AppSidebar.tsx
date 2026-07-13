import { Link, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowLeft, LogOut } from "lucide-react";
import { cn } from "@/common/lib/utils";
import { useSidebarState } from "@/common/hooks/use-sidebar-state";
import { useAuth } from "@/common/contexts/AuthContext";
import { useDomain } from "@/common/contexts/DomainContext";
import { adminNavItems } from "@/common/config/adminNav";
import type { DomainNavItem } from "@/domains/types";
import { Badge } from "@/common/components/ui/badge";
import { useAecApp } from "@/domains/aec/context/AecAppContext";

function HexagonLogo({ collapsed, label, tagline }: { collapsed: boolean; label: string; tagline: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative shrink-0">
        <svg
          width={collapsed ? 32 : 36}
          height={collapsed ? 28 : 32}
          viewBox="0 0 52 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M13 2L39 2L52 22L39 42L13 42L0 22Z" stroke="#89D8F8" strokeWidth="2" fill="none" />
          <circle cx="26" cy="22" r="4.5" fill="#0099FF" />
          <circle cx="36" cy="23" r="3.8" fill="#0099FF" />
          <circle cx="26" cy="12" r="3.5" fill="#0099FF" />
          <circle cx="16" cy="22" r="3.2" fill="#0099FF" />
          <circle cx="26" cy="33" r="3.2" fill="#0099FF" />
          <circle cx="36" cy="33" r="1.8" fill="#0099FF" />
          <circle cx="16" cy="12" r="1.4" fill="#0099FF" />
          <line x1="26" y1="22" x2="36" y2="23" stroke="#0099FF" strokeWidth="0.8" opacity="0.4" />
          <line x1="26" y1="22" x2="26" y2="12" stroke="#0099FF" strokeWidth="0.8" opacity="0.4" />
          <line x1="26" y1="22" x2="16" y2="22" stroke="#0099FF" strokeWidth="0.8" opacity="0.4" />
          <line x1="26" y1="22" x2="26" y2="33" stroke="#0099FF" strokeWidth="0.8" opacity="0.4" />
          <line x1="26" y1="22" x2="36" y2="33" stroke="#0099FF" strokeWidth="0.8" opacity="0.3" />
          <line x1="26" y1="22" x2="16" y2="12" stroke="#0099FF" strokeWidth="0.8" opacity="0.3" />
        </svg>
      </div>
      {!collapsed && (
        <div className="min-w-0">
          <h1 className="text-[18px] font-black tracking-tight leading-tight" style={{ fontFamily: "'Arial Black', 'Arial', sans-serif", color: "#0099FF" }}>
            Datonix
          </h1>
          <p className="text-[10px] font-semibold tracking-wide" style={{ color: "#aaccdd" }}>
            {label}
          </p>
          <p className="text-[4px] font-bold uppercase tracking-[2.2px]" style={{ color: "#aaccdd" }}>
            {tagline}
          </p>
        </div>
      )}
    </div>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: DomainNavItem;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      key={item.path}
      to={item.path}
      title={item.title}
      className={cn(
        "group flex items-center gap-3 rounded-lg text-sm font-medium transition-all duration-150",
        active ? "font-bold text-white" : "hover:bg-white/[0.05]"
      )}
      style={{
        padding: "10px 12px",
        borderRadius: "8px",
        ...(active
          ? { background: "#2a4a6a", color: "#ffffff" }
          : { color: "#8aaec8" }),
      }}
    >
      <item.icon
        className="h-[18px] w-[18px] shrink-0"
        style={{ color: active ? "#ffffff" : "#8aaec8" }}
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.badge !== undefined && (
            <Badge
              variant="secondary"
              className="h-5 min-w-5 justify-center px-1.5 text-[10px]"
              style={{ background: "#0099FF", color: "#fff" }}
            >
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );
}

function applyAecBadges(items: DomainNavItem[], badges: ReturnType<typeof useAecApp>["navBadges"]): DomainNavItem[] {
  const badgeMap: Record<string, number | undefined> = {
    "/customer-inquiries": badges.inquiries,
    "/timesheets": badges.timesheets,
    "/expenses/approvals": badges.expenses,
    "/leave": badges.leave,
    "/ai-agents": badges.agents,
  };
  return items.map((item) => {
    const count = badgeMap[item.path];
    return count !== undefined && count > 0 ? { ...item, badge: count } : { ...item, badge: undefined };
  });
}

function DomainNav({ items, collapsed }: { items: DomainNavItem[]; collapsed: boolean }) {
  const location = useLocation();
  const hasGroups = items.some((item) => item.group);

  if (!hasGroups) {
    return (
      <>
        {items.map((item) => {
          const active =
            item.path === "/projects"
              ? location.pathname === "/projects"
              : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
          return <NavLink key={item.path} item={item} active={active} collapsed={collapsed} />;
        })}
      </>
    );
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
        <div key={gi} className={gi > 0 ? "mt-3" : ""}>
          {!collapsed && group.label && (
            <p
              className="mb-1 px-3 text-[10px] font-bold uppercase tracking-wider"
              style={{ color: "#5a7a95" }}
            >
              {group.label}
            </p>
          )}
          {group.items.map((item) => {
            const active =
              item.path === "/projects"
                ? location.pathname === "/projects"
                : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return <NavLink key={item.path} item={item} active={active} collapsed={collapsed} />;
          })}
        </div>
      ))}
    </>
  );
}

function AecSidebarNav({ collapsed }: { collapsed: boolean }) {
  const domain = useDomain();
  const { navBadges } = useAecApp();
  const items = applyAecBadges(domain.nav, navBadges);
  return <DomainNav items={items} collapsed={collapsed} />;
}

export function AppSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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
        "fixed left-0 top-0 z-40 flex h-screen flex-col transition-all duration-200 rounded-[10px]",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded"
      )}
      style={{ background: "#1a2a3a" }}
    >
      {/* Logo header */}
      <div
        className={cn(
          "flex items-center border-b border-white/[0.06]",
          collapsed ? "justify-center px-2 h-16" : "px-4 h-16"
        )}
        style={{ background: "#152030", borderRadius: "10px 10px 0 0" }}
      >
        <HexagonLogo collapsed={collapsed} label={domain.label} tagline={domain.tagline} />
      </div>

      {/* User Profile */}
      <div className={cn(
        "border-b border-white/[0.06] px-3 py-3",
        collapsed ? "flex justify-center" : "flex items-center gap-3"
      )}>
        <div className="relative h-9 w-9 shrink-0">
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#2a4a6a" }}>
            {user?.initials || "?"}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-emerald-400" style={{ borderColor: "#1a2a3a" }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white truncate">{user?.name || "Guest"}</p>
            <p className="text-[11px] truncate" style={{ color: "#7a9ab5" }}>
              {user?.industry} • {user?.title}
            </p>
          </div>
        )}
      </div>

      {/* Back button for admin */}
      {isAdminRoute && (
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={() => navigate(domain.defaultRoute ?? "/dashboard")}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors w-full hover:bg-white/[0.06]"
            )}
            style={{ color: "#8aaec8" }}
            title="Back to Home"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Back to Home</span>}
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-[2px] px-2 py-3 overflow-y-auto">
        {isAdminRoute ? (
          adminNavItems.map((item) => {
            const active = location.pathname === item.path;
            return <NavLink key={item.path} item={item} active={active} collapsed={collapsed} />;
          })
        ) : isAec ? (
          <AecSidebarNav collapsed={collapsed} />
        ) : (
          <DomainNav items={domain.nav} collapsed={collapsed} />
        )}
      </nav>

      {/* Sign Out */}
      <button
        onClick={handleLogout}
        className={cn(
          "flex items-center gap-3 border-t border-white/[0.06] px-4 py-3 text-sm font-medium transition-colors hover:bg-white/[0.06]",
          collapsed ? "justify-center px-2" : ""
        )}
        style={{ color: "#8aaec8" }}
        title="Sign Out"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!collapsed && <span>Sign Out</span>}
      </button>

      <button
        onClick={toggle}
        className="flex h-10 items-center justify-center border-t border-white/[0.06] transition-colors"
        style={{ color: "#8aaec8" }}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
