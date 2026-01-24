import apiClient from '../AxiosService';
import { singleFlight } from '../../utils/singleFlight';
import { logger } from '../LoggingService';

/**
 * Required API key definition from integration config
 */
export interface RequiredApiKey {
  key: string;
  label: string;
  type: 'secret' | 'text';
  placeholder?: string;
  description?: string;
  helpUrl?: string;
}

/**
 * Integration with config status
 */
export interface IntegrationWithConfig {
  id: string;
  name: string;
  displayName?: string;
  description: string;
  icon: string;
  category?: string;
  requiredApiKeys?: RequiredApiKey[];
  configured: boolean;
  enabled: boolean;
  configuredAt?: string;
  configuredKeys: string[];
  actions: Array<{
    id: string;
    serviceName: string;
    actionTitle: string;
    description: string;
    icon: string;
    service: string;
  }>;
}

/**
 * API key input for saving
 */
export interface ApiKeyInput {
  key: string;
  value: string;
}

/**
 * Config save response
 */
export interface IntegrationConfigResponse {
  integrationId: string;
  configured: boolean;
  enabled: boolean;
  configuredAt?: string;
  configuredKeys: string[];
}

/**
 * Get all integrations with their config status
 */
export const getIntegrationsWithConfig = (): Promise<IntegrationWithConfig[]> => {
  return singleFlight('integrations:configs', async () => {
    try {
      const response = await apiClient.get<IntegrationWithConfig[]>(
        '/integrations/configs'
      );
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch integrations with config', error);
      throw error;
    }
  });
};

/**
 * Get config for a specific integration
 */
export const getIntegrationConfig = async (
  integrationId: string
): Promise<IntegrationConfigResponse> => {
  try {
    const response = await apiClient.get<IntegrationConfigResponse>(
      `/integrations/${integrationId}/config`
    );
    return response.data;
  } catch (error) {
    logger.error(`Failed to fetch config for ${integrationId}`, error);
    throw error;
  }
};

/**
 * Save API keys for an integration
 */
export const saveIntegrationConfig = async (
  integrationId: string,
  apiKeys: ApiKeyInput[]
): Promise<IntegrationConfigResponse> => {
  try {
    const response = await apiClient.put<IntegrationConfigResponse>(
      `/integrations/${integrationId}/config`,
      { apiKeys }
    );
    return response.data;
  } catch (error) {
    logger.error(`Failed to save config for ${integrationId}`, error);
    throw error;
  }
};

/**
 * Delete config for an integration
 */
export const deleteIntegrationConfig = async (
  integrationId: string
): Promise<void> => {
  try {
    await apiClient.delete(`/integrations/${integrationId}/config`);
  } catch (error) {
    logger.error(`Failed to delete config for ${integrationId}`, error);
    throw error;
  }
};

/**
 * Get a specific API key value (decrypted)
 */
export const getApiKeyValue = async (
  integrationId: string,
  keyName: string
): Promise<string> => {
  try {
    const response = await apiClient.get<{ key: string; value: string }>(
      `/integrations/${integrationId}/config/keys/${keyName}`
    );
    return response.data.value;
  } catch (error) {
    logger.error(`Failed to fetch API key ${keyName} for ${integrationId}`, error);
    throw error;
  }
};

/**
 * Test connection result
 */
export interface TestConnectionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Test integration connection
 * @param integrationId - Integration ID
 * @param apiKeys - Optional API keys to test with (for testing unsaved values)
 */
export const testIntegrationConnection = async (
  integrationId: string,
  apiKeys?: ApiKeyInput[]
): Promise<TestConnectionResult> => {
  try {
    const response = await apiClient.post<TestConnectionResult>(
      `/integrations/${integrationId}/test`,
      { apiKeys }
    );
    return response.data;
  } catch (error: any) {
    // Handle API error responses
    if (error.response?.data) {
      return {
        success: false,
        error: error.response.data.error || 'Connection test failed',
      };
    }
    logger.error(`Failed to test connection for ${integrationId}`, error);
    return {
      success: false,
      error: 'Failed to test connection',
    };
  }
};
