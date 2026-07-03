/**
 * Canonical brand fallbacks — used until GET /api/config/public responds
 * (and whenever the backend is unreachable). The live values are the
 * `branding.*` system settings, editable from the System Settings page.
 */
export interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
  muted: string;
  background: string;
  text: string;
}

export interface Branding {
  appName: string;
  tagline: string;
  domain: string;
  webUrl: string;
  supportEmail: string;
  supportPhone: string;
  copyrightHolder: string;
  logoUrl: string;
  colors: BrandColors;
}

export interface PublicConfig {
  appName: string;
  branding: Branding;
  [key: string]: unknown;
}

export const DEFAULT_BRANDING: Branding = {
  appName: 'Citizen Link',
  tagline: 'Where integrity becomes impact and income.',
  domain: 'citizenlink.co.ke',
  webUrl: 'https://citizenlink.co.ke',
  supportEmail: 'support@citizenlink.co.ke',
  supportPhone: '+254 700 000 000',
  copyrightHolder: 'Citizen Link',
  logoUrl: '/api/branding/logo-icon.png',
  colors: {
    primary: '#003b5a',
    secondary: '#006397',
    accent: '#e8b84b',
    muted: '#a8c8da',
    background: '#f4f6f9',
    text: '#4a5568',
  },
};
