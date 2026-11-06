import dayjs from 'dayjs';
import React, { FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Button, Group, Stack, TagsInput, Textarea } from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { handleApiErrors } from '@/lib/api';
import { useDocumentCaseApi } from '../hooks';
import { DocumentCase, UpdateCaseDetailsFormData } from '../types';
import { UpdateCaseDetailsSchema } from '../utils/validation';
import CaseLocationFields from './CaseLocationFields';

type UpdateCasedetailsFormProps = {
  documentCase: DocumentCase;
  onSuccess?: (documentCase: DocumentCase) => void;
  closeWorkspace?: () => void;
};

const UpdateCasedetailsForm: FC<UpdateCasedetailsFormProps> = ({
  documentCase,
  onSuccess,
  closeWorkspace,
}) => {
  const form = useForm<UpdateCaseDetailsFormData>({
    defaultValues: {
      eventDate: documentCase.eventDate ? dayjs(documentCase.eventDate).toDate() : undefined,
      description: documentCase.description ?? undefined,
      tags: documentCase.tags ?? undefined,
      level1: documentCase.level1,
      level2: documentCase.level2 ?? undefined,
      level3: documentCase.level3 ?? undefined,
      place: documentCase.place ?? undefined,
    },
    resolver: zodResolver(UpdateCaseDetailsSchema),
  });
  const { updateDocumentCase } = useDocumentCaseApi();

  const handleSubmit: SubmitHandler<UpdateCaseDetailsFormData> = async (data) => {
    try {
      const { eventDate, ...rest } = data;
      const payload = {
        ...rest,
        eventDate: eventDate ? dayjs(eventDate).format('YYYY-MM-DD') : undefined,
      };
      const updatedCase = await updateDocumentCase(documentCase.id, payload as any);
      onSuccess?.(updatedCase);
      showNotification({
        title: 'Success',
        message: 'Case details updated successfully',
        color: 'green',
      });
      closeWorkspace?.();
    } catch (error) {
      const e = handleApiErrors<UpdateCaseDetailsFormData>(error);
      if (e.detail) {
        showNotification({
          title: 'Error updating case details',
          message: e.detail,
          color: 'red',
        });
      } else {
        Object.entries(e).forEach(([key, val]) =>
          form.setError(key as keyof UpdateCaseDetailsFormData, { message: val as string })
        );
      }
    }
  };

  const isLostCase = !!documentCase.lostDocumentCase;
  const dateLabel = isLostCase ? 'Date Lost' : 'Date Found';

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-between',
        display: 'flex',
      }}
    >
      <Stack p="md" h="100%" justify="space-between" gap="lg">
        <Stack gap="md">
          <Controller
            control={form.control}
            name="eventDate"
            render={({ field, fieldState }) => (
              <DateInput
                {...field}
                value={field.value || null}
                onChange={(value) => field.onChange(value)}
                label={dateLabel}
                error={fieldState.error?.message}
                placeholder="Select date"
                leftSection={<TablerIcon name="calendar" size={18} />}
                required
              />
            )}
          />
          <CaseLocationFields
            form={form}
            placeLabel={isLostCase ? 'Where it was lost' : 'Where it was found'}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                value={field.value as string}
                placeholder="Describe the case..."
                label="Description"
                error={fieldState.error?.message}
                minRows={3}
                autosize
              />
            )}
          />
          <Controller
            control={form.control}
            name="tags"
            render={({ field, fieldState }) => (
              <TagsInput
                {...field}
                data={field.value ?? []}
                value={field.value ?? []}
                label="Tags"
                error={fieldState.error?.message}
                placeholder="Add tags"
                clearable
                description="Keywords to help find the document case"
                leftSection={<TablerIcon name="tag" size={18} />}
              />
            )}
          />
        </Stack>

        <Group gap="sm">
          <Button
            flex={1}
            variant="default"
            onClick={closeWorkspace}
            leftSection={<TablerIcon name="x" size={18} />}
          >
            Cancel
          </Button>
          <Button
            flex={1}
            type="submit"
            variant="filled"
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
            leftSection={<TablerIcon name="check" size={18} />}
          >
            Update Details
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default UpdateCasedetailsForm;
