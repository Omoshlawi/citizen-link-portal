import React from 'react';
import { Card, Divider, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { CustodyStatus, FoundDocumentCase } from '@/features/cases/types';
import { mutate } from '@/lib/api';
import { useCustodyHistory } from '../hooks/useCustody';
import { useStation } from '../hooks/useStations';
import { CustodyStatusBadge } from './CustodyStatusBadge';
import DocumentCustodyActions from './DocumentCustodyActions';
import { OperationHistoryTimeline } from './OperationHistoryTimeline';

interface CaseCustodyPanelProps {
  foundCase: FoundDocumentCase;
}

/** Where a found document is now, and every custody operation it has been through. */
export const CaseCustodyPanel: React.FC<CaseCustodyPanelProps> = ({ foundCase }) => {
  const {
    operations,
    isLoading,
    mutate: mutateHistory,
  } = useCustodyHistory(foundCase.id, { orderBy: 'createdAt' });
  const { station: currentStation } = useStation(foundCase.currentStationId);

  return (
    <Stack gap="md">
      <Card withBorder>
        <Stack gap="xs">
          <Group justify="space-between">
            <Title order={5}>Custody Status</Title>
            <Group gap="xs">
              <CustodyStatusBadge status={foundCase.custodyStatus} />
              <DocumentCustodyActions
                foundCaseId={foundCase.id}
                custodyStatus={foundCase.custodyStatus ?? CustodyStatus.WITH_FINDER}
                currentStationId={foundCase.currentStationId}
                onActionComplete={() => {
                  void mutate('/documents/cases');
                  void mutateHistory();
                }}
              />
            </Group>
          </Group>

          <Divider />

          <Group gap="xl">
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Current Station
              </Text>
              <Text size="sm" fw={600}>
                {currentStation?.name ?? '—'}
              </Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Operations
              </Text>
              <Text size="sm" fw={600}>
                {operations.length}
              </Text>
            </Stack>
          </Group>
        </Stack>
      </Card>

      <Card withBorder>
        <Stack gap="md">
          <Title order={5}>Operation History</Title>
          {isLoading ? (
            <Loader size="sm" />
          ) : (
            <OperationHistoryTimeline operations={operations} foundCaseId={foundCase.id} />
          )}
        </Stack>
      </Card>
    </Stack>
  );
};
