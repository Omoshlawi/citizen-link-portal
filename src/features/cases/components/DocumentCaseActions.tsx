import React from 'react';
import { Link } from 'react-router-dom';
import { Button, Group, Menu } from '@mantine/core';
import { launchWorkspace, TablerIcon } from '@/components';
import { useUserHasSystemAccess } from '@/hooks/useSystemAccess';
import AnonymizeCaseForm from '../forms/AnonymizeCaseForm';
import RejectFoundDocumentCaseForm from '../forms/RejectFoundDocumentCaseForm';
import ResolveExtractionForm from '../forms/ResolveExtractionForm';
import UpdateCasedetailsForm from '../forms/UpdateCasedetailsForm';
import UpdateDocumentinfoForm from '../forms/UpdateDocumentinfoForm';
import VerifyFoundDocumentCaseForm from '../forms/VerifyFoundDocumentCaseForm';
import { useActiveExchange } from '@/features/exchange';
import {
  CaseType,
  DocumentCase,
  ExtractionStatus,
  FoundDocumentCaseStatus,
  LostDocumentCaseStatus,
} from '../types';
import {
  CancelDocumentCollection,
  IssueDocumentCollectionCode,
  RevokeDocumentCollection,
  VerifyDocumentCollectionCode,
} from './form-actions';

interface DocumentCaseActionsProps {
  caseId: string;
  caseNumber: string;
  documentCase: DocumentCase;
  reportType: CaseType;
  status: string;
}

const DocumentCaseActions: React.FC<DocumentCaseActionsProps> = ({
  caseNumber,
  documentCase,
  reportType,
  status,
}) => {
  const { hasAccess: canVerify } = useUserHasSystemAccess({ documentCase: ['verify'] });
  const { hasAccess: canReject } = useUserHasSystemAccess({ documentCase: ['reject'] });
  const { hasAccess: canResolveExtraction } = useUserHasSystemAccess({
    documentCase: ['resolveExtraction'],
  });
  const { hasAccess: canAnonymize } = useUserHasSystemAccess({ documentCase: ['anonymize'] });

  const latestExtraction = documentCase.extractions
    ?.slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  const hasUnresolvedFailure =
    latestExtraction?.extractionStatus === ExtractionStatus.FAILED &&
    !latestExtraction?.resolutionType;

  const isSubmitted = status === FoundDocumentCaseStatus.SUBMITTED;
  const isDraft =
    status === FoundDocumentCaseStatus.DRAFT || status === LostDocumentCaseStatus.DRAFT;
  const { hasActiveExchange, hasActiveVerification } = useActiveExchange(
    reportType === 'FOUND' ? documentCase.foundDocumentCase?.id : undefined
  );

  const openVerify = () => {
    const close = launchWorkspace(
      <VerifyFoundDocumentCaseForm documentCase={documentCase} onClose={() => close()} />,
      { title: 'Verify Found Document Case' }
    );
  };

  const openReject = () => {
    const close = launchWorkspace(
      <RejectFoundDocumentCaseForm documentCase={documentCase} onClose={() => close()} />,
      { title: 'Reject Found Document Case' }
    );
  };

  const openAnonymize = () => {
    const close = launchWorkspace(
      <AnonymizeCaseForm documentCase={documentCase} onClose={() => close()} />,
      { title: 'Anonymize Case' }
    );
  };

  return (
    <Group gap="xs" wrap="nowrap">
      {/* Prominent Enter Code button — only shown when a verification code is pending */}
      {reportType === 'FOUND' && hasActiveVerification && (
        <VerifyDocumentCollectionCode
          documentCase={documentCase}
          renderTrigger={({ onClick }) => (
            <Button
              leftSection={<TablerIcon name="keyframe" size={14} />}
              color="teal"
              variant="filled"
              size="sm"
              onClick={onClick}
            >
              Enter Code
            </Button>
          )}
        />
      )}

      <Menu shadow="md" position="bottom-end">
        <Menu.Target>
          <Button leftSection={<TablerIcon name="dotsVertical" size={14} />} variant="light">
            Actions
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Actions</Menu.Label>

          <Menu.Item
            leftSection={<TablerIcon name="vectorTriangle" size={14} />}
            component={Link}
            to={`/dashboard/matches?matchesTab=semantic&semanticRef=${caseNumber}&semanticType=${reportType === 'LOST' ? 'lost' : 'found'}`}
            color="civicBlue"
          >
            Similar Cases
          </Menu.Item>
          <Menu.Divider />

          {/* Edit actions — only available while in DRAFT */}
          <Menu.Item
            leftSection={<TablerIcon name="edit" size={14} />}
            disabled={!isDraft || hasActiveExchange}
            onClick={() => {
              const close = launchWorkspace(
                <UpdateCasedetailsForm
                  documentCase={documentCase}
                  closeWorkspace={() => close()}
                />,
                { title: 'Edit Case Details' }
              );
            }}
          >
            Edit Case Details
          </Menu.Item>
          {documentCase.document && (
            <Menu.Item
              leftSection={<TablerIcon name="fileText" size={14} />}
              disabled={!isDraft || hasActiveExchange}
              onClick={() => {
                const close = launchWorkspace(
                  <UpdateDocumentinfoForm
                    document={documentCase.document!}
                    closeWorkspace={() => close()}
                  />,
                  { title: 'Edit Document Info' }
                );
              }}
            >
              Edit Document Info
            </Menu.Item>
          )}

          {reportType === 'FOUND' && (
            <>
              <Menu.Divider />
              {hasActiveVerification && (
                <>
                  <IssueDocumentCollectionCode
                    documentCase={documentCase}
                    renderTrigger={({ onClick }) => (
                      <Menu.Item
                        leftSection={<TablerIcon name="send" size={14} />}
                        onClick={onClick}
                        color="civicBlue"
                      >
                        Resend Code
                      </Menu.Item>
                    )}
                  />
                  <RevokeDocumentCollection
                    documentCase={documentCase}
                    renderTrigger={({ onClick }) => (
                      <Menu.Item
                        leftSection={<TablerIcon name="keyOff" size={14} />}
                        onClick={onClick}
                        color="orange"
                      >
                        Revoke Code
                      </Menu.Item>
                    )}
                  />
                  <CancelDocumentCollection
                    documentCase={documentCase}
                    renderTrigger={({ onClick }) => (
                      <Menu.Item
                        leftSection={<TablerIcon name="circleX" size={14} />}
                        onClick={onClick}
                        color="red"
                      >
                        Cancel Collection
                      </Menu.Item>
                    )}
                  />
                </>
              )}
              {hasActiveExchange && !hasActiveVerification && (
                /* Exchange scheduled by finder — staff issues the code */
                <IssueDocumentCollectionCode
                  documentCase={documentCase}
                  renderTrigger={({ onClick }) => (
                    <Menu.Item
                      leftSection={<TablerIcon name="packageImport" size={14} />}
                      onClick={onClick}
                      color="civicBlue"
                    >
                      Issue Code
                    </Menu.Item>
                  )}
                />
              )}
            </>
          )}

          {canResolveExtraction && hasUnresolvedFailure && (
            <>
              <Menu.Divider />
              <Menu.Item
                leftSection={<TablerIcon name="messageCircle" size={14} />}
                color="yellow"
                onClick={() => {
                  const close = launchWorkspace(
                    <ResolveExtractionForm
                      documentCase={documentCase}
                      onClose={() => close()}
                    />,
                    { title: 'Review Document Processing' }
                  );
                }}
              >
                Review Document Processing
              </Menu.Item>
            </>
          )}

          {reportType === 'FOUND' && (canVerify || canReject) && (
            <>
              <Menu.Divider />
              {canVerify && (
                <Menu.Item
                  leftSection={<TablerIcon name="circleCheck" size={14} />}
                  onClick={openVerify}
                  disabled={!isSubmitted}
                  color="civicGreen"
                >
                  Verify Case
                </Menu.Item>
              )}
              {canReject && (
                <Menu.Item
                  leftSection={<TablerIcon name="circleX" size={14} />}
                  onClick={openReject}
                  disabled={!isSubmitted}
                  color="red"
                >
                  Reject Case
                </Menu.Item>
              )}
            </>
          )}
          {canAnonymize && !documentCase.anonymizedAt && !documentCase.voided && (
            <>
              <Menu.Divider />
              <Menu.Item
                leftSection={<TablerIcon name="shieldOff" size={14} />}
                color="red"
                onClick={openAnonymize}
              >
                Anonymize Case
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default DocumentCaseActions;
