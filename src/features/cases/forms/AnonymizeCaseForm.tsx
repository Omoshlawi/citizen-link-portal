import React, { useState } from 'react';
import { Alert, Button, Group, Stack } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { handleApiErrors } from '@/lib/api';
import { useDocumentCaseApi } from '../hooks';
import { DocumentCase } from '../types';

type AnonymizeCaseFormProps = {
  documentCase: DocumentCase;
  onClose: () => void;
  onSuccess?: () => void;
};

const AnonymizeCaseForm: React.FC<AnonymizeCaseFormProps> = ({ documentCase, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { anonymizeCase } = useDocumentCaseApi();

  const handleAnonymize = async () => {
    setIsSubmitting(true);
    try {
      await anonymizeCase(documentCase.id);
      showNotification({
        title: 'Case anonymized',
        message: 'PII has been permanently stripped from this case.',
        color: 'orange',
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      const e = handleApiErrors(error);
      showNotification({
        title: 'Anonymization failed',
        message: e.detail ?? 'An unexpected error occurred.',
        color: 'red',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack p="md" h="100%" justify="space-between">
      <Alert
        variant="light"
        color="red"
        icon={<TablerIcon name="alertTriangle" size={16} />}
        title="This action cannot be undone"
      >
        This permanently strips all PII from this case — name, document number, date of birth,
        document image, and extracted fields. The case record and audit trail are preserved, but
        the personal data is gone forever.
      </Alert>

      <Group gap={1}>
        <Button flex={1} variant="default" radius={0} onClick={onClose} disabled={isSubmitting}>
          Go Back
        </Button>
        <Button
          flex={1}
          radius={0}
          color="red"
          variant="filled"
          leftSection={<TablerIcon name="shieldOff" size={14} />}
          loading={isSubmitting}
          disabled={isSubmitting}
          onClick={handleAnonymize}
        >
          Anonymize Case
        </Button>
      </Group>
    </Stack>
  );
};

export default AnonymizeCaseForm;
