import { useQuery } from '@tanstack/react-query';
import {
  getCostSummary,
  getCostRecords,
  getDailyCosts,
  getCostsByAssistant,
  getCostsByModel
} from '../services/api/costTrackingService';
import {
  CostSummary,
  CostRecord,
  DailyCost,
  CostFilters,
  AssistantCostData,
  ModelCostData
} from '../types/costTracking';

// Query keys for cache management
export const costQueryKeys = {
  all: ['costs'] as const,
  summary: (startDate?: string, endDate?: string, provider?: string) =>
    [...costQueryKeys.all, 'summary', { startDate, endDate, provider }] as const,
  records: (filters: CostFilters) =>
    [...costQueryKeys.all, 'records', filters] as const,
  daily: (days: number, startDate?: string, endDate?: string, provider?: string) =>
    [...costQueryKeys.all, 'daily', { days, startDate, endDate, provider }] as const,
  byAssistant: (assistantId: string, startDate?: string, endDate?: string, limit?: number) =>
    [...costQueryKeys.all, 'byAssistant', { assistantId, startDate, endDate, limit }] as const,
  byModel: (model: string, startDate?: string, endDate?: string, limit?: number) =>
    [...costQueryKeys.all, 'byModel', { model, startDate, endDate, limit }] as const,
};

// Hook for fetching cost summary
export const useCostSummary = (startDate?: string, endDate?: string, provider?: string) => {
  const query = useQuery({
    queryKey: costQueryKeys.summary(startDate, endDate, provider),
    queryFn: () => getCostSummary(startDate, endDate, provider),
    staleTime: 60_000, // 1 minute
    refetchInterval: 120_000, // Refetch every 2 minutes in background
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
};

// Hook for fetching cost records with pagination
export const useCostRecords = (filters: CostFilters = {}) => {
  const query = useQuery({
    queryKey: costQueryKeys.records(filters),
    queryFn: () => getCostRecords(filters),
    staleTime: 60_000, // 1 minute
    refetchInterval: 120_000, // Refetch every 2 minutes in background
  });

  return {
    data: query.data?.records ?? [],
    count: query.data?.count ?? 0,
    totalCount: query.data?.totalCount ?? 0,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
};

// Hook for fetching daily cost trends
export const useDailyCosts = (
  days: number = 30,
  startDate?: string,
  endDate?: string,
  provider?: string
) => {
  const query = useQuery({
    queryKey: costQueryKeys.daily(days, startDate, endDate, provider),
    queryFn: () => getDailyCosts(days, startDate, endDate, provider),
    staleTime: 60_000, // 1 minute
    refetchInterval: 120_000, // Refetch every 2 minutes in background
  });

  return {
    data: query.data ?? [],
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
  };
};

// Hook for fetching assistant-specific costs
export const useAssistantCosts = (
  assistantId: string | null,
  startDate?: string,
  endDate?: string,
  limit?: number
) => {
  const query = useQuery({
    queryKey: costQueryKeys.byAssistant(assistantId ?? '', startDate, endDate, limit),
    queryFn: () => getCostsByAssistant(assistantId!, startDate, endDate, limit),
    enabled: !!assistantId, // Only fetch when assistantId is provided
    staleTime: 60_000,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
};

// Hook for fetching model-specific costs
export const useModelCosts = (
  model: string | null,
  startDate?: string,
  endDate?: string,
  limit?: number
) => {
  const query = useQuery({
    queryKey: costQueryKeys.byModel(model ?? '', startDate, endDate, limit),
    queryFn: () => getCostsByModel(model!, startDate, endDate, limit),
    enabled: !!model, // Only fetch when model is provided
    staleTime: 60_000,
  });

  return {
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error?.message ?? null,
    refetch: query.refetch,
  };
};

// Combined hook for complete cost dashboard data
export const useCostDashboard = (filters: CostFilters = {}) => {
  const summary = useCostSummary(filters.startDate, filters.endDate, filters.provider);
  const records = useCostRecords({ ...filters, limit: filters.limit || 1000 });
  const dailyCosts = useDailyCosts(30, filters.startDate, filters.endDate, filters.provider);

  const isLoading = summary.loading || records.loading || dailyCosts.loading;
  const hasError = summary.error || records.error || dailyCosts.error;

  // Get the most recent update time from all queries
  const lastUpdatedAt = Math.max(
    summary.dataUpdatedAt || 0,
    records.dataUpdatedAt || 0,
    dailyCosts.dataUpdatedAt || 0
  );

  return {
    summary: summary.data,
    records: records.data,
    recordCount: records.count,
    totalRecordCount: records.totalCount,
    dailyCosts: dailyCosts.data,
    isLoading,
    error: hasError ? (summary.error || records.error || dailyCosts.error) : null,
    lastUpdatedAt: lastUpdatedAt ? new Date(lastUpdatedAt) : null,
    refetch: () => {
      summary.refetch();
      records.refetch();
      dailyCosts.refetch();
    }
  };
};
