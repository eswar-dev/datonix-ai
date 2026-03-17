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
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebarState } from "@/hooks/use-sidebar-state";
import datonixLogo from "@/assets/datonix-logo.png";
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

export function AppSidebar() {
  const { collapsed, toggle } = useSidebarState();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const navItems = isAdminRoute ? adminNavItems : mainNavItems;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col bg-sidebar text-sidebar-foreground transition-all duration-200",
        collapsed ? "w-sidebar-collapsed" : "w-sidebar-expanded"
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        {collapsed ? (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-button bg-sidebar-primary font-semibold text-sidebar-primary-foreground text-sm">
            D
          </div>
        ) : (
          <img src={datonixLogo} alt="Datonix" className="h-9 object-contain mix-blend-lighten" />
        )}
      </div>

      {/* User Profile */}
      <div className={cn(
        "border-b border-sidebar-border px-3 py-3",
        collapsed ? "flex justify-center" : "flex items-center gap-3"
      )}>
        <img src={profileAvatar} alt="John Doe" className="h-8 w-8 shrink-0 rounded-full object-cover" />
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-xs font-medium text-sidebar-foreground truncate">John Doe</p>
            <p className="text-[10px] text-accent font-semibold truncate">Sales Manager</p>
          </div>
        )}
      </div>

      {/* Back button for admin */}
      {isAdminRoute && (
        <div className="px-2 pt-3 pb-1">
          <button
            onClick={() => navigate("/dashboard")}
            className={cn(
              "flex items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition-colors w-full",
              "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
            title="Back to Home"
          >
            <ArrowLeft className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Back to Home</span>}
          </button>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-2 py-3 overflow-y-auto">
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
                "flex items-center gap-3 rounded-button px-3 py-2 text-sm font-medium transition-colors duration-150",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!collapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        onClick={toggle}
        className="flex h-10 items-center justify-center border-t border-sidebar-border text-sidebar-muted hover:text-sidebar-foreground transition-colors"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
