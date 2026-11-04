import useSWR from 'swr';
import { useListScope } from '@/hooks/useListScope';
import { APIFetchResponse, constructUrl, PaginatedData } from '@/lib/api';
import { Invoice } from '../types';

export const useInvoice = (claimId?: string) => {
  const { params: scope, ready } = useListScope('invoices');
  const url = constructUrl('/invoice', { ...scope, claimId, v: 'custom:include(items)' });
  const { data, isLoading, error } = useSWR<APIFetchResponse<PaginatedData<Invoice>>>(
    claimId && ready ? url : null
  );
  return { invoice: data?.data?.results?.[0], isLoading, error };
};
