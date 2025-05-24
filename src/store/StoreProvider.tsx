import React, { useEffect } from 'react';
import { useAuthStore } from './useAuthStore';
import { useAIAssistedStore } from './useAIAssistedStore';
import { useLanguageStore } from './useLanguageStore';
import { useCompanyStore } from './useCompanyStore';
import { useUserStore } from './useUserStore';
import { useAssistantStore } from './useAssistantStore';
import { useTeamStore } from './useTeamStore';
import { useInboxStore } from './useInboxStore';
import { useOnboardingStore } from './useOnboardingStore';
import { useSessionStore } from './useSessionStore';

interface StoreProviderProps {
  children: React.ReactNode;
}

/**
 * StoreProvider initializes all Zustand stores and handles initial data loading.
 * This replaces the MobX RootStore initialization.
 */
export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  // Initialize non-auth dependent stores on mount
  useEffect(() => {
    const initializeStores = () => {
      // Initialize AI Assisted configs
      useAIAssistedStore.getState().initialize();
      
      // Initialize language
      useLanguageStore.getState().initializeLanguage();
    };
    
    initializeStores();
  }, []);

  return <>{children}</>;
};

/**
 * Hook to access all stores - provides a migration path from useRootStore
 * This can be used during the transition period to access Zustand stores
 * in a similar way to how RootStore was accessed.
 */
export const useStores = () => {
  return {
    authStore: useAuthStore(),
    aiAssistedStore: useAIAssistedStore(),
    languageStore: useLanguageStore(),
    companyStore: useCompanyStore(),
    userStore: useUserStore(),
    assistantStore: useAssistantStore(),
    teamStore: useTeamStore(),
    inboxStore: useInboxStore(),
    onboardingStore: useOnboardingStore(),
    sessionStore: useSessionStore(),
    
    // Compatibility getters for easier migration
    get language() { return useLanguageStore.getState().language; },
    get assistantsLoaded() { return useAssistantStore.getState().assistantsLoaded; },
    get isAuthenticated() { return useAuthStore.getState().isAuthenticated; },
    getAssistantById: (id: string) => useAssistantStore.getState().getAssistantById(id),
  };
};