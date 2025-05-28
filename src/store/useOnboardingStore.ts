import { create } from 'zustand';
import {
  getOnboardingStatus,
  updateOnboardingStatus,
} from '../services/api/onboardingService';
import { logger } from '../services/LoggingService';

export enum OnboardingStatus {
  CREATED = 'created',
  API_KEY_REQUIRED = 'api_key_required',
  READY_FOR_ASSISTANTS = 'ready_for_assistants',
  USING_BASIC_FEATURES = 'using_basic_features',
  ADVANCED_USER = 'advanced_user',
  EXPERT_USER = 'expert_user'
}

interface OnboardingStoreState {
  onboardingStatus: OnboardingStatus;
  onboardedModules: string[];
  isLoading: boolean;
  
  // Actions
  loadOnboardingStatus: () => Promise<void>;
  updateStatus: (status: OnboardingStatus) => Promise<void>;
  updateOnboardingStatus: (status: OnboardingStatus) => Promise<void>;
  addOnboardedModule: (module: string) => void;
  isModuleOnboarded: (module: string) => boolean;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStoreState>((set, get) => ({
  onboardingStatus: OnboardingStatus.CREATED,
  onboardedModules: [],
  isLoading: false,
  
  loadOnboardingStatus: async () => {
    set({ isLoading: true });
    try {
      const response = await getOnboardingStatus();
      set({ 
        onboardingStatus: response.status || OnboardingStatus.CREATED,
        onboardedModules: response.onboardedModules || [],
        isLoading: false 
      });
    } catch (error) {
      logger.error('Failed to load onboarding status', error);
      set({ isLoading: false });
      // Don't throw - allow app to continue with default status
    }
  },
  
  updateStatus: async (status) => {
    const previousStatus = get().onboardingStatus;
    
    // Optimistic update
    set({ onboardingStatus: status });
    
    try {
      await updateOnboardingStatus();
    } catch (error) {
      logger.error('Failed to update onboarding status', error);
      // Rollback on error
      set({ onboardingStatus: previousStatus });
      throw error;
    }
  },

  updateOnboardingStatus: async (status) => {
    const previousStatus = get().onboardingStatus;
    
    // Optimistic update
    set({ onboardingStatus: status });
    
    try {
      await updateOnboardingStatus();
    } catch (error) {
      logger.error('Failed to update onboarding status', error);
      // Rollback on error
      set({ onboardingStatus: previousStatus });
      throw error;
    }
  },
  
  addOnboardedModule: (module) => {
    set(state => ({
      onboardedModules: state.onboardedModules.includes(module) 
        ? state.onboardedModules 
        : [...state.onboardedModules, module]
    }));
  },
  
  isModuleOnboarded: (module) => {
    return get().onboardedModules.includes(module);
  },
  
  resetOnboarding: () => {
    set({
      onboardingStatus: OnboardingStatus.CREATED,
      onboardedModules: [],
    });
  },
}));
