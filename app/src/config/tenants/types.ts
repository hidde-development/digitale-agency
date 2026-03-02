export interface TenantTheme {
  primary: string;
  primaryLight: string;
  accent: string;
  bgDark: string;
  bgLight: string;
  fontFamily: string;
}

export interface TenantSecurity {
  deflection: string;
  contact_url?: string;
  contact_text?: string;
}

export interface TenantBranding {
  methodology_name?: string;
}

export interface TenantConfig {
  slug: string;
  name: string;
  logo: string;
  theme: TenantTheme;
  clientConfigSlug: string;
  availableAgents: string[];
  security: TenantSecurity;
  branding: TenantBranding;
}
