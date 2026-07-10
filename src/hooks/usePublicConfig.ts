import useSWR from 'swr';
import { APIFetchResponse } from '@/lib/api';
import { DEFAULT_BRAND, PublicConfig, staticFileUrl } from '@/config/brand';

/**
 * Runtime branding from the backend's public config (GET /api/config/public).
 * Anonymous endpoint — safe pre-login. Text fields fall back to DEFAULT_BRAND;
 * the logo is strictly dynamic (logoUrl is null when no logo is uploaded).
 */
export const usePublicConfig = () => {
  const { data } = useSWR<APIFetchResponse<PublicConfig>>('/config/public');
  const cfg = data?.data;

  return {
    appName: cfg?.appName || DEFAULT_BRAND.appName,
    supportEmail: cfg?.supportEmail || DEFAULT_BRAND.supportEmail,
    supportPhone: cfg?.supportPhone || DEFAULT_BRAND.supportPhone,
    logoKey: cfg?.logoKey ?? null,
    logoUrl: cfg?.logoKey ? staticFileUrl(cfg.logoKey) : null,
  };
};
