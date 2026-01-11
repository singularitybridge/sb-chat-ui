/**
 * useWebSocketCommands Hook
 *
 * Sets up WebSocket command handlers for UI control from backend
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { toast } from 'react-toastify';
import { websocketService } from '../services/websocket';
import { useUiContextStore } from '../store/useUiContextStore';
import { logger } from '../services/LoggingService';

export const useWebSocketCommands = () => {
  const navigate = useNavigate();
  const { setWorkspaceFile } = useUiContextStore();

  useEffect(() => {
    // Connect to WebSocket
    websocketService.connect();

    // Register navigate command handler
    websocketService.registerCommandHandler('navigate', (data: any) => {
      const { route } = data;
      logger.info('Executing navigate command', { route });

      try {
        navigate(route);
        toast.info(`Navigated to ${route}`, {
          position: 'bottom-right',
          autoClose: 3000,
        });
      } catch (error) {
        logger.error('Failed to execute navigate command', error);
        toast.error(`Failed to navigate to ${route}`, {
          position: 'bottom-right',
          autoClose: 5000,
        });
      }
    });

    // Register open-file command handler
    websocketService.registerCommandHandler('open-file', (data: any) => {
      const { path, assistantId } = data;
      logger.info('Executing open-file command', { path, assistantId });

      try {
        // Navigate to workspace page
        const workspaceRoute = `/admin/assistants/${assistantId}/workspace`;
        navigate(workspaceRoute);

        // Set the workspace file context (this will trigger UI to load the file)
        setWorkspaceFile({
          path,
          content: '', // Content will be loaded by the workspace component
          assistantId,
        });

        toast.success(`Opening ${path}`, {
          position: 'bottom-right',
          autoClose: 3000,
        });
      } catch (error) {
        logger.error('Failed to execute open-file command', error);
        toast.error(`Failed to open ${path}`, {
          position: 'bottom-right',
          autoClose: 5000,
        });
      }
    });

    // Register notification command handler
    websocketService.registerCommandHandler('notification', (data: any) => {
      const { message, type = 'info', duration = 5000 } = data;
      logger.info('Executing notification command', { message, type });

      try {
        switch (type) {
          case 'success':
            toast.success(message, {
              position: 'bottom-right',
              autoClose: duration,
            });
            break;
          case 'error':
            toast.error(message, {
              position: 'bottom-right',
              autoClose: duration,
            });
            break;
          case 'warning':
            toast.warning(message, {
              position: 'bottom-right',
              autoClose: duration,
            });
            break;
          case 'info':
          default:
            toast.info(message, {
              position: 'bottom-right',
              autoClose: duration,
            });
            break;
        }
      } catch (error) {
        logger.error('Failed to execute notification command', error);
      }
    });

    logger.info('WebSocket command handlers registered');

    // Cleanup on unmount
    return () => {
      websocketService.unregisterCommandHandler('navigate');
      websocketService.unregisterCommandHandler('open-file');
      websocketService.unregisterCommandHandler('notification');
      websocketService.disconnect();
      logger.info('WebSocket command handlers unregistered');
    };
  }, [navigate, setWorkspaceFile]);
};
