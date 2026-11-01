import useSWR from 'swr';
import { DEFAULT_BRAND, PublicConfig } from '@/config/brand';
import type { AddressLocaleFormatSpec } from '@/features/addresses/types';
import { APIFetchResponse } from '@/lib/api';

/**
 * Runtime branding text and region codes from the backend's public config (GET /api/config/public).
 * Anonymous endpoint — safe pre-login. Fields fall back to DEFAULT_BRAND. The
 * logo is bundled, not fetched (see components/Logo).
 */
export const usePublicConfig = () => {
  const { data, isLoading } = useSWR<APIFetchResponse<PublicConfig>>('/config/public');
  const cfg = data?.data;

  return {
    appName: cfg?.appName || DEFAULT_BRAND.appName,
    supportEmail: cfg?.supportEmail || DEFAULT_BRAND.supportEmail,
    supportPhone: cfg?.supportPhone || DEFAULT_BRAND.supportPhone,
    // Region values have no safe fallback, so they stay undefined until the config loads.
    countryCode: cfg?.countryCode as string | undefined,
    addressLocaleCode: cfg?.addressLocaleCode as string | undefined,
    addressLocaleSpec: (cfg?.addressLocaleSpec ?? null) as AddressLocaleFormatSpec | null,
    isLoading,
  };
};
