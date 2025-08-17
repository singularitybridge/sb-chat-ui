import { useState, useEffect, useCallback } from 'react';
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

// Hook for fetching cost summary
export const useCostSummary = (startDate?: string, endDate?: string) => {
  const [data, setData] = useState<CostSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await getCostSummary(startDate, endDate);
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cost summary');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for fetching cost records with pagination
export const useCostRecords = (filters: CostFilters = {}) => {
  const [data, setData] = useState<CostRecord[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCostRecords(filters);
      setData(result.records);
      setCount(result.count);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch cost records');
      setData([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]); // Stringify to compare object contents

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, count, loading, error, refetch: fetchData };
};

// Hook for fetching daily cost trends
export const useDailyCosts = (days: number = 30) => {
  const [data, setData] = useState<DailyCost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const dailyCosts = await getDailyCosts(days);
      setData(dailyCosts);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch daily costs');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for fetching assistant-specific costs
export const useAssistantCosts = (
  assistantId: string | null,
  startDate?: string,
  endDate?: string,
  limit?: number
) => {
  const [data, setData] = useState<AssistantCostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!assistantId) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const assistantData = await getCostsByAssistant(assistantId, startDate, endDate, limit);
      setData(assistantData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch assistant costs');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [assistantId, startDate, endDate, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for fetching model-specific costs
export const useModelCosts = (
  model: string | null,
  startDate?: string,
  endDate?: string,
  limit?: number
) => {
  const [data, setData] = useState<ModelCostData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!model) {
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const modelData = await getCostsByModel(model, startDate, endDate, limit);
      setData(modelData);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch model costs');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [model, startDate, endDate, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
};

// Hook for real-time cost updates (placeholder for WebSocket implementation)
export const useRealtimeCosts = (enabled: boolean = true) => {
  const [latestCost, setLatestCost] = useState<CostRecord | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // TODO: Implement WebSocket connection for real-time updates
    // This is a placeholder for the actual implementation
    setConnected(true);

    return () => {
      setConnected(false);
    };
  }, [enabled]);

  return { latestCost, connected };
};

// Combined hook for complete cost dashboard data
export const useCostDashboard = (filters: CostFilters = {}) => {
  const summary = useCostSummary(filters.startDate, filters.endDate);
  const records = useCostRecords({ ...filters, limit: filters.limit || 100 });
  const dailyCosts = useDailyCosts(30);
  const realtime = useRealtimeCosts();

  const isLoading = summary.loading || records.loading || dailyCosts.loading;
  const hasError = summary.error || records.error || dailyCosts.error;

  return {
    summary: summary.data,
    records: records.data,
    recordCount: records.count,
    dailyCosts: dailyCosts.data,
    latestCost: realtime.latestCost,
    isLoading,
    error: hasError ? (summary.error || records.error || dailyCosts.error) : null,
    refetch: () => {
      summary.refetch();
      records.refetch();
      dailyCosts.refetch();
    }
  };
};