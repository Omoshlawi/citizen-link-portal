import React from 'react';
import { Table } from '@tanstack/react-table';
import { Flex, Group, Text } from '@mantine/core';
import { DataTableViewOptions } from './DataTableViewOptions';

interface DataTableHeaderProps<TData> {
  table: Table<TData>;
  title?: string;
  actions?: React.ReactNode;
  withColumnViewOptions?: boolean;
}

const DataTableHeader = <TData,>({
  table,
  title,
  actions,
  withColumnViewOptions = true,
}: DataTableHeaderProps<TData>) => {
  if (!title && !actions && !withColumnViewOptions) {
    return null;
  }

  return (
    <Flex mb="md" gap="sm" align="center" justify="space-between" wrap="wrap">
      {title && (
        <Text fw={700} size="lg">
          {title}
        </Text>
      )}
      <Group gap="sm" ml="auto">
        {withColumnViewOptions && <DataTableViewOptions table={table} />}
        {actions}
      </Group>
    </Flex>
  );
};

export default DataTableHeader;
