// Cost Tracking TypeScript Interfaces

export interface CostRecord {
  _id: string;
  companyId: string;
  assistantId: string;
  assistantName?: string;
  sessionId?: string;
  userId: string;
  provider: 'openai' | 'anthropic' | 'google';
  modelName: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputCost: number;
  outputCost: number;
  totalCost: number;
  duration: number; // milliseconds
  toolCalls: number;
  cached: boolean;
  requestType: 'streaming' | 'non-streaming' | 'stateless';
  timestamp: string; // ISO date
  createdAt: string;
  updatedAt: string;
}

export interface CostSummary {
  totalCost: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalRequests: number;
  averageDuration: number; // milliseconds
  byModel: {
    [modelName: string]: {
      cost: number;
      requests: number;
      tokens: number;
    };
  };
  byProvider: {
    [provider: string]: {
      cost: number;
      requests: number;
      tokens: number;
    };
  };
  byAssistant: Array<{
    assistantId: string;
    assistantName?: string;
    cost: number;
    requests: number;
    tokens: number;
  }>;
}

export interface DailyCost {
  date: string; // YYYY-MM-DD format
  cost: number;
  requests: number;
  tokens: number;
}

export interface CostFilters {
  provider?: string;
  model?: string;
  assistantId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  skip?: number;
}

export interface AssistantCostData {
  records: CostRecord[];
  summary: {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    averageCost: number;
  };
}

export interface ModelCostData {
  records: CostRecord[];
  summary: {
    totalCost: number;
    totalTokens: number;
    totalRequests: number;
    averageCost: number;
  };
}

// UI State Types
export interface CostTrackingState {
  // Data
  summary: CostSummary | null;
  records: CostRecord[];
  dailyCosts: DailyCost[];
  
  // UI State
  selectedTab: 'overview' | 'assistants' | 'models' | 'trends' | 'details';
  dateRange: { start: Date | null; end: Date | null };
  filters: CostFilters;
  
  // Loading & Error
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}