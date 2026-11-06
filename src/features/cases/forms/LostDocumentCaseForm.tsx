import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  ActionIcon,
  Button,
  Divider,
  Group,
  Paper,
  Select,
  Stack,
  TagsInput,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { showNotification } from '@mantine/notifications';
import { InputSkeleton, TablerIcon } from '@/components';
import { useDocumentTypes } from '@/features/admin/hooks';
import { handleApiErrors } from '@/lib/api';
import { INPUT_WRAPPER_ORDER } from '@/lib/utils';
import { useDocumentCaseApi } from '../hooks';
import { DocumentCase, LostDocumentCaseFormData } from '../types';
import { LostDocumentCaseSchema } from '../utils';
import CaseLocationFields from './CaseLocationFields';

type LostDocumentCaseFormProps = {
  closeWorkspace?: () => void;
  onSuccess?: (caseData: DocumentCase) => void;
};

const LostDocumentCaseForm = ({ closeWorkspace, onSuccess }: LostDocumentCaseFormProps) => {
  const navigate = useNavigate();
  const form = useForm<LostDocumentCaseFormData>({
    defaultValues: {
      additionalFields: [],
    },
    resolver: zodResolver(LostDocumentCaseSchema),
  });
  const { documentTypes, isLoading: isDocumentTypesLoading } = useDocumentTypes();
  const { createLostDocumentCase } = useDocumentCaseApi();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'additionalFields',
  });

  const sectionTitle = (label: string) => (
    <Divider
      labelPosition="left"
      label={
        <Text size="sm" fw={600}>
          {label}
        </Text>
      }
    />
  );

  const handleSubmit: SubmitHandler<LostDocumentCaseFormData> = async (data) => {
    try {
      const doc = await createLostDocumentCase(data);
      onSuccess?.(doc);
      showNotification({
        title: 'Success',
        color: 'green',
        message: `Lost Document case created successfully`,
      });
      navigate(`/dashboard/cases/${doc.id}`);
      closeWorkspace?.();
    } catch (error) {
      const e = handleApiErrors<LostDocumentCaseFormData>(error);
      if ('detail' in e && e.detail) {
        showNotification({
          title: `Error creating lost document case`,
          message: e.detail,
          color: 'red',
          position: 'top-right',
        });
      } else {
        Object.entries(e).forEach(([key, val]) =>
          form.setError(key as keyof LostDocumentCaseFormData, { message: val as string })
        );
      }
    }
  };
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
      <Stack p="md" h="100%" justify="space-between" gap="lg" style={{ overflowY: 'auto' }}>
        <Stack gap="lg">
          {/* Basic Information Section */}
          {sectionTitle('Basic Information')}
          <Stack gap="md">
            <Controller
              control={form.control}
              name="typeId"
              render={({ field, fieldState }) =>
                isDocumentTypesLoading ? (
                  <InputSkeleton />
                ) : (
                  <Select
                    {...field}
                    data={documentTypes.map((d) => ({ value: d.id, label: d.name }))}
                    label="Document Type"
                    error={fieldState.error?.message}
                    placeholder="Select document type"
                    leftSection={<TablerIcon name="fileText" size={18} />}
                    searchable
                    nothingFoundMessage="Nothing found..."
                    required
                  />
                )
              }
            />
            <Controller
              control={form.control}
              name="eventDate"
              render={({ field, fieldState }) => (
                <DateInput
                  {...field}
                  label="Date Lost"
                  error={fieldState.error?.message}
                  placeholder="Select date"
                  leftSection={<TablerIcon name="calendar" size={18} />}
                  required
                />
              )}
            />
            <CaseLocationFields form={form} placeLabel="Where it was lost" />
            <Controller
              control={form.control}
              name="description"
              render={({ field, fieldState }) => (
                <Textarea
                  {...field}
                  value={field.value as string}
                  placeholder="Describe the lost document..."
                  label="Description"
                  error={fieldState.error?.message}
                  minRows={3}
                  autosize
                  description="Provide additional details about the lost document"
                />
              )}
            />
          </Stack>

          {/* Owner Information Section */}
          {sectionTitle('Owner Information')}
          <Stack gap="md">
            <Controller
              control={form.control}
              name="surname"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  value={field.value as string}
                  placeholder="Enter surname"
                  label="Surname"
                  error={fieldState.error?.message}
                  inputWrapperOrder={INPUT_WRAPPER_ORDER}
                  description="The last name of the document owner"
                  leftSection={<TablerIcon name="user" size={18} />}
                  required
                />
              )}
            />
            <Controller
              control={form.control}
              name="givenNames"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  value={field.value as string}
                  placeholder="Enter given names"
                  label="Given Names"
                  error={fieldState.error?.message}
                  inputWrapperOrder={INPUT_WRAPPER_ORDER}
                  description="The first and middle names of the document owner"
                  leftSection={<TablerIcon name="user" size={18} />}
                  required
                />
              )}
            />
            <Group grow>
              <Controller
                control={form.control}
                name="dateOfBirth"
                render={({ field, fieldState }) => (
                  <DateInput
                    {...field}
                    label="Date of Birth"
                    error={fieldState.error?.message}
                    placeholder="Select date"
                    leftSection={<TablerIcon name="calendar" size={18} />}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="placeOfBirth"
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    label="Place of Birth"
                    error={fieldState.error?.message}
                    placeholder="Enter place of birth"
                    inputWrapperOrder={INPUT_WRAPPER_ORDER}
                    description="The place where the owner was born"
                    leftSection={<TablerIcon name="mapPin" size={18} />}
                  />
                )}
              />
            </Group>
            <Group grow>
              <Controller
                control={form.control}
                name="gender"
                render={({ field, fieldState }) => (
                  <Select
                    {...field}
                    label="Gender"
                    error={fieldState.error?.message}
                    placeholder="Select gender"
                    data={['Male', 'Female', 'Unknown']}
                    inputWrapperOrder={INPUT_WRAPPER_ORDER}
                    description="The gender of the owner"
                    leftSection={<TablerIcon name="genderAgender" size={18} />}
                  />
                )}
              />
            </Group>
          </Stack>

          {/* Document Details Section */}
          {sectionTitle('Document Details')}
          <Stack gap="md">
            <Group grow>
              <Controller
                control={form.control}
                name="documentNumber"
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    value={field.value as string}
                    placeholder="Enter document number"
                    label="Document Number"
                    error={fieldState.error?.message}
                    inputWrapperOrder={INPUT_WRAPPER_ORDER}
                    description="The number of the document (if available)"
                    leftSection={<TablerIcon name="id" size={18} />}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="serialNumber"
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    value={field.value as string}
                    placeholder="Enter serial number"
                    label="Serial Number"
                    error={fieldState.error?.message}
                    inputWrapperOrder={INPUT_WRAPPER_ORDER}
                    description="The serial number of the document (if available)"
                    leftSection={<TablerIcon name="barcode" size={18} />}
                  />
                )}
              />
            </Group>
            <Controller
              control={form.control}
              name="batchNumber"
              render={({ field, fieldState }) => (
                <TextInput
                  {...field}
                  value={field.value as string}
                  placeholder="Enter batch number"
                  label="Batch Number"
                  error={fieldState.error?.message}
                  inputWrapperOrder={INPUT_WRAPPER_ORDER}
                  description="The batch number of the document (if available)"
                  leftSection={<TablerIcon name="listNumbers" size={18} />}
                />
              )}
            />
            <Group grow>
              <Controller
                control={form.control}
                name="issuer"
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    value={field.value as string}
                    placeholder="Enter issuer"
                    label="Issuer"
                    error={fieldState.error?.message}
                    inputWrapperOrder={INPUT_WRAPPER_ORDER}
                    description="The issuer of the document (if available)"
                    leftSection={<TablerIcon name="building" size={18} />}
                  />
                )}
              />
              <Controller
                control={form.control}
                name="placeOfIssue"
                render={({ field, fieldState }) => (
                  <TextInput
                    {...field}
                    value={field.value as string}
                    placeholder="Enter place of issue"
                    label="Place of Issue"
                    error={fieldState.error?.message}
                    inputWrapperOrder={INPUT_WRAPPER_ORDER}
                    description="The place where the document was issued (if available)"
                    leftSection={<TablerIcon name="mapPin" size={18} />}
                  />
                )}
              />
            </Group>
            <Controller
              control={form.control}
              name="issuanceDate"
              render={({ field, fieldState }) => (
                <DateInput
                  {...field}
                  label="Issuance Date"
                  error={fieldState.error?.message}
                  placeholder="Select date"
                  leftSection={<TablerIcon name="calendar" size={18} />}
                />
              )}
            />
          </Stack>

          {/* Additional Fields Section */}
          {sectionTitle('Additional Fields')}
          <Paper p="md" withBorder radius="md">
            <Group justify="space-between" mb="md">
              <Text fw={600}>Custom Fields</Text>
              <Button
                size="xs"
                variant="light"
                leftSection={<TablerIcon name="plus" size={16} />}
                onClick={() => append({ fieldName: '', fieldValue: '' })}
              >
                Add Field
              </Button>
            </Group>
            {fields.length === 0 ? (
              <Text c="dimmed" size="sm" ta="center" py="md">
                No additional fields added. Click "Add Field" to add custom fields.
              </Text>
            ) : (
              <Stack gap="md">
                {fields.map((field, index) => (
                  <Group key={field.id} align="flex-start" gap="sm">
                    <Controller
                      control={form.control}
                      name={`additionalFields.${index}.fieldName`}
                      render={({ field: fieldController, fieldState }) => (
                        <TextInput
                          {...fieldController}
                          placeholder="Field name"
                          label="Field Name"
                          error={fieldState.error?.message}
                          style={{ flex: 1 }}
                          required
                        />
                      )}
                    />
                    <Controller
                      control={form.control}
                      name={`additionalFields.${index}.fieldValue`}
                      render={({ field: fieldController, fieldState }) => (
                        <TextInput
                          {...fieldController}
                          placeholder="Field value"
                          label="Field Value"
                          error={fieldState.error?.message}
                          style={{ flex: 1 }}
                          required
                        />
                      )}
                    />
                    <ActionIcon
                      color="red"
                      variant="light"
                      mt={28}
                      onClick={() => remove(index)}
                      aria-label="Remove field"
                    >
                      <TablerIcon name="trash" size={18} />
                    </ActionIcon>
                  </Group>
                ))}
              </Stack>
            )}
          </Paper>

          {/* Metadata Section */}
          {sectionTitle('Metadata')}
          <Stack gap="md">
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
                  inputWrapperOrder={INPUT_WRAPPER_ORDER}
                  description="Keywords to help find the document case"
                  leftSection={<TablerIcon name="tag" size={18} />}
                />
              )}
            />
          </Stack>
        </Stack>

        <Group gap="sm" mt="auto">
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
            Submit Lost Document Case
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default LostDocumentCaseForm;
