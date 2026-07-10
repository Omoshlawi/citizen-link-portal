/**
 * Canonical brand fallbacks — used until GET /api/config/public responds and
 * whenever the backend is unreachable. Live values are the backend `branding.*`
 * settings, editable from the System Settings page. Note: the logo has NO asset
 * fallback — it is strictly dynamic (see usePublicConfig / Logo).
 */
export interface PublicConfig {
  appName: string;
  supportEmail: string | null;
  supportPhone: string | null;
  logoKey: string | null;
  // region fields are also present on the payload but not needed here
  [key: string]: unknown;
}

export const DEFAULT_BRAND = {
  appName: 'Citizen Link',
  supportEmail: 'support@citizenlink.co.ke',
  supportPhone: '+254 700 000 000',
} as const;

/** Absolute-path URL (same-origin via the /api proxy) that streams a static asset by key. */
export const staticFileUrl = (key: string) =>
  `/api/files/static?fileName=${encodeURIComponent(key)}`;
