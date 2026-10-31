import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Link, useSearchParams } from 'react-router-dom';
import { ActionIcon, Badge, Select, Stack, Text, TextInput } from '@mantine/core';
import { StateFullDataTable, StatusBadge, TablerIcon } from '@/components';
import { useTableUrlFilters } from '@/hooks/useTableUrlFilters';
import { formatDate } from '@/lib/utils';
import { CONFIDENCE_OPTIONS, STATUS_OPTIONS, VERDICT_COLORS, VERDICT_LABELS } from '../constants';
import { useMatches } from '../hooks';
import { Match, MatchConfidence } from '../types';

export const RecordedMatchesTab = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    page,
    pageSize,
    status,
    search,
    searchInput,
    setSearchInput,
    setStatus,
    setPage,
    setPageSize,
  } = useTableUrlFilters();

  const confidence = searchParams.get('confidence');
  const verdict = searchParams.get('verdict');

  const setConfidence = (value: string | null) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set('confidence', value);
        } else {
          prev.delete('confidence');
        }
        prev.set('page', '1');
        return prev;
      },
      { replace: true }
    );
  };

  const setVerdict = (value: string | null) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set('verdict', value);
        } else {
          prev.delete('verdict');
        }
        prev.set('page', '1');
        return prev;
      },
      { replace: true }
    );
  };

  const scoreParams = useMemo(() => {
    switch (confidence) {
      case MatchConfidence.HIGH:
        return { minMatchScore: 0.7 };
      case MatchConfidence.MEDIUM:
        return { minMatchScore: 0.4, maxMatchScore: 0.7 };
      case MatchConfidence.LOW:
        return { minMatchScore: 0.1, maxMatchScore: 0.4 };
      case MatchConfidence.NO_MATCH:
        return { maxMatchScore: 0.1 };
      default:
        return {};
    }
  }, [confidence]);

  const matchesAsync = useMatches({
    page,
    limit: pageSize,
    ...(search && { search }),
    ...(status && { status }),
    ...scoreParams,
    ...(verdict && { verdict }),
  });

  const columns = useMemo<ColumnDef<Match>[]>(
    () => [
      {
        header: 'Match #',
        accessorKey: 'matchNumber',
        enableHiding: false,
        cell: ({ row: { original } }) => (
          <Text size="sm" ff="monospace" fw={500}>
            {original.matchNumber}
          </Text>
        ),
      },
      {
        header: 'Lost Case',
        id: 'lostCase',
        cell: ({ row: { original } }) => {
          const doc = original.lostDocumentCase?.case?.document;
          const caseNumber = original.lostDocumentCase?.case?.caseNumber;
          return (
            <Stack gap={0}>
              <Text size="sm">{caseNumber}</Text>
              <Text size="xs" c="dimmed">
                {doc?.fullName ?? doc?.documentNumber ?? '—'}
              </Text>
            </Stack>
          );
        },
      },
      {
        header: 'Found Case',
        id: 'foundCase',
        cell: ({ row: { original } }) => {
          const doc = original.foundDocumentCase?.case?.document;
          const caseNumber = original.foundDocumentCase?.case?.caseNumber;
          return (
            <Stack gap={0}>
              <Text size="sm">{caseNumber}</Text>
              <Text size="xs" c="dimmed">
                {doc?.fullName ?? doc?.documentNumber ?? '—'}
              </Text>
            </Stack>
          );
        },
      },
      {
        header: 'Score',
        accessorKey: 'finalScore',
        cell: ({ row: { original } }) => (
          <Badge
            variant="light"
            color={
              original.finalScore >= 0.7 ? 'green' : original.finalScore >= 0.4 ? 'yellow' : 'red'
            }
            size="sm"
          >
            {(original.finalScore * 100).toFixed(0)}%
          </Badge>
        ),
      },
      {
        header: 'Verdict',
        id: 'verdict',
        cell: ({ row: { original } }) => {
          const v = original.verdict;
          if (!v) {
            return '—';
          }
          return (
            <Badge variant="light" color={VERDICT_COLORS[v] ?? 'gray'} size="xs">
              {VERDICT_LABELS[v] ?? v.replace(/_/g, ' ')}
            </Badge>
          );
        },
      },
      {
        header: 'Confidence',
        id: 'confidence',
        cell: ({ row: { original } }) => {
          const score = original.finalScore;
          let label = 'Low';
          let color = 'orange';

          if (score >= 0.7) {
            label = 'High';
            color = 'green';
          } else if (score >= 0.4) {
            label = 'Medium';
            color = 'yellow';
          } else if (score < 0.1) {
            label = 'No Match';
            color = 'red';
          }

          return (
            <Badge variant="outline" color={color} size="xs">
              {label}
            </Badge>
          );
        },
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row: { original } }) => <StatusBadge status={original.status} />,
      },
      {
        header: 'Matched On',
        accessorKey: 'createdAt',
        cell: ({ row: { original } }) => formatDate(original.createdAt),
      },
      {
        id: 'actions',
        size: 40,
        cell: ({ row: { original } }) => (
          <ActionIcon
            component={Link}
            to={`${original.id}`}
            variant="subtle"
            size="sm"
            aria-label="View match"
          >
            <TablerIcon name="eye" size={14} />
          </ActionIcon>
        ),
      },
    ],
    []
  );

  return (
    <StateFullDataTable
      {...matchesAsync}
      data={matchesAsync.matches}
      columns={columns}
      renderActions={() => (
        <>
          <TextInput
            placeholder="Search matches..."
            leftSection={<TablerIcon name="search" size={14} />}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            size="xs"
            w={200}
          />
          <Select
            placeholder="Status"
            data={STATUS_OPTIONS}
            value={status}
            onChange={setStatus}
            size="xs"
            clearable
            w={130}
          />
          <Select
            placeholder="Confidence"
            data={CONFIDENCE_OPTIONS}
            value={confidence}
            onChange={setConfidence}
            size="xs"
            clearable
            w={140}
          />
          <Select
            placeholder="Verdict"
            data={Object.entries(VERDICT_LABELS).map(([value, label]) => ({ label, value }))}
            value={verdict}
            onChange={setVerdict}
            size="xs"
            clearable
            w={160}
          />
        </>
      )}
      pagination={{
        totalCount: matchesAsync.totalCount,
        currentPage: page,
        pageSize,
        onChange: setPage,
        onPageSizeChange: setPageSize,
      }}
    />
  );
};
