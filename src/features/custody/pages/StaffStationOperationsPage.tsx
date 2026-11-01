import React, { useMemo } from 'react';
import { ColumnDef, Row } from '@tanstack/react-table';
import { ActionIcon, Badge, Menu, Stack, Text, TextInput } from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { DashboardPageHeader, launchWorkspace, StateFullDataTable, TablerIcon } from '@/components';
import { useTableUrlFilters } from '@/hooks/useTableUrlFilters';
import { handleApiErrors } from '@/lib/api';
import { formatDate } from '@/lib/utils/helpers';
import { ExpandedGrantRow } from '../components';
import GrantStaffOperationForm from '../forms/GrantStaffOperationForm';
import { revokeStaffStationOperation, useStaffWithGrants } from '../hooks/useCustody';
import { StaffGrantSummary, StaffOperationScope } from '../types';

// ─── Page ─────────────────────────────────────────────────────────────────────

const StaffStationOperationsPage: React.FC = () => {
  const { page, pageSize, setPage, setPageSize, search, searchInput, setSearchInput } =
    useTableUrlFilters();
  // Paginated by staff member, so one person's grants are never split across pages.
  const { staff, totalCount, isLoading, mutate, error } = useStaffWithGrants({
    page,
    limit: pageSize,
    search,
  });

  const handleRevoke = (grant: StaffOperationScope) => {
    modals.openConfirmModal({
      title: 'Revoke Operation Grant',
      children: (
        <Text size="sm">
          Revoke <strong>{grant.operationType?.name}</strong> access at{' '}
          <strong>{grant.station?.name}</strong> for <strong>{grant.user?.name}</strong>?
        </Text>
      ),
      labels: { confirm: 'Revoke', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await revokeStaffStationOperation(grant.id);
          showNotification({
            title: 'Revoked',
            message: 'Operation grant revoked.',
            color: 'green',
          });
          void mutate();
        } catch (err) {
          const e = handleApiErrors<{}>(err);
          showNotification({
            title: 'Error',
            message: e.detail ?? 'Failed to revoke grant.',
            color: 'red',
          });
        }
      },
    });
  };

  const handleGrant = () => {
    const closeWorkspace = launchWorkspace(
      <GrantStaffOperationForm onClose={() => closeWorkspace()} onSuccess={() => void mutate()} />,
      { width: 'narrow', title: 'Grant Staff Operation' }
    );
  };

  const columns = useMemo<ColumnDef<StaffGrantSummary>[]>(
    () => [
      {
        id: 'expand',
        size: 0,
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
        header: 'Staff Member',
        id: 'user',
        cell: ({ row: { original } }) => (
          <Text size="sm" fw={500}>
            {original.user.name}
          </Text>
        ),
      },
      {
        header: 'Stations',
        id: 'stations',
        cell: ({ row: { original } }) => (
          <Badge variant="light" color="teal" size="sm">
            {original.stationCount}
          </Badge>
        ),
      },
      {
        header: 'Operations',
        id: 'operations',
        cell: ({ row: { original } }) => (
          <Badge variant="light" color="civicBlue" size="sm">
            {original.operationCount}
          </Badge>
        ),
      },
      {
        header: 'Last Granted',
        id: 'latestGrantedAt',
        cell: ({ row: { original } }) =>
          original.latestGrantedAt ? formatDate(original.latestGrantedAt) : '—',
      },
      {
        id: 'actions',
        size: 0,
        cell: ({ row }) => (
          <Menu position="bottom-end" width={160}>
            <Menu.Target>
              <ActionIcon variant="subtle" size="sm">
                <TablerIcon name="dots" size={14} stroke={1.5} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                leftSection={
                  <TablerIcon name={row.getIsExpanded() ? 'chevronUp' : 'chevronDown'} size={14} />
                }
                onClick={() => row.toggleExpanded()}
              >
                {row.getIsExpanded() ? 'Collapse' : 'Expand'}
              </Menu.Item>
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
        title="Staff Station Operations"
        subTitle="Manage which operations each staff member can perform at each station"
        icon="userCog"
      />
      <StateFullDataTable
        data={staff}
        error={error}
        isLoading={isLoading}
        onAdd={handleGrant}
        columns={columns}
        renderExpandedRow={(row: Row<StaffGrantSummary>) => (
          <ExpandedGrantRow userId={row.original.userId} onRevoke={handleRevoke} />
        )}
        renderActions={() => (
          <TextInput
            placeholder="Search staff..."
            size="xs"
            w={220}
            leftSection={<TablerIcon name="search" size={14} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.currentTarget.value)}
          />
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

export default StaffStationOperationsPage;
