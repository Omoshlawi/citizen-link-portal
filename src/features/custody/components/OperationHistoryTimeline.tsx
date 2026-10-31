import React from 'react';
import { Box, Group, Stack, Text, Timeline } from '@mantine/core';
import { TablerIcon } from '@/components';
import { formatDate } from '@/lib/utils/helpers';
import { DocumentOperation } from '../types';
import { CustodyStatusBadge } from './CustodyStatusBadge';
import { OPERATION_ICONS } from './operationIcons';

interface OperationHistoryTimelineProps {
  operations: DocumentOperation[];
  /** The case whose history is shown — batch operations hold other cases too. */
  foundCaseId?: string;
  isLoading?: boolean;
}

export const OperationHistoryTimeline: React.FC<OperationHistoryTimelineProps> = ({
  operations,
  foundCaseId,
}) => {
  if (operations.length === 0) {
    return (
      <Text size="sm" c="dimmed" ta="center" py="xl">
        No operations recorded yet.
      </Text>
    );
  }

  return (
    <Timeline active={operations.length - 1} bulletSize={28} lineWidth={2}>
      {operations.map((op) => {
        const iconName = OPERATION_ICONS[op.operationType?.code ?? ''] ?? 'circle';
        const item = op.items.find((i) => i.foundCaseId === foundCaseId) ?? op.items[0];
        const isSystemRecorded = op.metadata?.source === 'EXCHANGE';
        const stationLabel = (() => {
          const code = op.operationType?.code;
          if (code === 'REQUISITION') {
            const performer = op.station?.name;
            const source = op.counterpartStation?.name;
            if (performer && source) {
              return `${performer} → requested from ${source}`;
            }
            if (source) {
              return `Requested from: ${source}`;
            }
            return performer ?? null;
          }
          if (op.station && op.counterpartStation) {
            return `${op.station.name} → ${op.counterpartStation.name}`;
          }
          return op.station?.name ?? op.counterpartStation?.name ?? null;
        })();

        return (
          <Timeline.Item
            key={op.id}
            bullet={<TablerIcon name={iconName as any} size={14} />}
            title={
              <Group gap="xs" wrap="nowrap">
                <Text size="sm" fw={600}>
                  {op.operationType?.name ?? op.operationNumber}
                </Text>
                <Text size="xs" c="dimmed">
                  {op.operationNumber}
                </Text>
              </Group>
            }
          >
            <Stack gap={4} mt={4}>
              {item && (
                <Group gap="xs">
                  <CustodyStatusBadge status={item.custodyStatusBefore ?? undefined} />
                  <TablerIcon name="arrowRight" size={12} />
                  <CustodyStatusBadge status={item.custodyStatusAfter ?? undefined} />
                </Group>
              )}

              {isSystemRecorded && (
                <Text size="xs" c="dimmed">
                  Recorded automatically · confirmed by handover code
                  {op.metadata?.exchangeNumber ? ` (${op.metadata.exchangeNumber})` : ''}
                </Text>
              )}

              {stationLabel && (
                <Text size="xs" c="dimmed">
                  Station: {stationLabel}
                </Text>
              )}

              {op.notes && (
                <Box
                  px="xs"
                  py={4}
                  style={{ background: 'var(--mantine-color-gray-0)', borderRadius: 4 }}
                >
                  <Text size="xs" c="dimmed">
                    {op.notes}
                  </Text>
                </Box>
              )}

              <Text size="xs" c="dimmed">
                By {op.createdBy?.name ?? op.createdById} · {formatDate(op.createdAt)}
              </Text>
            </Stack>
          </Timeline.Item>
        );
      })}
    </Timeline>
  );
};
