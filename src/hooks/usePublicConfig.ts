import useSWR from 'swr';
import { APIFetchResponse } from '@/lib/api';
import { DEFAULT_BRAND, PublicConfig } from '@/config/brand';

/**
 * Runtime branding text from the backend's public config (GET /api/config/public).
 * Anonymous endpoint — safe pre-login. Fields fall back to DEFAULT_BRAND. The
 * logo is bundled, not fetched (see components/Logo).
 */
export const usePublicConfig = () => {
  const { data } = useSWR<APIFetchResponse<PublicConfig>>('/config/public');
  const cfg = data?.data;

  return {
    appName: cfg?.appName || DEFAULT_BRAND.appName,
    supportEmail: cfg?.supportEmail || DEFAULT_BRAND.supportEmail,
    supportPhone: cfg?.supportPhone || DEFAULT_BRAND.supportPhone,
  };
};
