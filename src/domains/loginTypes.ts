export interface DomainLoginTheme {
  pageBackground: string;
  panelBackground: string;
  panelHeaderBackground: string;
  accent: string;
  accentHover: string;
  accentMuted: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  inputBackground: string;
}

export interface DomainLoginConfig {
  welcomeTitle: string;
  welcomeSubtitle: string;
  heroImage: string;
  heroAlt: string;
  highlights: string[];
  theme: DomainLoginTheme;
}
