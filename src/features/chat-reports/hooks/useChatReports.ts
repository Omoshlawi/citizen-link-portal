import useSWR from 'swr';
import { apiFetch, APIFetchResponse, constructUrl, mutate, PaginatedData } from '@/lib/api';
import { ChatReport, ChatReportDetail, ResolveReportFormData } from '../types';

type ChatReportFilters = Record<string, string | number | boolean | undefined>;

export const useChatReports = (filters: ChatReportFilters = {}) => {
  const url = constructUrl('/chat-bot/reports', filters);
  const { data, error, isLoading } = useSWR<APIFetchResponse<PaginatedData<ChatReport>>>(url);
  return {
    reports: data?.data?.results ?? [],
    totalCount: data?.data?.totalCount ?? 0,
    currentPage: data?.data?.currentPage ?? 1,
    pageSize: data?.data?.pageSize ?? 12,
    isLoading,
    error,
  };
};

export const useChatReport = (reportId?: string) => {
  const { data, isLoading, error } = useSWR<APIFetchResponse<ChatReportDetail>>(
    reportId ? `/chat-bot/reports/${reportId}` : null
  );
  return { report: data?.data, isLoading, error };
};

const resolveReport = async (reportId: string, data: ResolveReportFormData) => {
  const url = constructUrl(`/chat-bot/reports/${reportId}`);
  const res = await apiFetch<ChatReportDetail>(url, { method: 'PATCH', data });
  // Prefix match refreshes both the queue and this report's detail view.
  mutate('/chat-bot/reports');
  return res.data;
};

export const useChatReportApi = () => ({ resolveReport });
