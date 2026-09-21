import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Box, Group, Menu, Paper, Stack, Text, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import {
  DashboardPageHeader,
  launchWorkspace,
  StateFullDataTable,
  SystemAuthorized,
  TablerIcon,
} from '@/components';
import { useUserHasSystemAccess } from '@/hooks/useSystemAccess';
import { useTableUrlFilters } from '@/hooks/useTableUrlFilters';
import { handleApiErrors } from '@/lib/api';
import { RoleForm } from '../forms/RoleForm';
import { useRoleRecords, useRoleRecordsApi } from '../hooks/useRoleRecords';
import { RoleRecord } from '../types';

const RolesPage = () => {
  const { page, pageSize, search, searchInput, setSearchInput, setPage, setPageSize } =
    useTableUrlFilters();
  const rolesAsync = useRoleRecords({ page, limit: pageSize, search, includeVoided: true });
  const { deleteRole, restoreRole, mutateRoles } = useRoleRecordsApi();
  const { hasAccess } = useUserHasSystemAccess({ setting: ['manage-system'] });

  const handleDelete = (role: RoleRecord) => {
    modals.openConfirmModal({
      title: 'Delete Role',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <b>{role.name}</b>? Users with this role slug in their
          profile will no longer receive these permissions.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteRole(role.id);
          showNotification({ title: 'Success', message: 'Role deleted', color: 'green' });
          mutateRoles();
        } catch (error) {
          const e = handleApiErrors(error);
          showNotification({
            title: 'Error',
            message: e.detail || 'Failed to delete',
            color: 'red',
          });
        }
      },
    });
  };

  const handleRestore = async (role: RoleRecord) => {
    try {
      await restoreRole(role.id);
      showNotification({ title: 'Success', message: 'Role restored', color: 'green' });
      mutateRoles();
    } catch (error) {
      const e = handleApiErrors(error);
      showNotification({
        title: 'Error',
        message: e.detail || 'Failed to restore',
        color: 'red',
      });
    }
  };

  const handleLaunchFormWorkspace = (role?: RoleRecord) => {
    const closeWorkspace = launchWorkspace(
      <RoleForm role={role} closeWorkspace={() => closeWorkspace()} />,
      { width: 'wide', title: role ? 'Edit Role' : 'Create Role' }
    );
  };

  const columns = useMemo<ColumnDef<RoleRecord>[]>(
    () => [
      {
        id: 'expand',
        header: ({ table }) => (
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => table.toggleAllRowsExpanded(!table.getIsAllRowsExpanded())}
          >
            <TablerIcon
              name={table.getIsAllRowsExpanded() ? 'chevronUp' : 'chevronDown'}
              size={16}
            />
          </ActionIcon>
        ),
        cell: ({ row }) => (
          <ActionIcon
            variant="subtle"
            color="gray"
            onClick={() => row.toggleExpanded(!row.getIsExpanded())}
          >
            <TablerIcon name={row.getIsExpanded() ? 'chevronUp' : 'chevronDown'} size={16} />
          </ActionIcon>
        ),
        enableSorting: false,
        size: 0,
      },
      {
        header: 'Role',
        accessorKey: 'name',
        cell: ({ row: { original } }) => (
          <Stack gap={0}>
            <Text size="sm" fw={600}>
              {original.name}
            </Text>
            <Text size="xs" c="dimmed" ff="monospace">
              {original.slug}
            </Text>
          </Stack>
        ),
      },
      {
        header: 'Type',
        id: 'type',
        cell: ({ row: { original } }) =>
          !original.canDelete ? (
            <Badge size="xs" variant="dot" color="gray">
              System
            </Badge>
          ) : (
            <Badge size="xs" variant="dot" color="blue">
              Custom
            </Badge>
          ),
      },
      {
        header: 'Permissions',
        id: 'perms',
        cell: ({ row: { original } }) => (
          <Badge variant="light">{original.permissions.length}</Badge>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'voided',
        cell: ({ row: { original } }) =>
          original.voided ? (
            <Badge size="xs" color="red">
              Voided
            </Badge>
          ) : (
            <Badge size="xs" color="green">
              Active
            </Badge>
          ),
      },
      {
        id: 'actions',
        header: '',
        size: 0,
        cell: ({ row: { original } }) => (
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <ActionIcon variant="subtle">
                <TablerIcon name="dots" size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Actions</Menu.Label>
              <Menu.Divider />
              <SystemAuthorized
                permissions={{ setting: ['manage-system'] }}
                unauthorizedAction={{ type: 'hide' }}
              >
                <Menu.Item
                  leftSection={<TablerIcon name="edit" size={14} />}
                  onClick={() => handleLaunchFormWorkspace(original)}
                >
                  Edit
                </Menu.Item>
              </SystemAuthorized>
              {!original.voided && original.canDelete && (
                <SystemAuthorized
                  permissions={{ setting: ['manage-system'] }}
                  unauthorizedAction={{ type: 'hide' }}
                >
                  <Menu.Item
                    color="red"
                    leftSection={<TablerIcon name="trash" size={14} />}
                    onClick={() => handleDelete(original)}
                  >
                    Delete
                  </Menu.Item>
                </SystemAuthorized>
              )}
              {original.voided && (
                <SystemAuthorized
                  permissions={{ setting: ['manage-system'] }}
                  unauthorizedAction={{ type: 'hide' }}
                >
                  <Menu.Item
                    color="green"
                    leftSection={<TablerIcon name="history" size={14} />}
                    onClick={() => handleRestore(original)}
                  >
                    Restore
                  </Menu.Item>
                </SystemAuthorized>
              )}
            </Menu.Dropdown>
          </Menu>
        ),
      },
    ],
    []
  );

  return (
    <Stack gap="md">
      <DashboardPageHeader
        title="Roles"
        subTitle="Manage system roles and their permissions"
        icon="shieldLock"
      />
      <StateFullDataTable
        {...rolesAsync}
        data={rolesAsync.roles}
        columns={columns}
        renderActions={() => (
          <TextInput
            placeholder="Search roles..."
            leftSection={<TablerIcon name="search" size={14} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="xs"
            w={200}
          />
        )}
        renderExpandedRow={({ original }) => {
          const permTree = original.permissions.reduce<
            Record<string, { resourceName: string; actions: typeof original.permissions }>
          >((acc, perm) => {
            const key = perm.resource.slug;
            if (!acc[key]) {
              acc[key] = { resourceName: perm.resource.name, actions: [] };
            }
            acc[key].actions.push(perm);
            return acc;
          }, {});

          return (
            <Paper p="sm">
              <Stack gap="xs">
                <Text size="sm" fw={600}>
                  {original.name} Permissions
                </Text>
                {original.permissions.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    No permissions assigned.
                  </Text>
                ) : (
                  Object.entries(permTree).map(([resource, node]) => (
                    <Box key={resource}>
                      <Group gap="xs">
                        <Text size="sm" c="dimmed">
                          ├─
                        </Text>
                        <Badge variant="default" color="gray" size="xs">
                          {node.resourceName}
                        </Badge>
                        <Text size="xs" ff="monospace" c="dimmed">
                          {resource}
                        </Text>
                      </Group>
                      <Stack gap={4} pl="lg" mt={4}>
                        {node.actions.map((perm) => (
                          <Group key={perm.id} gap="xs">
                            <Text size="sm" c="dimmed">
                              └─
                            </Text>
                            <Text size="sm">{perm.resourceAction.name}</Text>
                            <Text size="xs" ff="monospace" c="dimmed">
                              {perm.resourceAction.slug}
                            </Text>
                          </Group>
                        ))}
                      </Stack>
                    </Box>
                  ))
                )}
              </Stack>
            </Paper>
          );
        }}
        onAdd={hasAccess ? () => handleLaunchFormWorkspace() : undefined}
        pagination={{
          totalCount: rolesAsync.totalCount,
          currentPage: page,
          pageSize,
          onChange: setPage,
          onPageSizeChange: setPageSize,
        }}
        nothingFoundMessage="No roles configured."
      />
    </Stack>
  );
};

export default RolesPage;
