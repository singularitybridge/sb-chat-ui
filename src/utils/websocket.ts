import { logger } from '../services/LoggingService';

/**
 * WebSocket utility for bidirectional communication with backend
 *
 * Phase 1: Stub implementation for UI context tracking
 * Phase 2+: Will implement full bidirectional RPC communication
 *
 * For Phase 1, UI state reporting happens via HTTP in useUiContextStore
 */

let ws: WebSocket | null = null;
let reconnectTimer: NodeJS.Timeout | null = null;
const RECONNECT_DELAY = 5000; // 5 seconds

/**
 * Initialize WebSocket connection
 * Currently a stub - will be fully implemented in Phase 2
 */
export const initializeWebSocket = (token: string): void => {
  logger.info('[WebSocket] Initialize called (Phase 1 stub)');

  // Phase 1: No-op stub
  // The UI state is reported via HTTP in useUiContextStore
  // WebSocket will be fully implemented in Phase 2 for bidirectional RPC

  // TODO Phase 2:
  // - Connect to ws://localhost:3000/ui-state
  // - Send auth token
  // - Listen for backend commands
  // - Implement RPC handlers for UI control
};

/**
 * Disconnect WebSocket
 * Currently a stub - will be fully implemented in Phase 2
 */
export const disconnectWebSocket = (): void => {
  logger.info('[WebSocket] Disconnect called (Phase 1 stub)');

  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (ws) {
    ws.close();
    ws = null;
  }
};

/**
 * Send message to backend via WebSocket
 * Currently a stub - will be fully implemented in Phase 2
 */
export const sendWebSocketMessage = (message: any): void => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    logger.warn('[WebSocket] Cannot send message - not connected');
    return;
  }

  try {
    ws.send(JSON.stringify(message));
  } catch (error) {
    logger.error('[WebSocket] Error sending message', error);
  }
};

/**
 * Check if WebSocket is available and connected
 */
export const isWebSocketAvailable = (): boolean => {
  return ws !== null && ws.readyState === WebSocket.OPEN;
};

/**
 * Execute assistant with optional workspace save (Phase 2 stub)
 * TODO: Implement proper WebSocket RPC for assistant execution
 */
export const executeAssistantWithSave = async (params: {
  assistantId: string;
  userInput: string;
  savePath?: string;
}): Promise<{ response: string; savedPath?: string }> => {
  logger.info('[WebSocket] executeAssistantWithSave called (stub)', params);

  // Phase 2 stub - return placeholder response
  // In full implementation, this would send RPC request via WebSocket
  throw new Error('executeAssistantWithSave not yet implemented - use HTTP API for now');
};
