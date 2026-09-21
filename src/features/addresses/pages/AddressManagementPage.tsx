import React from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import {
  ActionIcon,
  Badge,
  Group,
  Menu,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import {
  DashboardPageHeader,
  launchWorkspace,
  StateFullDataTable,
  SystemAuthorized,
  TablerIcon,
} from '@/components';
import { useTableUrlFilters } from '@/hooks/useTableUrlFilters';
import { handleApiErrors } from '@/lib/api';
import { AddressForm, AddressLocaleForm } from '../forms';
import {
  useAddresses,
  useAddressesApi,
  useAddressHierarchy,
  useAddressHierarchyApi,
  useAddressLocales,
  useAddressLocalesApi,
} from '../hooks';
import {
  Address,
  AddressFormData,
  AddressHierarchyNode,
  AddressLocale,
  AddressLocaleFormData,
} from '../types';

// ─── Shared ──────────────────────────────────────────────────────────────────

const Detail = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <Stack gap={0}>
    <Text size="xs" c="dimmed">
      {label}
    </Text>
    <Text size="sm">{value ?? '—'}</Text>
  </Stack>
);

const formatDate = (value?: string) => {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

// ─── Hierarchy Tab ────────────────────────────────────────────────────────────

const LEVEL_OPTIONS = [
  { label: 'Level 1', value: '1' },
  { label: 'Level 2', value: '2' },
  { label: 'Level 3', value: '3' },
  { label: 'Level 4', value: '4' },
  { label: 'Level 5', value: '5' },
];

type HierarchyHandlers = {
  onDelete: (node: AddressHierarchyNode) => void;
  onRestore: (node: AddressHierarchyNode) => void;
};

const buildHierarchyColumns = (handlers: HierarchyHandlers): ColumnDef<AddressHierarchyNode>[] => [
  { header: 'Country', accessorKey: 'country' },
  { header: 'Level', accessorKey: 'level' },
  { header: 'Name', accessorKey: 'name' },
  {
    header: 'Name local',
    accessorKey: 'nameLocal',
    cell: ({ row: { original } }) => original?.nameLocal ?? '—',
  },
  {
    header: 'Status',
    accessorKey: 'voided',
    cell: ({ row: { original } }) => (
      <Badge color={original.voided ? 'red' : 'green'} variant="light" size="xs">
        {original.voided ? 'Voided' : 'Active'}
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
          {!original.voided ? (
            <SystemAuthorized
              permissions={{ addressHierarchy: ['delete'] }}
              unauthorizedAction={{ type: 'hide' }}
            >
              <Menu.Item
                color="red"
                leftSection={<TablerIcon name="trash" size={14} />}
                onClick={() => handlers.onDelete(original)}
              >
                Delete
              </Menu.Item>
            </SystemAuthorized>
          ) : (
            <SystemAuthorized
              permissions={{ addressHierarchy: ['restore'] }}
              unauthorizedAction={{ type: 'hide' }}
            >
              <Menu.Item
                color="green"
                leftSection={<TablerIcon name="history" size={14} />}
                onClick={() => handlers.onRestore(original)}
              >
                Restore
              </Menu.Item>
            </SystemAuthorized>
          )}
        </Menu.Dropdown>
      </Menu>
    ),
  },
];

const HierarchyDetails = ({ node }: { node: AddressHierarchyNode }) => (
  <Stack gap="xs">
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
      <Detail label="Country" value={node.country} />
      <Detail label="Level" value={node.level} />
      <Detail label="Name" value={node.name} />
      <Detail label="Status" value={node.voided ? 'Voided' : 'Active'} />
    </SimpleGrid>
  </Stack>
);

const HierarchyTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, pageSize, search, searchInput, setSearchInput, setPage, setPageSize } =
    useTableUrlFilters();

  const level = searchParams.get('level');

  const setLevel = (value: string | null) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set('level', value);
        } else {
          prev.delete('level');
        }
        prev.set('page', '1');
        return prev;
      },
      { replace: true }
    );
  };

  const hierarchyQuery = useAddressHierarchy({
    page,
    limit: pageSize,
    search,
    level: level ? Number(level) : undefined,
  });
  const { deleteHierarchyNode, restoreHierarchyNode, mutateAddressHierarchy } =
    useAddressHierarchyApi();

  const handleDelete = (node: AddressHierarchyNode) => {
    modals.openConfirmModal({
      title: 'Delete hierarchy entry',
      centered: true,
      children: (
        <Text size="sm">
          This hides the{' '}
          <Text span fw={600}>
            {node.name}
          </Text>{' '}
          label from use. Continue?
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteHierarchyNode(node.id);
          showNotification({
            title: 'Hierarchy removed',
            message: 'Entry deleted',
            color: 'green',
          });
          mutateAddressHierarchy();
        } catch (error) {
          const e = handleApiErrors<Record<string, string>>(error);
          showNotification({
            title: 'Failed to delete entry',
            message: e.detail ?? 'Unknown error',
            color: 'red',
          });
        }
      },
    });
  };

  const handleRestore = async (node: AddressHierarchyNode) => {
    try {
      await restoreHierarchyNode(node.id);
      showNotification({ title: 'Hierarchy restored', message: 'Entry restored', color: 'green' });
      mutateAddressHierarchy();
    } catch (error) {
      const e = handleApiErrors<Record<string, string>>(error);
      showNotification({
        title: 'Failed to restore entry',
        message: e.detail ?? 'Unknown error',
        color: 'red',
      });
    }
  };

  return (
    <StateFullDataTable
      {...hierarchyQuery}
      data={hierarchyQuery.hierarchy}
      nothingFoundMessage="No hierarchy entries available."
      columns={buildHierarchyColumns({ onDelete: handleDelete, onRestore: handleRestore })}
      renderExpandedRow={({ original }) => <HierarchyDetails node={original} />}
      pagination={{
        totalCount: hierarchyQuery.totalCount,
        currentPage: page,
        pageSize,
        onChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      renderActions={() => (
        <>
          <TextInput
            placeholder="Search by name..."
            leftSection={<TablerIcon name="search" size={14} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="xs"
            w={200}
          />
          <Select
            placeholder="Level"
            data={LEVEL_OPTIONS}
            value={level}
            onChange={setLevel}
            size="xs"
            clearable
            w={120}
          />
        </>
      )}
    />
  );
};

// ─── Locales Tab ──────────────────────────────────────────────────────────────

type LocaleHandlers = {
  onEdit: (locale: AddressLocale) => void;
  onDelete: (locale: AddressLocale) => void;
  onRestore: (locale: AddressLocale) => void;
};

const buildLocaleColumns = (handlers: LocaleHandlers): ColumnDef<AddressLocale>[] => [
  {
    id: 'expand',
    header: ({ table }) => {
      const expanded = table.getIsAllRowsExpanded();
      return (
        <ActionIcon variant="subtle" onClick={() => table.toggleAllRowsExpanded(!expanded)}>
          <TablerIcon name={expanded ? 'chevronUp' : 'chevronDown'} size={16} />
        </ActionIcon>
      );
    },
    cell: ({ row }) => {
      const expanded = row.getIsExpanded();
      return (
        <ActionIcon variant="subtle" onClick={() => row.toggleExpanded(!expanded)}>
          <TablerIcon name={expanded ? 'chevronUp' : 'chevronDown'} size={16} />
        </ActionIcon>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 0,
  },
  { header: 'Code', accessorKey: 'code' },
  { header: 'Country', accessorKey: 'country' },
  { header: 'Region', accessorKey: 'regionName' },
  {
    header: 'Tags',
    accessorKey: 'tags',
    cell: ({ row: { original } }) =>
      original.tags?.length ? (
        <Group gap={4}>
          {original.tags.map((tag) => (
            <Badge key={tag} variant="light" color="blue" size="xs">
              {tag}
            </Badge>
          ))}
        </Group>
      ) : (
        '—'
      ),
  },
  {
    header: 'Updated',
    accessorKey: 'updatedAt',
    cell: ({ row: { original } }) => new Date(original.updatedAt).toLocaleString(),
  },
  {
    header: 'Status',
    accessorKey: 'voided',
    cell: ({ row: { original } }) => (
      <Badge color={original.voided ? 'red' : 'green'} variant="light" size="xs">
        {original.voided ? 'Voided' : 'Active'}
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
            permissions={{ addressLocale: ['update'] }}
            unauthorizedAction={{ type: 'hide' }}
          >
            <Menu.Item
              leftSection={<TablerIcon name="edit" size={14} />}
              onClick={() => handlers.onEdit(original)}
            >
              Edit
            </Menu.Item>
          </SystemAuthorized>
          {!original.voided && (
            <SystemAuthorized
              permissions={{ addressLocale: ['delete'] }}
              unauthorizedAction={{ type: 'hide' }}
            >
              <Menu.Item
                color="red"
                leftSection={<TablerIcon name="trash" size={14} />}
                onClick={() => handlers.onDelete(original)}
              >
                Delete
              </Menu.Item>
            </SystemAuthorized>
          )}
          {original.voided && (
            <SystemAuthorized
              permissions={{ addressLocale: ['restore'] }}
              unauthorizedAction={{ type: 'hide' }}
            >
              <Menu.Item
                color="green"
                leftSection={<TablerIcon name="history" size={14} />}
                onClick={() => handlers.onRestore(original)}
              >
                Restore
              </Menu.Item>
            </SystemAuthorized>
          )}
        </Menu.Dropdown>
      </Menu>
    ),
  },
];

const AddressLocaleDetails = ({ locale }: { locale: AddressLocale }) => (
  <Stack gap="md">
    <Stack gap={0}>
      <Text size="sm" c="dimmed">
        Description
      </Text>
      <Text size="sm">{locale.description ?? '—'}</Text>
    </Stack>

    {locale.tags && locale.tags.length > 0 && (
      <Group gap={4}>
        {locale.tags.map((tag) => (
          <Badge key={tag} variant="light" color="blue">
            {tag}
          </Badge>
        ))}
      </Group>
    )}

    <Stack gap="xs">
      <Text size="sm" fw={600}>
        Levels
      </Text>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
        {locale.formatSpec.levels.map((level) => (
          <Paper key={`${level.level}-${level.label}`} p="xs" withBorder>
            <Stack gap={2}>
              <Text size="sm" fw={600}>
                {level.label} ({level.level.toUpperCase()})
              </Text>
              <Text size="xs" c="dimmed">
                Required: {level.required ? 'Yes' : 'No'}
              </Text>
              {level.aliases && level.aliases.length > 0 && (
                <Text size="xs">Aliases: {level.aliases.join(', ')}</Text>
              )}
              {level.helperText && (
                <Text size="xs" c="dimmed">
                  {level.helperText}
                </Text>
              )}
            </Stack>
          </Paper>
        ))}
      </SimpleGrid>
    </Stack>

    <Stack gap="xs">
      <Text size="sm" fw={600}>
        Metadata
      </Text>
      <Stack gap={4}>
        <Text size="sm">Instructions: {locale.formatSpec.metadata?.instructions ?? '—'}</Text>
        <Text size="sm">
          Preferred fields:{' '}
          {locale.formatSpec.metadata?.preferredFields?.length
            ? locale.formatSpec.metadata.preferredFields.join(', ')
            : '—'}
        </Text>
        {locale.formatSpec.metadata?.validation && (
          <Stack gap={2}>
            {Object.entries(locale.formatSpec.metadata.validation).map(([field, rule]) => (
              <Text key={field} size="xs">
                <Text span fw={600}>
                  {field}
                </Text>
                : {rule}
              </Text>
            ))}
          </Stack>
        )}
      </Stack>
    </Stack>

    {locale.formatSpec.postalCode && (
      <Stack gap={2}>
        <Text size="sm" fw={600}>
          Postal code spec
        </Text>
        <Text size="sm">Label: {locale.formatSpec.postalCode.label}</Text>
        <Text size="sm">Required: {locale.formatSpec.postalCode.required ? 'Yes' : 'No'}</Text>
        <Text size="sm">Description: {locale.formatSpec.postalCode.description ?? '—'}</Text>
      </Stack>
    )}

    {locale.formatSpec.displayTemplate && (
      <Stack gap={2}>
        <Text size="sm" fw={600}>
          Display template
        </Text>
        <Text size="sm" ff="monospace">
          {locale.formatSpec.displayTemplate}
        </Text>
      </Stack>
    )}

    {locale.examples && locale.examples.length > 0 && (
      <Stack gap="xs">
        <Text size="sm" fw={600}>
          Examples
        </Text>
        {locale.examples.map((example) => (
          <Paper key={example.label} withBorder p="sm">
            <Stack gap={4}>
              <Text size="sm" fw={600}>
                {example.label}
              </Text>
              {example.notes && (
                <Text size="xs" c="dimmed">
                  {example.notes}
                </Text>
              )}
              <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                {Object.entries(example.address).map(([field, value]) => (
                  <Stack key={field} gap={0}>
                    <Text size="xs" c="dimmed">
                      {field}
                    </Text>
                    <Text size="sm">{value ?? '—'}</Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Stack>
          </Paper>
        ))}
      </Stack>
    )}
  </Stack>
);

const LocalesTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, pageSize, search, searchInput, setSearchInput, setPage, setPageSize } =
    useTableUrlFilters();

  const country = searchParams.get('country');

  const setCountry = (value: string | null) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set('country', value);
        } else {
          prev.delete('country');
        }
        prev.set('page', '1');
        return prev;
      },
      { replace: true }
    );
  };

  const localeQuery = useAddressLocales({
    page,
    limit: pageSize,
    search,
    country: country ?? undefined,
  });
  const { deleteAddressLocale, restoreAddressLocale, mutateAddressLocales } =
    useAddressLocalesApi();

  const handleLaunchForm = (locale?: AddressLocale) => {
    const dispose = launchWorkspace(
      <AddressLocaleForm locale={locale} closeWorkspace={() => dispose()} />,
      {
        title: locale ? 'Edit address locale' : 'New address locale',
        width: 'wide',
        expandable: true,
      }
    );
  };

  const handleDelete = (locale: AddressLocale) => {
    modals.openConfirmModal({
      title: 'Delete address locale',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete locale{' '}
          <Text span fw={600}>
            {locale.code}
          </Text>
          ? This action can be reverted.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteAddressLocale(locale.id);
          showNotification({
            title: 'Locale deleted',
            message: 'Deleted successfully',
            color: 'green',
          });
          mutateAddressLocales();
        } catch (error) {
          const e = handleApiErrors<AddressLocaleFormData>(error);
          showNotification({
            title: 'Failed to delete locale',
            message: e.detail ?? 'Unknown error',
            color: 'red',
          });
        }
      },
    });
  };

  const handleRestore = async (locale: AddressLocale) => {
    try {
      await restoreAddressLocale(locale.id);
      showNotification({
        title: 'Locale restored',
        message: 'Restored successfully',
        color: 'green',
      });
      mutateAddressLocales();
    } catch (error) {
      const e = handleApiErrors<AddressLocaleFormData>(error);
      showNotification({
        title: 'Failed to restore locale',
        message: e.detail ?? 'Unknown error',
        color: 'red',
      });
    }
  };

  return (
    <StateFullDataTable
      {...localeQuery}
      data={localeQuery.locales}
      columns={buildLocaleColumns({
        onEdit: handleLaunchForm,
        onDelete: handleDelete,
        onRestore: handleRestore,
      })}
      nothingFoundMessage="No locales found. Click add to create one."
      renderExpandedRow={({ original }) => <AddressLocaleDetails locale={original} />}
      onAdd={() => handleLaunchForm()}
      pagination={{
        totalCount: localeQuery.totalCount,
        currentPage: page,
        pageSize,
        onChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      renderActions={() => (
        <>
          <TextInput
            placeholder="Search locales..."
            leftSection={<TablerIcon name="search" size={14} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="xs"
            w={200}
          />
          <TextInput
            placeholder="Country code (e.g. KE)"
            leftSection={<TablerIcon name="world" size={14} />}
            value={country ?? ''}
            onChange={(e) => setCountry(e.target.value)}
            size="xs"
            w={160}
          />
        </>
      )}
    />
  );
};

// ─── Addresses Tab ────────────────────────────────────────────────────────────

type AddressColumnHandlers = {
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onRestore: (address: Address) => void;
};

const buildAddressColumns = (handlers: AddressColumnHandlers): ColumnDef<Address>[] => [
  {
    id: 'expand',
    header: ({ table }) => {
      const expanded = table.getIsAllRowsExpanded();
      return (
        <ActionIcon variant="subtle" onClick={() => table.toggleAllRowsExpanded(!expanded)}>
          <TablerIcon name={expanded ? 'chevronUp' : 'chevronDown'} size={16} />
        </ActionIcon>
      );
    },
    cell: ({ row }) => {
      const expanded = row.getIsExpanded();
      return (
        <ActionIcon variant="subtle" onClick={() => row.toggleExpanded(!expanded)}>
          <TablerIcon name={expanded ? 'chevronUp' : 'chevronDown'} size={16} />
        </ActionIcon>
      );
    },
    enableSorting: false,
    enableHiding: false,
    size: 0,
  },
  { header: 'Label', accessorKey: 'label', cell: ({ row: { original } }) => original.label ?? '—' },
  { header: 'Type', accessorKey: 'type' },
  { header: 'Level 1', accessorKey: 'level1' },
  { header: 'Country', accessorKey: 'country' },
  {
    header: 'Preferred',
    accessorKey: 'preferred',
    cell: ({ row: { original } }) => (
      <Badge color={original.preferred ? 'green' : 'gray'} variant="light">
        {original.preferred ? 'Yes' : 'No'}
      </Badge>
    ),
  },
  {
    header: 'Updated',
    accessorKey: 'updatedAt',
    cell: ({ row: { original } }) => new Date(original.updatedAt).toLocaleString(),
  },
  {
    header: 'Status',
    accessorKey: 'voided',
    cell: ({ row: { original } }) => (
      <Badge color={original.voided ? 'red' : 'green'} variant="light">
        {original.voided ? 'Voided' : 'Active'}
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
          <Menu.Label>Manage</Menu.Label>
          <Menu.Item
            leftSection={<TablerIcon name="edit" size={14} />}
            onClick={() => handlers.onEdit(original)}
          >
            Edit
          </Menu.Item>
          {!original.voided && (
            <Menu.Item
              color="red"
              leftSection={<TablerIcon name="trash" size={14} />}
              onClick={() => handlers.onDelete(original)}
            >
              Delete
            </Menu.Item>
          )}
          {original.voided && (
            <Menu.Item
              color="green"
              leftSection={<TablerIcon name="history" size={14} />}
              onClick={() => handlers.onRestore(original)}
            >
              Restore
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>
    ),
  },
];

const AddressDetails = ({ address }: { address: Address }) => (
  <Stack gap="sm">
    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
      <Detail label="Label" value={address.label ?? '—'} />
      <Detail label="Type" value={address.type} />
      <Detail label="Address1" value={address.address1} />
      <Detail label="Address2" value={address.address2 ?? '—'} />
      <Detail label="Landmark" value={address.landmark ?? '—'} />
      <Detail label="Level 1" value={address.level1} />
      <Detail label="Level 2" value={address.level2 ?? '—'} />
      <Detail label="Level 3" value={address.level3 ?? '—'} />
      <Detail label="Level 4" value={address.level4 ?? '—'} />
      <Detail label="Level 5" value={address.level5 ?? '—'} />
      <Detail label="City / Village" value={address.cityVillage ?? '—'} />
      <Detail label="State / Province" value={address.stateProvince ?? '—'} />
      <Detail label="Country" value={address.country} />
      <Detail label="Postal code" value={address.postalCode ?? '—'} />
      <Detail label="Plus code" value={address.plusCode ?? '—'} />
      <Detail label="Latitude" value={address.latitude ?? '—'} />
      <Detail label="Longitude" value={address.longitude ?? '—'} />
      <Detail label="Preferred" value={address.preferred ? 'Yes' : 'No'} />
      <Detail label="Voided" value={address.voided ? 'Yes' : 'No'} />
      <Detail label="Start date" value={formatDate(address.startDate)} />
      <Detail label="End date" value={address.endDate ? formatDate(address.endDate) : '—'} />
      <Detail label="Updated at" value={formatDate(address.updatedAt)} />
    </SimpleGrid>
  </Stack>
);

const AddressesTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, pageSize, search, searchInput, setSearchInput, setPage, setPageSize } =
    useTableUrlFilters();

  const location = searchParams.get('location');

  const setLocation = (value: string | null) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set('location', value);
        } else {
          prev.delete('location');
        }
        prev.set('page', '1');
        return prev;
      },
      { replace: true }
    );
  };

  const addressQuery = useAddresses({
    page,
    limit: pageSize,
    search,
    location: location ?? undefined,
  });
  const { deleteAddress, restoreAddress, mutateAddresses } = useAddressesApi();

  const handleLaunchForm = (address?: Address) => {
    const dispose = launchWorkspace(
      <AddressForm address={address} closeWorkspace={() => dispose()} />,
      { title: address ? 'Edit address' : 'New address', width: 'wide', expandable: true }
    );
  };

  const handleDelete = (address: Address) => {
    modals.openConfirmModal({
      title: 'Delete address',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete{' '}
          <Text span fw={600}>
            {address.label ?? address.address1}
          </Text>
          ? This action can be reverted.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteAddress(address.id);
          showNotification({
            title: 'Address deleted',
            message: 'Deleted successfully',
            color: 'green',
          });
          mutateAddresses();
        } catch (error) {
          const e = handleApiErrors<AddressFormData>(error);
          showNotification({
            title: 'Failed to delete address',
            message: e.detail ?? 'Unknown error',
            color: 'red',
          });
        }
      },
    });
  };

  const handleRestore = async (address: Address) => {
    try {
      await restoreAddress(address.id);
      showNotification({
        title: 'Address restored',
        message: 'Restored successfully',
        color: 'green',
      });
      mutateAddresses();
    } catch (error) {
      const e = handleApiErrors<AddressFormData>(error);
      showNotification({
        title: 'Failed to restore address',
        message: e.detail ?? 'Unknown error',
        color: 'red',
      });
    }
  };

  return (
    <StateFullDataTable
      {...addressQuery}
      data={addressQuery.addresses}
      nothingFoundMessage="No addresses found. Click add to create one."
      renderExpandedRow={({ original }) => <AddressDetails address={original} />}
      columns={buildAddressColumns({
        onEdit: handleLaunchForm,
        onDelete: handleDelete,
        onRestore: handleRestore,
      })}
      onAdd={() => handleLaunchForm()}
      pagination={{
        totalCount: addressQuery.totalCount,
        currentPage: page,
        pageSize,
        onChange: setPage,
        onPageSizeChange: setPageSize,
      }}
      renderActions={() => (
        <>
          <TextInput
            placeholder="Search labels..."
            leftSection={<TablerIcon name="search" size={14} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="xs"
            w={200}
          />
          <TextInput
            placeholder="Search area (e.g. Nairobi)"
            leftSection={<TablerIcon name="world" size={14} />}
            value={location ?? ''}
            onChange={(e) => setLocation(e.target.value)}
            size="xs"
            w={160}
          />
        </>
      )}
    />
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const AddressManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get('tab') ?? 'hierarchy';

  const handleTabChange = (value: string | null) => {
    setSearchParams({ tab: value ?? 'hierarchy' });
  };

  return (
    <Stack gap="md">
      <DashboardPageHeader
        title="Address Management"
        subTitle="Manage addresses, hierarchy levels, and locale formats"
        icon="mapPin"
      />
      <Tabs value={tab} onChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Tab value="hierarchy" leftSection={<TablerIcon name="layersLinked" size={14} />}>
            Hierarchy
          </Tabs.Tab>
          <Tabs.Tab value="locales" leftSection={<TablerIcon name="worldPin" size={14} />}>
            Locales
          </Tabs.Tab>
          <Tabs.Tab value="addresses" leftSection={<TablerIcon name="mapPin" size={14} />}>
            Addresses
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="hierarchy" pt="md">
          {tab === 'hierarchy' && <HierarchyTab />}
        </Tabs.Panel>
        <Tabs.Panel value="locales" pt="md">
          {tab === 'locales' && <LocalesTab />}
        </Tabs.Panel>
        <Tabs.Panel value="addresses" pt="md">
          {tab === 'addresses' && <AddressesTab />}
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
};

export default AddressManagementPage;
