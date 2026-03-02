import type { TenantConfig } from './types';

export const goldfizh: TenantConfig = {
  slug: 'goldfizh',
  name: 'Agency Intelligence',
  logo: '/logos/goldfizh.png',
  theme: {
    primary: '#6331F4',
    primaryLight: '#E2DBFF',
    accent: '#FF6D65',
    bgDark: '#22222D',
    bgLight: '#F5F6F8',
    fontFamily: 'Epilogue',
  },
  clientConfigSlug: 'default',
  availableAgents: ['seo-specialist', 'tone-of-voice', 'social-specialist', 'doelgroep-specialist', 'website-auditor', 'ad-specialist', 'intentie-coach'],
  security: {
    deflection: 'Deze tool is gemaakt door Goldfizh Digital Agency. Neem contact met hen op via https://www.goldfizh.nl',
    contact_url: 'https://www.goldfizh.nl',
  },
  branding: {
    methodology_name: 'Het Intentiegedreven model',
  },
};

const tenants: Record<string, TenantConfig> = {
  goldfizh,
  default: goldfizh,
  localhost: goldfizh,
};

export function getTenant(slug: string): TenantConfig {
  return tenants[slug] || goldfizh;
}
