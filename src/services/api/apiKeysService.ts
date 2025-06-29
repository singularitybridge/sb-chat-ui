import apiClient from '../AxiosService';
import { singleFlight, clearSingleFlightCache } from '../../utils/singleFlight';

interface CreateApiKeyRequest {
  name: string;
  expiresInDays?: number;
  permissions?: string[];
}

interface ApiKeyResponse {
  id: string;
  name: string;
  key?: string; // Only present in create response
  permissions: string[];
  expiresAt: string;
  createdAt: string;
}

interface CreateApiKeyResponse {
  message: string;
  apiKey: ApiKeyResponse;
}

interface ListApiKeysResponse {
  apiKeys: ApiKeyResponse[];
}

class ApiKeysService {
  private basePath = '/api/keys';

  async createApiKey(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    const response = await apiClient.post<CreateApiKeyResponse>(this.basePath, data);
    return response.data;
  }

  async listApiKeys(): Promise<ListApiKeysResponse> {
    const cacheKey = `apiKeys-list`;
    return singleFlight(
      cacheKey,
      async () => {
        const response = await apiClient.get<ListApiKeysResponse>(this.basePath);
        return response.data;
      },
      5 * 60 * 1000 // 5 minute cache
    );
  }

  async revokeApiKey(keyId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`${this.basePath}/${keyId}`);
    // Clear the list cache when a key is revoked
    clearSingleFlightCache('apiKeys-list');
    return response.data;
  }

  async verifyApiKey(apiKey: string): Promise<any> {
    const response = await apiClient.post('/auth/verify-token', {}, {
      headers: {
        Authorization: `Bearer ${apiKey}`
      }
    });
    return response.data;
  }
}

export const apiKeysService = new ApiKeysService();