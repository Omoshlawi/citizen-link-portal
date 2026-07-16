import React from 'react';
import { Alert, Divider, Grid, Stack, Text } from '@mantine/core';
import { TablerIcon } from '@/components';
import { DocaiStage } from '../types';
import ConversationsView from './ConversationsView';
import { formatDuration } from './extraction-constants';

interface StageDetailProps {
  stage: DocaiStage;
}

const StageDetail: React.FC<StageDetailProps> = ({ stage }) => {
  const { usage } = stage;
  const duration = formatDuration(stage.started_at, stage.completed_at);

  const inputTokens = usage?.total_input_tokens;
  const outputTokens = usage?.total_output_tokens;
  const hasTokens = inputTokens != null || outputTokens != null;

  // Null for self-hosted models — docai only prices models it has a rate for.
  const cost = usage?.estimated_cost_usd;

  return (
    <Stack gap="md">
      <Grid gutter="md">
        {usage?.model && (
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Text size="xs" fw={600} c="dimmed" mb={2}>Model</Text>
            <Text size="sm" ff="monospace">{usage.model}</Text>
            {usage.provider && (
              <Text size="xs" c="dimmed">{usage.provider}</Text>
            )}
          </Grid.Col>
        )}
        {duration !== '—' && (
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Text size="xs" fw={600} c="dimmed" mb={2}>Duration</Text>
            <Text size="sm" ff="monospace">{duration}</Text>
          </Grid.Col>
        )}
        {hasTokens && (
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Text size="xs" fw={600} c="dimmed" mb={2}>Tokens</Text>
            <Text size="sm" ff="monospace">
              {`${(inputTokens ?? 0).toLocaleString()} in · ${(outputTokens ?? 0).toLocaleString()} out`}
            </Text>
          </Grid.Col>
        )}
        {stage.completed_at && (
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Text size="xs" fw={600} c="dimmed" mb={2}>Completed</Text>
            <Text size="sm">{new Date(stage.completed_at).toLocaleString()}</Text>
          </Grid.Col>
        )}
        {cost != null && (
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Text size="xs" fw={600} c="dimmed" mb={2}>Est. Cost</Text>
            <Text size="sm" ff="monospace">${cost.toFixed(6)}</Text>
          </Grid.Col>
        )}
      </Grid>

      {stage.error && (
        <Alert
          variant="light"
          color="red"
          icon={<TablerIcon name="alertCircle" size={14} />}
          title="Stage Error"
        >
          <Text size="sm" ff="monospace" style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {stage.error}
          </Text>
        </Alert>
      )}

      <Divider />
      <ConversationsView
        conversations={stage.conversations}
        stageFailed={stage.status !== 'SUCCESS'}
      />
    </Stack>
  );
};

export default StageDetail;
