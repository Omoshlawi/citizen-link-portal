import { ColumnDef } from '@tanstack/react-table';
import { ActionIcon, Badge, Button, Menu, Text } from '@mantine/core';
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
import { LogoUploadForm, SystemSettingForm } from '../forms';
import { useSystemSettings, useSystemSettingsApi } from '../hooks';
import { SystemSetting } from '../types';

const SystemSettingsPage = () => {
  const { page, pageSize, setPage, setPageSize } = useTableUrlFilters();
  const settingsAsync = useSystemSettings({ page, limit: pageSize });
  const { deleteSetting, mutateSettings } = useSystemSettingsApi();
  const { hasAccess } = useUserHasSystemAccess({ setting: ['manage-system'] });

  const handleDelete = (setting: SystemSetting) => {
    modals.openConfirmModal({
      title: 'Delete Setting',
      centered: true,
      children: (
        <Text size="sm">
          Are you sure you want to delete <strong>{setting.key}</strong>? The system will fall back
          to the code default until it is re-seeded or re-created.
        </Text>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        try {
          await deleteSetting(setting.key);
          showNotification({ title: 'Success', message: `${setting.key} deleted`, color: 'green' });
          mutateSettings();
        } catch (error) {
          const e = handleApiErrors<{}>(error);
          if (e.detail) {
            showNotification({
              title: 'Error deleting setting',
              message: e.detail,
              color: 'red',
              position: 'top-right',
            });
          }
        }
      },
    });
  };

  const handleLaunchForm = (setting?: SystemSetting) => {
    const closeWorkspace = launchWorkspace(
      <SystemSettingForm setting={setting} closeWorkspace={() => closeWorkspace()} />,
      { width: 'narrow', title: setting ? `Edit: ${setting.key}` : 'New Setting' }
    );
  };

  const openLogoUpload = () => {
    const id = modals.open({
      title: 'Upload logo',
      children: <LogoUploadForm onClose={() => modals.close(id)} />,
    });
  };

  return (
    <div>
      <DashboardPageHeader
        title="System Settings"
        subTitle="View and edit runtime configuration variables"
        icon="adjustments"
        traiiling={
          <SystemAuthorized
            permissions={{ setting: ['manage-system'] }}
            unauthorizedAction={{ type: 'hide' }}
          >
            <Menu shadow="md" width={180} position="bottom-end">
              <Menu.Target>
                <Button
                  variant="light"
                  size="xs"
                  leftSection={<TablerIcon name="upload" size={14} />}
                  rightSection={<TablerIcon name="chevronDown" size={14} />}
                >
                  Upload
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Uploads</Menu.Label>
                <Menu.Item
                  leftSection={<TablerIcon name="photo" size={14} />}
                  onClick={openLogoUpload}
                >
                  Logo
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </SystemAuthorized>
        }
      />
      <StateFullDataTable
        {...settingsAsync}
        data={settingsAsync.settings}
        columns={[
          ...columns,
          {
            header: '',
            id: 'actions',
            cell: ({ row: { original: setting } }: { row: { original: SystemSetting } }) => (
              <SystemAuthorized
                permissions={{ setting: ['manage-system'] }}
                unauthorizedAction={{ type: 'hide' }}
              >
                <Menu shadow="md" width={160}>
                  <Menu.Target>
                    <ActionIcon variant="subtle" aria-label="Actions">
                      <TablerIcon name="dots" style={{ width: '70%', height: '70%' }} stroke={1.5} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>Actions</Menu.Label>
                    <Menu.Divider />
                    <Menu.Item
                      leftSection={<TablerIcon name="edit" size={14} />}
                      color="green"
                      onClick={() => handleLaunchForm(setting)}
                    >
                      Edit
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<TablerIcon name="trash" size={14} />}
                      color="red"
                      onClick={() => handleDelete(setting)}
                    >
                      Delete
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </SystemAuthorized>
            ),
            size: 0,
          },
        ]}
        onAdd={hasAccess ? () => handleLaunchForm() : undefined}
        pagination={{
          totalCount: settingsAsync.totalCount,
          currentPage: page,
          pageSize,
          onChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </div>
  );
};

export default SystemSettingsPage;

const columns: ColumnDef<SystemSetting>[] = [
  {
    header: 'Key',
    accessorKey: 'key',
    cell: ({ row: { original: s } }) => (
      <Badge variant="light" color="civicBlue" radius={0} tt="none" fw={500}>
        {s.key}
      </Badge>
    ),
  },
  {
    header: 'Value',
    accessorKey: 'value',
    cell: ({ row: { original: s } }) => (
      <Text size="sm" ff="monospace">
        {s.value}
      </Text>
    ),
  },
  {
    header: 'Description',
    accessorKey: 'description',
    cell: ({ row: { original: s } }) => (
      <Text size="sm" c="dimmed">
        {s.description ?? '—'}
      </Text>
    ),
  },
  {
    header: 'Public',
    accessorKey: 'isPublic',
    cell: ({ row: { original: s } }) => (
      <TablerIcon
        name={s.isPublic ? 'circleDashedCheck' : 'circleDashedX'}
        color={s.isPublic ? 'green' : 'gray'}
      />
    ),
  },
  {
    header: 'Last Updated',
    accessorKey: 'updatedAt',
    cell: ({ row: { original: s } }) => new Date(s.updatedAt).toDateString(),
  },
];
