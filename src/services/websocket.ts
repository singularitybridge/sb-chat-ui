/**
 * WebSocket Service - Frontend
 *
 * Provides bidirectional real-time communication with backend for:
 * - UI state updates (frontend → backend)
 * - UI control commands (backend → frontend)
 *
 * Uses reference counting to handle React StrictMode's double-invocation
 * of useEffect hooks gracefully.
 */

import { io, Socket } from 'socket.io-client';
import { logger } from './LoggingService';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Delay before actually disconnecting (survives StrictMode remount)
const DISCONNECT_DELAY_MS = 100;

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private commandHandlers: Map<string, (data: any) => void> = new Map();
  private connectionRefCount = 0;
  private disconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;

  /**
   * Connect to WebSocket server with JWT authentication
   * Uses reference counting - safe to call multiple times
   */
  connect(): void {
    // Increment ref count
    this.connectionRefCount++;
    logger.debug(`WebSocket: Connect called (refCount: ${this.connectionRefCount})`);

    // Cancel any pending disconnect
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
      logger.debug('WebSocket: Cancelled pending disconnect');
    }

    // Already connected or connecting
    if (this.socket?.connected) {
      logger.debug('WebSocket: Already connected');
      return;
    }

    if (this.isConnecting) {
      logger.debug('WebSocket: Connection already in progress');
      return;
    }

    const token = localStorage.getItem('userToken');

    if (!token) {
      logger.warn('WebSocket: No auth token available, cannot connect');
      return;
    }

    logger.info('WebSocket: Connecting to backend...');
    this.isConnecting = true;

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
      this.isConnecting = false;
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
          window.location.href = `/admin/assistants/${assistantId}/workspace${path}`;
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
   * Request disconnect from WebSocket server
   * Uses reference counting - safe to call multiple times
   * Actual disconnect is delayed to survive StrictMode remount
   */
  disconnect(): void {
    // Decrement ref count
    this.connectionRefCount = Math.max(0, this.connectionRefCount - 1);
    logger.debug(`WebSocket: Disconnect called (refCount: ${this.connectionRefCount})`);

    // Only schedule disconnect if no more references
    if (this.connectionRefCount > 0) {
      logger.debug('WebSocket: Other references exist, not disconnecting');
      return;
    }

    // Schedule disconnect with delay (survives StrictMode remount)
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
    }

    this.disconnectTimer = setTimeout(() => {
      this.disconnectTimer = null;
      if (this.connectionRefCount === 0 && this.socket) {
        logger.info('WebSocket: Disconnecting (no active references)...');
        this.socket.disconnect();
        this.socket = null;
        this.commandHandlers.clear();
        this.isConnecting = false;
      }
    }, DISCONNECT_DELAY_MS);
  }

  /**
   * Force immediate disconnect (for cleanup/logout)
   */
  forceDisconnect(): void {
    if (this.disconnectTimer) {
      clearTimeout(this.disconnectTimer);
      this.disconnectTimer = null;
    }
    this.connectionRefCount = 0;
    this.isConnecting = false;
    if (this.socket) {
      logger.info('WebSocket: Force disconnecting...');
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

  /**
   * Subscribe to a session room for real-time messages
   * Replaces Pusher channel subscription
   */
  subscribeToSession(sessionId: string): void {
    if (!this.socket?.connected) {
      logger.warn('WebSocket: Not connected, cannot subscribe to session');
      return;
    }

    this.socket.emit('session:subscribe', sessionId);
    logger.info(`WebSocket: Subscribed to session ${sessionId}`);
  }

  /**
   * Unsubscribe from a session room
   * Replaces Pusher channel unsubscription
   */
  unsubscribeFromSession(sessionId: string): void {
    if (!this.socket?.connected) {
      logger.debug('WebSocket: Not connected, cannot unsubscribe from session');
      return;
    }

    this.socket.emit('session:unsubscribe', sessionId);
    logger.info(`WebSocket: Unsubscribed from session ${sessionId}`);
  }

  /**
   * Register a handler for session events
   * Replaces Pusher event binding
   */
  onSessionEvent(event: string, callback: (data: any) => void): void {
    if (!this.socket) {
      logger.warn(`WebSocket: Not initialized, cannot register handler for ${event}`);
      return;
    }

    this.socket.on(event, callback);
    logger.debug(`WebSocket: Registered handler for event: ${event}`);
  }

  /**
   * Remove a handler for session events
   * Replaces Pusher event unbinding
   */
  offSessionEvent(event: string, callback?: (data: any) => void): void {
    if (!this.socket) {
      logger.debug(`WebSocket: Not initialized, cannot remove handler for ${event}`);
      return;
    }

    if (callback) {
      this.socket.off(event, callback);
    } else {
      this.socket.off(event);
    }
    logger.debug(`WebSocket: Removed handler for event: ${event}`);
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
