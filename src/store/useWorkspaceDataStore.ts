import { create } from 'zustand';

/**
 * Data state for a specific dataKey
 */
export interface DataState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  timestamp: number;
  source?: string; // Which agent/component created this data
}

/**
 * Subscription callback type
 */
export type DataSubscription = (data: DataState) => void;

/**
 * Workspace context information
 */
export interface WorkspaceContext {
  currentFile: string | null;
  agentId: string | null;
  agentName: string | null;
  sessionId: string | null;
  userId: string | null;
  userName: string | null;
}

/**
 * Store state interface
 */
interface WorkspaceDataState {
  // Data storage indexed by dataKey
  dataStore: Record<string, DataState>;

  // Subscriptions indexed by dataKey
  subscriptions: Record<string, Set<DataSubscription>>;

  // Workspace context
  context: WorkspaceContext;

  // Actions
  setData: (key: string, data: any, source?: string) => void;
  getData: (key: string) => DataState | null;
  setLoading: (key: string, loading: boolean) => void;
  setError: (key: string, error: string | null) => void;
  clearData: (key: string) => void;
  clearAll: () => void;

  // Subscription management
  subscribe: (key: string, callback: DataSubscription) => () => void;
  notifySubscribers: (key: string) => void;

  // Context management
  setContext: (context: Partial<WorkspaceContext>) => void;
  getContext: () => WorkspaceContext;
}

/**
 * Workspace Data Store
 *
 * Reactive data store for workspace components.
 * Supports data binding, subscriptions, and multi-agent orchestration.
 *
 * Usage:
 * ```tsx
 * const { setData, getData, subscribe } = useWorkspaceDataStore();
 *
 * // Store data
 * setData('product_search', { products: [...] }, 'search-agent');
 *
 * // Get data
 * const state = getData('product_search');
 *
 * // Subscribe to changes
 * const unsubscribe = subscribe('product_search', (data) => {
 *   console.log('Data updated:', data);
 * });
 * ```
 */
export const useWorkspaceDataStore = create<WorkspaceDataState>((set, get) => ({
  dataStore: {},
  subscriptions: {},
  context: {
    currentFile: null,
    agentId: null,
    agentName: null,
    sessionId: null,
    userId: null,
    userName: null,
  },

  setData: (key: string, data: any, source?: string) => {
    set((state) => ({
      dataStore: {
        ...state.dataStore,
        [key]: {
          data,
          loading: false,
          error: null,
          timestamp: Date.now(),
          source,
        },
      },
    }));

    // Notify subscribers
    get().notifySubscribers(key);

    console.log(`📊 [WorkspaceDataStore] Data set for key "${key}":`, data);
  },

  getData: (key: string) => {
    return get().dataStore[key] || null;
  },

  setLoading: (key: string, loading: boolean) => {
    set((state) => ({
      dataStore: {
        ...state.dataStore,
        [key]: {
          ...(state.dataStore[key] || { data: null, error: null, timestamp: Date.now() }),
          loading,
        },
      },
    }));

    // Notify subscribers of loading state change
    get().notifySubscribers(key);
  },

  setError: (key: string, error: string | null) => {
    set((state) => ({
      dataStore: {
        ...state.dataStore,
        [key]: {
          ...(state.dataStore[key] || { data: null, loading: false, timestamp: Date.now() }),
          error,
        },
      },
    }));

    // Notify subscribers of error
    get().notifySubscribers(key);

    if (error) {
      console.error(`❌ [WorkspaceDataStore] Error for key "${key}":`, error);
    }
  },

  clearData: (key: string) => {
    set((state) => {
      const newStore = { ...state.dataStore };
      delete newStore[key];
      return { dataStore: newStore };
    });

    console.log(`🗑️ [WorkspaceDataStore] Cleared data for key "${key}"`);
  },

  clearAll: () => {
    set({ dataStore: {}, subscriptions: {} });
    console.log('🗑️ [WorkspaceDataStore] Cleared all data');
  },

  subscribe: (key: string, callback: DataSubscription) => {
    set((state) => {
      const subs = state.subscriptions[key] || new Set();
      subs.add(callback);
      return {
        subscriptions: {
          ...state.subscriptions,
          [key]: subs,
        },
      };
    });

    console.log(`🔔 [WorkspaceDataStore] Subscription added for key "${key}"`);

    // Return unsubscribe function
    return () => {
      set((state) => {
        const subs = state.subscriptions[key];
        if (subs) {
          subs.delete(callback);
          if (subs.size === 0) {
            const newSubs = { ...state.subscriptions };
            delete newSubs[key];
            return { subscriptions: newSubs };
          }
        }
        return state;
      });

      console.log(`🔕 [WorkspaceDataStore] Subscription removed for key "${key}"`);
    };
  },

  notifySubscribers: (key: string) => {
    const state = get();
    const subs = state.subscriptions[key];
    const dataState = state.dataStore[key];

    if (subs && subs.size > 0 && dataState) {
      console.log(`📢 [WorkspaceDataStore] Notifying ${subs.size} subscribers for key "${key}"`);
      subs.forEach((callback) => {
        try {
          callback(dataState);
        } catch (error) {
          console.error(`❌ [WorkspaceDataStore] Subscription callback error for key "${key}":`, error);
        }
      });
    }
  },

  setContext: (context: Partial<WorkspaceContext>) => {
    set((state) => ({
      context: {
        ...state.context,
        ...context,
      },
    }));

    console.log('🌐 [WorkspaceDataStore] Context updated:', context);
  },

  getContext: () => {
    return get().context;
  },
}));

/**
 * React hook to subscribe to a specific dataKey
 *
 * Usage:
 * ```tsx
 * const { data, loading, error } = useWorkspaceData('product_search');
 * ```
 */
export function useWorkspaceData(dataKey: string): DataState {
  const dataState = useWorkspaceDataStore((state) => state.dataStore[dataKey]);

  return dataState || {
    data: null,
    loading: false,
    error: null,
    timestamp: 0,
  };
}

/**
 * React hook to get workspace context
 *
 * Usage:
 * ```tsx
 * const context = useWorkspaceContext();
 * console.log('Current file:', context.currentFile);
 * ```
 */
export function useWorkspaceContext(): WorkspaceContext {
  return useWorkspaceDataStore((state) => state.context);
}
