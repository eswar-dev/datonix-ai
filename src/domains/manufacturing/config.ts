import {
  Bot,
  Brain,
  Database,
  FileText,
  LayoutDashboard,
  Shield,
} from "lucide-react";
import type { DomainConfig } from "@/domains/types";
import Dashboard from "./pages/Dashboard";
import DataSources from "./pages/DataSources";
import BotPage from "./pages/BotPage";
import Reports from "./pages/Reports";
import DecisionIntelligence from "./pages/DecisionIntelligence";
import { manufacturingLoginConfig } from "./login";

export const manufacturingConfig: DomainConfig = {
  id: "manufacturing",
  label: "Manufacturing",
  tagline: "AI THAT MAKES DECISIONS ACTIONABLE",
  login: manufacturingLoginConfig,
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
