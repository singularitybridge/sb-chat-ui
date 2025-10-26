import React, { useState, useEffect } from 'react';
import { Search, Loader2, CheckCircle2, XCircle, Save } from 'lucide-react';
import { executeAssistantWithSave, isWebSocketAvailable } from '../../utils/websocket';
import { workspaceApiScript } from '../../utils/workspace-api';

interface WorkspaceSearchProps {
  assistantId?: string;
  sessionId?: string;
  saveToPath?: string;
  autoSave?: boolean;
}

/**
 * Inject workspace API script into HTML content
 * This allows HTML pages to use workspace.ask() to query AI
 */
const injectWorkspaceAPI = (html: string): string => {
  // Find the </head> tag or <body> tag to inject script
  const headCloseIndex = html.toLowerCase().indexOf('</head>');
  const bodyOpenIndex = html.toLowerCase().indexOf('<body');

  const scriptTag = `<script id="workspace-api">${workspaceApiScript}</script>`;

  if (headCloseIndex !== -1) {
    // Inject before </head>
    return html.slice(0, headCloseIndex) + scriptTag + html.slice(headCloseIndex);
  } else if (bodyOpenIndex !== -1) {
    // Find the end of <body...> tag
    const bodyOpenEnd = html.indexOf('>', bodyOpenIndex);
    if (bodyOpenEnd !== -1) {
      // Inject after <body>
      return html.slice(0, bodyOpenEnd + 1) + scriptTag + html.slice(bodyOpenEnd + 1);
    }
  }

  // Fallback: prepend to entire content
  return scriptTag + html;
};

/**
 * WorkspaceSearch component for AI-powered workspace search
 * Uses WebSocket RPC for bidirectional communication
 */
export const WorkspaceSearch: React.FC<WorkspaceSearchProps> = ({
  assistantId = 'integration-expert',
  sessionId,
  saveToPath,
  autoSave = false,
}) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState('');
  const [savedPath, setSavedPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Check WebSocket connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(isWebSocketAvailable());
    };

    checkConnection();
    const interval = setInterval(checkConnection, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    if (!isConnected) {
      setError('WebSocket not connected. Please refresh the page.');
      return;
    }

    setIsSearching(true);
    setResult('');
    setSavedPath(null);
    setError(null);

    try {
      // Execute assistant with optional save via WebSocket RPC
      const response = await executeAssistantWithSave({
        assistantId,
        userInput: query.trim(),
        savePath: autoSave ? saveToPath : undefined,
      });

      console.log('🔍 WorkspaceSearch - Response received:', response);

      setResult(response.response);
      if (response.savedPath) {
        setSavedPath(response.savedPath);
      }
    } catch (err: any) {
      console.error('❌ WorkspaceSearch - Search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSave = async () => {
    if (!result || !saveToPath) return;

    try {
      await executeAssistantWithSave({
        assistantId,
        userInput: query.trim(),
        savePath: saveToPath,
      });
      setSavedPath(saveToPath);
    } catch (err: any) {
      setError(err.message || 'Save failed');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Connection Status */}
      {!isConnected && (
        <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <XCircle className="h-5 w-5 text-yellow-600" />
          <p className="text-sm text-yellow-800">WebSocket disconnected. Some features may not work.</p>
        </div>
      )}

      {/* Search Input */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask me anything about the workspace..."
            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
            disabled={isSearching || !isConnected}
          />
        </div>
        {query && (
          <button
            type="submit"
            disabled={isSearching || !isConnected}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
          >
            {isSearching ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </span>
            ) : (
              'Search'
            )}
          </button>
        )}
      </form>

      {/* Results */}
      {result && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Results</h3>
            {!autoSave && saveToPath && !savedPath && (
              <button
                onClick={handleManualSave}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Save className="h-4 w-4" />
                Save to Workspace
              </button>
            )}
            {savedPath && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Saved to {savedPath}
              </div>
            )}
          </div>
          <div className="prose prose-slate max-w-none bg-white border border-gray-200 rounded-xl p-6">
            {result.trim().startsWith('<!DOCTYPE html>') || result.trim().startsWith('<html') ? (
              <iframe
                srcDoc={injectWorkspaceAPI(result)}
                className="w-full min-h-[600px] border-0 rounded-lg"
                sandbox="allow-scripts allow-forms allow-same-origin"
                title="HTML Response"
              />
            ) : (
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">{result}</div>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Search Error</p>
            <p className="text-xs text-red-700 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isSearching && !result && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto" />
            <p className="text-sm text-gray-600">Processing your query...</p>
          </div>
        </div>
      )}
    </div>
  );
};
