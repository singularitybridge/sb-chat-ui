import { create } from 'zustand';
import { logger } from '../services/LoggingService';
import { websocketService } from '../services/websocket';

export interface WorkspaceFileContext {
  path: string;
  content: string;
  assistantId: string;
}

export interface UiContext {
  currentRoute: string;
  workspaceFile: WorkspaceFileContext | null;
  sessionId: string | null;
  assistantId: string | null;
  lastUpdated: Date;
}

interface UiContextStoreState {
  uiContext: UiContext;
  isReporting: boolean; // Track if currently reporting to backend

  // Update the current route
  setCurrentRoute: (route: string) => void;

  // Update workspace file being viewed
  setWorkspaceFile: (file: WorkspaceFileContext | null) => void;

  // Update session context
  setSessionContext: (sessionId: string | null, assistantId: string | null) => void;

  // Get full UI context (used by RPC handler)
  getUiContext: () => UiContext;

  // Update multiple context fields at once
  updateContext: (updates: Partial<Omit<UiContext, 'lastUpdated'>>) => void;

  // Report UI state to backend
  reportToBackend: () => Promise<void>;
}

/**
 * Report UI state to backend via WebSocket (Phase 2)
 */
const reportUIStateToBackend = async (context: UiContext): Promise<void> => {
  try {
    const token = localStorage.getItem('userToken');
    if (!token) {
      logger.debug('No auth token available, skipping UI state report');
      return;
    }

    // Ensure WebSocket connection is established
    if (!websocketService.isConnected()) {
      logger.debug('WebSocket not connected, attempting to connect...');
      websocketService.connect();

      // If still not connected, skip this update
      if (!websocketService.isConnected()) {
        logger.debug('WebSocket connection failed, skipping UI state update');
        return;
      }
    }

    const payload: any = {
      currentRoute: context.currentRoute,
      sessionId: context.sessionId,
      assistantId: context.assistantId,
    };

    // Include workspace document if viewing one
    if (context.workspaceFile) {
      payload.openWorkspaceDocument = {
        path: context.workspaceFile.path,
        lastModified: context.lastUpdated,
        metadata: {
          assistantId: context.workspaceFile.assistantId,
        },
      };
    }

    // Include UI context
    payload.uiContext = {
      breadcrumbs: context.currentRoute.split('/').filter(Boolean),
    };

    // Send via WebSocket instead of HTTP
    websocketService.sendUIStateUpdate(payload);

    logger.debug('UI state reported to backend via WebSocket', {
      route: context.currentRoute,
      sessionId: context.sessionId,
      hasWorkspaceFile: !!context.workspaceFile
    });
  } catch (error: any) {
    // Don't throw - just log the error. UI state reporting is non-critical.
    logger.warn('Failed to report UI state to backend', error);
  }
};

export const useUiContextStore = create<UiContextStoreState>((set, get) => ({
  uiContext: {
    currentRoute: window.location.pathname,
    workspaceFile: null,
    sessionId: null,
    assistantId: null,
    lastUpdated: new Date(),
  },
  isReporting: false,

  setCurrentRoute: (route: string) => {
    logger.debug('UI Context: Route changed', { route });
    set(state => ({
      uiContext: {
        ...state.uiContext,
        currentRoute: route,
        lastUpdated: new Date(),
      },
    }));

    // Report to backend (non-blocking)
    const state = get();
    if (!state.isReporting) {
      set({ isReporting: true });
      reportUIStateToBackend(state.uiContext)
        .finally(() => set({ isReporting: false }));
    }
  },

  setWorkspaceFile: (file: WorkspaceFileContext | null) => {
    logger.debug('UI Context: Workspace file changed', {
      path: file?.path || 'none',
      assistantId: file?.assistantId
    });
    set(state => ({
      uiContext: {
        ...state.uiContext,
        workspaceFile: file,
        lastUpdated: new Date(),
      },
    }));

    // Report to backend (non-blocking)
    const state = get();
    if (!state.isReporting) {
      set({ isReporting: true });
      reportUIStateToBackend(state.uiContext)
        .finally(() => set({ isReporting: false }));
    }
  },

  setSessionContext: (sessionId: string | null, assistantId: string | null) => {
    logger.debug('UI Context: Session context changed', { sessionId, assistantId });
    set(state => ({
      uiContext: {
        ...state.uiContext,
        sessionId,
        assistantId,
        lastUpdated: new Date(),
      },
    }));

    // Sync to sessionStorage for WebSocket RPC getUiContext (Phase 1 Frontend)
    if (sessionId) {
      sessionStorage.setItem('activeSessionId', sessionId);
    } else {
      sessionStorage.removeItem('activeSessionId');
    }

    if (assistantId) {
      sessionStorage.setItem('activeAssistantId', assistantId);
    } else {
      sessionStorage.removeItem('activeAssistantId');
    }

    // Report to backend (non-blocking)
    const state = get();
    if (!state.isReporting) {
      set({ isReporting: true });
      reportUIStateToBackend(state.uiContext)
        .finally(() => set({ isReporting: false }));
    }
  },

  getUiContext: () => {
    return get().uiContext;
  },

  updateContext: (updates: Partial<Omit<UiContext, 'lastUpdated'>>) => {
    logger.debug('UI Context: Bulk update', updates);
    set(state => ({
      uiContext: {
        ...state.uiContext,
        ...updates,
        lastUpdated: new Date(),
      },
    }));

    // Report to backend (non-blocking)
    const state = get();
    if (!state.isReporting) {
      set({ isReporting: true });
      reportUIStateToBackend(state.uiContext)
        .finally(() => set({ isReporting: false }));
    }
  },

  reportToBackend: async () => {
    const state = get();
    if (!state.isReporting) {
      set({ isReporting: true });
      try {
        await reportUIStateToBackend(state.uiContext);
      } finally {
        set({ isReporting: false });
      }
    }
  },
}));
