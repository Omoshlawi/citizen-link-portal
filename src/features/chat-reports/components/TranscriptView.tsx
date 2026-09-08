import { FC } from 'react';
import { Badge, Box, Group, Paper, Stack, Text } from '@mantine/core';
import { formatDateTime } from '@/lib/utils';
import { ChatTranscriptMessage } from '../types';

interface TranscriptViewProps {
  messages: ChatTranscriptMessage[];
  /** Null for reports filed mid-conversation, before message ids were known. */
  reportedMessageId: string | null;
  /** The snapshot the reporter saw — the fallback for matching when there is no id. */
  reportedContent: string;
}

/**
 * The conversation the reported reply came from, oldest first, with the reported
 * turn marked. Context is the whole point: an assistant reply read on its own is
 * rarely enough to judge.
 */
const TranscriptView: FC<TranscriptViewProps> = ({
  messages,
  reportedMessageId,
  reportedContent,
}) => {
  // Prefer the id. Without one, fall back to matching the snapshot, and only
  // mark a hit if exactly one message matches — otherwise nothing is marked
  // rather than the wrong turn.
  const contentMatches = messages.filter(
    (m) => m.role === 'ASSISTANT' && m.content.trim() === reportedContent.trim()
  );
  const fallbackId = contentMatches.length === 1 ? contentMatches[0].id : null;
  const markedId = reportedMessageId ?? fallbackId;

  if (!messages.length) {
    return (
      <Text size="sm" c="dimmed">
        This conversation is no longer available. The snapshot above is what the reporter saw.
      </Text>
    );
  }

  return (
    <Stack gap="sm">
      {messages.map((message) => {
        const isReported = message.id === markedId;
        const isBot = message.role === 'ASSISTANT';
        return (
          <Paper
            key={message.id}
            withBorder
            p="sm"
            bg={isReported ? 'var(--mantine-color-red-light)' : undefined}
            style={
              isReported ? { borderColor: 'var(--mantine-color-red-filled)' } : undefined
            }
          >
            <Group justify="space-between" mb={6} wrap="nowrap">
              <Group gap="xs">
                <Badge size="xs" variant="light" color={isBot ? 'civicBlue' : 'gray'}>
                  {isBot ? 'Assistant' : 'Citizen'}
                </Badge>
                {isReported && (
                  <Badge size="xs" color="red">
                    Reported
                  </Badge>
                )}
              </Group>
              <Text size="xs" c="dimmed">
                {formatDateTime(message.createdAt)}
              </Text>
            </Group>
            <Box style={{ whiteSpace: 'pre-wrap' }}>
              <Text size="sm">{message.content}</Text>
            </Box>
          </Paper>
        );
      })}

      {!markedId && (
        <Text size="xs" c="dimmed">
          The reported reply could not be matched to a message in this conversation — it may have
          been deleted since. The snapshot above is authoritative.
        </Text>
      )}
    </Stack>
  );
};

export default TranscriptView;
