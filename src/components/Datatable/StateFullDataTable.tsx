import React, { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { Table } from '@tanstack/react-table';
import { Box, Button, Group, Pagination, SegmentedControl, Select, Text } from '@mantine/core';
import { PAGE_SIZE_OPTIONS } from '@/hooks/useTableUrlFilters';
import { TableSkeleton } from '../ComponentSkeletons';
import { EmptyState, ErrorState } from '../StateWidgets';
import { DataTable, DataTableProps } from './DataTable';

export interface PaginationConfig {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

interface StateFullDataTableProps<TData, TValue>
  extends Omit<DataTableProps<TData, TValue>, 'renderTable'> {
  isLoading?: boolean;
  error?: Error;
  onAdd?: () => void;
  retryOnError?: () => void;
  nothingFoundMessage?: string;
  errorMessage?: string;
  views?: Record<string, (table: Table<TData>) => React.ReactNode>;
  renderViewTabItem?: (view: string) => React.ReactNode;
  defaultView?: string;
  pagination?: PaginationConfig;
}

const StateFullDataTable = <TData, TValue>({
  error,
  isLoading,
  onAdd,
  retryOnError,
  renderActions,
  nothingFoundMessage,
  errorMessage,
  views = {},
  renderViewTabItem,
  defaultView = 'table',
  pagination,
  ...props
}: StateFullDataTableProps<TData, TValue>) => {
  const _views = ['table', ...Object.keys(views)];
  const [currentView, setCurrentView] = useState<string>(
    _views.includes(defaultView) ? defaultView : 'table'
  );

  const renderContent = () => {
    if (isLoading) {
      return () => <TableSkeleton />;
    }
    if (error) {
      return () => (
        <ErrorState
          error={error}
          title={props.title}
          onRetry={retryOnError}
          message={errorMessage}
        />
      );
    }
    if (!props?.data?.length) {
      return () => <EmptyState title={props.title} message={nothingFoundMessage} onAdd={onAdd} />;
    }
    if (currentView !== 'table') {
      return views[currentView];
    }
    return undefined;
  };

  const totalPages = pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : 0;
  const rangeStart = pagination ? (pagination.currentPage - 1) * pagination.pageSize + 1 : 0;
  const rangeEnd = pagination
    ? Math.min(pagination.currentPage * pagination.pageSize, pagination.totalCount)
    : 0;

  return (
    <>
      <DataTable
        {...props}
        renderTable={renderContent()}
        renderActions={(table) => (
          <>
            {typeof onAdd === 'function' && (
              <Button
                leftSection={<IconPlus size={14} />}
                variant="light"
                size="xs"
                onClick={onAdd}
              >
                Add
              </Button>
            )}
            {renderActions?.(table)}
            {Object.keys(views).length > 0 && (
              <SegmentedControl
                size="xs"
                value={currentView}
                onChange={setCurrentView}
                data={_views.map((v) => ({
                  label: renderViewTabItem?.(v) ?? v,
                  value: v,
                }))}
              />
            )}
          </>
        )}
        renderPaginator={
          pagination && pagination.totalCount > 0
            ? () => (
                <Box
                  style={{
                    borderLeft: '1px solid var(--mantine-color-default-border)',
                    borderRight: '1px solid var(--mantine-color-default-border)',
                    borderBottom: '1px solid var(--mantine-color-default-border)',
                    background:
                      'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 48,
                    paddingLeft: 'var(--mantine-spacing-md)',
                    paddingRight: 'var(--mantine-spacing-sm)',
                  }}
                >
                  <Group gap={6} align="center">
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                      Items per page
                    </Text>
                    <Select
                      size="xs"
                      data={PAGE_SIZE_OPTIONS.map((n) => ({ value: String(n), label: String(n) }))}
                      value={String(pagination.pageSize)}
                      onChange={(v) => v && pagination.onPageSizeChange(Number(v))}
                      w={60}
                      allowDeselect={false}
                    />
                  </Group>
                  <Group gap="sm" align="center">
                    <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                      {rangeStart}–{rangeEnd} of {pagination.totalCount} items
                    </Text>
                    {totalPages > 1 && (
                      <Pagination
                        total={totalPages}
                        value={pagination.currentPage}
                        onChange={pagination.onChange}
                        size="xs"
                        withEdges
                      />
                    )}
                  </Group>
                </Box>
              )
            : undefined
        }
      />
    </>
  );
};

export default StateFullDataTable;
