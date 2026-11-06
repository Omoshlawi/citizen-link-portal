import { Controller, FieldValues, UseFormReturn } from 'react-hook-form';
import { SimpleGrid, Stack, TextInput } from '@mantine/core';
import { TablerIcon } from '@/components';
import { HierarchyLevelSelect } from '@/components/form-components';
import { usePublicConfig } from '@/hooks/usePublicConfig';

type CaseLocationValues = {
  level1: string;
  level2?: string | null;
  level3?: string | null;
  place?: string | null;
};

type CaseLocationFieldsProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  /** Shown under the place field, e.g. where the document was found. */
  placeLabel: string;
  /** Off where the area is already known, leaving only the place field. */
  showArea?: boolean;
};

/** Where a document was lost or found: an area, plus optional typed detail. */
const CaseLocationFields = <T extends FieldValues>({
  form: anyForm,
  placeLabel,
  showArea = true,
}: CaseLocationFieldsProps<T>) => {
  const form = anyForm as unknown as UseFormReturn<CaseLocationValues>;
  const { countryCode, addressLocaleSpec } = usePublicConfig();
  const level1 = form.watch('level1');
  const level2 = form.watch('level2');

  const levelLabel = (level: string, fallback: string) =>
    addressLocaleSpec?.levels.find((spec) => spec.level === level)?.label ?? fallback;

  return (
    <Stack gap="md">
      {showArea && (
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
          <Controller
            control={form.control}
            name="level1"
            render={({ field, fieldState }) => (
              <HierarchyLevelSelect
                level={1}
                country={countryCode}
                label={levelLabel('level1', 'Level 1')}
                required
                value={field.value ?? ''}
                error={fieldState.error?.message}
                onChange={(value) => {
                  field.onChange(value);
                  form.setValue('level2', '');
                  form.setValue('level3', '');
                }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="level2"
            render={({ field, fieldState }) => (
              <HierarchyLevelSelect
                level={2}
                country={countryCode}
                parentName={level1}
                label={levelLabel('level2', 'Level 2')}
                value={field.value ?? ''}
                error={fieldState.error?.message}
                onChange={(value) => {
                  field.onChange(value);
                  form.setValue('level3', '');
                }}
              />
            )}
          />
          <Controller
            control={form.control}
            name="level3"
            render={({ field, fieldState }) => (
              <HierarchyLevelSelect
                level={3}
                country={countryCode}
                parentName={level2 ?? undefined}
                label={levelLabel('level3', 'Level 3')}
                value={field.value ?? ''}
                error={fieldState.error?.message}
                onChange={field.onChange}
              />
            )}
          />
        </SimpleGrid>
      )}
      <Controller
        control={form.control}
        name="place"
        render={({ field, fieldState }) => (
          <TextInput
            {...field}
            value={field.value ?? ''}
            label={placeLabel}
            description="Optional. Describe the place, without anyone's name or home address."
            placeholder="e.g. Near the Westlands stage"
            maxLength={500}
            error={fieldState.error?.message}
            leftSection={<TablerIcon name="mapPin" size={18} />}
          />
        )}
      />
    </Stack>
  );
};

export default CaseLocationFields;
