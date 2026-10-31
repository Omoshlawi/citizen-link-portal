import useSWR from 'swr';
import { APIFetchResponse, constructUrl, PaginatedData } from '@/lib/api';
import { Station } from '../types';

export const useStations = (params: Record<string, any> = {}, skip: boolean = false) => {
  const url = constructUrl('/stations', { limit: 100, ...params });
  const { data, error, isLoading, mutate } = useSWR<APIFetchResponse<PaginatedData<Station>>>(
    skip ? null : url
  );
  return {
    stations: data?.data?.results ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    isLoading,
    error,
    mutate,
  };
};

export const useStation = (id?: string | null) => {
  const url = id ? constructUrl(`/stations/${id}`) : null;
  const { data, error, isLoading, mutate } = useSWR<APIFetchResponse<Station>>(url);
  return {
    station: data?.data,
    isLoading,
    error,
    mutate,
  };
};
