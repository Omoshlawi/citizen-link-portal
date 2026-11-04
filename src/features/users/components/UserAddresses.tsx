import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge, Stack, Text, Title } from '@mantine/core';
import { StateFullDataTable } from '@/components';
import { useAddresses } from '@/features/addresses/hooks/useAddress';
import { Address } from '@/features/addresses/types';

const columns: ColumnDef<Address>[] = [
  {
    header: 'Label / Type',
    id: 'label',
    cell: ({ row: { original: a } }) => (
      <Stack gap={2}>
        <Text size="sm" fw={500}>{a.label || a.type}</Text>
        {a.label && (
          <Text size="xs" c="dimmed" tt="capitalize">{a.type.toLowerCase()}</Text>
        )}
      </Stack>
    ),
  },
  {
    header: 'Address',
    id: 'address',
    cell: ({ row: { original: a } }) => (
      <Text size="sm" lineClamp={2} title={a.formatted ?? a.address1}>
        {a.formatted ?? a.address1}
      </Text>
    ),
  },
  {
    header: 'Region',
    id: 'region',
    cell: ({ row: { original: a } }) => {
      const parts = [a.level2, a.level1, a.country].filter(Boolean);
      return <Text size="sm">{parts.join(', ') || '—'}</Text>;
    },
  },
  {
    header: 'Preferred',
    accessorKey: 'preferred',
    cell: ({ row: { original: a } }) =>
      a.preferred ? (
        <Badge color="civicGreen" variant="light" size="sm">Preferred</Badge>
      ) : null,
  },
  {
    header: 'Status',
    accessorKey: 'voided',
    cell: ({ row: { original: a } }) =>
      a.voided ? (
        <Badge color="red" variant="light" size="sm">Voided</Badge>
      ) : (
        <Badge color="green" variant="light" size="sm">Active</Badge>
      ),
  },
];

type UserAddressesProps = {
  userId: string;
};

const UserAddresses: React.FC<UserAddressesProps> = ({ userId }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const addressesAsync = useAddresses({ scope: 'all', userId, page, limit: pageSize });

  return (
    <Stack gap="md">
      <Stack gap={2}>
        <Title order={5}>Addresses</Title>
        <Text size="xs" c="dimmed">Saved addresses associated with this account</Text>
      </Stack>
      <StateFullDataTable
        {...addressesAsync}
        data={addressesAsync.addresses}
        columns={columns}
        pagination={{
          totalCount: addressesAsync.totalCount,
          currentPage: page,
          pageSize,
          onChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </Stack>
  );
};

export default UserAddresses;
