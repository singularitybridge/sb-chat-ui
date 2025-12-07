import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { useEmbedAuth } from '../../contexts/EmbedAuthContext';
import { setGlobalEmbedApiKey } from '../../services/AxiosService';
import { MarkdownRenderer } from '../../components/workspace/MarkdownRenderer';
import { workspaceApiScript } from '../../utils/workspace-api';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * EmbedWorkspacePage - Embeddable workspace file viewer
 *
 * URL Pattern: /embed/workspace/:documentId?apiKey=sk_live_xxx
 * documentId = base64(assistantId:filepath)
 *
 * Examples:
 * - /embed/workspace/aW50ZWdyYXRpb24tZXhwZXJ0Oi90ZXN0cy9nZW5lcmFsLXRlc3QuaHRtbA==?apiKey=sk_live_abc123
 */

const EmbedWorkspacePage: React.FC = observer(() => {
  const { documentId } = useParams<{ documentId: string }>();
  const [searchParams] = useSearchParams();
  const { setApiKey: setEmbedApiKey } = useEmbedAuth();

  // Decode documentId to get assistantId and filepath
  let assistantId: string | undefined;
  let filepath: string | undefined;

  try {
    const decoded = atob(documentId || '');
    const [aid, ...pathParts] = decoded.split(':');
    assistantId = aid;
    filepath = pathParts.join(':'); // In case path contains ':'
  } catch (e) {
    console.error('Failed to decode documentId:', e);
  }

  const [fileContent, setFileContent] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  /**
   * Get file extension to determine rendering type
   */
  const getFileType = (path: string): string => {
    if (!path) return 'unknown';
    const ext = path.split('.').pop()?.toLowerCase();
    return ext || 'unknown';
  };

  /**
   * Inject workspace API script into HTML content
   * Allows embedded HTML to use workspace.ask() and other functions
   */
  const injectWorkspaceAPI = (html: string): string => {
    const scriptTag = `<script id="workspace-api">${workspaceApiScript}</script>`;

    // Try to inject before </head>
    const headCloseIndex = html.toLowerCase().indexOf('</head>');
    if (headCloseIndex !== -1) {
      return html.slice(0, headCloseIndex) + scriptTag + html.slice(headCloseIndex);
    }

    // Try to inject after <body>
    const bodyOpenIndex = html.toLowerCase().indexOf('<body');
    if (bodyOpenIndex !== -1) {
      const bodyOpenEnd = html.indexOf('>', bodyOpenIndex);
      if (bodyOpenEnd !== -1) {
        return html.slice(0, bodyOpenEnd + 1) + scriptTag + html.slice(bodyOpenEnd + 1);
      }
    }

    // Fallback: prepend to content
    return scriptTag + html;
  };

  /**
   * Fetch file content from workspace API
   */
  const fetchFileContent = async (apiKey: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!filepath) {
        throw new Error('File path is missing');
      }

      if (!assistantId) {
        throw new Error('Assistant ID is missing');
      }

      // Add leading slash if not present
      const normalizedPath = filepath.startsWith('/') ? filepath : `/${filepath}`;

      const response = await fetch(
        `${apiUrl}/api/workspace/get?path=${encodeURIComponent(normalizedPath)}&scope=agent&agentId=${assistantId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Invalid or expired API key');
        } else if (response.status === 404) {
          throw new Error('File not found');
        } else {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
      }

      const data = await response.json();

      if (!data.found) {
        throw new Error('File not found in workspace');
      }

      // Handle binary content (base64 encoded)
      if (data.isBinary) {
        setFileContent(data.content);
      } else {
        // Handle text content
        setFileContent(data.content || '');
      }

      setFileType(getFileType(normalizedPath));
    } catch (err: any) {
      console.error('Error fetching workspace file:', err);
      setError(err.message || 'Failed to load workspace file');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Setup effect: Extract API key and fetch file
   */
  useEffect(() => {
    const setup = async () => {
      // Extract API key from URL
      const apiKeyFromUrl = searchParams.get('apiKey');

      if (!apiKeyFromUrl) {
        setError('API key is missing from URL. Please provide ?apiKey=sk_live_xxx');
        setIsLoading(false);
        setGlobalEmbedApiKey(null);
        return;
      }

      // Set API key in context and global axios config
      setEmbedApiKey(apiKeyFromUrl);
      setGlobalEmbedApiKey(apiKeyFromUrl);

      // Fetch the file
      await fetchFileContent(apiKeyFromUrl);
    };

    setup();
  }, [assistantId, filepath, searchParams]);

  /**
   * Handle workspace search requests from iframe
   */
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Handle workspace file navigation from embedded iframe
      if (event.data.type === 'loadWorkspaceFile') {
        const newPath = event.data.path;
        const apiKeyFromUrl = searchParams.get('apiKey');

        if (!assistantId || !newPath) {
          console.error('❌ Missing assistantId or path for navigation');
          return;
        }

        // Create new documentId with same assistantId but different path
        const newDocumentId = btoa(`${assistantId}:${newPath}`);

        // Navigate to new embedded workspace file
        window.location.href = `/embed/workspace/${newDocumentId}?apiKey=${apiKeyFromUrl}`;
        return;
      }

      // Handle workspace search requests
      if (event.data.type === 'workspace-search') {
        const { query, requestId } = event.data.payload;
        const apiKeyFromUrl = searchParams.get('apiKey');

        if (!assistantId || !apiKeyFromUrl) {
          console.error('❌ Missing assistantId or API key for workspace search');
          return;
        }

        try {
          console.log('🔍 [EmbedWorkspace] Starting workspace search:', query);

          const response = await fetch(
            `${apiUrl}/assistant/${assistantId}/workspace-execute`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Authorization': `Bearer ${apiKeyFromUrl}`,
              },
              body: JSON.stringify({
                query,
                searchContext: {
                  currentPage: filepath || 'embed'
                }
              })
            }
          );

          if (!response.ok) {
            throw new Error(`Search failed: ${response.statusText}`);
          }

          // Read SSE stream
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('No response body');
          }

          let fullResponse = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data) {
                  try {
                    const streamEvent = JSON.parse(data);

                    // Accumulate response for complete message
                    if (streamEvent.type === 'chunk') {
                      fullResponse += streamEvent.content || '';
                    }

                    // Send event to iframe
                    if (event.source) {
                      (event.source as Window).postMessage({
                        type: 'workspace-search-response',
                        payload: {
                          ...streamEvent,
                          requestId: requestId,
                          fullResponse: streamEvent.type === 'complete' ? fullResponse : undefined
                        }
                      }, '*');

                      console.log('📤 [EmbedWorkspace] Sent event to iframe:', streamEvent.type);
                    }
                  } catch (parseError) {
                    console.error('Failed to parse SSE event:', parseError);
                  }
                }
              }
            }
          }
        } catch (error: any) {
          console.error('❌ [EmbedWorkspace] Search error:', error);

          // Send error to iframe with requestId
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'workspace-search-response',
              payload: {
                type: 'error',
                error: error.message || 'Search failed',
                timestamp: Date.now(),
                requestId: requestId
              }
            }, '*');
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [assistantId, filepath, searchParams, apiUrl]);

  /**
   * Render loading state
   */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading workspace file...</p>
        </div>
      </div>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load File</h2>
              <p className="text-sm text-gray-600 mb-4">{error}</p>
              <div className="text-xs text-gray-500 space-y-1">
                <p><strong>Assistant ID:</strong> {assistantId}</p>
                <p><strong>File Path:</strong> {filepath}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Render file content based on type
   */
  const renderFileContent = () => {
    switch (fileType) {
      case 'html':
        return (
          <iframe
            srcDoc={injectWorkspaceAPI(fileContent)}
            className="w-full h-screen border-0"
            sandbox="allow-scripts allow-forms allow-same-origin"
            title="Embedded Workspace HTML"
          />
        );

      case 'mdx':
      case 'md':
        return (
          <div className="min-h-screen bg-white">
            <div className="max-w-4xl mx-auto px-6 py-8">
              <div className="prose prose-slate max-w-none">
                <MarkdownRenderer content={fileContent} disableWorkspaceSearch={true} />
              </div>
            </div>
          </div>
        );

      case 'json':
        try {
          const jsonContent = typeof fileContent === 'string'
            ? JSON.parse(fileContent)
            : fileContent;

          return (
            <div className="min-h-screen bg-gray-900 p-6">
              <pre className="text-gray-100 font-mono text-sm overflow-x-auto">
                <code>{JSON.stringify(jsonContent, null, 2)}</code>
              </pre>
            </div>
          );
        } catch {
          return (
            <div className="min-h-screen bg-gray-900 p-6">
              <pre className="text-gray-100 font-mono text-sm overflow-x-auto">
                <code>{fileContent}</code>
              </pre>
            </div>
          );
        }

      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <img
              src={`data:image/${fileType};base64,${fileContent}`}
              alt="Embedded workspace image"
              className="max-w-full h-auto shadow-lg rounded"
            />
          </div>
        );

      case 'txt':
      case 'csv':
      default:
        return (
          <div className="min-h-screen bg-white p-6">
            <pre className="text-gray-800 font-mono text-sm whitespace-pre-wrap overflow-x-auto">
              {fileContent}
            </pre>
          </div>
        );
    }
  };

  return (
    <div className="workspace-embed-container">
      {renderFileContent()}
    </div>
  );
});

export default EmbedWorkspacePage;
