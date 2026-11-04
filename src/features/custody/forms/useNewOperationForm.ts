import { useCallback, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Resolver, SubmitHandler, useForm } from 'react-hook-form';
import { showNotification } from '@mantine/notifications';
import { useCustodyCandidates } from '@/features/cases/hooks';
import { CaseType, FoundDocumentCaseStatus } from '@/features/cases/types';
import { useActiveStation } from '@/hooks/useActiveStation';
import { authClient, handleApiErrors } from '@/lib/api';
import { createOperation, useStaffAllowedOperations } from '../hooks/useCustody';
import { useStations } from '../hooks/useStations';
import {
  CustodyStatus,
  DocumentOperationType,
  DocumentOperationTypeCode,
  SubmissionMethod,
} from '../types';
import { makeNewOperationSchema, NewOperationFormData } from '../utils/validation';

interface UseNewOperationFormOptions {
  preselectedType?: DocumentOperationType;
  defaultStationId?: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const useNewOperationForm = ({
  preselectedType,
  defaultStationId,
  onClose,
  onSuccess,
}: UseNewOperationFormOptions) => {
  const { stationId: activeStationId } = useActiveStation();
  const { data: sessionData } = authClient.useSession();
  const sessionUserId: string | null = sessionData?.user?.id ?? null;
  const sessionUserEmail: string | null = sessionData?.user?.email ?? null;

  // ── Case label tracking (pills display after search clears) ─────────────────
  const [caseLabels, setCaseLabels] = useState<Record<string, string>>({});
  const [caseSearch, setCaseSearch] = useState('');

  // ── Dynamic Zod resolver via ref so the schema reflects the current op type ─
  const selectedOpTypeRef = useRef<DocumentOperationType | undefined>(preselectedType);

  const resolver: Resolver<NewOperationFormData> = useCallback(
    async (data, context, options) => {
      const schema = makeNewOperationSchema(selectedOpTypeRef.current);
      return zodResolver(schema)(data, context, options);
    },
    [] // stable — reads opType at call-time via ref
  );

  // ── RHF form ──────────────────────────────────────────────────────────────
  const form = useForm<NewOperationFormData>({
    values: {
      operationTypeId: preselectedType?.id ?? '',
      foundCaseIds: [],
      stationId: defaultStationId ?? activeStationId ?? null,
      counterpartStationId: null,
      responsiblePersonId: sessionUserId ?? undefined,
      notes: '',
      targetArea: '',
      receiptSubmissionMethod: null,
    },
    resolver,
    mode: 'onTouched',
  });

  // ── Static data fetching (no dependencies) ────────────────────────────────
  const { operations, isLoading: opTypesLoading } = useStaffAllowedOperations(
    activeStationId ?? defaultStationId ?? ''
  );
  const { stations } = useStations();

  // ── Derived state ──────────────────────────────────────────────────────────
  const watchedTypeId = form.watch('operationTypeId');
  const watchedFoundCaseIds = form.watch('foundCaseIds');
  const watchedCounterpartStationId = form.watch('counterpartStationId');
  const watchedReceiptMethod = form.watch('receiptSubmissionMethod');
  const watchedTargetArea = form.watch('targetArea');

  const selectedOpType = useMemo<DocumentOperationType | undefined>(
    () => preselectedType ?? operations.find((s) => s.id === watchedTypeId),
    [preselectedType, operations, watchedTypeId]
  );

  // Keep ref in sync so the resolver always uses the latest op type
  selectedOpTypeRef.current = selectedOpType;

  //  Case fetching — filtered based on operation type
  const { cases, isLoading: casesLoading } = useCustodyCandidates({
    caseType: CaseType.FOUND,
    limit: 8,
    ...(caseSearch && { search: caseSearch }),
    // REQUISITION: only show docs at the selected source station
    ...(selectedOpType?.code === DocumentOperationTypeCode.REQUISITION &&
      watchedCounterpartStationId && { currentStationId: watchedCounterpartStationId }),
    // RECEIPT DROPOFF: filter DRAFT/WITH_FINDER cases at the active station
    ...(selectedOpType?.code === DocumentOperationTypeCode.RECEIPT &&
      watchedReceiptMethod === SubmissionMethod.STATION_DROPOFF && {
        submissionMethod: SubmissionMethod.STATION_DROPOFF,
        status: FoundDocumentCaseStatus.DRAFT,
        custodyStatus: CustodyStatus.WITH_FINDER,
        ...(activeStationId && { pickupStationId: activeStationId }),
      }),
    // RECEIPT PICKUP: filter DRAFT/WITH_FINDER cases in the target area
    ...(selectedOpType?.code === DocumentOperationTypeCode.RECEIPT &&
      watchedReceiptMethod === SubmissionMethod.AGENT_PICKUP && {
        submissionMethod: SubmissionMethod.AGENT_PICKUP,
        custodyStatus: CustodyStatus.WITH_FINDER,
        status: FoundDocumentCaseStatus.DRAFT,
        ...(watchedTargetArea && { collectionArea: watchedTargetArea }),
      }),
  });

  const operationTypeOptions = useMemo(
    () => operations.map((t) => ({ value: t.id, label: t.name })),
    [operations]
  );

  const stationOptions = useMemo(
    () => stations.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` })),
    [stations]
  );

  const availableCases = useMemo(
    () => cases.filter((c) => !watchedFoundCaseIds.includes(c.foundDocumentCase?.id ?? '')),
    [cases, watchedFoundCaseIds]
  );

  // Case selection helpers
  const addCase = (foundCaseId: string, label: string) => {
    form.setValue('foundCaseIds', [...watchedFoundCaseIds, foundCaseId], { shouldValidate: true });
    setCaseLabels((prev) => ({ ...prev, [foundCaseId]: label }));
    setCaseSearch('');
  };

  const removeCase = (foundCaseId: string) => {
    const remaining = watchedFoundCaseIds.filter((id) => id !== foundCaseId);
    form.setValue('foundCaseIds', remaining, { shouldValidate: true });
    setCaseLabels((prev) => {
      const next = { ...prev };
      delete next[foundCaseId];
      return next;
    });
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<NewOperationFormData> = async (data) => {
    try {
      await createOperation({
        operationTypeId: data.operationTypeId,
        foundCaseIds: data.foundCaseIds,
        ...(data.stationId && { stationId: data.stationId }),
        ...(data.counterpartStationId && { counterpartStationId: data.counterpartStationId }),
        responsiblePersonId: data.responsiblePersonId ?? null,
        notes: data.notes || undefined,
        ...(data.targetArea?.trim() && { targetArea: data.targetArea.trim() }),
      });
      showNotification({
        title: 'Operation created',
        message: `Draft operation created with ${data.foundCaseIds.length} document(s).`,
        color: 'teal',
      });
      onSuccess?.();
      onClose();
    } catch (err) {
      const e = handleApiErrors<NewOperationFormData>(err);
      if (e.detail) {
        form.setError('root', { message: e.detail });
      } else {
        Object.entries(e).forEach(([key, val]) =>
          form.setError(key as keyof NewOperationFormData, { message: String(val) })
        );
      }
    }
  };

  return {
    form,
    selectedOpType,
    opTypesLoading,
    operationTypeOptions,
    stationOptions,
    sessionUserEmail,
    // Case picker
    caseSearch,
    setCaseSearch,
    cases,
    casesLoading,
    availableCases,
    caseLabels,
    addCase,
    removeCase,
    watchedFoundCaseIds,
    watchedCounterpartStationId,
    watchedReceiptMethod,
    watchedTargetArea,
    // Submit
    handleSubmit: form.handleSubmit(onSubmit),
  };
};
