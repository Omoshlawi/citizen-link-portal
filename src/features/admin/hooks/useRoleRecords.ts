import {
  apiFetch,
  APIFetchResponse,
  authClient,
  constructUrl,
  mutate as globalMutate,
  useApi,
} from '@/lib/api';
import {
  EffectivePermissions,
  Resource,
  ResourceAction,
  ResourceActionFormData,
  ResourceFormData,
  RoleFormData,
  RoleRecord,
} from '../types';

// ─── Roles ────────────────────────────────────────────────────────────────────

export const useRoleRecords = (filters: Record<string, any> = {}) => {
  const url = constructUrl('/roles', filters);
  const { data, error, isLoading, mutate } =
    useApi<APIFetchResponse<{ results: RoleRecord[]; totalCount: number }>>(url);

  return {
    roles: data?.data?.results ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    error,
    isLoading,
    mutate,
  };
};

export const useRoleRecord = (id?: string) => {
  const url = constructUrl(`/roles/${id}`);
  const { data, error, isLoading, mutate } = useApi<APIFetchResponse<RoleRecord>>(id ? url : null);
  return { role: data?.data, error, isLoading, mutate };
};

export const useRoleRecordsApi = () => {
  const createRole = async (payload: RoleFormData) => {
    const res = await apiFetch<RoleRecord>('/roles', { method: 'POST', data: payload });
    return res.data;
  };

  const updateRole = async (id: string, payload: Partial<RoleFormData>) => {
    const res = await apiFetch<RoleRecord>(`/roles/${id}`, { method: 'PATCH', data: payload });
    return res.data;
  };

  const deleteRole = async (id: string) => {
    const res = await apiFetch<RoleRecord>(`/roles/${id}`, { method: 'DELETE' });
    return res.data;
  };

  const restoreRole = async (id: string) => {
    const res = await apiFetch<RoleRecord>(`/roles/${id}/restore`, { method: 'POST' });
    return res.data;
  };

  const setRolePermissions = async (id: string, resourceActionIds: string[]) => {
    const res = await apiFetch<RoleRecord>(`/roles/${id}/permissions`, {
      method: 'PUT',
      data: { resourceActionIds },
    });
    return res.data;
  };

  const mutateRoles = () => globalMutate('/roles');

  return { createRole, updateRole, deleteRole, restoreRole, setRolePermissions, mutateRoles };
};

// ─── Resources ────────────────────────────────────────────────────────────────

export const useResources = (filters: Record<string, any> = {}) => {
  const url = constructUrl('/roles/resources', filters);
  const { data, error, isLoading, mutate } =
    useApi<APIFetchResponse<{ results: Resource[]; totalCount: number }>>(url);

  return {
    resources: data?.data?.results ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    error,
    isLoading,
    mutate,
  };
};

export const useResource = (id?: string) => {
  const url = constructUrl(`/roles/resources/${id}`);
  const { data, error, isLoading, mutate } = useApi<APIFetchResponse<Resource>>(id ? url : null);
  return { resource: data?.data, error, isLoading, mutate };
};

export const useResourcesApi = () => {
  const createResource = async (payload: ResourceFormData) => {
    const res = await apiFetch<Resource>('/roles/resources', { method: 'POST', data: payload });
    return res.data;
  };

  const updateResource = async (id: string, payload: Partial<ResourceFormData>) => {
    const res = await apiFetch<Resource>(`/roles/resources/${id}`, {
      method: 'PATCH',
      data: payload,
    });
    return res.data;
  };

  const deleteResource = async (id: string) => {
    const res = await apiFetch<Resource>(`/roles/resources/${id}`, { method: 'DELETE' });
    return res.data;
  };

  const restoreResource = async (id: string) => {
    const res = await apiFetch<Resource>(`/roles/resources/${id}/restore`, { method: 'POST' });
    return res.data;
  };

  const createAction = async (resourceId: string, payload: ResourceActionFormData) => {
    const res = await apiFetch<ResourceAction>(`/roles/resources/${resourceId}/actions`, {
      method: 'POST',
      data: payload,
    });
    return res.data;
  };

  const updateAction = async (actionId: string, payload: Partial<ResourceActionFormData>) => {
    const res = await apiFetch<ResourceAction>(`/roles/actions/${actionId}`, {
      method: 'PATCH',
      data: payload,
    });
    return res.data;
  };

  const deleteAction = async (actionId: string) => {
    const res = await apiFetch<ResourceAction>(`/roles/actions/${actionId}`, { method: 'DELETE' });
    return res.data;
  };

  const restoreAction = async (actionId: string) => {
    const res = await apiFetch<ResourceAction>(`/roles/actions/${actionId}/restore`, {
      method: 'POST',
    });
    return res.data;
  };

  const mutateResources = () => globalMutate('/roles/resources');

  return {
    createResource,
    updateResource,
    deleteResource,
    restoreResource,
    createAction,
    updateAction,
    deleteAction,
    restoreAction,
    mutateResources,
  };
};

// ─── Effective permissions (real-time display) ────────────────────────────────

export const useMyPermissions = () => {
  // Keyed by user so a sign-out/sign-in or impersonation never reuses another user's cache entry.
  const { data: session, isPending } = authClient.useSession();
  const userId = session?.user?.id;
  const { data, error, isLoading } = useApi<
    APIFetchResponse<{ permissions: EffectivePermissions }>
  >(userId ? constructUrl('/roles/my-permissions', { user: userId }) : null);
  return {
    permissions: data?.data?.permissions ?? {},
    error,
    isLoading: isPending || isLoading,
  };
};
