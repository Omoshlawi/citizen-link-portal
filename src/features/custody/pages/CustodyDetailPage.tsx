import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Divider, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { DashboardPageHeader } from '@/components';
import { useDocumentCase } from '@/features/cases/hooks';
import { useCustodyHistory } from '../hooks/useCustody';
import { CustodyStatusBadge } from '../components/CustodyStatusBadge';
import { DocumentCustodyActions } from '../components';
import { OperationHistoryTimeline } from '../components/OperationHistoryTimeline';

const CustodyDetailPage: React.FC = () => {
  const { foundCaseId } = useParams<{ foundCaseId: string }>();
  const { report, isLoading: caseLoading } = useDocumentCase(foundCaseId);
  const { operations, isLoading: historyLoading, mutate } = useCustodyHistory(foundCaseId);

  const foundCase = report?.foundDocumentCase;
  const document = report?.document;

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
              <CustodyStatusBadge status={(foundCase as any).custodyStatus} />
              <DocumentCustodyActions
                foundCaseId={foundCase.id}
                custodyStatus={(foundCase as any).custodyStatus}
                currentStationId={(foundCase as any).currentStationId}
                onActionComplete={() => void mutate()}
              />
            </Group>
          </Group>

          <Divider />

          <Group gap="xl">
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Document</Text>
              <Text size="sm" fw={600}>{document?.fullName ?? '—'}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Current Station</Text>
              <Text size="sm" fw={600}>{(foundCase as any).currentStation?.name ?? '—'}</Text>
            </Stack>
            <Stack gap={2}>
              <Text size="xs" c="dimmed">Operations</Text>
              <Text size="sm" fw={600}>{operations.length}</Text>
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
            <OperationHistoryTimeline operations={operations} foundCaseId={foundCaseId} />
          )}
        </Stack>
      </Card>
    </Stack>
  );
};

export default CustodyDetailPage;
