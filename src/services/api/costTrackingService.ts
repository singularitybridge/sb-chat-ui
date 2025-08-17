import axios from 'axios';
import { singleFlight } from '../../utils/singleFlight';
import {
  CostRecord,
  CostSummary,
  DailyCost,
  CostFilters,
  AssistantCostData,
  ModelCostData,
  ApiResponse
} from '../../types/costTracking';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout
      console.error('Unauthorized access to cost tracking API');
    }
    return Promise.reject(error);
  }
);

// API Service Functions

/**
 * Get cost summary with aggregated data
 */
export const getCostSummary = async (startDate?: string, endDate?: string): Promise<CostSummary> => {
  const key = `cost-summary-${startDate || 'all'}-${endDate || 'all'}`;
  
  return singleFlight(
    key,
    async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await api.get<ApiResponse<CostSummary>>('/api/costs/summary', { params });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch cost summary');
      }
      
      return response.data.data;
    }
  );
};

/**
 * Get detailed cost records with filtering
 */
export const getCostRecords = async (filters: CostFilters = {}): Promise<{ records: CostRecord[]; count: number }> => {
  const response = await api.get<ApiResponse<CostRecord[]>>('/api/costs', { params: filters });
  
  if (!response.data.success || !response.data.data) {
    throw new Error(response.data.error || 'Failed to fetch cost records');
  }
  
  return {
    records: response.data.data,
    count: response.data.count || response.data.data.length
  };
};

/**
 * Get daily cost trend data
 */
export const getDailyCosts = async (days: number = 30): Promise<DailyCost[]> => {
  const key = `daily-costs-${days}`;
  
  return singleFlight(
    key,
    async () => {
      const response = await api.get<ApiResponse<DailyCost[]>>('/api/costs/daily', {
        params: { days }
      });
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch daily costs');
      }
      
      return response.data.data;
    }
  );
};

/**
 * Get costs by specific assistant
 */
export const getCostsByAssistant = async (
  assistantId: string,
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<AssistantCostData> => {
  const key = `assistant-costs-${assistantId}-${startDate || 'all'}-${endDate || 'all'}`;
  
  return singleFlight(
    key,
    async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (limit) params.limit = limit;

      const response = await api.get<ApiResponse<AssistantCostData>>(
        `/api/costs/by-assistant/${assistantId}`,
        { params }
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch assistant costs');
      }
      
      return response.data.data;
    }
  );
};

/**
 * Get costs by specific model
 */
export const getCostsByModel = async (
  model: string,
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<ModelCostData> => {
  const key = `model-costs-${model}-${startDate || 'all'}-${endDate || 'all'}`;
  
  return singleFlight(
    key,
    async () => {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (limit) params.limit = limit;

      const response = await api.get<ApiResponse<ModelCostData>>(
        `/api/costs/by-model/${encodeURIComponent(model)}`,
        { params }
      );
      
      if (!response.data.success || !response.data.data) {
        throw new Error(response.data.error || 'Failed to fetch model costs');
      }
      
      return response.data.data;
    }
  );
};

// Utility functions for formatting
export const formatCost = (cost: number): string => {
  if (cost < 0.01) {
    return `$${cost.toFixed(6)}`;
  } else if (cost < 1) {
    return `$${cost.toFixed(4)}`;
  } else {
    return `$${cost.toFixed(2)}`;
  }
};

export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
};

export const formatTokens = (tokens: number): string => {
  if (tokens < 1000) return tokens.toString();
  if (tokens < 1000000) return `${(tokens / 1000).toFixed(1)}K`;
  return `${(tokens / 1000000).toFixed(2)}M`;
};

// Export everything as a service object for convenience
const costTrackingService = {
  getCostSummary,
  getCostRecords,
  getDailyCosts,
  getCostsByAssistant,
  getCostsByModel,
  formatCost,
  formatDuration,
  formatTokens
};

export default costTrackingService;