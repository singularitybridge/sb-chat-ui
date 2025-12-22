/**
 * Global logout handler that clears all stores and caches.
 * This ensures proper session isolation when users log out and log back in.
 */

import { useSessionStore } from '../store/useSessionStore';
import { useChatStore } from '../store/chatStore';
import { useAssistantStore } from '../store/useAssistantStore';
import { useCompanyStore } from '../store/useCompanyStore';
import { useTeamStore } from '../store/useTeamStore';
import { useUserStore } from '../store/useUserStore';
import { useInboxStore } from '../store/useInboxStore';
import { useOnboardingStore } from '../store/useOnboardingStore';
import { useAuthStore } from '../store/useAuthStore';
import { useScreenShareStore } from '../store/useScreenShareStore';
import { useAudioStore } from '../store/useAudioStore';
import { useMemoryStore } from '../store/useMemoryStore';
import useVapiStore from '../store/useVapiStore';
import { useWorkspaceDataStore } from '../store/useWorkspaceDataStore';
import { useUiContextStore } from '../store/useUiContextStore';
import { useAIAssistedStore } from '../store/useAIAssistedStore';
import { messageCache } from './messageCache';
import { logger } from '../services/LoggingService';

/**
 * Clears all Zustand stores and caches.
 * Call this on logout to ensure no user data persists.
 */
export const clearAllStores = () => {
  logger.info('Clearing all stores and caches on logout');

  // Clear session store
  useSessionStore.setState({
    activeSession: null,
    activeDialog: '',
    isApiKeyMissing: false,
    isLoadingSession: false,
  });

  // Clear chat store - abort any ongoing requests first
  const chatState = useChatStore.getState();
  if (chatState.abortController) {
    chatState.abortController.abort();
  }
  useChatStore.setState({
    messages: [],
    isLoading: false,
    isLoadingMessages: false,
    isClearing: false,
    clearedSessionId: null,
    newSessionFromClear: null,
    abortController: null,
  });

  // Clear assistant store
  useAssistantStore.setState({
    assistants: [],
    assistantsLoaded: false,
    isLoading: false,
  });

  // Clear company store
  useCompanyStore.setState({
    companies: [],
    companiesLoaded: false,
    isLoading: false,
  });

  // Clear team store
  useTeamStore.setState({
    teams: [],
    teamsLoaded: false,
    isLoading: false,
  });

  // Clear user store
  useUserStore.setState({
    users: [],
    usersLoaded: false,
    isLoading: false,
  });

  // Clear inbox store
  useInboxStore.setState({
    inboxSessions: [],
    inboxSessionsLoaded: false,
    isLoading: false,
  });

  // Reset onboarding store
  useOnboardingStore.getState().resetOnboarding();

  // Stop and clear screen share store - use stopSession() for proper cleanup
  const screenShareState = useScreenShareStore.getState();
  if (screenShareState.isActive || screenShareState.stream) {
    screenShareState.stopSession();
  }
  // Also clear the history
  screenShareState.clearHistory();

  // Stop and clear audio store
  const audioState = useAudioStore.getState();
  audioState.stopAudio();
  useAudioStore.setState({
    audioState: 'disabled',
    audioRef: null,
  });

  // Clear memory store
  useMemoryStore.setState({
    entries: [],
    entriesLoaded: false,
    isLoading: false,
    filters: { scope: 'user' },
    error: null,
  });

  // Cleanup VAPI store - use cleanup() for proper call termination
  const vapiState = useVapiStore.getState();
  vapiState.cleanup();

  // Clear workspace data store - use clearAll() method
  useWorkspaceDataStore.getState().clearAll();
  // Also reset context
  useWorkspaceDataStore.setState({
    context: {
      currentFile: null,
      agentId: null,
      agentName: null,
      sessionId: null,
      userId: null,
      userName: null,
    },
  });

  // Clear UI context store
  useUiContextStore.setState({
    uiContext: {
      currentRoute: '/',
      workspaceFile: null,
      sessionId: null,
      assistantId: null,
      lastUpdated: new Date(),
    },
    isReporting: false,
  });

  // Clear session storage items used by UI context
  sessionStorage.removeItem('activeSessionId');
  sessionStorage.removeItem('activeAssistantId');

  // Re-initialize AI assisted store (clears and reloads configs)
  useAIAssistedStore.getState().initialize();

  // Clear message cache
  messageCache.clear();

  // Clear persisted storage
  localStorage.removeItem('auth-storage');

  logger.info('All stores and caches cleared successfully');
};

/**
 * Full logout handler that clears auth state and all stores.
 * Use this instead of calling authStore.logout() directly.
 */
export const logout = (): boolean => {
  // Clear all stores first
  clearAllStores();

  // Then clear auth state (this also removes userToken)
  const result = useAuthStore.getState().logout();

  return result;
};
