import { Bot, Brain, Database, FileText, LayoutDashboard, Shield } from "lucide-react";
import type { DomainConfig } from "@/domains/types";
import { retailLoginConfig } from "./login";
import Dashboard from "@/domains/manufacturing/pages/Dashboard";
import DataSources from "@/domains/manufacturing/pages/DataSources";
import BotPage from "@/domains/manufacturing/pages/BotPage";
import Reports from "@/domains/manufacturing/pages/Reports";
import DecisionIntelligence from "@/domains/manufacturing/pages/DecisionIntelligence";

/** Retail still uses the legacy ops workspace until retail-specific pages exist. */
export const retailConfig: DomainConfig = {
  id: "retail",
  label: "Retail",
  tagline: "AI THAT MAKES DECISIONS ACTIONABLE",
  defaultRoute: "/dashboard",
  login: retailLoginConfig,
  nav: [
    { title: "Data Sources", path: "/data-sources", icon: Database },
    { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { title: "Datonix AI", path: "/bot", icon: Bot },
    { title: "Reports", path: "/reports", icon: FileText },
    { title: "Decision Intelligence", path: "/decision-intelligence", icon: Brain },
    { title: "Administration", path: "/admin", icon: Shield },
  ],
  routes: [
    { path: "/dashboard", Component: Dashboard },
    { path: "/data-sources", Component: DataSources },
    { path: "/bot", Component: BotPage },
    { path: "/reports", Component: Reports },
    { path: "/decision-intelligence", Component: DecisionIntelligence },
  ],
};
