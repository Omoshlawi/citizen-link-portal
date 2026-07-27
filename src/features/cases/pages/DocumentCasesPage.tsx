import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Link, useSearchParams } from 'react-router-dom';
import { Anchor, Badge, Button, Group, Select, Stack, Tabs, Text, TextInput } from '@mantine/core';
import { DashboardPageHeader, StateFullDataTable, StatusBadge, TablerIcon } from '@/components';
import { launchWorkspace } from '@/components/Workspace';
import { useDocumentTypes } from '@/features/admin/hooks/useDocumentTypes';
import { useTableUrlFilters } from '@/hooks/useTableUrlFilters';
import { formatDate } from '@/lib/utils/helpers';
import { FoundDocumentCaseForm, LostDocumentCaseForm } from '../forms';
import { useDocumentCases } from '../hooks';
import {
  CustodyStatus,
  DocumentCase,
  FoundDocumentCaseStatus,
  LostDocumentCaseStatus,
} from '../types';

type CaseTab = 'all' | 'lost' | 'found';

const LOST_STATUS_OPTIONS = [
  { label: 'Draft', value: LostDocumentCaseStatus.DRAFT },
  { label: 'Submitted', value: LostDocumentCaseStatus.SUBMITTED },
  { label: 'Completed', value: LostDocumentCaseStatus.COMPLETED },
];

const FOUND_STATUS_OPTIONS = [
  { label: 'Draft', value: FoundDocumentCaseStatus.DRAFT },
  { label: 'Submitted', value: FoundDocumentCaseStatus.SUBMITTED },
  { label: 'Verified', value: FoundDocumentCaseStatus.VERIFIED },
  { label: 'Rejected', value: FoundDocumentCaseStatus.REJECTED },
  { label: 'Completed', value: FoundDocumentCaseStatus.COMPLETED },
];

const EXTRACTION_STATUS_OPTIONS = [
  { label: 'Processing: Pending', value: 'PENDING' },
  { label: 'Processing: In Progress', value: 'IN_PROGRESS' },
  { label: 'Processing: Completed', value: 'COMPLETED' },
  { label: 'Processing: Failed', value: 'FAILED' },
];

const CUSTODY_STATUS_OPTIONS = [
  { label: 'With Finder', value: CustodyStatus.WITH_FINDER },
  { label: 'In Custody', value: CustodyStatus.IN_CUSTODY },
  { label: 'In Transit', value: CustodyStatus.IN_TRANSIT },
  { label: 'Handed Over', value: CustodyStatus.HANDED_OVER },
  { label: 'Disposed', value: CustodyStatus.DISPOSED },
];

const DocumentCasesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get('type') ?? 'all') as CaseTab;

  const {
    page,
    pageSize,
    status,
    search,
    searchInput,
    setSearchInput,
    setStatus,
    setPage,
    setPageSize,
  } = useTableUrlFilters();

  const extractionStatus = searchParams.get('extractionStatus');

  const setExtractionStatus = (value: string | null) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set('extractionStatus', value);
        } else {
          prev.delete('extractionStatus');
        }
        prev.set('page', '1');
        return prev;
      },
      { replace: true }
    );
  };

  const documentType = searchParams.get('documentType');

  const setDocumentType = (value: string | null) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set('documentType', value);
        } else {
          prev.delete('documentType');
        }
        prev.set('page', '1');
        return prev;
      },
      { replace: true }
    );
  };

  const custodyStatus = searchParams.get('custodyStatus');

  const setCustodyStatus = (value: string | null) => {
    setSearchParams(
      (prev) => {
        if (value) {
          prev.set('custodyStatus', value);
        } else {
          prev.delete('custodyStatus');
        }
        prev.set('page', '1');
        return prev;
      },
      { replace: true }
    );
  };

  const handleTabChange = (value: string | null) => {
    setSearchParams(
      (prev) => {
        if (value && value !== 'all') {
          prev.set('type', value);
        } else {
          prev.delete('type');
        }
        prev.delete('status');
        prev.set('page', '1');
        return prev;
      },
      { replace: true }
    );
  };

  const vParam =
    activeTab === 'found'
      ? 'custom:include(foundDocumentCase:include(currentStation),document:include(type),address,user,extractions)'
      : activeTab === 'lost'
        ? 'custom:include(lostDocumentCase,document:include(type),address,user,extractions)'
        : 'custom:include(foundDocumentCase,lostDocumentCase,document:include(type),address,user,extractions)';

  const documentCasesAsync = useDocumentCases({
    v: vParam,
    ...(activeTab !== 'all' && { caseType: activeTab.toUpperCase() }),
    page,
    limit: pageSize,
    ...(search && { search }),
    ...(status && { status }),
    ...(extractionStatus && { extractionStatus }),
    ...(documentType && { documentType }),
    ...(custodyStatus && { custodyStatus }),
  });

  const { documentTypes } = useDocumentTypes();
  const documentTypeOptions = useMemo(
    () => documentTypes.map((type) => ({ label: type.name, value: type.id })),
    [documentTypes]
  );

  const statusOptions =
    activeTab === 'lost'
      ? LOST_STATUS_OPTIONS
      : activeTab === 'found'
        ? FOUND_STATUS_OPTIONS
        : null;

  const columns = useMemo<ColumnDef<DocumentCase>[]>(
    () => [
      {
        header: 'Case No.',
        accessorKey: 'caseNumber',
        enableHiding: false,
        cell({ row: { original: documentCase } }) {
          return (
            <Anchor component={Link} to={documentCase.id}>
              {documentCase.caseNumber}
            </Anchor>
          );
        },
      },
      {
        header: 'Type',
        id: 'caseType',
        cell: ({ row: { original } }) => {
          const isLost = !!original.lostDocumentCase;
          return (
            <Badge color={isLost ? 'orange' : 'teal'} variant="light" size="sm">
              {isLost ? 'Lost' : 'Found'}
            </Badge>
          );
        },
      },
      {
        header: 'Owner Name',
        accessorKey: 'document.fullName',
        cell: ({ row: { original } }) => original.document?.fullName ?? '—',
      },
      {
        header: 'Reported By',
        id: 'reportedBy',
        cell: ({ row: { original } }) => {
          const user = original.user;
          if (!user) {
            return (
              <Text size="sm" c="dimmed">
                —
              </Text>
            );
          }
          const display =
            (user as any).displayUsername || (user as any).username || user.name || user.email;
          return (
            <Text size="sm" title={user.email}>
              {display}
            </Text>
          );
        },
      },
      {
        header: 'Document Type',
        accessorKey: 'document.type.name',
        cell: ({ row: { original } }) => original.document?.type?.name ?? '—',
      },
      {
        header: activeTab === 'lost' ? 'Lost Date' : activeTab === 'found' ? 'Found Date' : 'Date',
        accessorKey: 'eventDate',
        cell: ({ row: { original } }) => formatDate(original.eventDate),
      },
      {
        header: 'Status',
        id: 'status',
        cell: ({ row: { original } }) => {
          const caseStatus =
            original.lostDocumentCase?.status ?? original.foundDocumentCase?.status;
          return <StatusBadge status={caseStatus} />;
        },
      },
      {
        header: 'AI Processing',
        id: 'extraction',
        cell: ({ row: { original } }) => {
          const extraction = original.extractions
            ?.slice()
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
          // Keyed on the extraction existing, not on lostDocumentCase.auto — a lost case
          // with an attached photo is auto=false yet does extract.
          if (!extraction) {
            return (
              <Text size="sm" c="dimmed">
                —
              </Text>
            );
          }
          const STEP_LABEL: Record<string, string> = {
            VISION: 'Image Scan',
            STRUCTURE: 'Data Reading',
          };
          return (
            <Stack gap={2}>
              <StatusBadge status={extraction.extractionStatus} />
              {extraction.currentStep && (
                <Text size="xs" c="dimmed">
                  {STEP_LABEL[extraction.currentStep] ?? extraction.currentStep}
                </Text>
              )}
            </Stack>
          );
        },
      },
      {
        header: 'Reported',
        accessorKey: 'createdAt',
        cell: ({ row: { original } }) => formatDate(original.createdAt),
      },
      {
        header: 'Custody',
        id: 'custodyStatus',
        cell: ({ row: { original } }) => {
          const status = original.foundDocumentCase?.custodyStatus;
          if (!status) {
            return '—';
          }
          return <StatusBadge status={status} />;
        },
      },
      {
        header: 'Current Station',
        id: 'currentStation',
        cell: ({ row: { original } }) => {
          const status = original.foundDocumentCase?.currentStation?.name;
          if (!status) {
            return '—';
          }
          return status;
        },
      },
    ],
    [activeTab]
  );
  return (
    <Stack gap="md">
      <DashboardPageHeader
        title="Cases"
        subTitle="Manage lost and found document cases"
        icon="files"
      />
      <Tabs value={activeTab} onChange={handleTabChange}>
        <Tabs.List>
          <Tabs.Tab value="all" leftSection={<TablerIcon name="files" size={14} />}>
            All Cases
          </Tabs.Tab>
          <Tabs.Tab value="lost" leftSection={<TablerIcon name="fileSearch" size={14} />}>
            Lost
          </Tabs.Tab>
          <Tabs.Tab value="found" leftSection={<TablerIcon name="fileCheck" size={14} />}>
            Found
          </Tabs.Tab>
        </Tabs.List>
      </Tabs>
      <StateFullDataTable
        {...documentCasesAsync}
        data={documentCasesAsync.reports}
        columns={[...columns]}
        renderActions={() => (
          <>
            <Group gap="xs" wrap="nowrap">
              <Button
                size="xs"
                variant="light"
                color="orange"
                leftSection={<TablerIcon name="fileSearch" size={14} />}
                onClick={() => {
                  const dismiss = launchWorkspace(
                    <LostDocumentCaseForm
                      onSuccess={() => dismiss()}
                      closeWorkspace={() => dismiss()}
                    />,
                    { title: 'Report Lost Document' }
                  );
                }}
              >
                Report Lost
              </Button>
              <Button
                size="xs"
                variant="light"
                color="teal"
                leftSection={<TablerIcon name="fileCheck" size={14} />}
                onClick={() => {
                  const dismiss = launchWorkspace(
                    <FoundDocumentCaseForm
                      onSuccess={() => dismiss()}
                      closeWorkspace={() => dismiss()}
                    />,
                    { title: 'Report Found Document' }
                  );
                }}
              >
                Report Found
              </Button>
            </Group>
            <TextInput
              placeholder="Search cases..."
              leftSection={<TablerIcon name="search" size={14} />}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              size="xs"
              w={200}
            />
            {statusOptions && (
              <Select
                placeholder="Status"
                data={statusOptions}
                value={status}
                onChange={setStatus}
                size="xs"
                clearable
                w={140}
              />
            )}
            <Select
              placeholder="Document Type"
              data={documentTypeOptions}
              value={documentType}
              onChange={setDocumentType}
              size="xs"
              clearable
              w={160}
              searchable
            />
            <Select
              placeholder="AI Processing"
              data={EXTRACTION_STATUS_OPTIONS}
              value={extractionStatus}
              onChange={setExtractionStatus}
              size="xs"
              clearable
              w={160}
            />
            {activeTab === 'found' && (
              <Select
                placeholder="Custody"
                data={CUSTODY_STATUS_OPTIONS}
                value={custodyStatus}
                onChange={setCustodyStatus}
                size="xs"
                clearable
                w={140}
              />
            )}
          </>
        )}
        pagination={{
          totalCount: documentCasesAsync.totalCount,
          currentPage: page,
          pageSize,
          onChange: setPage,
          onPageSizeChange: setPageSize,
        }}
      />
    </Stack>
  );
};

export default DocumentCasesPage;
