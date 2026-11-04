import { ReactNode } from 'react';
import { Alert, Button, Center, Loader, Stack, Text } from '@mantine/core';
import { TablerIcon } from '@/components';
import { useMyPermissions } from '@/features/admin/hooks/useRoleRecords';
import { authClient } from '@/lib/api';
import { hasAnyPermission } from './permissions';

/** Keeps the portal to users with `staffAccess: portal`; everyone else gets a way out. */
export const RequireStaffAccess = ({ children }: { children: ReactNode }) => {
  const { permissions, isLoading, error } = useMyPermissions();

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh" p="md">
        <Alert color="red" icon={<TablerIcon name="alertCircle" size={16} />}>
          Failed to check permissions. Please try again.
        </Alert>
      </Center>
    );
  }

  if (!hasAnyPermission(permissions, { staffAccess: ['portal'] })) {
    return (
      <Center h="100vh" p="md">
        <Stack align="center" gap="md" maw={420}>
          <TablerIcon name="lock" size={32} />
          <Text ta="center">This portal is for staff. Your account doesn't have access to it.</Text>
          <Button variant="default" onClick={() => authClient.signOut()}>
            Sign out
          </Button>
        </Stack>
      </Center>
    );
  }

  return <>{children}</>;
};
