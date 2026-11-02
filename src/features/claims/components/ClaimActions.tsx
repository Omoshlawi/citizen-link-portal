import { FC } from 'react';
import { Button, Group, Menu, Text } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { launchWorkspace, SystemAuthorized, TablerIcon } from '@/components';
import {
  IssueOutboundCollectionCode,
  RevokeOutboundCollectionCode,
  VerifyOutboundCollectionCode,
} from '@/features/cases/components/form-actions';
import { useCanPerformAtStation } from '@/features/custody/hooks/useCustody';
import { useActiveOutboundExchange } from '@/features/exchange';
import { useActiveStation } from '@/hooks/useActiveStation';
import {
  RejectClaimForm,
  RejectReviewForm,
  ReviewClaimForm,
  VerifyClaimForm,
  VerifyReviewForm,
} from '../forms';
import { useInvoice } from '../hooks/use-invoice';
import { Claim, ClaimStatus } from '../types';
import { downloadInvoicePdf } from '../utils/downloadInvoicePdf';

type ClaimActionsProps = {
  claim: Claim;
};

const ClaimActions: FC<ClaimActionsProps> = ({ claim }) => {
  const { exchange, hasActiveExchange, hasActiveVerification } = useActiveOutboundExchange(
    claim.id
  );
  const { invoice } = useInvoice(claim.id);
  const { stationId } = useActiveStation();
  // Release only from the station holding the document — the API enforces this too.
  const heldHere = !!stationId && exchange.holdingStationId === stationId;
  const notHeldHint = 'Held at another station — transfer or request it first.';
  // Code actions record a HANDOVER at the active station, so they need that grant too.
  const { allowed: canHandover } = useCanPerformAtStation('HANDOVER');
  const noHandoverHint = canHandover ? undefined : "You aren't granted Handover at this station";
  const releaseBlockedHint = heldHere ? noHandoverHint : notHeldHint;

  const handleReject = () => {
    const dismiss = launchWorkspace(<RejectClaimForm claim={claim} onClose={() => dismiss()} />, {
      title: 'Reject Claim',
    });
  };
  const handleVerify = () => {
    const dismiss = launchWorkspace(<VerifyClaimForm claim={claim} onClose={() => dismiss()} />, {
      title: 'Verify Claim',
    });
  };
  const handleDelete = () => {
    openConfirmModal({
      title: 'Confirm Delete',
      children: (
        <Text size="sm">
          This action will permanently delete the claim. Are you sure you want to proceed?
        </Text>
      ),
      labels: {
        confirm: 'Delete',
        cancel: 'Cancel',
      },
      confirmProps: {
        color: 'red',
      },
      cancelProps: {
        variant: 'outline',
      },
      onConfirm: () => {
        // Hit delete endpoint
      },
    });
  };
  const handleReview = () => {
    const dismiss = launchWorkspace(<ReviewClaimForm claim={claim} onClose={() => dismiss()} />, {
      title: 'Review Claim',
    });
  };
  const handleApproveReviewedClaim = () => {
    const dismiss = launchWorkspace(<VerifyReviewForm claim={claim} onClose={() => dismiss()} />, {
      title: 'Approve Claim',
    });
  };
  const handleRejectReviewedClaim = () => {
    const dismiss = launchWorkspace(<RejectReviewForm claim={claim} onClose={() => dismiss()} />, {
      title: 'Reject Claim',
    });
  };
  const verifyableStatuses: ClaimStatus[] = [ClaimStatus.PENDING, ClaimStatus.REJECTED];
  const rejectableStatuses: ClaimStatus[] = [ClaimStatus.PENDING, ClaimStatus.VERIFIED];

  return (
    <Group gap="xs" wrap="nowrap">
      {hasActiveVerification && exchange.exchangeNumber && (
        <VerifyOutboundCollectionCode
          claim={claim}
          exchangeNumber={exchange.exchangeNumber}
          renderTrigger={({ onClick }) => (
            <Button
              leftSection={<TablerIcon name="keyframe" size={14} />}
              color="teal"
              variant="filled"
              size="sm"
              onClick={onClick}
              disabled={!!releaseBlockedHint}
              title={releaseBlockedHint}
            >
              Enter Code
            </Button>
          )}
        />
      )}
      <Menu shadow="md" width={200}>
        <Menu.Target>
          <Button
            variant="light"
            aria-label="Actions"
            leftSection={
              <TablerIcon
                name="dotsVertical"
                style={{ width: '70%', height: '70%' }}
                stroke={1.5}
              />
            }
          >
            Actions
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Actions</Menu.Label>
          <Menu.Divider />
          {claim.status === ClaimStatus.DISPUTED && (
            <SystemAuthorized
              permissions={{ claim: ['review-dispute'] }}
              unauthorizedAction={{ type: 'hide' }}
            >
              <Menu.Item
                leftSection={<TablerIcon name="check" size={14} />}
                onClick={handleReview}
                color="green"
              >
                Review Dispute
              </Menu.Item>
            </SystemAuthorized>
          )}
          {claim.status === ClaimStatus.UNDER_REVIEW && (
            <SystemAuthorized
              permissions={{ claim: ['review-dispute'] }}
              unauthorizedAction={{ type: 'hide' }}
            >
              <Menu.Item
                leftSection={<TablerIcon name="check" size={14} />}
                onClick={handleApproveReviewedClaim}
                color="green"
              >
                Approve
              </Menu.Item>
            </SystemAuthorized>
          )}
          {claim.status === ClaimStatus.UNDER_REVIEW && (
            <SystemAuthorized
              permissions={{ claim: ['review-dispute'] }}
              unauthorizedAction={{ type: 'hide' }}
            >
              <Menu.Item
                leftSection={<TablerIcon name="x" size={14} />}
                onClick={handleRejectReviewedClaim}
                color="red"
              >
                Reject
              </Menu.Item>
            </SystemAuthorized>
          )}
          {verifyableStatuses.includes(claim.status) && (
            <SystemAuthorized
              permissions={{ claim: ['verify'] }}
              unauthorizedAction={{ type: 'hide' }}
            >
              <Menu.Item
                leftSection={<TablerIcon name="check" size={14} />}
                onClick={handleVerify}
                color="green"
              >
                Verify
              </Menu.Item>
            </SystemAuthorized>
          )}
          {rejectableStatuses.includes(claim.status) && (
            <SystemAuthorized
              permissions={{ claim: ['reject'] }}
              unauthorizedAction={{ type: 'hide' }}
            >
              <Menu.Item
                leftSection={<TablerIcon name="x" size={14} />}
                onClick={handleReject}
                color="red"
              >
                Reject
              </Menu.Item>
            </SystemAuthorized>
          )}
          <SystemAuthorized
            permissions={{ claim: ['delete'] }}
            unauthorizedAction={{ type: 'hide' }}
          >
            <Menu.Item
              leftSection={<TablerIcon name="trash" size={14} />}
              color="red"
              onClick={handleDelete}
            >
              Delete
            </Menu.Item>
          </SystemAuthorized>

          {claim.status === ClaimStatus.VERIFIED && invoice && (
            <>
              <Menu.Divider />
              <Menu.Label>Invoice</Menu.Label>
              <Menu.Item
                leftSection={<TablerIcon name="fileDownload" size={14} />}
                onClick={() => downloadInvoicePdf(invoice.id, invoice.invoiceNumber)}
              >
                Download Invoice
              </Menu.Item>
            </>
          )}
          {hasActiveExchange && exchange.exchangeNumber && (
            <>
              <Menu.Divider />
              <Menu.Label>Collection</Menu.Label>
              {releaseBlockedHint && (
                <Text size="xs" c="dimmed" px="sm" pb={4}>
                  {releaseBlockedHint}
                </Text>
              )}
              {hasActiveVerification ? (
                <>
                  <IssueOutboundCollectionCode
                    claim={claim}
                    exchangeNumber={exchange.exchangeNumber}
                    renderTrigger={({ onClick }) => (
                      <Menu.Item
                        leftSection={<TablerIcon name="send" size={14} />}
                        onClick={onClick}
                        color="teal"
                        disabled={!!releaseBlockedHint}
                      >
                        Resend Code
                      </Menu.Item>
                    )}
                  />
                  <RevokeOutboundCollectionCode
                    claim={claim}
                    exchangeNumber={exchange.exchangeNumber}
                    renderTrigger={({ onClick }) => (
                      <Menu.Item
                        leftSection={<TablerIcon name="keyOff" size={14} />}
                        onClick={onClick}
                        color="orange"
                        disabled={!canHandover}
                      >
                        Revoke Code
                      </Menu.Item>
                    )}
                  />
                </>
              ) : (
                <IssueOutboundCollectionCode
                  claim={claim}
                  exchangeNumber={exchange.exchangeNumber}
                  renderTrigger={({ onClick }) => (
                    <Menu.Item
                      leftSection={<TablerIcon name="packageExport" size={14} />}
                      onClick={onClick}
                      color="teal"
                      disabled={!!releaseBlockedHint}
                    >
                      Issue Code
                    </Menu.Item>
                  )}
                />
              )}
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
};

export default ClaimActions;
