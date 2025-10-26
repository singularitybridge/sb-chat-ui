import { workspaceReactiveApiScript } from './workspace-reactive-api';

/**
 * Workspace API for HTML pages rendered in iframes
 *
 * This script provides AI agent integration for HTML pages in the workspace.
 * It communicates with the parent window via postMessage to execute AI queries.
 *
 * Usage in HTML pages:
 * ```html
 * <script id="workspace-api">
 *   // This script is automatically injected by WorkspaceSearch component
 * </script>
 * <script>
 *   // Use workspace.ask() to query AI
 *   workspace.ask('What is the weather?').then(response => {
 *     document.getElementById('result').innerHTML = response;
 *   });
 * </script>
 * ```
 *
 * @deprecated Use workspaceReactiveApiScript for full reactive capabilities
 */

export const workspaceApiScript = `
(function() {
  // Create workspace API
  window.workspace = {
    /**
     * Ask AI assistant a question
     * @param {string} query - The question to ask
     * @param {object} options - Optional configuration
     * @param {string} options.assistantId - Override default assistant
     * @param {string} options.sessionId - Use specific session
     * @returns {Promise<string>} The AI response
     */
    ask: function(query, options = {}) {
      return new Promise((resolve, reject) => {
        const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        let fullResponse = '';

        // Listen for response
        const handleResponse = (event) => {
          if (event.data.type === 'workspace-search-response') {
            const payload = event.data.payload;

            // Handle chunk (accumulate response)
            if (payload.type === 'chunk' && payload.requestId === requestId) {
              fullResponse += payload.content || '';
            }

            // Handle text_delta (streaming chunk - alternative format)
            if (payload.type === 'text_delta' && payload.requestId === requestId) {
              fullResponse += payload.text || '';
            }

            // Handle complete response
            if (payload.type === 'complete' && payload.requestId === requestId) {
              window.removeEventListener('message', handleResponse);
              resolve(payload.fullResponse || fullResponse);
            }

            // Handle error
            if (payload.type === 'error' && payload.requestId === requestId) {
              window.removeEventListener('message', handleResponse);
              reject(new Error(payload.error || 'Search failed'));
            }
          }
        };

        window.addEventListener('message', handleResponse);

        // Send request to parent
        window.parent.postMessage({
          type: 'workspace-search',
          payload: {
            query: query,
            assistantId: options.assistantId,
            sessionId: options.sessionId,
            requestId: requestId
          }
        }, '*');

        // Timeout after 60 seconds
        setTimeout(() => {
          window.removeEventListener('message', handleResponse);
          reject(new Error('Request timeout'));
        }, 60000);
      });
    },

    /**
     * Ask AI assistant with streaming response
     * @param {string} query - The question to ask
     * @param {function} onChunk - Callback for each response chunk
     * @param {object} options - Optional configuration
     * @returns {Promise<string>} The complete response
     */
    askStream: function(query, onChunk, options = {}) {
      return new Promise((resolve, reject) => {
        const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        let fullResponse = '';

        // Listen for streaming response
        const handleResponse = (event) => {
          if (event.data.type === 'workspace-search-response') {
            const payload = event.data.payload;

            // Handle chunk (streaming chunk)
            if (payload.type === 'chunk' && payload.requestId === requestId) {
              const content = payload.content || '';
              fullResponse += content;
              if (onChunk) onChunk(content, fullResponse);
            }

            // Handle text_delta (streaming chunk - alternative format)
            if (payload.type === 'text_delta' && payload.requestId === requestId) {
              const text = payload.text || '';
              fullResponse += text;
              if (onChunk) onChunk(text, fullResponse);
            }

            // Handle complete response
            if (payload.type === 'complete' && payload.requestId === requestId) {
              window.removeEventListener('message', handleResponse);
              resolve(fullResponse || payload.fullResponse);
            }

            // Handle error
            if (payload.type === 'error' && payload.requestId === requestId) {
              window.removeEventListener('message', handleResponse);
              reject(new Error(payload.error || 'Search failed'));
            }
          }
        };

        window.addEventListener('message', handleResponse);

        // Send request to parent
        window.parent.postMessage({
          type: 'workspace-search',
          payload: {
            query: query,
            assistantId: options.assistantId,
            sessionId: options.sessionId,
            requestId: requestId
          }
        }, '*');

        // Timeout after 60 seconds
        setTimeout(() => {
          window.removeEventListener('message', handleResponse);
          reject(new Error('Request timeout'));
        }, 60000);
      });
    },

    /**
     * Send a message to the AI assistant (chat interface)
     * @param {string} message - The message to send
     */
    sendMessage: function(message) {
      window.parent.postMessage({
        type: 'workspace-message',
        payload: { message }
      }, '*');
    },

    /**
     * Load a workspace file
     * @param {string} path - Path to the file (e.g., '/docs/readme.md')
     */
    loadFile: function(path) {
      window.parent.postMessage({
        type: 'workspace-load-file',
        payload: { path }
      }, '*');
    }
  };

  console.log('✅ Workspace API initialized - use workspace.ask() to query AI');
})();
`;

/**
 * Export the enhanced reactive API script
 * This provides full reactive data binding, multi-agent orchestration,
 * navigation, and context access capabilities
 */
export { workspaceReactiveApiScript };
