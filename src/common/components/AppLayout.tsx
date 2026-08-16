import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/common/components/AppSidebar";
import { AppHeader } from "@/common/components/AppHeader";
import { SidebarStateProvider, useSidebarState } from "@/common/hooks/use-sidebar-state";
import { ViewModeProvider } from "@/common/contexts/ViewModeContext";
import { useDomain } from "@/common/contexts/DomainContext";
import { AecAppProvider } from "@/domains/aec/context/AecAppContext";
import { AecLayout } from "@/domains/aec/components/layout/AecLayout";

function LegacyLayoutInner() {
  const { collapsed } = useSidebarState();
  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar />
      <div
        className="flex flex-1 flex-col transition-all duration-200"
        style={{ marginLeft: collapsed ? 56 : 220 }}
      >
        <AppHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function LayoutInner() {
  const domain = useDomain();

  if (domain.id === "aec") {
    return (
      <AecAppProvider>
        <AecLayout />
      </AecAppProvider>
    );
  }

  return <LegacyLayoutInner />;
}

export function AppLayout() {
  return (
    <SidebarStateProvider>
      <ViewModeProvider>
        <LayoutInner />
      </ViewModeProvider>
    </SidebarStateProvider>
  );
}
