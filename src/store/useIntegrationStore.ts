import { create } from 'zustand';
import {
  getIntegrationsWithConfig,
  saveIntegrationConfig,
  deleteIntegrationConfig,
  IntegrationWithConfig,
  ApiKeyInput,
} from '../services/api/integrationConfigService';
import { logger } from '../services/LoggingService';

interface IntegrationStoreState {
  integrations: IntegrationWithConfig[];
  integrationsLoaded: boolean;
  isLoading: boolean;
  searchQuery: string;
  selectedCategory: string | null;

  // Actions
  loadIntegrations: () => Promise<void>;
  saveConfig: (
    integrationId: string,
    apiKeys: ApiKeyInput[]
  ) => Promise<void>;
  deleteConfig: (integrationId: string) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string | null) => void;

  // Getters
  getIntegrationById: (id: string) => IntegrationWithConfig | undefined;
  getFilteredIntegrations: () => IntegrationWithConfig[];
  getCategories: () => string[];
  getConfiguredIntegrations: () => IntegrationWithConfig[];
  getIntegrationsRequiringConfig: () => IntegrationWithConfig[];
}

export const useIntegrationStore = create<IntegrationStoreState>((set, get) => ({
  integrations: [],
  integrationsLoaded: false,
  isLoading: false,
  searchQuery: '',
  selectedCategory: null,

  loadIntegrations: async () => {
    set({ isLoading: true });
    try {
      const integrations = await getIntegrationsWithConfig();
      set({
        integrations: integrations || [],
        integrationsLoaded: true,
        isLoading: false,
      });
    } catch (error) {
      logger.error('Failed to load integrations', error);
      set({ integrationsLoaded: true, isLoading: false });
      throw error;
    }
  },

  saveConfig: async (integrationId, apiKeys) => {
    set({ isLoading: true });
    try {
      const response = await saveIntegrationConfig(integrationId, apiKeys);

      // Update the integration in the store
      set((state) => ({
        integrations: state.integrations.map((integration) =>
          integration.id === integrationId
            ? {
                ...integration,
                configured: response.configured,
                enabled: response.enabled,
                configuredAt: response.configuredAt,
                configuredKeys: response.configuredKeys,
              }
            : integration
        ),
        isLoading: false,
      }));
    } catch (error) {
      logger.error(`Failed to save config for ${integrationId}`, error);
      set({ isLoading: false });
      throw error;
    }
  },

  deleteConfig: async (integrationId) => {
    set({ isLoading: true });
    try {
      await deleteIntegrationConfig(integrationId);

      // Update the integration in the store
      set((state) => ({
        integrations: state.integrations.map((integration) =>
          integration.id === integrationId
            ? {
                ...integration,
                configured: false,
                enabled: false,
                configuredAt: undefined,
                configuredKeys: [],
              }
            : integration
        ),
        isLoading: false,
      }));
    } catch (error) {
      logger.error(`Failed to delete config for ${integrationId}`, error);
      set({ isLoading: false });
      throw error;
    }
  },

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSelectedCategory: (category) => set({ selectedCategory: category }),

  getIntegrationById: (id) => {
    return get().integrations.find((i) => i.id === id);
  },

  getFilteredIntegrations: () => {
    const { integrations, searchQuery, selectedCategory } = get();

    return integrations.filter((integration) => {
      // Filter out internal integrations by default
      if (integration.category === 'internal') {
        return false;
      }

      // Filter by search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = integration.name.toLowerCase().includes(query);
        const matchesDescription = integration.description
          .toLowerCase()
          .includes(query);
        if (!matchesName && !matchesDescription) {
          return false;
        }
      }

      // Filter by category
      if (selectedCategory && integration.category !== selectedCategory) {
        return false;
      }

      return true;
    });
  },

  getCategories: () => {
    const { integrations } = get();
    const categories = new Set<string>();

    integrations.forEach((integration) => {
      if (integration.category && integration.category !== 'internal') {
        categories.add(integration.category);
      }
    });

    return Array.from(categories).sort();
  },

  getConfiguredIntegrations: () => {
    return get().integrations.filter(
      (i) => i.configured && i.category !== 'internal'
    );
  },

  getIntegrationsRequiringConfig: () => {
    return get().integrations.filter(
      (i) =>
        i.requiredApiKeys &&
        i.requiredApiKeys.length > 0 &&
        i.category !== 'internal'
    );
  },
}));
