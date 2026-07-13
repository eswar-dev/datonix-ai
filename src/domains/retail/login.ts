import type { DomainLoginConfig } from "@/domains/loginTypes";
import { DATONIX_LOGIN_THEME } from "@/common/config/loginTheme";
import retailImg from "@/common/assets/retail-operations.jpg";

export const retailLoginConfig: DomainLoginConfig = {
  welcomeTitle: "Decision intelligence for retail",
  welcomeSubtitle:
    "Track shrink, inventory health, and store performance across your network with actionable insights for ops leaders.",
  heroImage: retailImg,
  heroAlt: "Retail operations leader with store analytics dashboards",
  highlights: ["Shrink & loss prevention", "Inventory & dead stock", "Regional store performance"],
  theme: DATONIX_LOGIN_THEME,
  demoAccounts: [
    { label: "Head of Retail Ops", email: "james@urbanretail.com", password: "datonix2026" },
    { label: "Store Manager", email: "sophie@urbanretail.com", password: "datonix2026" },
    { label: "Regional Director", email: "linda@urbanretail.com", password: "datonix2026" },
  ],
};
