import { FC } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Radio, Stack, Text, Textarea } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { handleApiErrors } from '@/lib/api';
import { useChatReportApi } from '../hooks';
import { ChatReport, ChatReportDetail, ResolveReportFormData } from '../types';
import { resolveReportSchema } from '../utils/validation';

interface ResolveReportFormProps {
  report: ChatReport;
  onClose: () => void;
  onSuccess?: (report: ChatReportDetail) => void;
}

const ResolveReportForm: FC<ResolveReportFormProps> = ({ report, onClose, onSuccess }) => {
  const form = useForm<ResolveReportFormData>({
    resolver: zodResolver(resolveReportSchema),
    defaultValues: { status: 'REVIEWED', resolutionNote: '' },
  });
  const { resolveReport } = useChatReportApi();

  const handleSubmit: SubmitHandler<ResolveReportFormData> = async (data) => {
    try {
      const updated = await resolveReport(report.id, {
        ...data,
        resolutionNote: data.resolutionNote?.trim() || undefined,
      });
      onSuccess?.(updated);
      showNotification({
        title: 'Report resolved',
        message: `Marked as ${data.status.toLowerCase()}`,
        color: 'green',
      });
      onClose();
    } catch (error) {
      const e = handleApiErrors<ResolveReportFormData>(error);
      if (e.detail) {
        showNotification({
          title: 'Could not resolve report',
          message: e.detail,
          color: 'red',
          position: 'top-right',
        });
      } else {
        Object.entries(e).forEach(([key, val]) =>
          form.setError(key as keyof ResolveReportFormData, { message: val })
        );
      }
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}
    >
      <Stack p="md" h="100%" justify="space-between">
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Resolving a report is final — it records who decided and cannot be reopened.
          </Text>

          <Controller
            control={form.control}
            name="status"
            render={({ field, fieldState }) => (
              <Radio.Group
                label="Outcome"
                value={field.value}
                onChange={field.onChange}
                error={fieldState.error?.message}
              >
                <Stack gap="xs" mt="xs">
                  <Radio
                    value="REVIEWED"
                    label="Reviewed"
                    description="The report was valid and has been acted on"
                  />
                  <Radio
                    value="DISMISSED"
                    label="Dismissed"
                    description="No problem with the reply, or the report was not actionable"
                  />
                </Stack>
              </Radio.Group>
            )}
          />

          <Controller
            control={form.control}
            name="resolutionNote"
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                label="Resolution note"
                description="What you found, and what you did about it"
                placeholder="Optional, but useful to whoever reads this later"
                autosize
                minRows={3}
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
            radius={0}
            flex={1}
            fullWidth
            type="submit"
            variant="filled"
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
          >
            Resolve
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default ResolveReportForm;
