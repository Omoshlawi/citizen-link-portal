import useSWR from 'swr';
import { apiFetch, APIFetchResponse, constructUrl, mutate, PaginatedData } from '@/lib/api';
import { Station, StationFormData } from '../types';

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

type StationRegion = Pick<Station, 'country' | 'addressLocaleCode'>;

/**
 * Phone and email are validated by format on the backend, so an empty value is omitted
 * rather than sent; other optional text goes through as-is so clearing a field persists.
 */
const toStationPayload = ({
  code,
  phoneNumber,
  email,
  latitude,
  longitude,
  ...rest
}: StationFormData) => ({
  ...rest,
  phoneNumber: phoneNumber || undefined,
  email: email || undefined,
  latitude: latitude ?? undefined,
  longitude: longitude ?? undefined,
});

export const useStationsApi = () => {
  const createStation = async (payload: StationFormData, region: StationRegion) => {
    const response = await apiFetch<Station>('/stations', {
      method: 'POST',
      data: { ...toStationPayload(payload), code: payload.code, ...region },
    });
    return response.data;
  };

  // `code` is the station's permanent identifier; the update route rejects it.
  const updateStation = async (stationId: string, payload: StationFormData) => {
    const response = await apiFetch<Station>(`/stations/${stationId}`, {
      method: 'PATCH',
      data: toStationPayload(payload),
    });
    return response.data;
  };

  /** Soft delete: the station is voided and can be restored. */
  const deleteStation = async (stationId: string) => {
    const response = await apiFetch<Station>(`/stations/${stationId}`, { method: 'DELETE' });
    return response.data;
  };

  const restoreStation = async (stationId: string) => {
    const response = await apiFetch<Station>(`/stations/${stationId}/restore`, {
      method: 'POST',
    });
    return response.data;
  };

  // Prefix match: also refreshes station pickers and `/stations/assigned`.
  const mutateStations = () => mutate('/stations');

  return { createStation, updateStation, deleteStation, restoreStation, mutateStations };
};
