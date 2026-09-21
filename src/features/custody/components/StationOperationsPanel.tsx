import React, { useMemo } from 'react';
import { Badge, Group, Loader, Stack, Switch, Table, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { handleApiErrors } from '@/lib/api';
import {
  updateStationOperationType,
  useDocumentOperationTypes,
  useStationOperationTypes,
} from '../hooks/useCustody';
import { Station, StationOperationType } from '../types';

type StationOperationsPanelProps = {
  station: Station;
};

export const StationOperationsPanel: React.FC<StationOperationsPanelProps> = ({ station }) => {
  const { stationOpTypes, isLoading, mutate } = useStationOperationTypes(station.id);
  const { operationTypes } = useDocumentOperationTypes({ limit: 100 });

  const rows = useMemo(
    () =>
      operationTypes
        .filter((ot) => !ot.voided)
        .map((ot) => ({
          operationType: ot,
          stationOp: stationOpTypes.find((sot) => sot.operationTypeId === ot.id) ?? null,
        })),
    [operationTypes, stationOpTypes]
  );

  const handleToggle = async (stationOp: StationOperationType | null, isEnabled: boolean) => {
    if (!stationOp) {
      return;
    }
    try {
      await updateStationOperationType(station.id, stationOp.id, { isEnabled });
      void mutate();
    } catch (err) {
      const e = handleApiErrors<{}>(err);
      showNotification({ title: 'Error', message: e.detail ?? 'Failed to update.', color: 'red' });
    }
  };

  if (isLoading) {
    return (
      <Group py="sm" justify="center">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">
          Loading operations…
        </Text>
      </Group>
    );
  }

  if (rows.length === 0) {
    return (
      <Text size="sm" c="dimmed" py="sm">
        No operation types configured.
      </Text>
    );
  }

  return (
    <Table withRowBorders={false} verticalSpacing="xs" horizontalSpacing="md">
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Operation Type</Table.Th>
          <Table.Th>Code</Table.Th>
          <Table.Th>Flags</Table.Th>
          <Table.Th>Enabled at Station</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {rows.map(({ operationType: ot, stationOp }) => (
          <Table.Tr key={ot.id}>
            <Table.Td>
              <Text size="sm" fw={500}>
                {ot.name}
              </Text>
            </Table.Td>
            <Table.Td>
              <Badge variant="light" color="gray" size="xs" ff="monospace">
                {ot.code}
              </Badge>
            </Table.Td>
            <Table.Td>
              <Group gap={4}>
                {ot.isHighPrivilege && (
                  <Badge size="xs" color="red">
                    High Privilege
                  </Badge>
                )}
                {ot.isFinalOperation && (
                  <Badge size="xs" color="orange">
                    Final
                  </Badge>
                )}
                {ot.requiresNotes && (
                  <Badge size="xs" color="gray">
                    Req. Notes
                  </Badge>
                )}
              </Group>
            </Table.Td>
            <Table.Td>
              {stationOp ? (
                <Switch
                  checked={stationOp.isEnabled}
                  onChange={(e) => handleToggle(stationOp, e.currentTarget.checked)}
                  size="sm"
                  color="civicGreen"
                />
              ) : (
                <Text size="xs" c="dimmed">
                  Not linked
                </Text>
              )}
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};
