import type { DomainLoginConfig } from "@/domains/loginTypes";
import { DATONIX_LOGIN_THEME } from "@/common/config/loginTheme";
import factoryImg from "@/common/assets/factory-worker.jpg";

export const manufacturingLoginConfig: DomainLoginConfig = {
  welcomeTitle: "Decision intelligence for manufacturing",
  welcomeSubtitle:
    "Monitor OEE, machine health, and production quality in one role-first workspace built for plant leaders.",
  heroImage: factoryImg,
  heroAlt: "Manufacturing operator with AR production analytics",
  highlights: ["OEE & machine health", "Scrap & quality signals", "Production optimization"],
  theme: DATONIX_LOGIN_THEME,
  demoAccounts: [
    { label: "Plant Manager", email: "sarah@precisionmfg.com", password: "datonix2026" },
    { label: "Production Supervisor", email: "david@precisionmfg.com", password: "datonix2026" },
    { label: "VP Manufacturing", email: "rajesh@precisionmfg.com", password: "datonix2026" },
  ],
};
