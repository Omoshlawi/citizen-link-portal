import React, { useMemo, useState } from 'react';
import { Loader, Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useAddressHierarchy } from '@/features/addresses/hooks';

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

/** Searchable picker over one address-hierarchy level. Stores the node name. */
export const HierarchyLevelSelect: React.FC<HierarchyLevelSelectProps> = ({
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
