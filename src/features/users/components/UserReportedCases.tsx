import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { Anchor, Badge, Group, Stack, Text, Title } from '@mantine/core';
import { StateFullDataTable, StatusBadge } from '@/components';
import { useDocumentCases } from '@/features/cases/hooks/useDocumentCases';
import {
  DocumentCase,
  FoundDocumentCaseStatus,
  LostDocumentCaseStatus,
} from '@/features/cases/types';

const columns: ColumnDef<DocumentCase>[] = [
  {
    header: 'Case No.',
    accessorKey: 'caseNumber',
    cell: ({ row: { original: c } }) => (
      <Anchor component={Link} to={`/dashboard/cases/${c.id}`} size="sm" fw={500}>
        {c.caseNumber}
      </Anchor>
    ),
  },
  {
    header: 'Type',
    id: 'caseType',
    cell: ({ row: { original: c } }) => {
      if (c.lostDocumentCase) {
        return (
          <Badge color="blue" variant="light" size="sm">
            Lost
          </Badge>
        );
      }
      if (c.foundDocumentCase) {
        return (
          <Badge color="teal" variant="light" size="sm">
            Found
          </Badge>
        );
      }
      return null;
    },
  },
  {
    header: 'Document Type',
    id: 'documentType',
    cell: ({ row: { original: c } }) => <Text size="sm">{c.document?.type?.name ?? '—'}</Text>,
  },
  {
    header: 'Status',
    id: 'status',
    cell: ({ row: { original: c } }) => {
      const status =
        (c.lostDocumentCase?.status as LostDocumentCaseStatus | undefined) ??
        (c.foundDocumentCase?.status as FoundDocumentCaseStatus | undefined);
      return <StatusBadge status={status} />;
    },
  },
  {
    header: 'Reported',
    accessorKey: 'createdAt',
    cell: ({ row: { original: c } }) => (
      <Text size="sm">{new Date(c.createdAt).toLocaleDateString()}</Text>
    ),
  },
];

type UserReportedCasesProps = {
  userId: string;
};

const UserReportedCases: React.FC<UserReportedCasesProps> = ({ userId }) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const casesAsync = useDocumentCases({
    userId,
    page,
    limit: pageSize,
    v: 'custom:include(lostDocumentCase,foundDocumentCase,document:include(type))',
  });

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Stack gap={2}>
          <Title order={5}>Reported Cases</Title>
          <Text size="xs" c="dimmed">
            Document cases submitted by this user
          </Text>
        </Stack>
      </Group>
      <StateFullDataTable
        {...casesAsync}
        data={casesAsync.reports}
        columns={columns}
        pagination={{
          totalCount: casesAsync.totalCount,
          currentPage: page,
          pageSize,
          onChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </Stack>
  );
};

export default UserReportedCases;
