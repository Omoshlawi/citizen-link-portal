import useSWR from 'swr';
import { APIFetchResponse } from '@/lib/api';
import { Branding, DEFAULT_BRANDING, PublicConfig } from '@/config/brand';

/**
 * Public runtime config from the backend (region + branding).
 * Anonymous endpoint — safe to call before login.
 */
export const usePublicConfig = () => {
  const { data, error, isLoading } = useSWR<APIFetchResponse<PublicConfig>>('/config/public', {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  return { config: data?.data, error, isLoading };
};

/** Branding values with canonical fallbacks so the UI never renders empty. */
export const useBrand = (): Branding => {
  const { config } = usePublicConfig();
  return config?.branding ?? DEFAULT_BRANDING;
};
