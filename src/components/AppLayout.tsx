import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { AppHeader } from "@/components/AppHeader";

export function AppLayout() {
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      {/* Main content — margin matches expanded sidebar; CSS handles collapsed via the sidebar component's own state */}
      <div className="flex flex-1 flex-col ml-sidebar-expanded transition-all duration-200 peer-collapsed:ml-sidebar-collapsed">
        <AppHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
