import apiClient from '../AxiosService';

export interface EnrichedSession {
  sessionId: string;
  agentId: string;
  agentName: string;
  active: boolean;
  channel: string;
  channelUserId: string;
  messageCount: number;
  lastMessageAt: string | null;
  createdAt: string;
}

export interface SessionListResponse {
  sessions: EnrichedSession[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface SessionListFilters {
  agentId?: string;
  status?: 'active' | 'inactive';
  channel?: string;
  channelUserId?: string;
  limit?: number;
  offset?: number;
}

export const getSessionsList = async (filters: SessionListFilters): Promise<SessionListResponse> => {
  const params = new URLSearchParams();
  if (filters.agentId) params.set('agentId', filters.agentId);
  if (filters.status) params.set('status', filters.status);
  if (filters.channel) params.set('channel', filters.channel);
  if (filters.channelUserId) params.set('channelUserId', filters.channelUserId);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.offset) params.set('offset', String(filters.offset));

  const response = await apiClient.get(`session?${params.toString()}`);
  return response.data;
};

export const getSessionReviewMessages = async (sessionId: string, limit = 100): Promise<any[]> => {
  const response = await apiClient.get(`session/${sessionId}/messages?limit=${limit}&offset=0`);
  // Backend returns { messages, total } when limit is provided
  return response.data.messages || response.data;
};
