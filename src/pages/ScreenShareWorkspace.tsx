import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router';
import { User, Laptop, Bot, RefreshCw, FileText, Trash2, PanelLeftClose, PanelLeft, Share2, FolderOpen, FolderClosed, Database, Sparkles, Monitor, ArrowLeft } from 'lucide-react';
import { useScreenShareStore } from '../store/useScreenShareStore';
import { useChatStore } from '../store/chatStore';
import { useSessionStore } from '../store/useSessionStore';
import { useAssistantStore } from '../store/useAssistantStore';
import { useAuthStore } from '../store/useAuthStore';
import { useTranslation } from 'react-i18next';
import { SBChatKitUI } from '../components/sb-chat-kit-ui/SBChatKitUI';
import { cn } from '../utils/cn';
import DynamicBackground, { setDynamicBackground } from '../components/DynamicBackground';
import { fileToBase64Attachment, Base64Attachment } from '../utils/base64Utils';
import { uploadContentFile } from '../services/api/contentFileService';
import { useUploadPreferencesStore } from '../store/useUploadPreferencesStore';
import { initializeWebSocket, disconnectWebSocket } from '../utils/websocket';
import { ContentPanel } from '../components/ui/content-panel';
import { findDefaultEntryFile, getWorkspaceRawContent, deleteWorkspaceItem, getWorkspaceItem } from '../services/api/workspaceService';
import { MarkdownRenderer } from '../components/workspace/MarkdownRenderer';
import { WorkspaceFileExplorer } from '../components/workspace/WorkspaceFileExplorer';
import { JSONViewer } from '../components/workspace/JSONViewer';
import { workspaceReactiveApiScript } from '../utils/workspace-api';
import WorkspaceEmbedDialog from '../components/WorkspaceEmbedDialog';
import { MemoryPreviewDialog } from '../components/workspace/MemoryPreviewDialog';
import { useWorkspaceLayout } from '../hooks/useWorkspaceLayout';
import { useWorkspaceKeyboard } from '../hooks/useWorkspaceKeyboard';
import { useWorkspaceDataStore } from '../store/useWorkspaceDataStore';
import { useUiContextStore } from '../store/useUiContextStore';

const ScreenShareWorkspace: React.FC = () => {
  const { assistantName } = useParams<{ assistantName: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getAssistantById } = useAssistantStore();
  const { userSessionInfo, isAuthenticated } = useAuthStore();

  // Parse file path from URL (everything after /workspace/)
  const getFilePathFromUrl = (): string | null => {
    const workspaceIndex = location.pathname.indexOf('/workspace/');
    if (workspaceIndex === -1) return null;
    const filePath = location.pathname.slice(workspaceIndex + '/workspace'.length);
    // Return null if empty or just a slash
    if (!filePath || filePath === '/') return null;
    return filePath;
  };

  // Find assistant by name (getAssistantById supports both ID and name)
  const assistantByName = assistantName ? getAssistantById(assistantName) : null;

  // Background configuration - same as Admin pages
  const backgroundProps = setDynamicBackground(
    'https://cdn.midjourney.com/41d91483-76a4-41f1-add2-638ff6f552e8/0_0.png',
    [
      { color: 'rgba(255, 255, 255, 0.95)', position: '0%' },
      { color: 'rgba(255, 255, 255, 0.8)', position: '8%' },
      { color: 'rgba(255, 255, 255, 0)', position: '100%' },
    ],
    [
      { color: '#CACACA', stop: '0%', opacity: 0.5 },
      { color: '#878787', stop: '50%', opacity: 0.6 },
      { color: '#202022', stop: '100%', opacity: 0.7 },
    ],
    'multiply'
  );

  // Store hooks
  const {
    isActive: isScreenSharing,
    stream,
    startSession,
    stopSession,
    captureScreenshot,
    sessionId: screenShareSessionId
  } = useScreenShareStore();

  const { saveToCloud } = useUploadPreferencesStore();

  const {
    messages,
    handleSubmitMessage,
    isLoading: isStreaming,
    handleClearChat,
    loadMessages
  } = useChatStore();

  const {
    activeSession,
    clearAndRenewActiveSession
  } = useSessionStore();

  // Workspace reactive data store
  const {
    setData: setWorkspaceData,
    getData: getWorkspaceData,
    setLoading: setWorkspaceLoading,
    setError: setWorkspaceError,
    subscribe: subscribeToWorkspaceData,
    setContext: setWorkspaceContext,
    getContext: getWorkspaceContext
  } = useWorkspaceDataStore();

  // UI context tracking
  const { setWorkspaceFile } = useUiContextStore();

  // Get current assistant - prioritize URL parameter over active session
  // This allows viewing any assistant's workspace regardless of active session
  const currentAssistant = assistantByName || (activeSession?.assistantId
    ? getAssistantById(activeSession.assistantId)
    : null);

  // Workspace layout hooks
  const { panels, togglePanel } = useWorkspaceLayout();

  // Keyboard shortcuts
  useWorkspaceKeyboard(
    () => togglePanel('chatPanel'),
    () => togglePanel('fileListPanel')
  );

  // Local state
  const [showAIWorkspace, setShowAIWorkspace] = useState(true); // true = AI Workspace (default), false = User Screen
  const [mobileView, setMobileView] = useState<'chat' | 'workspace'>('workspace'); // Mobile view toggle
  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string | null>(null);
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null);
  const [markdownViewMode, setMarkdownViewMode] = useState<'rendered' | 'raw'>('rendered'); // Toggle for MD/MDX files
  const [fileExplorerKey, setFileExplorerKey] = useState(0); // Key to force re-render of file explorer
  const [isReloadingFile, setIsReloadingFile] = useState(false); // Loading state for file reload
  const [showEmbedDialog, setShowEmbedDialog] = useState(false); // Toggle for embed dialog
  const [isHomePageMissing, setIsHomePageMissing] = useState(false); // True when on home page with no file
  const [isCreatingHomePage, setIsCreatingHomePage] = useState(false); // Loading state for home page creation
  const [showMemoryDialog, setShowMemoryDialog] = useState(false); // Toggle for memory preview dialog

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const workspaceRef = useRef<HTMLDivElement>(null);

  /**
   * Inject workspace API script into HTML content
   * This allows HTML pages to use workspace.ask() and reactive data binding
   */
  const injectWorkspaceAPIToHTML = (html: string): string => {
    // Find the </head> tag or <body> tag to inject script
    const headCloseIndex = html.toLowerCase().indexOf('</head>');
    const bodyOpenIndex = html.toLowerCase().indexOf('<body');

    // Use reactive API for full capabilities
    const scriptTag = `<script id="workspace-api">${workspaceReactiveApiScript}</script>`;

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

  // Load messages on mount and ensure we have a session
  useEffect(() => {
    if (activeSession?._id) {
      loadMessages(activeSession._id);
    } else {
      // If no active session, we need to select an assistant first
      console.log('No active session in workspace. Please select an assistant first.');
    }
  }, [activeSession?._id, loadMessages]);

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    console.log('🔐 ScreenShareWorkspace - Auth token check:', {
      hasToken: !!token,
      isAuthenticated
    });

    if (token) {
      initializeWebSocket(token);
    } else {
      console.warn('⚠️ No auth token available - WebSocket will not connect');
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated]);

  // Cleanup screen sharing on unmount
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isScreenSharing) {
        stopSession();
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // Set up video stream
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Auto-load file from URL path or default entry file
  useEffect(() => {
    const loadFile = async () => {
      if (!currentAssistant?._id) return;

      try {
        // Get file path from URL
        const urlFilePath = getFilePathFromUrl();

        // If no URL path, find default entry file
        const finalPath = urlFilePath || await findDefaultEntryFile(currentAssistant._id, activeSession?._id);

        if (finalPath) {
          // Determine file extension first
          const parts = finalPath.split('.');
          const extension = parts.length > 1 ? parts[parts.length - 1].toLowerCase() : 'text';

          // For HTML files, use raw endpoint to avoid JSON wrapping issues with large files
          if (extension === 'html') {
            try {
              const content = await getWorkspaceRawContent(finalPath, 'agent', currentAssistant._id, activeSession?._id);
              setSelectedFilePath(finalPath);
              setSelectedFileContent(content);
              setSelectedFileType(extension);
              setIsHomePageMissing(false);
            } catch (error) {
              console.error('Failed to load HTML file:', error);
            }
          } else {
            // Load the file using regular endpoint
            const response = await getWorkspaceItem(finalPath, 'agent', currentAssistant._id, activeSession?._id);

            if (response.found && response.content) {
              let content: string;
              if (response.isBinary) {
                content = response.content;
              } else {
                content = typeof response.content === 'string'
                  ? response.content
                  : JSON.stringify(response.content, null, 2);
              }

              setSelectedFilePath(finalPath);
              setSelectedFileContent(content);
              setSelectedFileType(extension);
              setIsHomePageMissing(false); // File was found
            }
          }
        } else if (!urlFilePath) {
          // No URL path and no default entry file - show welcome message
          setSelectedFilePath(null);
          setSelectedFileContent(null);
          setSelectedFileType(null);
          setIsHomePageMissing(true);
        } else {
          // URL path specified but file not found
          setIsHomePageMissing(false);
        }
      } catch (error) {
        console.error('Failed to load file:', error);
        setIsHomePageMissing(false);
      }
    };

    loadFile();
  }, [currentAssistant?._id, activeSession?._id, location.pathname]); // Load when assistant, session, or URL changes

  // Update UI context when workspace file changes
  useEffect(() => {
    if (selectedFilePath && selectedFileContent && currentAssistant?._id) {
      setWorkspaceFile({
        path: selectedFilePath,
        content: selectedFileContent,
        assistantId: currentAssistant._id,
      });
    } else {
      setWorkspaceFile(null);
    }
  }, [selectedFilePath, selectedFileContent, currentAssistant?._id, setWorkspaceFile]);

  // Initialize workspace API for MDX files (rendered directly, not in iframe)
  // Instead of using postMessage, connect directly to Zustand store
  useEffect(() => {
    (window as any).workspace = {
      // Direct store access for MDX components (no postMessage)
      // Always get current state to avoid stale references
      setData: async (key: string, value: any, source?: string) => {
        useWorkspaceDataStore.getState().setData(key, value, source);
      },
      getData: async (key: string) => {
        return useWorkspaceDataStore.getState().getData(key);
      },
      subscribe: (key: string, callback: (data: any) => void) => {
        return useWorkspaceDataStore.getState().subscribe(key, callback);
      },
      executeAgent: async (agentName: string, query: string, options?: any) => {
        if (!currentAssistant?._id) {
          throw new Error('No active assistant');
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        let targetAgentId = currentAssistant._id;

        // Support agent name lookup
        if (agentName && agentName !== currentAssistant.name) {
          const foundAgent = getAssistantById(agentName);
          if (foundAgent) {
            targetAgentId = foundAgent._id;
          }
        }

        const response = await fetch(`${API_URL}/assistant/${targetAgentId}/workspace-execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'x-workspace-session': options?.sessionId || activeSession?._id || 'workspace-session'
          },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          throw new Error(`Agent execution failed: ${response.statusText}`);
        }

        let data = await response.json();

        // Handle { success, response } format from backend
        if (data.response) {
          // If response is a string (could be stringified JSON), try to parse it
          if (typeof data.response === 'string') {
            try {
              const parsed = JSON.parse(data.response);
              data = parsed; // Replace data with parsed object
            } catch (e) {
              // If parse fails, it's a plain text response
              return data.response;
            }
          } else {
            // Response is already an object
            data = data.response;
          }
        }

        // Handle message format from backend (used by data.message)
        if (data.message) {
          if (typeof data.message === 'string') {
            try {
              const parsed = JSON.parse(data.message);
              data = parsed;
            } catch (e) {
              return data.message;
            }
          } else {
            data = data.message;
          }
        }

        // Extract text from message object format (with content array)
        if (data.content && Array.isArray(data.content) && data.content.length > 0) {
          const textContent = data.content.find((c: any) => c.type === 'text');
          if (textContent && textContent.text && textContent.text.value) {
            return textContent.text.value;
          }
        }

        return typeof data === 'object' ? JSON.stringify(data) : data;
      },
      executeAgentStream: async (agentName: string, query: string, onChunk?: (chunk: string, fullText: string) => void, options?: any) => {
        if (!currentAssistant?._id) {
          throw new Error('No active assistant');
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        let targetAgentId = currentAssistant._id;

        if (agentName && agentName !== currentAssistant.name) {
          const foundAgent = getAssistantById(agentName);
          if (foundAgent) {
            targetAgentId = foundAgent._id;
          }
        }

        const response = await fetch(`${API_URL}/assistant/${targetAgentId}/workspace-execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
            'x-workspace-session': options?.sessionId || activeSession?._id || 'workspace-session'
          },
          body: JSON.stringify({ query })
        });

        if (!response.ok) {
          throw new Error(`Agent execution failed: ${response.statusText}`);
        }

        // Read SSE stream
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullText = '';

        if (!reader) {
          throw new Error('No response body');
        }

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
                  if (streamEvent.type === 'content' && streamEvent.text) {
                    fullText += streamEvent.text;
                    onChunk?.(streamEvent.text, fullText);
                  }
                } catch (parseError) {
                  console.error('Failed to parse SSE event:', parseError);
                }
              }
            }
          }
        }

        return fullText;
      }
    };

    return () => {
      // Cleanup: remove workspace API on unmount
      if ((window as any).workspace) {
        delete (window as any).workspace;
      }
    };
  }, [currentAssistant, activeSession, getAssistantById]); // Re-initialize if assistant or session changes

  // Listen for PostMessage events from workspace iframe
  useEffect(() => {
    const handleWorkspaceMessage = async (event: MessageEvent) => {
      // Handle workspace action messages
      if (event.data.type === 'WORKSPACE_ACTION' && event.data.action === 'sendMessage') {
        handleSendMessage(event.data.message);
      }

      // Handle workspace search requests
      if (event.data.type === 'workspace-search') {
        const { query, assistantId, sessionId, requestId } = event.data.payload;

        if (!currentAssistant?._id) {
          console.error('❌ No current assistant for workspace search');
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const targetAssistantId = assistantId || currentAssistant._id;

        try {
          console.log('🔍 [ScreenShareWorkspace] Starting workspace search:', query);

          const response = await fetch(
            `${API_URL}/assistant/${targetAssistantId}/workspace-execute`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                'x-workspace-session': sessionId || activeSession?._id || 'workspace-session'
              },
              body: JSON.stringify({
                query,
                searchContext: {
                  currentPage: selectedFilePath || 'workspace'
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

                    // Send event to iframe (event.source is the iframe window)
                    // Include requestId so iframe can match response to request
                    if (event.source) {
                      (event.source as Window).postMessage({
                        type: 'workspace-search-response',
                        payload: {
                          ...streamEvent,
                          requestId: requestId // Add requestId to response
                        }
                      }, '*');
                    }
                  } catch (parseError) {
                    console.error('Failed to parse SSE event:', parseError);
                  }
                }
              }
            }
          }
        } catch (error: any) {
          console.error('❌ [ScreenShareWorkspace] Search error:', error);

          // Send error to iframe with requestId
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'workspace-search-response',
              payload: {
                type: 'error',
                error: error.message || 'Search failed',
                timestamp: Date.now(),
                requestId: requestId // Include requestId in error response
              }
            }, '*');
          }
        }
      }

      // ========== REACTIVE DATA HANDLERS ==========

      // Handle workspace-set-data
      if (event.data.type === 'workspace-set-data') {
        const { key, value, source } = event.data.payload;
        const requestId = event.data.requestId;

        try {
          setWorkspaceData(key, value, source);

          if (event.source) {
            (event.source as Window).postMessage({
              type: 'workspace-set-data-response',
              requestId,
              success: true
            }, '*');
          }
        } catch (error: any) {
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'workspace-set-data-response',
              requestId,
              success: false,
              error: error.message
            }, '*');
          }
        }
      }

      // Handle workspace-get-data
      if (event.data.type === 'workspace-get-data') {
        const { key } = event.data.payload;
        const requestId = event.data.requestId;

        const dataState = getWorkspaceData(key);

        if (event.source) {
          (event.source as Window).postMessage({
            type: 'workspace-get-data-response',
            requestId,
            found: !!dataState,
            data: dataState
          }, '*');
        }
      }

      // Handle workspace-subscribe
      if (event.data.type === 'workspace-subscribe') {
        const { key } = event.data.payload;

        // Subscribe to data changes and forward to iframe
        const unsubscribe = subscribeToWorkspaceData(key, (dataState) => {
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'workspace-data-changed',
              key,
              dataState
            }, '*');
          }
        });
      }

      // Handle workspace-execute-agent
      if (event.data.type === 'workspace-execute-agent') {
        const { agentName, query, sessionId, requestId } = event.data.payload;

        if (!currentAssistant?._id) {
          console.error('❌ No current assistant for agent execution');
          return;
        }

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

        // Resolve agent name to ID (support both name and ID)
        let targetAgentId = agentName === 'current' ? currentAssistant._id : agentName;

        // Try to find agent by name if not an ID format
        if (!targetAgentId.match(/^[a-f0-9]{24}$/i)) {
          const foundAgent = getAssistantById(targetAgentId); // This supports name lookup
          if (foundAgent) {
            targetAgentId = foundAgent._id;
          }
        }

        try {
          const response = await fetch(
            `${API_URL}/assistant/${targetAgentId}/workspace-execute`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream',
                'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
                'x-workspace-session': sessionId || activeSession?._id || 'workspace-session'
              },
              body: JSON.stringify({
                query,
                searchContext: {
                  currentPage: selectedFilePath || 'workspace'
                }
              })
            }
          );

          if (!response.ok) {
            throw new Error(`Agent execution failed: ${response.statusText}`);
          }

          // Read SSE stream
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();

          if (!reader) {
            throw new Error('No response body');
          }

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

                    if (event.source) {
                      (event.source as Window).postMessage({
                        type: 'workspace-execute-agent-response',
                        requestId,
                        payload: streamEvent
                      }, '*');
                    }
                  } catch (parseError) {
                    console.error('Failed to parse SSE event:', parseError);
                  }
                }
              }
            }
          }
        } catch (error: any) {
          console.error('❌ [ScreenShareWorkspace] Agent execution error:', error);

          if (event.source) {
            (event.source as Window).postMessage({
              type: 'workspace-execute-agent-response',
              requestId,
              payload: {
                type: 'error',
                error: error.message || 'Agent execution failed',
                timestamp: Date.now()
              }
            }, '*');
          }
        }
      }

      // Handle workspace-load-file (Fix Gap 1)
      if (event.data.type === 'workspace-load-file') {
        const { path } = event.data.payload;
        const requestId = event.data.requestId;

        if (!currentAssistant?._id) {
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'workspace-load-file-response',
              requestId,
              error: 'No active assistant'
            }, '*');
          }
          return;
        }

        try {
          const response = await getWorkspaceItem(path, 'agent', currentAssistant._id, activeSession?._id);

          if (response.found && response.content) {
            let content: string;
            if (response.isBinary) {
              content = response.content;
            } else {
              content = typeof response.content === 'string'
                ? response.content
                : JSON.stringify(response.content, null, 2);
            }

            if (event.source) {
              (event.source as Window).postMessage({
                type: 'workspace-load-file-response',
                requestId,
                content
              }, '*');
            }

            console.log(`📂 [ScreenShareWorkspace] File loaded: ${path}`);
          } else {
            if (event.source) {
              (event.source as Window).postMessage({
                type: 'workspace-load-file-response',
                requestId,
                error: 'File not found'
              }, '*');
            }
          }
        } catch (error: any) {
          if (event.source) {
            (event.source as Window).postMessage({
              type: 'workspace-load-file-response',
              requestId,
              error: error.message || 'Failed to load file'
            }, '*');
          }
        }
      }

      // Handle workspace-navigate
      if (event.data.type === 'workspace-navigate') {
        const { path } = event.data.payload;

        if (assistantName) {
          console.log(`🧭 [ScreenShareWorkspace] Navigating to: ${path}`);
          navigate(`/admin/assistants/${assistantName}/workspace${path}`);
        }
      }

      // Handle workspace-get-context
      if (event.data.type === 'workspace-get-context') {
        const requestId = event.data.requestId;

        const context = {
          currentFile: selectedFilePath,
          agentId: currentAssistant?._id || null,
          agentName: currentAssistant?.name || null,
          sessionId: activeSession?._id || null,
          userId: userSessionInfo?.userId || null,
          userName: userSessionInfo?.userName || null
        };

        if (event.source) {
          (event.source as Window).postMessage({
            type: 'workspace-get-context-response',
            requestId,
            context
          }, '*');
        }

        console.log('🌐 [ScreenShareWorkspace] Context retrieved:', context);
      }
    };

    window.addEventListener('message', handleWorkspaceMessage);
    return () => window.removeEventListener('message', handleWorkspaceMessage);
  }, [currentAssistant?._id, activeSession?._id, selectedFilePath]); // Add dependencies

  // Expose global function for MDX/HTML buttons to trigger messages
  useEffect(() => {
    // @ts-expect-error adding global function to window
    window.sendWorkspaceMessage = (message: string) => {
      console.log('📨 [ScreenShareWorkspace] Sending message from workspace button:', message);
      handleSendMessage(message);
    };

    return () => {
      // @ts-expect-error cleanup global function
      delete window.sendWorkspaceMessage;
    };
  }, []); // Empty deps - handleSendMessage is stable enough

  // Expose global function for MDX links to load workspace files
  useEffect(() => {
    // @ts-expect-error adding global function to window
    window.loadWorkspaceFile = (path: string) => {
      if (!assistantName) return;

      console.log('📂 [ScreenShareWorkspace] Loading workspace file:', path);
      // Navigate to file path - useEffect will handle loading
      navigate(`/admin/assistants/${assistantName}/workspace${path}`);
    };

    return () => {
      // @ts-expect-error cleanup global function
      delete window.loadWorkspaceFile;
    };
  }, [assistantName, navigate]);

  // Handle file selection from explorer
  const handleFileSelect = (path: string, content: string, type: string) => {
    // Update URL to include file path
    if (assistantName) {
      navigate(`/admin/assistants/${assistantName}/workspace${path}`);
    }
    // State will be updated by the useEffect that watches location.pathname
  };

  // Handle file deletion
  const handleDeleteFile = async () => {
    if (!selectedFilePath || !currentAssistant?._id) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete "${selectedFilePath.split('/').pop()}"?`);
    if (!confirmDelete) return;

    try {
      await deleteWorkspaceItem(
        selectedFilePath,
        'agent',
        currentAssistant._id,
        activeSession?._id
      );

      // Navigate back to workspace root (no file selected)
      if (assistantName) {
        navigate(`/admin/assistants/${assistantName}/workspace`);
      }

      // Clear selection
      setSelectedFilePath(null);
      setSelectedFileContent(null);
      setSelectedFileType(null);

      // Trigger file explorer refresh
      setFileExplorerKey(prev => prev + 1);
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  // Handle file deleted callback from explorer
  const handleFileDeleted = () => {
    setFileExplorerKey(prev => prev + 1);
  };

  // Handle file reload
  const handleReloadFile = async () => {
    if (!selectedFilePath || !currentAssistant?._id) return;

    try {
      setIsReloadingFile(true);

      // For HTML files, use raw endpoint to avoid JSON wrapping issues
      if (selectedFileType === 'html') {
        const content = await getWorkspaceRawContent(selectedFilePath, 'agent', currentAssistant._id, activeSession?._id);
        setSelectedFileContent(content);
      } else {
        const response = await getWorkspaceItem(selectedFilePath, 'agent', currentAssistant._id, activeSession?._id);

        if (response.found && response.content) {
          let content: string;
          if (response.isBinary) {
            content = response.content;
          } else {
            content = typeof response.content === 'string'
              ? response.content
              : JSON.stringify(response.content, null, 2);
          }

          setSelectedFileContent(content);
        }
      }
    } catch (error) {
      console.error('Failed to reload file:', error);
      alert('Failed to reload file. Please try again.');
    } finally {
      setIsReloadingFile(false);
    }
  };

  const startScreenShare = async () => {
    // Prevent multiple simultaneous calls
    if (isScreenSharing || stream) {
      console.log('Screen sharing already active, skipping...');
      return;
    }

    try {
      await startSession({
        captureMode: 'manual',
        analysisMode: 'session'
      });
    } catch (error) {
      console.error('Failed to start screen share:', error);
    }
  };

  const handleSendMessage = async (messageText: string, attachments?: Base64Attachment[]) => {
    console.log('🚀 [ScreenShareWorkspace] handleSendMessage called', {
      messageText,
      hasAttachments: !!attachments,
      activeSessionId: activeSession?._id,
      currentAssistantId: currentAssistant?._id,
      isScreenSharing
    });

    // Check if we have an active session
    if (!activeSession?._id) {
      console.error('No active session. Please select an assistant from the assistants page first.');
      return;
    }

    // Capture and attach screenshot if screen sharing
    if (isScreenSharing) {
      console.log('📸 [ScreenShareWorkspace] Capturing screenshot...');
      const screenshot = await captureScreenshot();
      if (screenshot) {
        const fileName = screenShareSessionId
          ? `${screenShareSessionId}-screenshare.png`
          : `screen-${Date.now()}-screenshare.png`;

        console.log('📤 [ScreenShareWorkspace] Uploading screenshot:', fileName);

        try {
          // Convert screenshot to base64 attachment
          const file = new File([screenshot], fileName, { type: 'image/png' });
          const screenshotAttachment = await fileToBase64Attachment(file);

          // If saveToCloud is enabled, also upload to cloud storage
          if (saveToCloud) {
            try {
              const formData = new FormData();
              formData.append('file', file);
              formData.append('title', fileName);

              const uploadResponse = await uploadContentFile(formData);

              if (uploadResponse?.data?.gcpStorageUrl) {
                screenshotAttachment.cloudUrl = uploadResponse.data.gcpStorageUrl;
                console.log('📤 Screenshot uploaded to cloud:', uploadResponse.data.gcpStorageUrl);
              }
            } catch (uploadError) {
              console.error('Cloud upload failed (continuing with base64):', uploadError);
            }
          }

          console.log('📎 [ScreenShareWorkspace] Created attachment:', {
            fileName: screenshotAttachment.fileName,
            mimeType: screenshotAttachment.mimeType,
            hasCloudUrl: !!screenshotAttachment.cloudUrl
          });

            // Send message with screenshot
            const assistantInfo = currentAssistant ? {
              _id: currentAssistant._id,
              voice: currentAssistant.voice,
              name: currentAssistant.name
            } : undefined;

            console.log('💬 [ScreenShareWorkspace] Calling handleSubmitMessage with:', {
              messageText,
              assistantInfo,
              sessionId: activeSession?._id,
              attachmentCount: 1
            });

            await handleSubmitMessage(
              messageText,
              assistantInfo,
              activeSession?._id,
              [screenshotAttachment]
            );

            console.log('✅ [ScreenShareWorkspace] Message sent successfully');
        } catch (error) {
          console.error('Failed to process screenshot:', error);
          // Send message without screenshot on error
          const assistantInfo = currentAssistant ? {
            _id: currentAssistant._id,
            voice: currentAssistant.voice,
            name: currentAssistant.name
          } : undefined;

          await handleSubmitMessage(
            messageText,
            assistantInfo,
            activeSession?._id,
            undefined
          );
        }
      }
    } else {
      // Send without screenshot
      console.log('📨 [ScreenShareWorkspace] Sending message without screenshot');

      const assistantInfo = currentAssistant ? {
        _id: currentAssistant._id,
        voice: currentAssistant.voice,
        name: currentAssistant.name
      } : undefined;

      console.log('💬 [ScreenShareWorkspace] Calling handleSubmitMessage (no screenshot) with:', {
        messageText,
        assistantInfo,
        sessionId: activeSession?._id,
        attachments
      });

      await handleSubmitMessage(
        messageText,
        assistantInfo,
        activeSession?._id,
        attachments
      );

      console.log('✅ [ScreenShareWorkspace] Message sent successfully (no screenshot)');
    }
  };

  const handleClear = async () => {
    if (activeSession?._id && currentAssistant?._id) {
      await handleClearChat(
        activeSession._id,
        currentAssistant._id,
        clearAndRenewActiveSession
      );
    }
  };

  const handleCreateHomePage = async () => {
    if (!currentAssistant?._id) return;

    setIsCreatingHomePage(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Default home page content
      const defaultContent = `---
title: ${currentAssistant.name} Workspace
description: Welcome to your AI workspace
---

# Welcome to ${currentAssistant.name} Workspace

This is your workspace home page. You can use this space to organize your work, create documentation, and interact with your AI assistant.

## Getting Started

- Use the file explorer on the left to create and organize files
- Create markdown files (.md/.mdx) for documentation
- Create HTML files for interactive dashboards
- All files are private to this assistant

## Quick Actions

Feel free to customize this page or create new files using the workspace!
`;

      // Create the home page file
      const response = await fetch(`${API_URL}/api/workspace/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('userToken')}`,
        },
        body: JSON.stringify({
          itemPath: '/README.mdx',
          content: defaultContent,
          scope: 'agent',
          scopeId: currentAssistant._id,
          metadata: {
            title: `${currentAssistant.name} Workspace`,
            description: 'Workspace home page',
            contentType: 'text/mdx',
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create home page');
      }

      // Refresh file explorer and load the new file
      setFileExplorerKey(prev => prev + 1);

      // Reload the current location to load the new home page
      window.location.reload();
    } catch (error) {
      console.error('Failed to create home page:', error);
      alert('Failed to create home page. Please try again.');
    } finally {
      setIsCreatingHomePage(false);
    }
  };

  return (
    <div
      ref={workspaceRef}
      className="h-full w-full overflow-hidden flex relative"
    >
      <DynamicBackground {...backgroundProps} />
      <div className="relative z-10 flex w-full justify-center h-full">
        {/* Mobile View Toggle - Only visible on mobile */}
        <div className="md:hidden absolute top-0 left-0 right-0 z-20 px-4 py-2 bg-background/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/admin/assistants')}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="Back to assistants"
            >
              <ArrowLeft className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
            </button>
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
              <button
                onClick={() => setMobileView('chat')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  mobileView === 'chat'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Chat
              </button>
              <button
                onClick={() => setMobileView('workspace')}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  mobileView === 'workspace'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                Workspace
              </button>
            </div>
            <button
              onClick={() => setShowMemoryDialog(true)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title="View workspace memory"
            >
              <Database className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row w-full gap-4 md:gap-7 pt-14 md:pt-0">
          {/* Left Panel - Chat (with smooth animation) */}
          <ContentPanel
            className={cn(
              'flex flex-col w-full md:max-w-sm md:w-full h-full transition-all duration-300 ease-in-out',
              // Desktop: use panels state
              'hidden md:flex',
              panels.chatPanel ? 'md:translate-x-0 md:opacity-100' : 'md:-translate-x-full md:opacity-0 md:pointer-events-none md:absolute',
              // Mobile: use mobileView state
              mobileView === 'chat' ? '!flex' : '!hidden md:!flex'
            )}
          >
              {!activeSession ? (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Active Session</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Please select an assistant from the assistants page first.
                    </p>
                    <button
                      onClick={() => navigate('/admin/assistants')}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-sm"
                    >
                      Go to Assistants
                    </button>
                  </div>
                </div>
              ) : (
                <SBChatKitUI
                  messages={messages}
                  assistant={currentAssistant ? {
                    name: currentAssistant.name,
                    description: currentAssistant.description,
                    avatar: currentAssistant.avatarImage,
                    conversationStarters: currentAssistant.conversationStarters?.length
                      ? currentAssistant.conversationStarters.map(cs => ({ ...cs }))
                      : []
                  } : undefined}
                  assistantName={currentAssistant?.name || 'AI Assistant'}
                  onSendMessage={handleSendMessage}
                  onClear={handleClear}
                  isLoading={isStreaming}
                  compact={true}
                />
              )}
          </ContentPanel>

          {/* Right Panel - Workspace View Area */}
          <ContentPanel
            className={cn(
              'flex-1 min-w-0 flex flex-col h-full',
              // Mobile: use mobileView state
              mobileView === 'workspace' ? 'flex' : 'hidden md:flex'
            )}
          >
            {/* Toolbar - hidden on mobile (mobile has its own header) */}
            <div className="hidden md:flex px-4 py-3 items-center justify-between border-b border-border">
              {/* Left: Back Button + Workspace Title + Icon Switcher */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate('/admin/assistants')}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  title="Back to assistants"
                >
                  <ArrowLeft className="h-5 w-5 text-muted-foreground rtl:rotate-180" />
                </button>
                <h3 className="text-sm font-semibold text-foreground">
                  {currentAssistant?.name || 'AI'} Workspace
                </h3>

                {/* Icon Workspace Switcher */}
                <div className="inline-flex items-center rounded-lg bg-violet/10 px-2 py-0.5 gap-1.5">
                  <span className="text-xs font-medium text-violet">View:</span>
                  <button
                    onClick={() => setShowAIWorkspace(false)}
                    className={cn(
                      'p-1 rounded transition-all',
                      !showAIWorkspace
                        ? 'text-foreground opacity-100'
                        : 'text-muted-foreground opacity-40 hover:opacity-60'
                    )}
                    title="User Screen"
                  >
                    <User className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setShowAIWorkspace(true)}
                    className={cn(
                      'p-1 rounded transition-all',
                      showAIWorkspace
                        ? 'text-foreground opacity-100'
                        : 'text-muted-foreground opacity-40 hover:opacity-60'
                    )}
                    title="AI Workspace"
                  >
                    <Bot className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Right: Toggle Buttons */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowMemoryDialog(true)}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  title="View workspace memory"
                >
                  <Database className="h-5 w-5 text-muted-foreground" />
                </button>
                <button
                  onClick={() => togglePanel('chatPanel')}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  title={panels.chatPanel ? 'Hide chat panel (⌘⇧C)' : 'Show chat panel (⌘⇧C)'}
                >
                  {panels.chatPanel ? <PanelLeftClose className="h-5 w-5 text-muted-foreground" /> : <PanelLeft className="h-5 w-5 text-muted-foreground" />}
                </button>
                <button
                  onClick={() => togglePanel('fileListPanel')}
                  className="p-2 hover:bg-accent rounded-lg transition-colors"
                  title={panels.fileListPanel ? 'Hide file list (⌘⇧E)' : 'Show file list (⌘⇧E)'}
                >
                  {panels.fileListPanel ? <FolderClosed className="h-5 w-5 text-muted-foreground" /> : <FolderOpen className="h-5 w-5 text-muted-foreground" />}
                </button>
              </div>
            </div>

            {/* Mobile Workspace Toolbar */}
            <div className="md:hidden px-3 py-2 flex items-center justify-between border-b border-border bg-background">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground truncate">
                  {currentAssistant?.name || 'AI'} Workspace
                </h3>
                {/* Icon Workspace Switcher */}
                <div className="inline-flex items-center rounded-lg bg-violet/10 px-1.5 py-0.5 gap-1">
                  <button
                    onClick={() => setShowAIWorkspace(false)}
                    className={cn(
                      'p-0.5 rounded transition-all',
                      !showAIWorkspace
                        ? 'text-foreground opacity-100'
                        : 'text-muted-foreground opacity-40 hover:opacity-60'
                    )}
                    title="User Screen"
                  >
                    <User className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setShowAIWorkspace(true)}
                    className={cn(
                      'p-0.5 rounded transition-all',
                      showAIWorkspace
                        ? 'text-foreground opacity-100'
                        : 'text-muted-foreground opacity-40 hover:opacity-60'
                    )}
                    title="AI Workspace"
                  >
                    <Bot className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => togglePanel('fileListPanel')}
                  className="p-1.5 hover:bg-accent rounded-lg transition-colors"
                  title={panels.fileListPanel ? 'Hide files' : 'Show files'}
                >
                  {panels.fileListPanel ? <FolderClosed className="h-4 w-4 text-muted-foreground" /> : <FolderOpen className="h-4 w-4 text-muted-foreground" />}
                </button>
              </div>
            </div>

            {/* Dynamic Content Area - Shows either Screen Preview or AI Workspace */}
            {showAIWorkspace ? (
              // AI Workspace View - File Explorer + File Viewer
              <div className="flex-1 flex overflow-hidden bg-secondary font-['Inter',sans-serif]">
                {/* File Explorer Sidebar (with smooth animation) */}
                <div
                  className={cn(
                    'w-64 md:w-80 border-r border-border bg-background transition-all duration-300 ease-in-out',
                    // Desktop behavior
                    'hidden md:block',
                    panels.fileListPanel ? 'md:translate-x-0 md:opacity-100' : 'md:-translate-x-full md:opacity-0 md:pointer-events-none md:absolute',
                    // Mobile: show as overlay when panel is open
                    panels.fileListPanel ? '!block absolute md:relative z-10 h-full' : ''
                  )}
                  style={{ willChange: 'transform, opacity' }}
                >
                  {currentAssistant?._id ? (
                    <WorkspaceFileExplorer
                      key={fileExplorerKey}
                      agentId={currentAssistant._id}
                      agentName={currentAssistant.name}
                      sessionId={activeSession?._id}
                      selectedPath={selectedFilePath}
                      onFileSelect={handleFileSelect}
                      onFileDeleted={handleFileDeleted}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full p-6">
                      <p className="text-sm text-muted-foreground">No assistant selected</p>
                    </div>
                  )}
                </div>

                {/* File Viewer */}
                <div className="flex-1 flex flex-col overflow-hidden bg-background">
                  {selectedFilePath && selectedFileContent ? (
                    <>
                      {/* File Header */}
                      <div className="px-3 md:px-6 py-2 md:py-4 border-b border-border">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <h3 className="text-xs md:text-sm font-semibold text-foreground truncate">
                              {selectedFilePath}
                            </h3>
                            <span className="px-1.5 md:px-2 py-0.5 bg-secondary text-muted-foreground rounded text-[10px] md:text-xs font-medium shrink-0">
                              {selectedFileType?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                            {/* Toggle for MD/MDX files */}
                            {(selectedFileType === 'md' || selectedFileType === 'mdx') && (
                              <button
                                onClick={() => setMarkdownViewMode(prev => prev === 'rendered' ? 'raw' : 'rendered')}
                                className="p-1.5 md:px-3 md:py-1 bg-secondary hover:bg-accent text-foreground rounded text-xs font-medium transition-colors flex items-center gap-1"
                                title={markdownViewMode === 'rendered' ? 'Show Raw' : 'Show Rendered'}
                              >
                                <FileText className="h-3 w-3" />
                                <span className="hidden md:inline">{markdownViewMode === 'rendered' ? 'Show Raw' : 'Show Rendered'}</span>
                              </button>
                            )}
                            {/* Embed button for HTML/MDX/MD files */}
                            {(selectedFileType === 'html' || selectedFileType === 'md' || selectedFileType === 'mdx') && (
                              <button
                                onClick={() => setShowEmbedDialog(true)}
                                className="p-1.5 md:px-3 md:py-1 bg-violet/10 hover:bg-violet/20 text-violet rounded text-xs font-medium transition-colors flex items-center gap-1"
                                title="Embed this file"
                              >
                                <Share2 className="h-3 w-3" />
                                <span className="hidden md:inline">Embed</span>
                              </button>
                            )}
                            {/* Reload button */}
                            <button
                              onClick={handleReloadFile}
                              disabled={isReloadingFile}
                              className="p-1.5 md:px-3 md:py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-xs font-medium transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reload file"
                            >
                              <RefreshCw className={`h-3 w-3 ${isReloadingFile ? 'animate-spin' : ''}`} />
                              <span className="hidden md:inline">Reload</span>
                            </button>
                            {/* Delete button */}
                            <button
                              onClick={handleDeleteFile}
                              className="p-1.5 md:px-3 md:py-1 bg-destructive/10 hover:bg-destructive/20 text-destructive rounded text-xs font-medium transition-colors flex items-center gap-1"
                              title="Delete file"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span className="hidden md:inline">Delete</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* File Content */}
                      <div className="flex-1 overflow-auto min-h-0">
                        {selectedFileType === 'html' ? (
                          <iframe
                            srcDoc={injectWorkspaceAPIToHTML(selectedFileContent)}
                            className="w-full h-full min-h-screen border-0"
                            sandbox="allow-scripts allow-forms allow-same-origin"
                            title="HTML Preview"
                          />
                        ) : (selectedFileType === 'md' || selectedFileType === 'mdx') ? (
                          markdownViewMode === 'rendered' ? (
                            <div className="p-4 md:p-8">
                              <MarkdownRenderer content={selectedFileContent} />
                            </div>
                          ) : (
                            <div className="p-3 md:p-6">
                              <pre className="text-xs md:text-sm text-foreground bg-secondary rounded-lg p-3 md:p-4 overflow-auto whitespace-pre-wrap font-mono">
                                {selectedFileContent}
                              </pre>
                            </div>
                          )
                        ) : (selectedFileType === 'png' || selectedFileType === 'jpg' || selectedFileType === 'jpeg' || selectedFileType === 'gif') ? (
                          <div className="p-4 md:p-8 flex items-center justify-center">
                            <img
                              src={`data:image/${selectedFileType};base64,${selectedFileContent}`}
                              alt={selectedFilePath}
                              className="max-w-full h-auto rounded-lg shadow-lg"
                            />
                          </div>
                        ) : selectedFileType === 'json' ? (
                          <JSONViewer content={selectedFileContent} />
                        ) : (
                          <div className="p-3 md:p-6">
                            <pre className="text-xs md:text-sm text-foreground whitespace-pre-wrap font-mono">
                              {selectedFileContent}
                            </pre>
                          </div>
                        )}
                      </div>
                    </>
                  ) : isHomePageMissing ? (
                    // Welcome message for missing home page
                    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                      <div className="text-center max-w-md">
                        <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-violet/10 rounded-full mb-4 md:mb-6">
                          <Sparkles className="h-8 w-8 md:h-10 md:w-10 text-violet" />
                        </div>
                        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2 md:mb-3">Welcome to Your Workspace</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-4 md:mb-6 leading-relaxed">
                          This workspace doesn&apos;t have a home page yet. Create one to get started with organizing your work,
                          documenting projects, or building interactive dashboards.
                        </p>
                        <button
                          onClick={handleCreateHomePage}
                          disabled={isCreatingHomePage}
                          className="px-4 md:px-6 py-2 md:py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-xs md:text-sm font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                        >
                          {isCreatingHomePage ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                              Creating...
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4" />
                              Create Home Page
                            </>
                          )}
                        </button>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-3 md:mt-4">
                          This will create a README.mdx file at the root of your workspace
                        </p>
                      </div>
                    </div>
                  ) : (
                    // No file selected
                    <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                      <div className="text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-secondary rounded-full mb-3 md:mb-4">
                          <FileText className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xs md:text-sm font-medium text-foreground mb-1">No file selected</h3>
                        <p className="text-[10px] md:text-xs text-muted-foreground">Select a file from the explorer to preview</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // User Screen Preview
              <>
                <div className="flex-1 bg-card p-4 flex items-center justify-center">
                  {isScreenSharing && stream ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <Monitor className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground/70 mb-1">
                        {isScreenSharing ? 'Connecting...' : 'Screen sharing is off'}
                      </p>
                      {!isScreenSharing && (
                        <button
                          onClick={startScreenShare}
                          className="mt-4 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                        >
                          Start Screen Share
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="px-4 py-2 bg-secondary">
                  <p className="text-xs text-muted-foreground flex items-center">
                    {isScreenSharing ? (
                      <>
                        <span className="inline-block w-2 h-2 bg-destructive rounded-full mr-2 animate-pulse"></span>
                        Live • Screenshots attached to messages
                      </>
                    ) : (
                      <>
                        <span className="inline-block w-2 h-2 bg-muted-foreground rounded-full mr-2"></span>
                        Inactive • Click to start sharing
                      </>
                    )}
                  </p>
                </div>
              </>
            )}
          </ContentPanel>
        </div>
      </div>

      {/* Workspace Embed Dialog */}
      {showEmbedDialog && selectedFilePath && currentAssistant && (
        <WorkspaceEmbedDialog
          isOpen={showEmbedDialog}
          onClose={() => setShowEmbedDialog(false)}
          assistantId={currentAssistant._id}
          assistantName={currentAssistant.name}
          filePath={selectedFilePath}
        />
      )}

      {/* Memory Preview Dialog */}
      <MemoryPreviewDialog
        isOpen={showMemoryDialog}
        onClose={() => setShowMemoryDialog(false)}
      />
    </div>
  );
};

export default ScreenShareWorkspace;
