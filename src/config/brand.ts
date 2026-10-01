/**
 * Canonical brand text fallbacks — used until GET /api/config/public responds and
 * whenever the backend is unreachable. Live values are the backend `branding.*`
 * settings, editable from the System Settings page. The logo itself is bundled
 * (src/assets/brand, see components/Logo); the S3 branding images
 * (`branding.logo_key`, `branding.email_header_key`) are for email and print
 * templates only.
 */
export interface PublicConfig {
  appName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  // region fields are also present on the payload but not needed here
  [key: string]: unknown;
}

export const DEFAULT_BRAND = {
  appName: 'Citizen Link',
  supportEmail: 'support@citizenlink.co.ke',
  supportPhone: '+254 700 000 000',
} as const;
