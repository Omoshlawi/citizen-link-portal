import { useMyPermissions } from '@/features/admin/hooks/useRoleRecords';
import { hasAnyPermission, PermissionRule } from '@/features/dashboard/navigation/permissions';
import { authClient } from '@/lib/api';

export type ListResource = 'cases' | 'claims' | 'matches' | 'exchanges' | 'invoices';

const LIST_PRIVILEGES: Record<ListResource, { all: PermissionRule; station: PermissionRule }> = {
  cases: { all: { documentCase: ['list-any'] }, station: { documentCase: ['list-station'] } },
  claims: { all: { claim: ['list-any'] }, station: { claim: ['list-station'] } },
  matches: { all: { match: ['list-any'] }, station: { match: ['list-station'] } },
  exchanges: {
    all: { handover: ['manage-any'], documentCase: ['list-any'] },
    station: { handover: ['list-station'] },
  },
  invoices: { all: { invoice: ['list-any'] }, station: { invoice: ['list-station'] } },
};

/**
 * What a staff screen asks the API for. Lists return the caller's own records unless told
 * otherwise, so every portal list sends the widest scope the staff member holds. `ready` stays
 * false until permissions load, so a screen never flashes the wrong list.
 *
 * @param atActiveStation for browsing tables: limit `station` to the session's active station,
 * which the header's station switcher changes. Leave off when looking up one record's children.
 */
export const useListScope = (resource: ListResource, { atActiveStation = false } = {}) => {
  const { permissions, isLoading } = useMyPermissions();
  const { data: session } = authClient.useSession();
  const stationId: string | undefined = (session?.session as any)?.stationId ?? undefined;
  const { all, station } = LIST_PRIVILEGES[resource];

  const params: { scope: 'all' | 'station' | 'mine'; stationId?: string } = hasAnyPermission(
    permissions,
    all
  )
    ? { scope: 'all' }
    : hasAnyPermission(permissions, station)
      ? { scope: 'station', ...(atActiveStation && stationId ? { stationId } : {}) }
      : { scope: 'mine' };

  return { params, ready: !isLoading };
};
