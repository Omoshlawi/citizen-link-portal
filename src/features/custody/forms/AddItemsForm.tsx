import React, { useState } from 'react';
import {
  Alert,
  Button,
  Combobox,
  Group,
  Input,
  Pill,
  PillsInput,
  ScrollArea,
  Stack,
  Text,
  useCombobox,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { useCustodyCandidates } from '@/features/cases/hooks';
import { useActiveStation } from '@/hooks/useActiveStation';
import { handleApiErrors } from '@/lib/api';
import { addOperationItem } from '../hooks/useCustody';
import { DocumentOperation, DocumentOperationTypeCode } from '../types';

interface AddItemsFormProps {
  operation: DocumentOperation;
  /** IDs already on the operation — excluded from search results */
  existingFoundCaseIds: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

const AddItemsForm: React.FC<AddItemsFormProps> = ({
  operation,
  existingFoundCaseIds,
  onClose,
  onSuccess,
}) => {
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [selectedCaseLabels, setSelectedCaseLabels] = useState<Record<string, string>>({});
  const [caseSearch, setCaseSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { stationId, isLoading: stationIsLoading } = useActiveStation();

  const combobox = useCombobox({ onDropdownClose: () => combobox.resetSelectedOption() });

  const { cases, isLoading: casesLoading } = useCustodyCandidates({
    caseType: 'FOUND',
    limit: 20,
    ...(caseSearch && { search: caseSearch }),
    currentStationId:
      operation.operationType?.code === DocumentOperationTypeCode.REQUISITION
        ? stationId
        : undefined,
  });

  const excludedIds = new Set([...existingFoundCaseIds, ...selectedCaseIds]);
  const availableCases = cases.filter((c) => !excludedIds.has(c.foundDocumentCase?.id ?? ''));

  const addCase = (foundCaseId: string, label: string) => {
    setSelectedCaseIds((prev) => [...prev, foundCaseId]);
    setSelectedCaseLabels((prev) => ({ ...prev, [foundCaseId]: label }));
    setCaseSearch('');
    combobox.closeDropdown();
  };

  const removeCase = (foundCaseId: string) => {
    setSelectedCaseIds((prev) => prev.filter((id) => id !== foundCaseId));
    setSelectedCaseLabels((prev) => {
      const next = { ...prev };
      delete next[foundCaseId];
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selectedCaseIds.length === 0) {
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      for (const foundCaseId of selectedCaseIds) {
        await addOperationItem(operation.id, foundCaseId);
      }
      showNotification({
        title: 'Documents added',
        message: `${selectedCaseIds.length} document(s) added to the operation.`,
        color: 'teal',
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const e = handleApiErrors<{}>(err);
      setError(e.detail ?? 'Failed to add documents.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack p="md" h="100%" justify="space-between">
      <ScrollArea flex={1} offsetScrollbars>
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            Search for found document cases to add to this operation.
          </Text>

          <Input.Wrapper label="Documents" required>
            <Combobox
              store={combobox}
              onOptionSubmit={(val) => {
                const c = cases.find((c) => c.foundDocumentCase?.id === val);
                if (c) {
                  addCase(val, `${c.caseNumber} · ${c.document?.type?.name ?? 'Unknown'}`);
                }
              }}
            >
              <Combobox.DropdownTarget>
                <PillsInput onClick={() => combobox.openDropdown()}>
                  <Pill.Group>
                    {selectedCaseIds.map((id) => (
                      <Pill key={id} withRemoveButton onRemove={() => removeCase(id)}>
                        {selectedCaseLabels[id] ?? id}
                      </Pill>
                    ))}
                    <Combobox.EventsTarget>
                      <PillsInput.Field
                        placeholder={
                          selectedCaseIds.length === 0
                            ? 'Search by case number or document type…'
                            : undefined
                        }
                        value={caseSearch}
                        onChange={(e) => {
                          setCaseSearch(e.currentTarget.value);
                          combobox.openDropdown();
                        }}
                        onFocus={() => combobox.openDropdown()}
                        onBlur={() => combobox.closeDropdown()}
                      />
                    </Combobox.EventsTarget>
                  </Pill.Group>
                </PillsInput>
              </Combobox.DropdownTarget>

              <Combobox.Dropdown>
                <Combobox.Options>
                  {casesLoading || stationIsLoading ? (
                    <Combobox.Empty>Searching…</Combobox.Empty>
                  ) : availableCases.length === 0 ? (
                    <Combobox.Empty>No matching cases found</Combobox.Empty>
                  ) : (
                    availableCases.map((c) => (
                      <Combobox.Option
                        key={c.foundDocumentCase?.id}
                        value={c.foundDocumentCase?.id ?? ''}
                      >
                        <Group gap="xs" wrap="nowrap">
                          <Text size="sm" fw={500}>
                            {c.caseNumber}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {c.document?.type?.name ?? '—'}
                          </Text>
                        </Group>
                      </Combobox.Option>
                    ))
                  )}
                </Combobox.Options>
              </Combobox.Dropdown>
            </Combobox>
          </Input.Wrapper>

          {error && (
            <Alert variant="light" color="red" icon={<TablerIcon name="alertTriangle" size={16} />}>
              {error}
            </Alert>
          )}
        </Stack>
      </ScrollArea>

      <Group gap={1} pt="md">
        <Button flex={1} variant="default" radius={0} onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          flex={1}
          radius={0}
          leftSection={<TablerIcon name="plus" size={14} />}
          loading={isLoading}
          disabled={selectedCaseIds.length === 0}
          onClick={handleSubmit}
        >
          Add {selectedCaseIds.length > 0 ? `${selectedCaseIds.length} Document(s)` : 'Documents'}
        </Button>
      </Group>
    </Stack>
  );
};

export default AddItemsForm;
