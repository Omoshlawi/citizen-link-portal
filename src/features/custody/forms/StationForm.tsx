import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  Alert,
  Button,
  Divider,
  Group,
  Loader,
  NumberInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { useAddressHierarchy } from '@/features/addresses/hooks';
import { usePublicConfig } from '@/hooks/usePublicConfig';
import { handleApiErrors } from '@/lib/api';
import { useStationsApi } from '../hooks/useStations';
import { Station, StationFormData, StationFormInput } from '../types';
import { StationSchema } from '../utils/validation';

type StationFormProps = {
  station?: Station;
  closeWorkspace?: () => void;
};

const StationForm: React.FC<StationFormProps> = ({ station, closeWorkspace }) => {
  const isEdit = Boolean(station);
  const { countryCode, addressLocaleCode, addressLocaleSpec, isLoading } = usePublicConfig();
  const { createStation, updateStation, mutateStations } = useStationsApi();

  // Country and locale are fixed per deployment; an existing station keeps its own.
  const country = station?.country ?? countryCode;
  const localeCode = station?.addressLocaleCode ?? addressLocaleCode;

  const form = useForm<StationFormInput, unknown, StationFormData>({
    defaultValues: {
      code: station?.code ?? '',
      name: station?.name ?? '',
      phoneNumber: station?.phoneNumber ?? '',
      email: station?.email ?? '',
      level1: station?.level1 ?? '',
      level2: station?.level2 ?? '',
      level3: station?.level3 ?? '',
      address1: station?.address1 ?? '',
      address2: station?.address2 ?? '',
      landmark: station?.landmark ?? '',
      postalCode: station?.postalCode ?? '',
      latitude: station?.coordinates?.lat ?? null,
      longitude: station?.coordinates?.lng ?? null,
    },
    resolver: zodResolver(StationSchema),
  });

  const level1 = form.watch('level1');
  const level2 = form.watch('level2');

  const levelLabel = (level: 'level1' | 'level2' | 'level3', fallback: string) =>
    addressLocaleSpec?.levels.find((spec) => spec.level === level)?.label ?? fallback;

  const handleSubmit: SubmitHandler<StationFormData> = async (data) => {
    try {
      if (station) {
        await updateStation(station.id, data);
      } else {
        await createStation(data, { country: country!, addressLocaleCode: localeCode! });
      }
      showNotification({
        title: 'Success',
        color: 'green',
        message: `Station ${isEdit ? 'updated' : 'created'} successfully`,
      });
      mutateStations();
      closeWorkspace?.();
    } catch (error) {
      const e = handleApiErrors<StationFormData>(error);
      if (e.detail) {
        showNotification({
          title: `Error ${isEdit ? 'updating' : 'creating'} station`,
          message: e.detail,
          color: 'red',
        });
      } else {
        Object.entries(e).forEach(([key, val]) =>
          form.setError(key as keyof StationFormInput, {
            // The backend's phone error is a raw regex; say what it means instead.
            message: key === 'phoneNumber' ? 'Enter a valid phone number' : val,
          })
        );
      }
    }
  };

  const regionMissing = !isLoading && (!country || !localeCode);

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

  const textField = (
    name: keyof StationFormInput,
    label: string,
    props: React.ComponentProps<typeof TextInput> = {}
  ) => (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <TextInput
          {...props}
          {...field}
          value={(field.value as string) ?? ''}
          label={label}
          error={fieldState.error?.message}
        />
      )}
    />
  );

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} style={{ height: '100%' }}>
      <Stack gap="lg" p="md" h="100%" justify="space-between">
        <Stack gap="md">
          {regionMissing && (
            <Alert color="red" icon={<TablerIcon name="alertCircle" size={16} />}>
              The region configuration could not be loaded, so the station can't be saved. Reload
              the page and try again.
            </Alert>
          )}

          {sectionTitle('General')}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {textField('code', 'Code', {
              required: true,
              disabled: isEdit,
              description: isEdit ? "A station's code can't be changed" : 'e.g. NRB-CBD-001',
              styles: { input: { fontFamily: 'monospace' } },
            })}
            {textField('name', 'Name', { required: true, placeholder: 'e.g. Nairobi CBD Station' })}
            {textField('phoneNumber', 'Phone number')}
            {textField('email', 'Email', { type: 'email' })}
          </SimpleGrid>

          {sectionTitle('Location')}
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
            <Controller
              control={form.control}
              name="level1"
              render={({ field, fieldState }) => (
                <HierarchyLevelSelect
                  level={1}
                  country={country}
                  label={levelLabel('level1', 'Level 1')}
                  required
                  value={field.value}
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
                  country={country}
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
                  country={country}
                  parentName={level2}
                  label={levelLabel('level3', 'Level 3')}
                  value={field.value ?? ''}
                  error={fieldState.error?.message}
                  onChange={field.onChange}
                />
              )}
            />
          </SimpleGrid>
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {textField('address1', 'Address line 1', {
              required: true,
              placeholder: 'Building and street',
            })}
            {textField('address2', 'Address line 2', { placeholder: 'Floor, office, etc.' })}
            {textField('landmark', 'Landmark')}
            {textField('postalCode', 'Postal code')}
          </SimpleGrid>

          {sectionTitle('Map coordinates')}
          <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
            {(['latitude', 'longitude'] as const).map((name) => (
              <Controller
                key={name}
                control={form.control}
                name={name}
                render={({ field, fieldState }) => (
                  <NumberInput
                    label={name === 'latitude' ? 'Latitude' : 'Longitude'}
                    value={field.value ?? ''}
                    onChange={(value) => field.onChange(value === '' ? null : value)}
                    onBlur={field.onBlur}
                    decimalScale={7}
                    hideControls
                    error={fieldState.error?.message}
                  />
                )}
              />
            ))}
          </SimpleGrid>
        </Stack>

        <Group gap={1}>
          <Button flex={1} variant="default" radius={0} onClick={closeWorkspace}>
            Cancel
          </Button>
          <Button
            flex={1}
            radius={0}
            type="submit"
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting || isLoading || regionMissing}
          >
            {isEdit ? 'Save changes' : 'Create station'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

export default StationForm;

type HierarchyLevelSelectProps = {
  level: 1 | 2 | 3;
  country?: string;
  /** Name of the selected parent node; levels below 1 stay disabled until it is set. */
  parentName?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
};

/** Searchable picker over one address-hierarchy level. Stations store the node name. */
const HierarchyLevelSelect: React.FC<HierarchyLevelSelectProps> = ({
  level,
  country,
  parentName,
  label,
  value,
  onChange,
  error,
  required,
}) => {
  const needsParent = level > 1;
  const disabled = needsParent && !parentName;
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebouncedValue(search, 400);
  // Searching for the current selection would narrow the list to it, so only send real queries.
  const query = debouncedSearch && debouncedSearch !== value ? debouncedSearch : undefined;
  const { hierarchy, isLoading } = useAddressHierarchy(
    { level, country, parentName: needsParent ? parentName : undefined, search: query, limit: 50 },
    disabled
  );

  const options = useMemo(() => {
    const names = new Set(hierarchy.filter((node) => !node.voided).map((node) => node.name));
    // Keep a saved value selectable even if it isn't in the current page of results.
    if (value) {
      names.add(value);
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [hierarchy, value]);

  return (
    <Select
      label={label}
      required={required}
      placeholder={disabled ? 'Select the level above first' : `Search ${label.toLowerCase()}`}
      data={options}
      value={value || null}
      onChange={(next) => onChange(next ?? '')}
      searchable
      searchValue={search}
      onSearchChange={setSearch}
      clearable
      disabled={disabled}
      error={error}
      rightSection={isLoading && !disabled ? <Loader size="xs" /> : undefined}
      nothingFoundMessage={isLoading ? 'Searching…' : 'No matches'}
    />
  );
};
