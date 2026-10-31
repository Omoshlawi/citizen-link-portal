import { Navigate } from 'react-router-dom';
import { Paper, Stack } from '@mantine/core';
import { CaseCustodyPanel } from '@/features/custody/components';
import { usePagePermissions } from '@/features/dashboard/navigation/usePagePermissions';
import {
  AdditionalDetails,
  ContactFooter,
  DocumentImages,
  DocumentInformation,
  ExchangesPanel,
  ExtractionInteractionsPanel,
  LocationInformation,
  ReportDetails,
} from '../components';
import { useCaseDetail } from './DocumentCaseDetail';

/** Sends a deep link to a tab this case doesn't show back to the first tab. */
const FirstTabRedirect = ({ caseId }: { caseId: string }) => (
  <Navigate to={`/dashboard/cases/${caseId}/document`} replace />
);

export const CaseDocumentTab = () => {
  const { reportData, reportType, status } = useCaseDetail();
  return (
    <Paper withBorder p="lg">
      <DocumentInformation
        document={reportData.document!}
        reportType={reportType}
        status={status}
      />
    </Paper>
  );
};

export const CaseImagesTab = () => {
  const { reportData, reportType, status } = useCaseDetail();
  return (
    <Paper withBorder p="lg">
      <DocumentImages document={reportData.document!} reportType={reportType} status={status} />
    </Paper>
  );
};

export const CaseLocationTab = () => {
  const { reportData, reportType, status } = useCaseDetail();
  return (
    <Paper withBorder p="lg">
      <LocationInformation documentCase={reportData} reportType={reportType} status={status} />
    </Paper>
  );
};

export const CaseDetailsTab = () => {
  const { reportData, reportType } = useCaseDetail();
  return (
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
        <ContactFooter reportType={reportType} foundDocumentCase={reportData.foundDocumentCase} />
      </Stack>
    </Paper>
  );
};

export const CaseAdditionalTab = () => {
  const { reportData, reportType, status } = useCaseDetail();
  return (
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
  );
};

export const CaseAiProcessingTab = () => {
  const { reportData, hasExtractions } = useCaseDetail();
  if (!hasExtractions) {
    return <FirstTabRedirect caseId={reportData.id} />;
  }
  return (
    <Paper withBorder p="lg">
      <ExtractionInteractionsPanel extractions={reportData.extractions ?? []} />
    </Paper>
  );
};

export const CaseExchangesTab = () => {
  const { reportData, foundCaseId } = useCaseDetail();
  if (!foundCaseId) {
    return <FirstTabRedirect caseId={reportData.id} />;
  }
  return <ExchangesPanel foundCaseId={foundCaseId} />;
};

export const CaseCustodyTab = () => {
  const { reportData } = useCaseDetail();
  const { canAccess, isLoading } = usePagePermissions();
  const foundCase = reportData.foundDocumentCase;
  if (isLoading) {
    return null;
  }
  if (!foundCase || !canAccess('custody')) {
    return <FirstTabRedirect caseId={reportData.id} />;
  }
  return <CaseCustodyPanel foundCase={foundCase} />;
};
