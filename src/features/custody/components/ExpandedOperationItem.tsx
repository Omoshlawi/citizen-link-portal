import { FC } from 'react';
import { Link } from 'react-router-dom';
import { ActionIcon, Anchor, Badge, Group, Table, Text } from '@mantine/core';
import { openConfirmModal } from '@mantine/modals';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { handleApiErrors } from '@/lib/api';
import { removeOperationItem, skipOperationItem } from '../hooks/useCustody';
import {
  DocumentOperationItem,
  DocumentOperationStatus,
  DocumentOperationType,
  DocumentOperationTypeCode,
} from '../types';
import CollectionStatusBadge from './CollectionStatusBadge';
import { CustodyStatusBadge } from './CustodyStatusBadge';

type ExpandedOperationItemProps = {
  item: DocumentOperationItem;
  onMutate: () => void;
  operationType?: DocumentOperationType;
  operationStatus: DocumentOperationStatus;
  operationId: string;
};
const ExpandedOperationItem: FC<ExpandedOperationItemProps> = ({
  item,
  onMutate,
  operationType,
  operationStatus,
  operationId,
}) => {
  const isPending = item.status === 'PENDING';
  const isReceiptOp = operationType?.code === DocumentOperationTypeCode.RECEIPT;
  const isDraft = operationStatus === DocumentOperationStatus.DRAFT;
  const isApproved = operationStatus === DocumentOperationStatus.APPROVED;
  const canRemove = isDraft;
  const canSkip = isDraft || isApproved;

  const handleItemAction = async (actionFn: () => Promise<any>, successMsg: string) => {
    try {
      await actionFn();
      showNotification({ title: 'Done', message: successMsg, color: 'teal' });
      onMutate();
    } catch (err) {
      const e = handleApiErrors<{}>(err);
      showNotification({ title: 'Error', message: e.detail ?? 'Action failed.', color: 'red' });
    }
  };

  const confirmSkip = (item: DocumentOperationItem) => {
    const label = item.foundCase?.case?.caseNumber ?? item.foundCaseId.slice(0, 8);
    openConfirmModal({
      title: 'Skip Document',
      children: (
        <Text size="sm">
          Skip case <strong>{label}</strong>? It will be excluded from execution.
        </Text>
      ),
      labels: { confirm: 'Skip', cancel: 'Cancel' },
      confirmProps: { color: 'orange' },
      onConfirm: () =>
        handleItemAction(() => skipOperationItem(operationId, item.id), 'Item skipped.'),
    });
  };

  const confirmRemove = (item: DocumentOperationItem) => {
    const label = item.foundCase?.case?.caseNumber ?? item.foundCaseId.slice(0, 8);
    openConfirmModal({
      title: 'Remove Document',
      children: (
        <Text size="sm">
          Remove case <strong>{label}</strong> from this operation?
        </Text>
      ),
      labels: { confirm: 'Remove', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: () =>
        handleItemAction(() => removeOperationItem(operationId, item.id), 'Item removed.'),
    });
  };

  return (
    <Table.Tr key={item.id}>
      <Table.Td>
        {item.foundCase?.case?.id ? (
          <Group gap={4} wrap="nowrap">
            <Anchor component={Link} to={`/dashboard/cases/${item.foundCase.case.id}`} size="sm">
              {item.foundCase.case.caseNumber}
            </Anchor>
            <ActionIcon
              component={Link}
              to={`/dashboard/cases/${item.foundCase.case.id}/custody`}
              variant="subtle"
              color="civicBlue"
              size="xs"
              title="Custody history"
            >
              <TablerIcon name="history" size={12} />
            </ActionIcon>
          </Group>
        ) : (
          <Text size="sm">{item.foundCaseId.slice(0, 8)}</Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed">
          {item.foundCase?.case?.document?.type?.name ?? '—'}
        </Text>
      </Table.Td>
      <Table.Td>
        {item.custodyStatusBefore ? (
          <Group gap={4} wrap="nowrap">
            <CustodyStatusBadge status={item.custodyStatusBefore} />
            <TablerIcon name="arrowRight" size={12} />
            <CustodyStatusBadge status={item.custodyStatusAfter ?? undefined} />
          </Group>
        ) : (
          <Text size="xs" c="dimmed">
            Pending
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Badge
          size="xs"
          variant="light"
          color={
            item.status === 'COMPLETED'
              ? 'civicGreen'
              : item.status === 'FAILED'
                ? 'red'
                : item.status === 'SKIPPED'
                  ? 'gray'
                  : 'civicBlue'
          }
        >
          {item.status}
        </Badge>
      </Table.Td>
      {isReceiptOp && (
        <Table.Td>
          <CollectionStatusBadge item={item} />
        </Table.Td>
      )}
      <Table.Td>
        <Text size="xs" c="dimmed">
          {item.userAddressId
            ? [item.userAddress?.level2, item.userAddress?.level3, item.userAddress?.address1]
                .filter(Boolean)
                .join(', ')
            : '--'}
        </Text>
      </Table.Td>
      {(canRemove || canSkip) && (
        <Table.Td>
          {isPending && (
            <Group gap={2} wrap="nowrap">
              {canSkip && (
                <ActionIcon
                  variant="subtle"
                  color="orange"
                  size="xs"
                  title="Skip item"
                  onClick={() => confirmSkip(item)}
                >
                  <TablerIcon name="playerSkipForward" size={12} />
                </ActionIcon>
              )}
              {canRemove && (
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="xs"
                  title="Remove item"
                  onClick={() => confirmRemove(item)}
                >
                  <TablerIcon name="trash" size={12} />
                </ActionIcon>
              )}
            </Group>
          )}
        </Table.Td>
      )}
    </Table.Tr>
  );
};

export default ExpandedOperationItem;
