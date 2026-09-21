import useSWR from 'swr';
import { apiFetch, APIFetchResponse, constructUrl, mutate, PaginatedData } from '@/lib/api';
import {
  ActiveExchangeState,
  DeliveryPolicy,
  DocumentExchange,
  ExchangeDirection,
  ExchangeStatus,
  ExchangeVerification,
  VerificationStatus,
} from '../types';

export const useExchanges = (params: Record<string, any> = {}, enabled = true) => {
  const url = constructUrl('/exchange', {
    v: 'custom:include(verifications,station,address,createdBy,completedBy,cancelledBy)',
    ...params,
  });
  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<APIFetchResponse<PaginatedData<DocumentExchange>>>(enabled ? url : null);
  return { exchanges: data?.data?.results ?? [], isLoading, error, mutate: swrMutate };
};

export const useActiveExchange = (foundCaseId?: string) => {
  const url = foundCaseId
    ? constructUrl('/exchange', {
        active: true,
        direction: ExchangeDirection.INBOUND,
        foundCaseId,
        v: 'custom:include(verifications)',
      })
    : null;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<
    APIFetchResponse<PaginatedData<DocumentExchange & { verifications: ExchangeVerification[] }>>
  >(url);

  const exchangeList = data?.data?.results ?? [];
  const activeExchange = exchangeList.find(
    (ex) => ex.status === ExchangeStatus.SCHEDULED || ex.status === ExchangeStatus.IN_PROGRESS
  );
  const pendingVerification = activeExchange?.verifications?.find(
    (v) => v.status === VerificationStatus.PENDING
  );

  const exchange: ActiveExchangeState = activeExchange
    ? {
        hasActiveExchange: true,
        exchangeId: activeExchange.id,
        exchangeNumber: activeExchange.exchangeNumber,
        status: activeExchange.status,
        scheduledAt: activeExchange.scheduledAt,
        expiresAt: pendingVerification?.expiresAt,
        attempts: pendingVerification?.attempts,
        maxAttempts: pendingVerification?.maxAttempts,
      }
    : { hasActiveExchange: false };

  return {
    exchange,
    hasActiveExchange: !!activeExchange,
    hasActiveVerification:
      !!activeExchange &&
      activeExchange.status === ExchangeStatus.IN_PROGRESS &&
      !!pendingVerification,
    isLoading,
    error,
    mutate: swrMutate,
  };
};

export const useActiveOutboundExchange = (claimId?: string) => {
  const url = claimId
    ? constructUrl('/exchange', {
        active: true,
        direction: ExchangeDirection.OUTBOUND,
        claimId,
        v: 'custom:include(verifications)',
      })
    : null;

  const {
    data,
    error,
    isLoading,
    mutate: swrMutate,
  } = useSWR<
    APIFetchResponse<PaginatedData<DocumentExchange & { verifications: ExchangeVerification[] }>>
  >(url);

  const exchangeList = data?.data?.results ?? [];
  const activeExchange = exchangeList.find(
    (ex) => ex.status === ExchangeStatus.SCHEDULED || ex.status === ExchangeStatus.IN_PROGRESS
  );
  const pendingVerification = activeExchange?.verifications?.find(
    (v) => v.status === VerificationStatus.PENDING
  );

  const exchange: ActiveExchangeState = activeExchange
    ? {
        hasActiveExchange: true,
        exchangeId: activeExchange.id,
        exchangeNumber: activeExchange.exchangeNumber,
        status: activeExchange.status,
        scheduledAt: activeExchange.scheduledAt,
        expiresAt: pendingVerification?.expiresAt,
        attempts: pendingVerification?.attempts,
        maxAttempts: pendingVerification?.maxAttempts,
      }
    : { hasActiveExchange: false };

  return {
    exchange,
    hasActiveExchange: !!activeExchange,
    hasActiveVerification:
      !!activeExchange &&
      activeExchange.status === ExchangeStatus.IN_PROGRESS &&
      !!pendingVerification,
    isLoading,
    error,
    mutate: swrMutate,
  };
};

export const useDocumentExchanges = (foundCaseId?: string) => {
  const url = foundCaseId
    ? constructUrl('/exchange', {
        foundCaseId,
        orderBy: '-createdAt',
        limit: 50,
        v: 'custom:include(station,address,createdBy,completedBy,cancelledBy)',
      })
    : null;
  const {
    data,
    isLoading,
    error,
    mutate: swrMutate,
  } = useSWR<APIFetchResponse<PaginatedData<DocumentExchange>>>(url);
  return { exchanges: data?.data?.results ?? [], isLoading, error, mutate: swrMutate };
};

export const useDeliveryPolicy = () => {
  const { data, error, isLoading } = useSWR<APIFetchResponse<DeliveryPolicy>>(
    '/exchange/delivery-policy'
  );
  return { policy: data?.data ?? null, isLoading, error };
};

export const useExchangeApi = () => {
  const issueCode = async (foundCaseId: string): Promise<DocumentExchange> => {
    const res = await apiFetch<DocumentExchange>(
      constructUrl('/exchange/issue-code', { direction: ExchangeDirection.INBOUND, foundCaseId }),
      { method: 'POST' }
    );
    mutate('/exchange');
    mutate('/documents/cases');
    return res.data;
  };

  const verifyCode = async (
    foundCaseId: string,
    data: { code: string }
  ): Promise<DocumentExchange> => {
    try {
      const res = await apiFetch<DocumentExchange>(
        constructUrl('/exchange/verify-code', {
          direction: ExchangeDirection.INBOUND,
          foundCaseId,
        }),
        { method: 'POST', data }
      );
      mutate('/documents/cases');
      return res.data;
    } finally {
      mutate('/exchange');
    }
  };

  const cancelExchange = async (foundCaseId: string, data: { reason: string }): Promise<void> => {
    await apiFetch(
      constructUrl('/exchange/withdraw', { direction: ExchangeDirection.INBOUND, foundCaseId }),
      { method: 'POST', data }
    );
    mutate('/exchange');
    mutate('/documents/cases');
  };

  const cancelVerification = async (
    foundCaseId: string,
    data: { reason: string }
  ): Promise<void> => {
    await apiFetch(
      constructUrl('/exchange/cancel-code', { direction: ExchangeDirection.INBOUND, foundCaseId }),
      { method: 'POST', data }
    );
    mutate('/exchange');
  };

  const issueOutboundCode = async (exchangeNumber: string): Promise<DocumentExchange> => {
    const res = await apiFetch<DocumentExchange>(
      constructUrl('/exchange/issue-code', {
        direction: ExchangeDirection.OUTBOUND,
        exchangeNumber,
      }),
      { method: 'POST' }
    );
    mutate('/exchange');
    mutate('/claim');
    return res.data;
  };

  const verifyOutboundCode = async (
    exchangeNumber: string,
    data: { code: string }
  ): Promise<DocumentExchange> => {
    try {
      const res = await apiFetch<DocumentExchange>(
        constructUrl('/exchange/verify-code', {
          direction: ExchangeDirection.OUTBOUND,
          exchangeNumber,
        }),
        { method: 'POST', data }
      );
      mutate('/claim');
      return res.data;
    } finally {
      mutate('/exchange');
    }
  };

  const cancelOutboundVerification = async (
    exchangeNumber: string,
    data: { reason: string }
  ): Promise<void> => {
    await apiFetch(
      constructUrl('/exchange/cancel-code', {
        direction: ExchangeDirection.OUTBOUND,
        exchangeNumber,
      }),
      { method: 'POST', data }
    );
    mutate('/exchange');
  };

  const failDelivery = async (exchangeNumber: string, data: { reason: string }): Promise<void> => {
    await apiFetch(constructUrl('/exchange/fail-delivery', { exchangeNumber }), {
      method: 'POST',
      data,
    });
    mutate('/exchange');
    mutate('/claim');
  };

  const getDeliveryLabelUrl = (exchangeNumber: string): string =>
    constructUrl(`/exchange/delivery-label/${exchangeNumber}`, {});

  return {
    issueCode,
    verifyCode,
    cancelExchange,
    cancelVerification,
    issueOutboundCode,
    verifyOutboundCode,
    cancelOutboundVerification,
    failDelivery,
    getDeliveryLabelUrl,
  };
};
