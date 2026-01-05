import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useUiContextStore } from '../store/useUiContextStore';
import { useSessionStore } from '../store/useSessionStore';
import { logger } from '../services/LoggingService';
import { initializeWebSocket, disconnectWebSocket } from '../utils/websocket';

/**
 * UI Context Tracker Component
 *
 * This component monitors UI state changes and updates the uiContextStore.
 * It should be mounted once at the app root level.
 *
 * Tracks:
 * - Route changes (via React Router)
 * - Active session changes
 * - Workspace file viewing (detected from route)
 * - WebSocket connection for RPC communication
 */
export const UiContextTracker: React.FC = () => {
  const location = useLocation();
  const { setCurrentRoute, setSessionContext, setWorkspaceFile } = useUiContextStore();
  const { activeSession } = useSessionStore();

  // Initialize WebSocket connection on mount
  useEffect(() => {
    const token = localStorage.getItem('userToken');

    if (token) {
      logger.info('UiContextTracker: Initializing WebSocket connection');
      initializeWebSocket(token);
    } else {
      logger.warn('UiContextTracker: No auth token available - WebSocket will not connect');
    }

    return () => {
      logger.info('UiContextTracker: Disconnecting WebSocket');
      disconnectWebSocket();
    };
  }, []); // Empty deps - only run once on mount

  // Track route changes
  useEffect(() => {
    const currentPath = location.pathname;
    setCurrentRoute(currentPath);

    // Check if viewing a workspace file
    // Pattern: /admin/assistants/:assistantId/workspace/:path
    const workspaceMatch = currentPath.match(/\/admin\/assistants\/([^/]+)\/workspace(.+)/);

    if (workspaceMatch) {
      const [, assistantId, workspacePath] = workspaceMatch;

      logger.debug('UiContextTracker: Detected workspace file view', {
        assistantId,
        path: workspacePath,
      });

      // We can't fetch the full file content here synchronously,
      // but we can set the metadata. The actual content would need
      // to be set by the workspace viewer component.
      setWorkspaceFile({
        path: workspacePath,
        content: '', // Will be filled by the workspace viewer
        assistantId,
      });
    } else {
      // Clear workspace file if not viewing one
      setWorkspaceFile(null);
    }
  }, [location.pathname, setCurrentRoute, setWorkspaceFile]);

  // Track session changes
  useEffect(() => {
    setSessionContext(
      activeSession?._id || null,
      activeSession?.assistantId || null
    );
  }, [activeSession, setSessionContext]);

  // This component doesn't render anything
  return null;
};
