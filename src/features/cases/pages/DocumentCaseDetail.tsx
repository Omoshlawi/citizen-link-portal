import { useParams } from 'react-router-dom';
import { Badge, Group, Paper, Stack, Tabs, Text } from '@mantine/core';
import { DashboardPageHeader, ErrorState, StatusBadge, TablerIcon } from '@/components';
import { TablerIconName } from '@/components/TablerIcon';
import {
  AdditionalDetails,
  CaseCollectionAlert,
  CaseExtractionAlert,
  ContactFooter,
  DocumentCaseActions,
  DocumentImages,
  DocumentInformation,
  ExchangesPanel,
  ExtractionInteractionsPanel,
  LocationInformation,
  ReportDetails,
} from '../components';
import { useActiveExchange } from '@/features/exchange';
import { useDocumentCase } from '../hooks';
import {
  CaseType,
  FoundDocumentCaseStatus,
  LostDocumentCaseStatus,
} from '../types';
import DocumentCaseDetailSkeleton from './DocumentCaseDetailSkeleton';

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

      <CaseExtractionAlert
        extraction={reportData.extractions
          ?.slice()
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]}
        reportType={reportType}
        lostAuto={reportData.lostDocumentCase?.auto}
        documentCase={reportData}
      />

      {hasActiveVerification && <CaseCollectionAlert documentCase={reportData} />}

      <Tabs defaultValue="document" variant="default">
        <Tabs.List>
          <Tabs.Tab value="document" leftSection={<TablerIcon name="id" size={16} />}>
            Document
          </Tabs.Tab>
          <Tabs.Tab value="images" leftSection={<TablerIcon name="photo" size={16} />}>
            Images
          </Tabs.Tab>
          <Tabs.Tab value="location" leftSection={<TablerIcon name="mapPin" size={16} />}>
            Location
          </Tabs.Tab>
          <Tabs.Tab value="details" leftSection={<TablerIcon name="infoCircle" size={16} />}>
            Report Details
          </Tabs.Tab>
          <Tabs.Tab value="additional" leftSection={<TablerIcon name="fileText" size={16} />}>
            Additional
          </Tabs.Tab>
          {(reportData.extractions?.length ?? 0) > 0 && (
            <Tabs.Tab value="extraction" leftSection={<TablerIcon name="robot" size={16} />}>
              AI Processing
            </Tabs.Tab>
          )}
          {!isLostCase && (
            <Tabs.Tab value="exchanges" leftSection={<TablerIcon name="arrowsExchange" size={16} />}>
              Exchanges
            </Tabs.Tab>
          )}
        </Tabs.List>

        <Tabs.Panel value="document" pt="md">
          <Paper withBorder p="lg">
            <DocumentInformation
              document={reportData.document!}
              reportType={reportType}
              status={status}
            />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="images" pt="md">
          <Paper withBorder p="lg">
            <DocumentImages
              document={reportData.document!}
              reportType={reportType}
              status={status}
            />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="location" pt="md">
          <Paper withBorder p="lg">
            <LocationInformation
              documentCase={reportData}
              reportType={reportType}
              status={status}
            />
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="details" pt="md">
          <Paper withBorder p="lg">
            <Stack gap="lg">
              <ReportDetails
                lostOrFoundDate={reportData.eventDate}
                createdAt={reportData.createdAt}
                description={reportData.description}
                tags={reportData.tags}
                lostDocumentCase={reportData.lostDocumentCase}
                foundDocumentCase={reportData.foundDocumentCase}
                documentCase={reportData}
              />
              <ContactFooter
                reportType={reportType}
                foundDocumentCase={reportData.foundDocumentCase}
              />
            </Stack>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="additional" pt="md">
          <Paper withBorder p="lg">
            <AdditionalDetails
              caseId={reportData.id}
              caseNumber={reportData.caseNumber}
              reportType={reportType}
              status={status}
              document={reportData.document}
              lostDocumentCase={reportData.lostDocumentCase}
            />
          </Paper>
        </Tabs.Panel>

        {(reportData.extractions?.length ?? 0) > 0 && (
          <Tabs.Panel value="extraction" pt="md">
            <Paper withBorder p="lg">
              <ExtractionInteractionsPanel extractions={reportData.extractions ?? []} />
            </Paper>
          </Tabs.Panel>
        )}
        {!isLostCase && (
          <Tabs.Panel value="exchanges" pt="md">
            <ExchangesPanel foundCaseId={foundCaseId!} />
          </Tabs.Panel>
        )}
      </Tabs>
    </Stack>
  );
};

export default DocumentCaseDetail;
