import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Database,
  LayoutDashboard,
  Bot,
  FileText,
  Brain,
  Shield,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Building2,
  Users,
  ShieldCheck,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import profileAvatar from "@/assets/profile-avatar.png";

const mainNavItems = [
  { title: "Data Sources", path: "/data-sources", icon: Database },
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Datonix AI", path: "/bot", icon: Bot },
  { title: "Reports", path: "/reports", icon: FileText },
  { title: "Decision Intelligence", path: "/decision-intelligence", icon: Brain },
  { title: "Administration", path: "/admin", icon: Shield },
];

const adminNavItems = [
  { title: "Tenants", path: "/admin/tenants", icon: Building2 },
  { title: "Organizations", path: "/admin/organizations", icon: Building2 },
  { title: "User Roles", path: "/admin/user-roles", icon: ShieldCheck },
  { title: "Users", path: "/admin/users", icon: Users },
  { title: "User Sessions", path: "/admin/user-sessions", icon: Clock },
];

function HexagonLogo({ collapsed }: { collapsed: boolean }) {
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
          {/* Flat-top hexagon, wider than tall */}
          <path
            d="M13 2L39 2L52 22L39 42L13 42L0 22Z"
            stroke="#89D8F8"
            strokeWidth="2"
            fill="none"
          />
          {/* 7 dots: center biggest, then varying sizes */}
          <circle cx="26" cy="22" r="4.5" fill="#0099FF" />
          <circle cx="36" cy="23" r="3.8" fill="#0099FF" />
          <circle cx="26" cy="12" r="3.5" fill="#0099FF" />
          <circle cx="16" cy="22" r="3.2" fill="#0099FF" />
          <circle cx="26" cy="33" r="3.2" fill="#0099FF" />
          <circle cx="36" cy="33" r="1.8" fill="#0099FF" />
          <circle cx="16" cy="12" r="1.4" fill="#0099FF" />
          {/* Connecting lines */}
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
          <p className="text-[4px] font-bold uppercase tracking-[2.2px]" style={{ color: "#aaccdd" }}>
            AI THAT MAKES DECISIONS ACTIONABLE
          </p>
        </div>
      )}
    </div>
  );
}

export function AppSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const navItems = isAdminRoute ? adminNavItems : mainNavItems;

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
        style={{ background: "#152030", borderRadius: collapsed ? "10px 10px 0 0" : "10px 10px 0 0" }}
      >
        <HexagonLogo collapsed={collapsed} />
      </div>

      {/* User Profile */}
      <div className={cn(
        "border-b border-white/[0.06] px-3 py-3",
        collapsed ? "flex justify-center" : "flex items-center gap-3"
      )}>
        <div className="relative h-9 w-9 shrink-0">
          <img
            src={profileAvatar}
            alt="John Doe"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10"
          />
          <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 bg-emerald-400" style={{ borderColor: "#1a2a3a" }} />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-white truncate">John Doe</p>
            <p className="text-[11px] truncate" style={{ color: "#7a9ab5" }}>Sales Manager</p>
          </div>
        )}
      </div>

      {/* Back button for admin */}
      {isAdminRoute && (
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={() => navigate("/dashboard")}
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
        {navItems.map((item) => {
          const active = isAdminRoute
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);
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
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

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