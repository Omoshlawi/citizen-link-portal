import { useParams } from 'react-router-dom';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  DashboardPageHeader,
  ErrorState,
  launchWorkspace,
  StatusBadge,
  SystemAuthorized,
  TablerIcon,
} from '@/components';
import { formatDateTime } from '@/lib/utils';
import TranscriptView from '../components/TranscriptView';
import ResolveReportForm from '../forms/ResolveReportForm';
import { useChatReport } from '../hooks';
import { ChatReportReason, ChatReportStatus } from '../types';
import { REASON_COLOR, REASON_LABEL } from '../utils/labels';

const ChatReportDetailPage = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { report, isLoading, error } = useChatReport(reportId);

  if (isLoading) {
    return (
      <Group justify="center" p="xl">
        <Loader />
      </Group>
    );
  }

  if (error || !report) {
    return <ErrorState error={error} message="No report data available" title="Chat Report" />;
  }

  const isPending = report.status === ChatReportStatus.PENDING;

  const handleResolve = () => {
    const close = launchWorkspace(
      <ResolveReportForm report={report} onClose={() => close()} />,
      { title: 'Resolve report' }
    );
  };

  return (
    <SystemAuthorized
      permissions={{ chatReport: ['read'] }}
      unauthorizedAction={{ type: 'redirect', path: '/dashboard' }}
    >
      <Stack gap="md">
        <DashboardPageHeader
          icon="messageReport"
          title="Reported AI reply"
          subTitle={`Reported ${formatDateTime(report.createdAt)}`}
          traiiling={
            isPending ? (
              <SystemAuthorized
                permissions={{ chatReport: ['manage'] }}
                unauthorizedAction={{ type: 'hide' }}
              >
                <Button
                  size="xs"
                  variant="light"
                  leftSection={<TablerIcon name="check" size={14} />}
                  onClick={handleResolve}
                >
                  Resolve
                </Button>
              </SystemAuthorized>
            ) : undefined
          }
        />

        <Card withBorder p="md">
          <Stack gap="sm">
            <Group gap="xs">
              <Badge variant="light" color={REASON_COLOR[report.reason]}>
                {REASON_LABEL[report.reason]}
              </Badge>
              <StatusBadge status={report.status} />
            </Group>

            <Box>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                The reply as the reporter saw it
              </Text>
              <Paper withBorder p="sm" bg="var(--mantine-color-red-light)">
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {report.content}
                </Text>
              </Paper>
            </Box>

            {report.details && (
              <Box>
                <Text size="xs" c="dimmed" tt="uppercase" fw={600} mb={4}>
                  {report.reason === ChatReportReason.OTHER
                    ? 'Why they reported it'
                    : 'What the reporter added'}
                </Text>
                {/* For "Other" this is the only signal the report carries, and
                    the API now requires it — so give it the same weight as the
                    reply itself rather than treating it as an aside. */}
                <Paper
                  withBorder={report.reason === ChatReportReason.OTHER}
                  p={report.reason === ChatReportReason.OTHER ? 'sm' : 0}
                >
                  <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                    {report.details}
                  </Text>
                </Paper>
              </Box>
            )}
          </Stack>
        </Card>

        {!isPending && (
          <Alert
            variant="light"
            color={report.status === ChatReportStatus.REVIEWED ? 'civicGreen' : 'gray'}
            title={`${report.status === ChatReportStatus.REVIEWED ? 'Reviewed' : 'Dismissed'}${
              report.reviewedBy ? ` by ${report.reviewedBy.name}` : ''
            }${report.reviewedAt ? ` on ${formatDateTime(report.reviewedAt)}` : ''}`}
          >
            {report.resolutionNote ? (
              <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                {report.resolutionNote}
              </Text>
            ) : (
              <Text size="sm" c="dimmed">
                No resolution note was recorded.
              </Text>
            )}
          </Alert>
        )}

        <Card withBorder p="md">
          <Title order={5} mb="sm">
            Conversation
          </Title>
          <TranscriptView
            messages={report.transcript ?? []}
            reportedMessageId={report.messageId}
            reportedContent={report.content}
          />
        </Card>
      </Stack>
    </SystemAuthorized>
  );
};

export default ChatReportDetailPage;
