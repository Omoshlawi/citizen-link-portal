import { Alert, Badge, Button, Group, Loader, Stack, Text } from '@mantine/core';
import { launchWorkspace, TablerIcon } from '@/components';
import { useUserHasSystemAccess } from '@/hooks/useSystemAccess';
import ResolveExtractionForm from '../forms/ResolveExtractionForm';
import UpdateDocumentinfoForm from '../forms/UpdateDocumentinfoForm';
import { AIExtraction, CaseType, DocumentCase, ExtractionResolutionType } from '../types';

const STEP_LABEL: Record<string, string> = {
  VISION: 'Image Scan',
  STRUCTURE: 'Data Reading',
};

const RESOLUTION_BADGE: Record<ExtractionResolutionType, { label: string; color: string }> = {
  [ExtractionResolutionType.RESUBMIT_IMAGE]: {
    label: 'Awaiting Image Resubmission',
    color: 'yellow',
  },
  [ExtractionResolutionType.SUBMIT_NEW_CASE]: { label: 'New Case Required', color: 'orange' },
  [ExtractionResolutionType.STAFF_HANDLING]: { label: 'Staff Handling', color: 'civicBlue' },
};

interface CaseExtractionAlertProps {
  extraction?: AIExtraction;
  reportType: CaseType;
  lostAuto?: boolean;
  documentCase: DocumentCase;
}

const CaseExtractionAlert = ({
  extraction,
  reportType,
  lostAuto,
  documentCase,
}: CaseExtractionAlertProps) => {
  const hasExtraction = reportType === 'FOUND' || lostAuto;
  const { hasAccess: canResolve } = useUserHasSystemAccess({ documentCase: ['resolveExtraction'] });

  if (!hasExtraction || !extraction) {
    return null;
  }

  const { extractionStatus, currentStep, resolutionType, failureReason } = extraction;

  if (extractionStatus === 'COMPLETED') {
    return null;
  }

  if (extractionStatus === 'FAILED') {
    // Nothing auto-resolves any more — a resolution exists only once staff set one.
    const isResolved = !!resolutionType;
    const badge = resolutionType ? RESOLUTION_BADGE[resolutionType] : null;

    const STAFF_RESOLUTION_COPY: Record<ExtractionResolutionType, string> = {
      [ExtractionResolutionType.RESUBMIT_IMAGE]:
        'The citizen has been asked to resubmit clearer document images. No action required until they do.',
      [ExtractionResolutionType.SUBMIT_NEW_CASE]:
        'The citizen has been asked to submit a new case. No action required until they do.',
      [ExtractionResolutionType.STAFF_HANDLING]:
        'Marked as staff-handled — the citizen has been told you are looking into it. If the images are readable, enter the fields manually.',
    };

    const openResolve = () => {
      const close = launchWorkspace(
        <ResolveExtractionForm documentCase={documentCase} onClose={() => close()} />,
        { title: 'Review Document Processing' }
      );
    };

    const openEnterFields = () => {
      const close = launchWorkspace(
        <UpdateDocumentinfoForm document={documentCase.document!} closeWorkspace={() => close()} />,
        { title: 'Enter Document Fields Manually' }
      );
    };

    return (
      <Alert
        variant="light"
        color={isResolved ? 'civicBlue' : 'yellow'}
        icon={<TablerIcon name={isResolved ? 'infoCircle' : 'alertTriangle'} size={16} />}
        title={
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {isResolved ? 'Document Processing — Resolved' : 'Document Processing — Needs Review'}
            </Text>
            {badge && (
              <Badge color={badge.color} variant="light" size="xs">
                {badge.label}
              </Badge>
            )}
          </Stack>
        }
      >
        <Stack gap="xs">
          <Text size="sm">
            {isResolved
              ? STAFF_RESOLUTION_COPY[resolutionType!]
              : "Automated processing didn't complete. Review the images and choose how to proceed."}
          </Text>

          {/* Raw diagnostic — the only signal separating an unreadable image from our own
              outage, and the citizen is never blamed for the latter without a human deciding. */}
          {!isResolved && failureReason && (
            <Text size="xs" c="dimmed" ff="monospace">
              {failureReason}
            </Text>
          )}

          {canResolve && !isResolved && (
            <Group gap="xs">
              {documentCase.document && (
                <Button
                  size="xs"
                  variant="outline"
                  color="civicBlue"
                  leftSection={<TablerIcon name="forms" size={13} />}
                  onClick={openEnterFields}
                >
                  Enter Fields Manually
                </Button>
              )}
              <Button
                size="xs"
                variant="outline"
                color="yellow"
                leftSection={<TablerIcon name="messageCircle" size={13} />}
                onClick={openResolve}
              >
                Review &amp; Resolve
              </Button>
            </Group>
          )}
        </Stack>
      </Alert>
    );
  }

  const stepLabel = currentStep ? STEP_LABEL[currentStep] : null;

  return (
    <Alert
      variant="light"
      color="civicBlue"
      icon={<Loader size={14} />}
      title={
        extractionStatus === 'IN_PROGRESS'
          ? `Processing In Progress${stepLabel ? ` — ${stepLabel}` : ''}`
          : 'Queued for Processing'
      }
    >
      {extractionStatus === 'IN_PROGRESS'
        ? 'The document is being analysed. Fields will populate automatically once complete.'
        : 'This document is queued for processing. Fields may be incomplete until processing finishes.'}
    </Alert>
  );
};

export default CaseExtractionAlert;
