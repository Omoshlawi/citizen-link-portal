import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Divider, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { DashboardPageHeader } from '@/components';
import { useDocumentCase } from '@/features/cases/hooks';
import { CustodyStatus } from '@/features/cases/types';
import { DocumentCustodyActions } from '../components';
import { CustodyStatusBadge } from '../components/CustodyStatusBadge';
import { OperationHistoryTimeline } from '../components/OperationHistoryTimeline';
import { useCustodyHistory } from '../hooks/useCustody';
import { useStation } from '../hooks/useStations';

/** Route param is the DocumentCase id; custody history is keyed by its FoundDocumentCase id. */
const CustodyDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { report, isLoading: caseLoading, mutate: mutateCase } = useDocumentCase(caseId);

  const foundCase = report?.foundDocumentCase;
  const document = report?.document;

  const {
    operations,
    isLoading: historyLoading,
    mutate: mutateHistory,
  } = useCustodyHistory(foundCase?.id, { orderBy: 'createdAt' });
  const { station: currentStation } = useStation(foundCase?.currentStationId);

  if (caseLoading) {
    return (
      <Stack align="center" py="xl">
        <Loader />
      </Stack>
    );
  }

  if (!report || !foundCase) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        Case not found.
      </Text>
    );
  }

  return (
    <Stack gap="md">
      <DashboardPageHeader
        title={`Custody — ${report.caseNumber}`}
        subTitle={document?.type?.name ?? 'Document'}
        icon="buildingWarehouse"
      />

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
                  void mutateCase();
                  void mutateHistory();
                }}
              />
            </Group>
          </Group>

          <Divider />

          <Group gap="xl">
            <Stack gap={2}>
              <Text size="xs" c="dimmed">
                Document
              </Text>
              <Text size="sm" fw={600}>
                {document?.fullName ?? '—'}
              </Text>
            </Stack>
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
          {historyLoading ? (
            <Loader size="sm" />
          ) : (
            <OperationHistoryTimeline operations={operations} foundCaseId={foundCase.id} />
          )}
        </Stack>
      </Card>
    </Stack>
  );
};

export default CustodyDetailPage;
