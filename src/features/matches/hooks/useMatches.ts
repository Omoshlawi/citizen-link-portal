import useSWR from 'swr';
import { DocumentCase } from '@/features/cases/types';
import { useListScope } from '@/hooks/useListScope';
import { APIFetchResponse, constructUrl, PaginatedData } from '@/lib/api';
import { Match } from '../types';

export const useMatches = (params: Record<string, any> = {}) => {
  const { params: scope, ready } = useListScope('matches', { atActiveStation: true });
  const url = constructUrl('/matching', {
    ...scope,
    v: 'custom:include(lostDocumentCase:include(case:include(document:include(type))),foundDocumentCase:include(case:include(document:include(type))))',
    ...params,
  });
  const { data, error, isLoading, mutate } = useSWR<APIFetchResponse<PaginatedData<Match>>>(
    ready ? url : null
  );
  return {
    matches: data?.data?.results ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    currentPage: data?.data?.currentPage ?? 1,
    pageSize: data?.data?.pageSize ?? 12,
    isLoading,
    error,
    mutate,
  };
};

export const useMatch = (matchId?: string) => {
  const url = matchId
    ? constructUrl(`/matching/${matchId}`, {
        v: 'custom:include(lostDocumentCase:include(case:include(document:include(type,images,additionalFields),address)),foundDocumentCase:include(case:include(document:include(type,images,additionalFields),address)))',
      })
    : null;
  const { data, error, isLoading } = useSWR<APIFetchResponse<Match>>(url);
  return {
    match: data?.data,
    isLoading,
    error,
  };
};

export const useSemanticMatches = (
  params: {
    caseRef?: string;
    type?: 'lost' | 'found';
    minMatchScore?: number;
    limit?: number;
  } = {}
) => {
  const { caseRef, type, minMatchScore, limit } = params;

  const lostUrl =
    caseRef && type === 'lost'
      ? constructUrl('/matching/lost', {
          lostDocumentCase: caseRef,
          v: 'custom:include(lostDocumentCase,foundDocumentCase,document:include(type))',
          ...(minMatchScore !== undefined && { minMatchScore }),
          ...(limit !== undefined && { limit }),
        })
      : null;

  const foundUrl =
    caseRef && type === 'found'
      ? constructUrl('/matching/found', {
          foundDocumentCase: caseRef,
          v: 'custom:include(lostDocumentCase,foundDocumentCase,document:include(type))',
          ...(minMatchScore !== undefined && { minMatchScore }),
          ...(limit !== undefined && { limit }),
        })
      : null;

  const {
    data: lostData,
    isLoading: lostLoading,
    error: lostError,
  } = useSWR<APIFetchResponse<{ results: DocumentCase[] }>>(lostUrl);
  const {
    data: foundData,
    isLoading: foundLoading,
    error: foundError,
  } = useSWR<APIFetchResponse<{ results: DocumentCase[] }>>(foundUrl);

  const results = lostData?.data?.results ?? foundData?.data?.results ?? [];
  return {
    results,
    totalCount: results.length,
    isLoading: lostLoading || foundLoading,
    error: lostError ?? foundError,
  };
};
