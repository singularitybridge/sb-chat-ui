import { io, Socket } from 'socket.io-client';
import { handleRpcRequest, initializeRpcHandlers } from './rpcHandlers';

export type MessageType = 'REQUEST' | 'UPDATE' | 'RESPONSE' | 'ERROR';

export interface WebSocketMessage {
  type: MessageType;
  requestId: string;
  action: string;
  data: Record<string, any>;
}

let socket: Socket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
const reconnectInterval = 5000; // 5 seconds

// Track connection state for graceful degradation
export const connectionState = {
  isConnected: false,
  hasAuthError: false,
  lastError: null as Error | null,
};

// Track RPC requests waiting for responses
const rpcRequests = new Map<string | number, {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}>();

// Handle RPC responses
const handleRpcResponse = (response: any) => {
  const id = response?.id;
  const pending = rpcRequests.get(id);

  if (pending) {
    clearTimeout(pending.timeout);
    rpcRequests.delete(id);

    if ('error' in response) {
      pending.reject(new Error(response.error.message));
    } else {
      pending.resolve(response.result);
    }
  }
};

// Add RPC response and request handler to socket message handling
const setupRpcHandlers = async (socket: Socket) => {
  socket.on('message', async (message: string | object) => {
    const parsed = typeof message === 'string' ? JSON.parse(message) : message;

    // Handle RPC responses (backend responding to our requests)
    if (parsed?.id && (parsed?.result || parsed?.error)) {
      handleRpcResponse(parsed);
    }
    // Handle RPC requests (backend calling our methods)
    else if (parsed?.method && parsed?.id !== undefined) {
      const response = await handleRpcRequest(parsed);
      socket.emit('message', JSON.stringify(response));
    }
  });
};

export const initializeWebSocket = (token?: string): void => {
  if (socket?.connected) {
    console.log('🔗 WebSocket already connected');
    return;
  }

  const url = import.meta.env.VITE_API_URL?.replace(/^http/, 'ws') || 'ws://localhost:3000';

  console.log('🔌 Initializing WebSocket:', {
    url,
    path: '/realtime',
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 10) + '...' : 'none'
  });

  socket = io(url, {
    path: '/realtime',
    auth: token ? { token } : undefined,
    reconnection: true,
    reconnectionAttempts: maxReconnectAttempts,
    reconnectionDelay: reconnectInterval,
    transports: ['websocket', 'polling'],
  });

  // Set up message handling immediately
  setupRpcHandlers(socket);

  socket.on('connect', () => {
    reconnectAttempts = 0;
    connectionState.isConnected = true;
    connectionState.hasAuthError = false;
    connectionState.lastError = null;
    console.log('✅ WebSocket connected successfully');
  });

  socket.on('disconnect', (reason) => {
    connectionState.isConnected = false;
    console.log('🔌 WebSocket disconnected:', reason);
  });

  socket.on('connect_error', (error: Error) => {
    reconnectAttempts++;
    connectionState.isConnected = false;
    connectionState.lastError = error;

    console.error('❌ WebSocket connection error:', {
      message: error.message,
      attempt: reconnectAttempts,
      maxAttempts: maxReconnectAttempts
    });

    if (error.message.includes('unauthorized') || error.message.includes('authentication failed')) {
      connectionState.hasAuthError = true;
      console.error('🚫 Authentication failed - disconnecting WebSocket');

      if (socket) {
        socket.disconnect();
        socket = null;
      }
      return;
    }
  });
};

export const disconnectWebSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  connectionState.isConnected = false;
};

export const retryConnection = (newToken: string): void => {
  reconnectAttempts = 0;
  connectionState.hasAuthError = false;
  initializeWebSocket(newToken);
};

export const isWebSocketAvailable = (): boolean => {
  return connectionState.isConnected && !connectionState.hasAuthError;
};

/**
 * Execute assistant with optional save to workspace
 */
export const executeAssistantWithSave = async (params: {
  assistantId: string;
  userInput: string;
  savePath?: string;
  promptOverride?: string;
  responseFormat?: any;
  attachments?: any[];
}): Promise<{
  success: boolean;
  response: string;
  savedPath: string | null;
  timestamp: string;
}> => {
  if (!socket?.connected) {
    throw new Error('WebSocket not connected');
  }

  const id = Date.now().toString();
  const rpcMessage = {
    jsonrpc: '2.0',
    method: 'uiExecuteAssistantWithSave',
    params: {
      assistantId: params.assistantId,
      userInput: params.userInput,
      savePath: params.savePath,
      promptOverride: params.promptOverride,
      responseFormat: params.responseFormat,
      attachments: params.attachments,
    },
    id
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      rpcRequests.delete(id);
      reject(new Error('RPC request timed out'));
    }, 60000); // 60 seconds timeout for AI requests

    rpcRequests.set(id, { resolve, reject, timeout });

    try {
      if (!socket) {
        throw new Error('WebSocket not initialized');
      }
      socket.emit('message', JSON.stringify(rpcMessage));
    } catch (error) {
      rpcRequests.delete(id);
      clearTimeout(timeout);
      reject(error instanceof Error ? error : new Error('Failed to send message'));
    }
  });
};

/**
 * Save search result to workspace
 */
export const saveSearchResult = async (params: {
  path: string;
  content: string;
  agentId?: string;
  contentType?: string;
  description?: string;
  tags?: string[];
}): Promise<any> => {
  if (!socket?.connected) {
    throw new Error('WebSocket not connected');
  }

  const id = Date.now().toString();
  const rpcMessage = {
    jsonrpc: '2.0',
    method: 'uiSaveSearchResult',
    params,
    id
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      rpcRequests.delete(id);
      reject(new Error('RPC request timed out'));
    }, 30000);

    rpcRequests.set(id, { resolve, reject, timeout });

    try {
      if (!socket) {
        throw new Error('WebSocket not initialized');
      }
      socket.emit('message', JSON.stringify(rpcMessage));
    } catch (error) {
      rpcRequests.delete(id);
      clearTimeout(timeout);
      reject(error instanceof Error ? error : new Error('Failed to send message'));
    }
  });
};

/**
 * Load file from workspace
 */
export const loadWorkspaceFile = async (params: {
  path: string;
  scopeId?: string;
}): Promise<any> => {
  if (!socket?.connected) {
    throw new Error('WebSocket not connected');
  }

  const id = Date.now().toString();
  const rpcMessage = {
    jsonrpc: '2.0',
    method: 'uiLoadFile',
    params,
    id
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      rpcRequests.delete(id);
      reject(new Error('RPC request timed out'));
    }, 30000);

    rpcRequests.set(id, { resolve, reject, timeout });

    try {
      if (!socket) {
        throw new Error('WebSocket not initialized');
      }
      socket.emit('message', JSON.stringify(rpcMessage));
    } catch (error) {
      rpcRequests.delete(id);
      clearTimeout(timeout);
      reject(error instanceof Error ? error : new Error('Failed to send message'));
    }
  });
};

/**
 * List workspace files
 */
export const listWorkspaceFiles = async (params?: {
  scope?: string;
  scopeId?: string;
  prefix?: string;
}): Promise<any> => {
  if (!socket?.connected) {
    throw new Error('WebSocket not connected');
  }

  const id = Date.now().toString();
  const rpcMessage = {
    jsonrpc: '2.0',
    method: 'uiListFiles',
    params: params || {},
    id
  };

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      rpcRequests.delete(id);
      reject(new Error('RPC request timed out'));
    }, 30000);

    rpcRequests.set(id, { resolve, reject, timeout });

    try {
      if (!socket) {
        throw new Error('WebSocket not initialized');
      }
      socket.emit('message', JSON.stringify(rpcMessage));
    } catch (error) {
      rpcRequests.delete(id);
      clearTimeout(timeout);
      reject(error instanceof Error ? error : new Error('Failed to send message'));
    }
  });
};

// Initialize RPC handlers on module load
initializeRpcHandlers();
