import React, { useMemo } from 'react';
import { IconSearch, IconX } from '@tabler/icons-react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { ActionIcon, Badge, Group, Menu, Select, Stack, Text, TextInput } from '@mantine/core';
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
import { StationOperationsPanel } from '../components';
import StationForm from '../forms/StationForm';
import { useStations, useStationsApi } from '../hooks/useStations';
import { Station } from '../types';

const PickupStationsPage: React.FC = () => {
  const {
    page,
    pageSize,
    setPage,
    setPageSize,
    search,
    searchInput,
    setSearchInput,
    status,
    setStatus,
  } = useTableUrlFilters();
  const { stations, totalCount, isLoading, error } = useStations({
    page,
    limit: pageSize,
    search,
    includeVoided: status === 'inactive' || status === 'all',
  });
  const { deleteStation, restoreStation, mutateStations } = useStationsApi();
  const { hasAccess: canCreate } = useUserHasSystemAccess({ station: ['create'] });

  const handleLaunchForm = (station?: Station) => {
    const dispose = launchWorkspace(
      <StationForm station={station} closeWorkspace={() => dispose()} />,
      { title: station ? `Edit ${station.name}` : 'New station', width: 'wide', expandable: true }
    );
  };

  const handleDeactivate = (station: Station) => {
    modals.openConfirmModal({
      title: 'Deactivate station',
      centered: true,
      children: (
        <Text size="sm">
          Deactivate{' '}
          <Text span fw={600}>
            {station.name}
          </Text>
          ? Staff won't be able to select it and citizens won't see it. You can restore it later.
        </Text>
      ),
      labels: { confirm: 'Deactivate', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteStation(station.id);
          showNotification({
            title: 'Station deactivated',
            message: `${station.name} was deactivated.`,
            color: 'green',
          });
          mutateStations();
        } catch (error) {
          showNotification({
            title: 'Failed to deactivate station',
            message: handleApiErrors(error).detail ?? 'Unknown error occurred',
            color: 'red',
          });
        }
      },
    });
  };

  const handleRestore = async (station: Station) => {
    try {
      await restoreStation(station.id);
      showNotification({
        title: 'Station restored',
        message: `${station.name} is active again.`,
        color: 'green',
      });
      mutateStations();
    } catch (error) {
      showNotification({
        title: 'Failed to restore station',
        message: handleApiErrors(error).detail ?? 'Unknown error occurred',
        color: 'red',
      });
    }
  };

  const columns = useMemo<ColumnDef<Station>[]>(
    () => [
      {
        id: 'expand',
        size: 40,
        header: '',
        cell: ({ row }) => (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => row.toggleExpanded()}
            aria-label="Expand row"
          >
            <TablerIcon name={row.getIsExpanded() ? 'chevronUp' : 'chevronDown'} size={14} />
          </ActionIcon>
        ),
      },
      {
        header: 'Code',
        accessorKey: 'code',
        cell: ({ getValue }) => (
          <Text size="sm" ff="monospace" fw={600}>
            {getValue() as string}
          </Text>
        ),
      },
      {
        header: 'Name',
        accessorKey: 'name',
      },
      {
        header: 'Location',
        id: 'location',
        cell: ({ row: { original } }) => (
          <Text size="sm" c="dimmed" truncate maw={260}>
            {[original.level2, original.level1].filter(Boolean).join(', ')}
          </Text>
        ),
      },
      {
        header: 'Address',
        id: 'address',
        cell: ({ row: { original } }) => (
          <Text size="sm" truncate maw={260}>
            {original.formatted ?? original.address1}
          </Text>
        ),
      },
      {
        header: 'Status',
        id: 'status',
        cell: ({ row: { original } }) => (
          <Badge size="sm" variant="light" color={original.voided ? 'gray' : 'civicGreen'}>
            {original.voided ? 'Inactive' : 'Active'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        size: 0,
        cell: ({ row: { original } }) => (
          <Menu shadow="md" width={180} position="bottom-end">
            <Menu.Target>
              <ActionIcon variant="subtle" color="gray" aria-label="Station actions">
                <TablerIcon name="dots" size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <SystemAuthorized
                permissions={{ station: ['update'] }}
                unauthorizedAction={{ type: 'hide' }}
              >
                <Menu.Item
                  leftSection={<TablerIcon name="edit" size={14} />}
                  onClick={() => handleLaunchForm(original)}
                >
                  Edit
                </Menu.Item>
              </SystemAuthorized>
              {original.voided ? (
                <SystemAuthorized
                  permissions={{ station: ['restore'] }}
                  unauthorizedAction={{ type: 'hide' }}
                >
                  <Menu.Item
                    color="green"
                    leftSection={<TablerIcon name="restore" size={14} />}
                    onClick={() => handleRestore(original)}
                  >
                    Restore
                  </Menu.Item>
                </SystemAuthorized>
              ) : (
                <SystemAuthorized
                  permissions={{ station: ['delete'] }}
                  unauthorizedAction={{ type: 'hide' }}
                >
                  <Menu.Item
                    color="red"
                    leftSection={<TablerIcon name="ban" size={14} />}
                    onClick={() => handleDeactivate(original)}
                  >
                    Deactivate
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
        title="Stations"
        subTitle="Manage stations and the operations available at each"
        icon="buildingStore"
      />
      <StateFullDataTable
        data={stations}
        isLoading={isLoading}
        error={error}
        columns={columns}
        onAdd={canCreate ? () => handleLaunchForm() : undefined}
        renderExpandedRow={(row: Row<Station>) => <StationOperationsPanel station={row.original} />}
        renderActions={() => (
          <Group gap="xs">
            <TextInput
              placeholder="Search stations..."
              size="xs"
              leftSection={<IconSearch size={14} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              rightSection={
                searchInput ? (
                  <ActionIcon size="xs" variant="transparent" onClick={() => setSearchInput('')}>
                    <IconX size={12} />
                  </ActionIcon>
                ) : null
              }
            />
            <Select
              size="xs"
              placeholder="All Status"
              value={status}
              onChange={setStatus}
              data={[
                { label: 'Status: Active', value: '' },
                { label: 'Status: All', value: 'all' },
                { label: 'Status: Inactive', value: 'inactive' },
              ]}
              w={120}
              clearable
            />
          </Group>
        )}
        pagination={{
          totalCount,
          currentPage: page,
          pageSize,
          onChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </Stack>
  );
};

export default PickupStationsPage;
