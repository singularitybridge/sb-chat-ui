import { create } from 'zustand';
import {
  getAssistants,
  addAssistant,
  updateAssistant,
  deleteAssistant,
} from '../services/api/assistantService';
import { IAssistant, ConversationStarter } from '../types/entities';
import { logger } from '../services/LoggingService';

// Re-export types for convenience
export type { ConversationStarter };
export type Assistant = IAssistant;

interface AssistantStoreState {
  assistants: Assistant[];
  assistantsLoaded: boolean;
  isLoading: boolean;
  
  // Actions
  loadAssistants: () => Promise<void>;
  addAssistant: (assistantData: Partial<Assistant>) => Promise<Assistant>;
  updateAssistant: (assistantId: string, updates: Partial<Assistant>) => Promise<void>;
  deleteAssistant: (assistantId: string) => Promise<void>;
  
  // Getters
  getAssistantById: (id: string) => Assistant | undefined;
  getAssistantsByTeam: (teamId: string) => Assistant[];
  getAssistantsByAction: (actionId: string) => Assistant[];
}

export const useAssistantStore = create<AssistantStoreState>((set, get) => ({
  assistants: [],
  assistantsLoaded: false,
  isLoading: false,
  
  loadAssistants: async () => {
    set({ isLoading: true });
    try {
      const assistants = await getAssistants();
      set({ 
        assistants: assistants || [], 
        assistantsLoaded: true,
        isLoading: false 
      });
    } catch (error) {
      logger.error('Failed to load assistants', error);
      set({ assistantsLoaded: true, isLoading: false });
      throw error;
    }
  },
  
  addAssistant: async (assistantData) => {
    set({ isLoading: true });
    try {
      // Convert partial data to required format for API
      const dataForAPI = assistantData as IAssistant;
      const newAssistant = await addAssistant(dataForAPI);
      set(state => ({
        assistants: [...state.assistants, newAssistant],
        isLoading: false
      }));
      return newAssistant;
    } catch (error) {
      logger.error('Failed to add assistant', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  updateAssistant: async (assistantId, updates) => {
    // Optimistic update
    const previousAssistant = get().assistants.find(a => a._id === assistantId);
    if (previousAssistant) {
      set(state => ({
        assistants: state.assistants.map(a => 
          a._id === assistantId ? { ...a, ...updates } : a
        )
      }));
    }
    
    set({ isLoading: true });
    try {
      // Convert partial updates to required format for API
      const updatesForAPI = updates as IAssistant & { voice?: string };
      const updatedAssistant = await updateAssistant(assistantId, updatesForAPI);
      set(state => ({
        assistants: state.assistants.map(a => 
          a._id === assistantId ? updatedAssistant : a
        ),
        isLoading: false
      }));
    } catch (error) {
      logger.error('Failed to update assistant', error);
      // Rollback on error
      if (previousAssistant) {
        set(state => ({
          assistants: state.assistants.map(a => 
            a._id === assistantId ? previousAssistant : a
          ),
          isLoading: false
        }));
      }
      throw error;
    }
  },
  
  deleteAssistant: async (assistantId) => {
    set({ isLoading: true });
    try {
      await deleteAssistant(assistantId);
      set(state => ({
        assistants: state.assistants.filter(a => a._id !== assistantId),
        isLoading: false
      }));
    } catch (error) {
      logger.error('Failed to delete assistant', error);
      set({ isLoading: false });
      throw error;
    }
  },
  
  getAssistantById: (identifier) => {
    // First try to find by name if the identifier doesn't look like an ObjectID
    const isObjectId = /^[a-f\d]{24}$/i.test(identifier);
    
    if (!isObjectId) {
      // Try to find by name first (for URL routing)
      const byName = get().assistants.find(a => a.name === identifier);
      if (byName) return byName;
    }
    
    // Fallback to finding by _id (works for both ObjectIDs and as a fallback)
    return get().assistants.find(a => a._id === identifier);
  },
  
  getAssistantsByTeam: (teamId) => {
    return get().assistants.filter(a => a.teams.includes(teamId));
  },
  
  getAssistantsByAction: (actionId) => {
    return get().assistants.filter(a => a.allowedActions.includes(actionId));
  },
}));
