/**
 * WebSocket Service - Frontend
 *
 * Provides bidirectional real-time communication with backend for:
 * - UI state updates (frontend → backend)
 * - UI control commands (backend → frontend)
 */

import { io, Socket } from 'socket.io-client';
import { logger } from './LoggingService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private commandHandlers: Map<string, (data: any) => void> = new Map();

  /**
   * Connect to WebSocket server with JWT authentication
   */
  connect(): void {
    const token = localStorage.getItem('userToken');

    if (!token) {
      logger.warn('WebSocket: No auth token available, cannot connect');
      return;
    }

    if (this.socket?.connected) {
      logger.debug('WebSocket: Already connected');
      return;
    }

    logger.info('WebSocket: Connecting to backend...');

    this.socket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    this.setupEventHandlers();
  }

  /**
   * Setup Socket.io event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      logger.info('WebSocket: Connected successfully', {
        socketId: this.socket?.id,
      });
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      logger.warn('WebSocket: Disconnected', { reason });
    });

    this.socket.on('connect_error', (error) => {
      this.reconnectAttempts++;
      logger.error('WebSocket: Connection error', {
        error: error.message,
        attempts: this.reconnectAttempts,
      });

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        logger.error('WebSocket: Max reconnect attempts reached');
        this.disconnect();
      }
    });

    // JSON-RPC Request Handler
    this.socket.on('message', (rawMessage: string) => {
      try {
        const message = JSON.parse(rawMessage);

        // Check if it's a JSON-RPC request
        if (
          message &&
          message.jsonrpc === '2.0' &&
          message.method &&
          message.id
        ) {
          logger.info('WebSocket: Received JSON-RPC request', {
            method: message.method,
            id: message.id,
          });
          this.handleRpcRequest(message);
        }
      } catch (error) {
        logger.error('WebSocket: Error parsing message', error);
      }
    });

    // Legacy UI Control Command Handlers (kept for backward compatibility)
    this.socket.on('ui-command:navigate', (data) => {
      logger.info('WebSocket: Received navigate command', data);
      this.handleCommand('navigate', data);
    });

    this.socket.on('ui-command:open-file', (data) => {
      logger.info('WebSocket: Received open-file command', data);
      this.handleCommand('open-file', data);
    });

    this.socket.on('ui-command:notification', (data) => {
      logger.info('WebSocket: Received notification command', data);
      this.handleCommand('notification', data);
    });
  }

  /**
   * Handle UI command by invoking registered handler
   */
  private handleCommand(command: string, data: any): void {
    const handler = this.commandHandlers.get(command);
    if (handler) {
      try {
        handler(data);
      } catch (error) {
        logger.error(`WebSocket: Error handling command ${command}`, error);
      }
    } else {
      logger.warn(`WebSocket: No handler registered for command: ${command}`);
    }
  }

  /**
   * Handle JSON-RPC request and send response
   */
  private async handleRpcRequest(request: any): Promise<void> {
    if (!this.socket) return;

    try {
      const { method, params, id } = request;

      let result: any;

      // Execute the RPC method
      switch (method) {
        case 'showNotification': {
          const { message, type = 'info' } = params;
          // Import dynamically to avoid circular dependencies
          const { toast } = await import('react-toastify');

          if (type === 'success') {
            toast.success(message);
          } else if (type === 'error') {
            toast.error(message);
          } else {
            toast.info(message);
          }

          result = { success: true };
          break;
        }

        case 'navigateToPage': {
          const { path } = params;
          window.location.href = path;
          result = { success: true };
          break;
        }

        case 'openWorkspaceFile': {
          const { assistantId, path } = params;
          window.location.href = `/workspace/${assistantId}?file=${encodeURIComponent(path)}`;
          result = { success: true };
          break;
        }

        case 'getUiContext': {
          // Get current UI context
          const currentRoute = window.location.pathname;
          const sessionId = sessionStorage.getItem('activeSessionId');
          const assistantId = sessionStorage.getItem('activeAssistantId');

          result = {
            currentRoute,
            sessionId,
            assistantId,
            timestamp: new Date().toISOString(),
          };
          break;
        }

        case 'pushMessageToChat': {
          const { content, role = 'assistant', metadata } = params;

          // Import chat store dynamically to avoid circular dependencies
          const { useChatStore } = await import('../store/chatStore');
          const pushMessage = useChatStore.getState().pushMessage;

          // Push message to chat
          pushMessage({
            content,
            role,
            metadata,
          });

          result = { success: true };
          break;
        }

        default:
          throw new Error(`Unknown RPC method: ${method}`);
      }

      // Send JSON-RPC success response
      const response = {
        jsonrpc: '2.0',
        result,
        id,
      };

      this.socket.emit('message', JSON.stringify(response));
      logger.info('WebSocket: Sent JSON-RPC response', { id, method });
    } catch (error: any) {
      // Send JSON-RPC error response
      const errorResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: error.message || 'Internal error',
        },
        id: request.id,
      };

      this.socket.emit('message', JSON.stringify(errorResponse));
      logger.error('WebSocket: RPC request error', error);
    }
  }

  /**
   * Register a command handler
   */
  registerCommandHandler(command: string, handler: (data: any) => void): void {
    this.commandHandlers.set(command, handler);
    logger.debug(`WebSocket: Registered handler for command: ${command}`);
  }

  /**
   * Unregister a command handler
   */
  unregisterCommandHandler(command: string): void {
    this.commandHandlers.delete(command);
    logger.debug(`WebSocket: Unregistered handler for command: ${command}`);
  }

  /**
   * Send UI state update to backend
   */
  sendUIStateUpdate(payload: any): void {
    if (!this.socket?.connected) {
      logger.debug('WebSocket: Not connected, cannot send UI state update');
      return;
    }

    this.socket.emit('ui-state-update', payload);
    logger.debug('WebSocket: Sent UI state update', {
      route: payload.currentRoute,
      sessionId: payload.sessionId,
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      logger.info('WebSocket: Disconnecting...');
      this.socket.disconnect();
      this.socket = null;
      this.commandHandlers.clear();
    }
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Get socket instance (for advanced use cases)
   */
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
