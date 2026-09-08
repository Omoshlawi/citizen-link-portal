import { ColumnDef } from '@tanstack/react-table';
import { Link } from 'react-router-dom';
import { ActionIcon, Badge, Group, Select, Stack, Text } from '@mantine/core';
import {
  DashboardPageHeader,
  StateFullDataTable,
  StatusBadge,
  SystemAuthorized,
  TablerIcon,
} from '@/components';
import { useTableUrlFilters } from '@/hooks/useTableUrlFilters';
import { formatDate } from '@/lib/utils';
import { useChatReports } from '../hooks';
import { ChatReport, ChatReportReason, ChatReportStatus } from '../types';
import { REASON_COLOR, REASON_OPTIONS, REASON_SHORT } from '../utils/labels';

const STATUS_OPTIONS = [
  { value: ChatReportStatus.PENDING, label: 'Pending' },
  { value: ChatReportStatus.REVIEWED, label: 'Reviewed' },
  { value: ChatReportStatus.DISMISSED, label: 'Dismissed' },
];

const ChatReportsPage = () => {
  const { page, pageSize, status, setStatus, searchParams, setFilter, setPage, setPageSize } =
    useTableUrlFilters();
  const reasonFilter = searchParams.get('reason') ?? null;

  const reportsAsync = useChatReports({
    page,
    limit: pageSize,
    ...(status && { status }),
    ...(reasonFilter && { reason: reasonFilter }),
  });

  return (
    <SystemAuthorized
      permissions={{ chatReport: ['read'] }}
      unauthorizedAction={{ type: 'redirect', path: '/dashboard' }}
    >
      <Stack gap="md">
        <DashboardPageHeader
          title="Chat Reports"
          subTitle="Replies from the AI assistant that citizens flagged for review"
          icon="messageReport"
        />
        <StateFullDataTable
          {...reportsAsync}
          data={reportsAsync.reports}
          nothingFoundMessage="No reports match these filters."
          columns={[
            ...columns,
            {
              id: 'actions',
              size: 40,
              cell: ({ row: { original: report } }) => (
                <ActionIcon
                  component={Link}
                  to={report.id}
                  variant="subtle"
                  size="sm"
                  aria-label="Review report"
                >
                  <TablerIcon name="eye" size={14} />
                </ActionIcon>
              ),
            },
          ]}
          renderActions={() => (
            <Group gap="xs">
              <Select
                placeholder="All statuses"
                clearable
                data={STATUS_OPTIONS}
                value={status}
                onChange={setStatus}
                size="xs"
                w={160}
              />
              <Select
                placeholder="All reasons"
                clearable
                data={REASON_OPTIONS}
                value={reasonFilter}
                onChange={(v) => setFilter('reason', v)}
                size="xs"
                w={160}
              />
            </Group>
          )}
          pagination={{
            totalCount: reportsAsync.totalCount,
            currentPage: page,
            pageSize,
            onChange: setPage,
            onPageSizeChange: setPageSize,
          }}
        />
      </Stack>
    </SystemAuthorized>
  );
};

export default ChatReportsPage;

const columns: ColumnDef<ChatReport>[] = [
  {
    accessorKey: 'reason',
    header: 'Reason',
    cell: ({ row: { original } }) => (
      <Stack gap={4}>
        <Badge variant="light" size="xs" color={REASON_COLOR[original.reason]} w="fit-content">
          {REASON_SHORT[original.reason]}
        </Badge>
        {/* "Other" says nothing on its own — the reporter's note is the only
            signal, so surface it here rather than making a reviewer open the row. */}
        {original.reason === ChatReportReason.OTHER && original.details && (
          <Text size="xs" c="dimmed" lineClamp={2} maw={220}>
            {original.details}
          </Text>
        )}
      </Stack>
    ),
  },
  {
    accessorKey: 'content',
    header: 'Reported reply',
    cell: ({ row: { original } }) => (
      <Text size="sm" lineClamp={2} maw={420}>
        {original.content}
      </Text>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row: { original } }) => <StatusBadge status={original.status} />,
  },
  {
    accessorKey: 'reviewedBy',
    header: 'Reviewed by',
    cell: ({ row: { original } }) => (
      <Text size="sm" c={original.reviewedBy ? undefined : 'dimmed'}>
        {original.reviewedBy?.name ?? '—'}
      </Text>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Reported',
    cell: ({ row: { original } }) => formatDate(original.createdAt),
  },
];
