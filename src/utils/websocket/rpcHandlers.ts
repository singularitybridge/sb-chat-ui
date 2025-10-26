import { useUiContextStore } from '../../store/useUiContextStore';
import { logger } from '../../services/LoggingService';
import { toast } from 'react-toastify';

// Type for RPC request
interface RpcRequest {
  jsonrpc: '2.0';
  method: string;
  params?: any;
  id: string | number;
}

// Type for RPC response
interface RpcResponse {
  jsonrpc: '2.0';
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
  id: string | number;
}

// Type for RPC handler function
type RpcHandler = (params: any) => Promise<any> | any;

// Registry of RPC handlers
const rpcHandlers = new Map<string, RpcHandler>();

/**
 * Register an RPC handler for a specific method
 */
export const registerRpcHandler = (method: string, handler: RpcHandler): void => {
  rpcHandlers.set(method, handler);
  logger.debug(`RPC handler registered: ${method}`);
};

/**
 * Handle incoming RPC request and return response
 */
export const handleRpcRequest = async (request: RpcRequest): Promise<RpcResponse> => {
  const { method, params, id } = request;

  try {
    const handler = rpcHandlers.get(method);

    if (!handler) {
      return {
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `Method not found: ${method}`,
        },
        id,
      };
    }

    const result = await handler(params);

    return {
      jsonrpc: '2.0',
      result,
      id,
    };
  } catch (error) {
    logger.error(`RPC handler error for method: ${method}`, error);

    return {
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: error instanceof Error ? error.message : 'Internal error',
        data: error instanceof Error ? error.stack : undefined,
      },
      id,
    };
  }
};

/**
 * Initialize all RPC handlers
 */
export const initializeRpcHandlers = (): void => {
  // Handler for getting UI context
  registerRpcHandler('getUiContext', () => {
    const context = useUiContextStore.getState().getUiContext();
    logger.debug('RPC: getUiContext called', context);
    return context;
  });

  // Handler for navigating to a page
  registerRpcHandler('navigateToPage', (params: { path: string }) => {
    logger.info('RPC: navigateToPage called', params);
    const { path } = params;

    if (!path) {
      throw new Error('Missing required parameter: path');
    }

    // Use window.location or React Router depending on setup
    window.location.href = path;

    return { success: true, path };
  });

  // Handler for opening workspace file
  registerRpcHandler('openWorkspaceFile', (params: { assistantId: string; path: string }) => {
    logger.info('RPC: openWorkspaceFile called', params);
    const { assistantId, path } = params;

    if (!assistantId || !path) {
      throw new Error('Missing required parameters: assistantId, path');
    }

    // Navigate to the workspace file view
    const targetPath = `/admin/assistants/${assistantId}/workspace${path}`;
    window.location.href = targetPath;

    return { success: true, path: targetPath };
  });

  // Handler for showing notification
  registerRpcHandler('showNotification', (params: { message: string; type?: 'success' | 'error' | 'info' }) => {
    logger.info('RPC: showNotification called', params);
    const { message, type = 'info' } = params;

    if (!message) {
      throw new Error('Missing required parameter: message');
    }

    // Show toast notification based on type
    switch (type) {
      case 'success':
        toast.success(message);
        break;
      case 'error':
        toast.error(message);
        break;
      case 'info':
      default:
        toast.info(message);
        break;
    }

    return { success: true, message, type };
  });

  logger.info('RPC handlers initialized');
};
