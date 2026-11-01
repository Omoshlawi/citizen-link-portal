import React, { useMemo, useState } from 'react';
import { Badge, Button, Group, Loader, Switch, Table, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { SystemAuthorized, TablerIcon } from '@/components';
import { handleApiErrors } from '@/lib/api';
import {
  createStationOperationType,
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

  const [linkingId, setLinkingId] = useState<string | null>(null);

  // Links start switched off; staff then turn them on with the switch.
  const handleLink = async (operationTypeId: string) => {
    setLinkingId(operationTypeId);
    try {
      await createStationOperationType(station.id, { operationTypeId, isEnabled: false });
      void mutate();
    } catch (err) {
      const e = handleApiErrors<{}>(err);
      showNotification({ title: 'Error', message: e.detail ?? 'Failed to link.', color: 'red' });
    } finally {
      setLinkingId(null);
    }
  };

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
                <SystemAuthorized
                  permissions={{ stationOperationType: ['manage'] }}
                  unauthorizedAction={{
                    type: 'fallback',
                    component: (
                      <Text size="xs" c="dimmed">
                        Not linked
                      </Text>
                    ),
                  }}
                >
                  <Button
                    size="compact-xs"
                    variant="light"
                    leftSection={<TablerIcon name="link" size={12} />}
                    loading={linkingId === ot.id}
                    disabled={linkingId !== null}
                    onClick={() => handleLink(ot.id)}
                    title="Adds this operation to the station, switched off"
                  >
                    Link
                  </Button>
                </SystemAuthorized>
              )}
            </Table.Td>
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
};
