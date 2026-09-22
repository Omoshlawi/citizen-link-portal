import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Button, Group, Radio, Stack, Text, Textarea } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { z } from 'zod';
import { handleApiErrors } from '@/lib/api';
import { useDocumentCaseApi } from '../hooks';
import { DocumentCase, ExtractionResolutionType } from '../types';

/**
 * What staff may choose. Both ask the citizen for something, and both notify them.
 *
 * STAFF_HANDLING is absent by design — it means staff dealt with the failure themselves, and
 * the backend writes it automatically when they key the fields in. The API rejects it here.
 */
const STAFF_SELECTABLE = [
  ExtractionResolutionType.RESUBMIT_IMAGE,
  ExtractionResolutionType.SUBMIT_NEW_CASE,
] as const;

const schema = z.object({
  resolutionType: z.enum(STAFF_SELECTABLE),
  resolutionMessage: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(500, 'Message must not exceed 500 characters'),
});

type FormData = z.infer<typeof schema>;

const RESOLUTION_OPTIONS = [
  {
    value: ExtractionResolutionType.RESUBMIT_IMAGE,
    label: 'Resubmit Image',
    description: 'User can upload new, clearer images for the same case',
  },
  {
    value: ExtractionResolutionType.SUBMIT_NEW_CASE,
    label: 'Submit New Case',
    description: 'User needs to start a fresh case (wrong document type submitted)',
  },
];

type ResolveExtractionFormProps = {
  documentCase: DocumentCase;
  onClose: () => void;
};

const ResolveExtractionForm: React.FC<ResolveExtractionFormProps> = ({ documentCase, onClose }) => {
  const { resolveExtractionFailure } = useDocumentCaseApi();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      resolutionType: ExtractionResolutionType.RESUBMIT_IMAGE,
      resolutionMessage: '',
    },
  });

  const handleSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await resolveExtractionFailure(documentCase.id, data);
      showNotification({
        title: 'Resolution saved',
        message: 'User has been notified.',
        color: 'green',
      });
      onClose();
    } catch (error) {
      const e = handleApiErrors<FormData>(error);
      if (e.detail) {
        showNotification({
          title: 'Error',
          message: e.detail,
          color: 'red',
          position: 'top-right',
        });
      } else {
        Object.entries(e).forEach(([key, val]) =>
          form.setError(key as keyof FormData, { message: val })
        );
      }
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} style={{ flex: 1, flexDirection: 'column' }}>
      <Stack p="md" h="100%" justify="space-between">
        <Stack gap="lg">
          <Controller
            control={form.control}
            name="resolutionType"
            render={({ field, fieldState }) => (
              <Radio.Group
                label="Resolution type"
                description="What should the user do next?"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              >
                <Stack gap="xs" mt="xs">
                  {RESOLUTION_OPTIONS.map((opt) => (
                    <Radio.Card key={opt.value} value={opt.value} p="sm">
                      <Group wrap="nowrap" align="flex-start">
                        <Radio.Indicator mt={2} />
                        <Stack gap={2}>
                          <Text size="sm" fw={600}>
                            {opt.label}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {opt.description}
                          </Text>
                        </Stack>
                      </Group>
                    </Radio.Card>
                  ))}
                </Stack>
              </Radio.Group>
            )}
          />

          <Controller
            control={form.control}
            name="resolutionMessage"
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                label="Message to user"
                description="Explain what happened and what the user should do next. This message is shown to the user."
                placeholder="e.g. The image you uploaded was too blurry to read. Please take a new photo in good lighting with the full document visible."
                minRows={4}
                autosize
                error={fieldState.error?.message}
              />
            )}
          />
        </Stack>

        <Group gap={1}>
          <Button flex={1} variant="default" radius={0} onClick={onClose}>
            Cancel
          </Button>
          <Button
            flex={1}
            radius={0}
            type="submit"
            variant="filled"
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
          >
            Save & Notify User
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default ResolveExtractionForm;
