import { Outlet, useOutletContext, useParams } from 'react-router-dom';
import { Alert, Badge, Group, Stack, Text } from '@mantine/core';
import {
  DashboardPageHeader,
  ErrorState,
  RouteTab,
  RouteTabs,
  StatusBadge,
  TablerIcon,
} from '@/components';
import { TablerIconName } from '@/components/TablerIcon';
import { useActiveExchange } from '@/features/exchange';
import { CaseCollectionAlert, CaseExtractionAlert, DocumentCaseActions } from '../components';
import { useDocumentCase } from '../hooks';
import { CaseType, DocumentCase, FoundDocumentCaseStatus, LostDocumentCaseStatus } from '../types';
import DocumentCaseDetailSkeleton from './DocumentCaseDetailSkeleton';

export type CaseDetailContext = {
  reportData: DocumentCase;
  reportType: CaseType;
  status: LostDocumentCaseStatus | FoundDocumentCaseStatus;
  hasExtractions: boolean;
  foundCaseId?: string;
};

/** Read the case loaded by the `DocumentCaseDetail` layout from inside a tab route. */
export const useCaseDetail = () => useOutletContext<CaseDetailContext>();

/** Layout route: each tab is a child path under `/dashboard/cases/:reportId`. */
const DocumentCaseDetail = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const { error, isLoading, report: reportData } = useDocumentCase(reportId);

  // Must be before any early returns — SWR skips fetch when foundCaseId is undefined
  const foundCaseId = reportData?.foundDocumentCase?.id;
  const { hasActiveVerification } = useActiveExchange(foundCaseId);

  if (isLoading) {
    return <DocumentCaseDetailSkeleton />;
  }
  if (error || !reportData) {
    return <ErrorState error={error} message="No report data available" title="Report Detail" />;
  }

  const isLostCase = !!reportData.lostDocumentCase;
  const reportType: CaseType = isLostCase ? CaseType.LOST : CaseType.FOUND;
  const docType = reportData.document?.type?.name || 'Unknown';
  const caseNumber = reportData.caseNumber || 'Unknown';
  const status = isLostCase
    ? reportData.lostDocumentCase?.status || LostDocumentCaseStatus.SUBMITTED
    : reportData.foundDocumentCase?.status || FoundDocumentCaseStatus.DRAFT;
  const pointAwarded = reportData.foundDocumentCase?.pointAwarded ?? 0;
  const hasExtractions = (reportData.extractions?.length ?? 0) > 0;

  const tabs: RouteTab[] = [
    { value: 'document', label: 'Document', icon: 'id' },
    { value: 'images', label: 'Images', icon: 'photo' },
    { value: 'location', label: 'Location', icon: 'mapPin' },
    { value: 'details', label: 'Report Details', icon: 'infoCircle' },
    { value: 'additional', label: 'Additional', icon: 'fileText' },
    ...(hasExtractions
      ? [{ value: 'ai-processing', label: 'AI Processing', icon: 'robot' } as RouteTab]
      : []),
    ...(!isLostCase
      ? [{ value: 'exchanges', label: 'Exchanges', icon: 'arrowsExchange' } as RouteTab]
      : []),
  ];

  const context: CaseDetailContext = {
    reportData,
    reportType,
    status,
    hasExtractions,
    foundCaseId,
  };

  return (
    <Stack gap="xl">
      <DashboardPageHeader
        icon={(reportData.document?.type?.icon || 'id') as TablerIconName}
        title={`${docType} Report`}
        subTitle={() => (
          <Group gap="sm">
            <Text size="sm" c="dimmed" ff="monospace">
              {caseNumber}
            </Text>
            <Badge size="xs" variant="light">
              {reportType === 'FOUND' ? 'Found Document' : 'Lost Document'}
            </Badge>
            <StatusBadge status={status} />
            {reportType === 'FOUND' && pointAwarded > 0 && (
              <Badge size="xs" color="civicGreen" variant="light">
                {pointAwarded} pts
              </Badge>
            )}
          </Group>
        )}
        traiiling={
          <DocumentCaseActions
            caseId={reportData.id}
            caseNumber={caseNumber}
            documentCase={reportData}
            reportType={reportType}
            status={status}
          />
        }
      />

      {reportData.anonymizedAt && (
        <Alert
          color="orange"
          icon={<TablerIcon name="shieldOff" size={16} />}
          title="PII Anonymized"
        >
          The personally identifiable information for this case was anonymized on{' '}
          {new Date(reportData.anonymizedAt).toLocaleDateString()}. Document fields, images, and
          extracted data have been stripped.
        </Alert>
      )}

      <CaseExtractionAlert
        extraction={
          reportData.extractions
            ?.slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
        }
        documentCase={reportData}
      />

      {hasActiveVerification && <CaseCollectionAlert documentCase={reportData} />}

      <Stack gap="md">
        <RouteTabs basePath={`/dashboard/cases/${reportData.id}`} tabs={tabs} iconSize={16} />
        <Outlet context={context} />
      </Stack>
    </Stack>
  );
};

export default DocumentCaseDetail;
