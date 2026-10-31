import { useCallback } from 'react';
import { useMyPermissions } from '@/features/admin/hooks/useRoleRecords';
import { hasAnyPermission, PAGE_PERMISSIONS } from './permissions';

/** Checks dashboard pages against the user's effective (DB-backed) permissions. */
export const usePagePermissions = () => {
  const { permissions, isLoading, error } = useMyPermissions();

  /** `true` for ungated pages even while loading; gated pages wait for the fetch. */
  const canAccess = useCallback(
    (page: string) => {
      const rule = PAGE_PERMISSIONS[page];
      if (!rule) {
        return true;
      }
      return !isLoading && !error && hasAnyPermission(permissions, rule);
    },
    [permissions, isLoading, error]
  );

  return { canAccess, isLoading, error };
};
