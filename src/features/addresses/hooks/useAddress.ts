import { apiFetch, APIFetchResponse, constructUrl, mutate, PaginatedData, useApi } from '@/lib/api';
import {
  Address,
  AddressFormData,
  AddressHierarchyNode,
  AddressLevelKey,
  LocaleFormat,
} from '../types';

type AddressFilters = Record<string, string | number | boolean | undefined>;

export const useAddresses = (filters: AddressFilters = {}) => {
  const url = constructUrl('/addresses', filters);
  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useApi<APIFetchResponse<PaginatedData<Address>>>(url);
  return {
    addresses: data?.data?.results ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    currentPage: data?.data?.currentPage ?? 1,
    pageSize: data?.data?.pageSize ?? 12,
    isLoading,
    error,
    mutate: swrMutate,
  };
};

export const useAddress = (id?: string, filters: AddressFilters = {}) => {
  const url = id ? constructUrl(`/addresses/${id}`, filters) : null;
  const { data, error, isLoading, mutate: swrMutate } = useApi<APIFetchResponse<Address>>(url);
  return {
    address: data?.data,
    error,
    isLoading,
    mutate: swrMutate,
  };
};

export const useAddressesApi = () => {
  const createAddress = async (payload: AddressFormData) => {
    const response = await apiFetch<Address>('/addresses', {
      method: 'POST',
      data: sanitizeAddressPayload(payload),
    });
    return response.data;
  };

  const updateAddress = async (addressId: string, payload: AddressFormData) => {
    const response = await apiFetch<Address>(`/addresses/${addressId}`, {
      method: 'PATCH',
      data: sanitizeAddressPayload(payload),
    });
    return response.data;
  };

  const deleteAddress = async (addressId: string, purge = false) => {
    const response = await apiFetch<Address>(`/addresses/${addressId}`, {
      method: 'DELETE',
      params: { purge },
    });
    return response.data;
  };

  const restoreAddress = async (addressId: string) => {
    const response = await apiFetch<Address>(`/addresses/${addressId}/restore`, {
      method: 'POST',
    });
    return response.data;
  };

  const mutateAddresses = () => mutate('/addresses');
  const mutateAddress = (addressId: string) => mutate(`/addresses/${addressId}`);

  return {
    createAddress,
    updateAddress,
    deleteAddress,
    restoreAddress,
    mutateAddresses,
    mutateAddress,
  };
};

export const useAddressHierarchy = (filters: AddressFilters = {}, skip = false) => {
  const url = skip ? null : constructUrl('/address-hierarchy', filters);
  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useApi<APIFetchResponse<PaginatedData<AddressHierarchyNode>>>(url);
  return {
    hierarchy: data?.data?.results ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    currentPage: data?.data?.currentPage ?? 1,
    pageSize: data?.data?.pageSize ?? 12,
    error,
    isLoading,
    mutate: swrMutate,
  };
};

export const useAddressHierarchyApi = () => {
  const deleteHierarchyNode = async (id: string) => {
    const response = await apiFetch<AddressHierarchyNode>(`/address-hierarchy/${id}`, {
      method: 'DELETE',
    });
    return response.data;
  };

  const restoreHierarchyNode = async (id: string) => {
    const response = await apiFetch<AddressHierarchyNode>(`/address-hierarchy/${id}/restore`, {
      method: 'POST',
    });
    return response.data;
  };

  const mutateAddressHierarchy = () => mutate('/address-hierarchy');

  return {
    deleteHierarchyNode,
    restoreHierarchyNode,
    mutateAddressHierarchy,
  };
};

const sanitizeAddressPayload = (payload: AddressFormData) => {
  const sanitizeString = (value?: string | null) => {
    if (value === undefined || value === null) {
      return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  };

  const sanitizeLocaleFormat = (localeFormat?: LocaleFormat) => {
    if (!localeFormat) {
      return undefined;
    }
    const normalized = Object.entries(localeFormat).reduce<LocaleFormat>((acc, [key, value]) => {
      const sanitized = sanitizeString(value);
      if (sanitized) {
        acc[key as AddressLevelKey] = sanitized;
      }
      return acc;
    }, {});
    return Object.keys(normalized).length ? normalized : undefined;
  };

  return {
    ...payload,
    label: sanitizeString(payload.label ?? undefined),
    address2: sanitizeString(payload.address2 ?? undefined),
    landmark: sanitizeString(payload.landmark ?? undefined),
    level2: sanitizeString(payload.level2 ?? undefined),
    level3: sanitizeString(payload.level3 ?? undefined),
    level4: sanitizeString(payload.level4 ?? undefined),
    level5: sanitizeString(payload.level5 ?? undefined),
    cityVillage: sanitizeString(payload.cityVillage ?? undefined),
    stateProvince: sanitizeString(payload.stateProvince ?? undefined),
    postalCode: sanitizeString(payload.postalCode ?? undefined),
    plusCode: sanitizeString(payload.plusCode ?? undefined),
    formatted: sanitizeString(payload.formatted ?? undefined),
    country: payload.country?.toUpperCase(),
    latitude: payload.latitude ?? undefined,
    longitude: payload.longitude ?? undefined,
    startDate: payload.startDate ?? undefined,
    endDate: payload.endDate ?? undefined,
    localeFormat: sanitizeLocaleFormat(payload.localeFormat),
  };
};
