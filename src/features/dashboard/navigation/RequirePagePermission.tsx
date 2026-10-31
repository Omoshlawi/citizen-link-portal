import { ReactNode } from 'react';
import { Alert, Center, Loader } from '@mantine/core';
import { TablerIcon } from '@/components';
import { usePagePermissions } from './usePagePermissions';

type RequirePagePermissionProps = {
  /** Path segment under `/dashboard`, as keyed in `PAGE_PERMISSIONS`. */
  page: string;
  children: ReactNode;
};

/** Route guard for a dashboard page; child routes (detail pages, tabs) inherit it. */
export const RequirePagePermission = ({ page, children }: RequirePagePermissionProps) => {
  const { canAccess, isLoading, error } = usePagePermissions();

  if (canAccess(page)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <Center py="xl">
        <Loader size="sm" />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert color="red" icon={<TablerIcon name="alertCircle" size={16} />}>
        Failed to check permissions. Please try again.
      </Alert>
    );
  }

  return (
    <Alert color="yellow" icon={<TablerIcon name="lock" size={16} />}>
      You don't have permission to access this page.
    </Alert>
  );
};
