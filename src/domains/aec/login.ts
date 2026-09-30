import type { DomainLoginConfig } from "@/domains/loginTypes";
import { DATONIX_LOGIN_THEME } from "@/common/config/loginTheme";
import aecImg from "@/common/assets/aec-project-intelligence.jpg";

export const aecLoginConfig: DomainLoginConfig = {
  welcomeTitle: "Decision intelligence for AEC",
  welcomeSubtitle:
    "Improve project delivery, utilization, and bid performance with analytics designed for architecture and engineering firms.",
  heroImage: aecImg,
  heroAlt: "AEC project leader with holographic project intelligence dashboards",
  highlights: ["Utilization & staffing", "Bid win-rate analytics", "Schedule & margin risk"],
  theme: DATONIX_LOGIN_THEME,
};
