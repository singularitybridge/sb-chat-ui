import { create } from 'zustand';
import {
  getFriendlyJournalEntries,
  searchJournalEntries,
  // createJournalEntry, // For future use
  // updateJournalEntry, // For future use
  // deleteJournalEntry, // For future use
} from '../services/api/memoryService';
import { IJournalEntry } from './models/JournalEntry';
import { logger } from '../services/LoggingService';
import { useAuthStore } from './useAuthStore'; // To get userId and companyId

interface MemoryFilters {
  entryType?: string; // Changed from JournalEntryType
  tags?: string[];
  scope?: 'user' | 'company';
  searchTerm?: string;
}

interface MemoryStoreState {
  entries: IJournalEntry[];
  entriesLoaded: boolean;
  isLoading: boolean;
  filters: MemoryFilters;
  error: string | null;

  // Actions
  loadEntries: (overrideFilters?: Partial<MemoryFilters>) => Promise<void>;
  setFilters: (newFilters: Partial<MemoryFilters>) => void;
  clearError: () => void;
}

export const useMemoryStore = create<MemoryStoreState>((set, get) => ({
  entries: [],
  entriesLoaded: false,
  isLoading: false,
  filters: {
    scope: 'user', // Default scope
  },
  error: null,

  loadEntries: async (overrideFilters?: Partial<MemoryFilters>) => {
    // console.log('[useMemoryStore] loadEntries called. OverrideFilters:', overrideFilters); // DEBUG LOG Removed
    set({ isLoading: true, error: null });
    const { isUserDataLoaded } = useAuthStore.getState(); // Simplified destructuring
    
    // Second console.log removed.
    
    // Double check if user data is actually loaded, even if MemoryPage checks it.
    // if (!isUserDataLoaded || !userSessionInfo.userId || !userSessionInfo.companyId) { // Original problematic guard
    //   logger.error('User ID or Company ID is missing for loading journal entries.', { isUserDataLoaded, userId: userSessionInfo.userId, companyId: userSessionInfo.companyId });
    //   set({ isLoading: false, error: 'User or company information is missing.' });
    //   return;
    // }

    // Fallback check, ensure isUserDataLoaded is true before proceeding,
    // as this is the minimum requirement for the token to be likely available.
    if (!isUserDataLoaded) {
        logger.warn('User data not loaded (isUserDataLoaded is false). Skipping loadEntries to prevent API calls without auth context.', { isUserDataLoaded });
        set({ isLoading: false, error: 'Authentication data not yet loaded. Please ensure you are logged in.' });
        return;
    }
    
    const currentFilters = { ...get().filters, ...overrideFilters };
    
    try {
      let fetchedEntries: IJournalEntry[];
      if (currentFilters.searchTerm && currentFilters.searchTerm.trim() !== '') {
        // For search, companyId and userId are optional and default on backend.
        // If scope is 'user', ideally we'd pass userId, but if not available from authStore,
        // we can't. Search might become company-wide or user-specific based on backend interpretation of missing userId.
        fetchedEntries = await searchJournalEntries({
          q: currentFilters.searchTerm,
          // companyId: userSessionInfo.companyId, // Omit, let backend default
          // userId: currentFilters.scope === 'user' ? userSessionInfo.userId : undefined, // Omit if not reliably available
          entryType: currentFilters.entryType,
          tags: currentFilters.tags,
          limit: 50, // Default limit for search
        });
      } else {
        // For getFriendlyJournalEntries, userId and companyId are optional and default on backend.
        // The 'scope' parameter is what the backend should use to determine user vs company.
        fetchedEntries = await getFriendlyJournalEntries({
          // userId: userSessionInfo.userId, // Omit, let backend default based on token/scope
          // companyId: userSessionInfo.companyId, // Omit, let backend default
          entryType: currentFilters.entryType,
          tags: currentFilters.tags,
          scope: currentFilters.scope, // This parameter should guide the backend
          limit: 50, // Default limit
        });
      }
      set({
        entries: fetchedEntries || [],
        entriesLoaded: true,
        isLoading: false,
        filters: currentFilters, // Persist applied filters
      });
    } catch (error) {
      const errorMessage = 'Failed to load journal entries';
      logger.error(errorMessage, error);
      set({ entriesLoaded: true, isLoading: false, error: errorMessage });
      // throw error; // Decide if re-throwing is needed for UI
    }
  },

  setFilters: (newFilters: Partial<MemoryFilters>) => {
    const currentFilters = get().filters;
    const updatedFilters = { ...currentFilters, ...newFilters };
    set({ filters: updatedFilters });
    // Optionally, trigger a reload if filters change significantly
    // get().loadEntries(updatedFilters); 
  },

  clearError: () => {
    set({ error: null });
  },
}));
