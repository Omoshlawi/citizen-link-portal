import React, { useState } from 'react';
import { Alert, Button, Group, PinInput, Stack, Text } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { Claim } from '@/features/claims/types';
import { useActiveOutboundExchange, useExchangeApi } from '@/features/exchange';
import { usePublicConfig } from '@/hooks/usePublicConfig';
import { formatDate } from '@/lib/utils/helpers';

type ConfirmOutboundCodeFormProps = {
  claim: Claim;
  exchangeNumber: string;
  onClose: () => void;
  onSuccess?: () => void;
};

const ConfirmOutboundCodeForm: React.FC<ConfirmOutboundCodeFormProps> = ({
  claim,
  exchangeNumber,
  onClose,
  onSuccess,
}) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { appName } = usePublicConfig();
  const { verifyOutboundCode } = useExchangeApi();
  const { exchange } = useActiveOutboundExchange(claim.id);

  const handleConfirm = async () => {
    if (code.length !== 6) {
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      await verifyOutboundCode(exchangeNumber, { code });
      showNotification({
        title: 'Handover confirmed',
        message: 'Document handed over successfully. Case is now complete.',
        color: 'green',
      });
      onSuccess?.();
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Incorrect code. Please try again.');
      setCode('');
    } finally {
      setIsLoading(false);
    }
  };

  const attemptsRemaining =
    exchange?.maxAttempts != null && exchange?.attempts != null
      ? exchange.maxAttempts - exchange.attempts
      : null;

  return (
    <Stack p="md" h="100%" justify="space-between">
      <Stack gap="md">
        <Stack gap={4}>
          <Text size="sm" c="dimmed">
            Ask the claimant to show the 6-digit code from their {appName} app. Enter it below to
            confirm the handover.
          </Text>
          {exchange?.expiresAt && (
            <Text size="xs" c="dimmed">
              Expires {formatDate(exchange.expiresAt)}
              {attemptsRemaining != null &&
                ` · ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining`}
            </Text>
          )}
        </Stack>

        <Group justify="center" pt="xs">
          <PinInput
            length={6}
            type="number"
            size="xl"
            value={code}
            onChange={setCode}
            autoFocus
            onComplete={handleConfirm}
          />
        </Group>

        {error && (
          <Alert variant="light" color="red" icon={<TablerIcon name="alertTriangle" size={16} />}>
            {error}
          </Alert>
        )}
      </Stack>

      <Group gap={1}>
        <Button flex={1} variant="default" radius={0} onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          flex={1}
          radius={0}
          variant="filled"
          color="teal"
          leftSection={<TablerIcon name="circleCheck" size={14} />}
          loading={isLoading}
          disabled={code.length !== 6}
          onClick={handleConfirm}
        >
          Confirm Handover
        </Button>
      </Group>
    </Stack>
  );
};

export default ConfirmOutboundCodeForm;
