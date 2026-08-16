import { cn } from "@/common/lib/utils";
import { Outlet } from "react-router-dom";
import { useTheme } from "@/common/contexts/ThemeContext";
import { AecTopBar } from "./AecTopBar";
import { AecBreadcrumbBar } from "./AecBreadcrumbBar";
import { AecSidebar } from "./AecSidebar";

export function AecLayout() {
  const { theme } = useTheme();

  return (
    <div className="aec-shell flex h-screen flex-col overflow-hidden">
      <AecTopBar />
      <div className="flex min-h-0 flex-1">
        <AecSidebar />
        <div
          className={cn(
            "aec-theme flex min-w-0 flex-1 flex-col",
            theme === "dark" && "dark",
          )}
        >
          <AecBreadcrumbBar />
          <main className="flex-1 overflow-y-auto p-5">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
