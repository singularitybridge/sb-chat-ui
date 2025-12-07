/**
 * Enhanced Workspace Reactive API for HTML pages rendered in iframes
 *
 * Extends the base workspace API with reactive data binding, context access,
 * navigation, and multi-agent execution capabilities.
 *
 * This script is injected into HTML iframes to enable full workspace integration.
 */

export const workspaceReactiveApiScript = `
(function() {
  // Subscription management
  const subscriptions = new Map();

  // Enhanced workspace API
  window.workspace = window.workspace || {};

  // ========== DATA MANAGEMENT ==========

  /**
   * Set data in reactive store
   * @param {string} key - Data key for storage
   * @param {any} value - Data to store
   * @param {string} source - Optional source identifier
   * @returns {Promise<void>}
   */
  workspace.setData = function(key, value, source) {
    return new Promise((resolve, reject) => {
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      const handleResponse = (event) => {
        if (event.data.type === 'workspace-set-data-response' && event.data.requestId === requestId) {
          window.removeEventListener('message', handleResponse);
          if (event.data.success) {
            resolve();
          } else {
            reject(new Error(event.data.error || 'Failed to set data'));
          }
        }
      };

      window.addEventListener('message', handleResponse);

      window.parent.postMessage({
        type: 'workspace-set-data',
        payload: { key, value, source },
        requestId
      }, '*');

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  };

  /**
   * Get data from reactive store
   * @param {string} key - Data key to retrieve
   * @returns {Promise<any>}
   */
  workspace.getData = function(key) {
    return new Promise((resolve, reject) => {
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      const handleResponse = (event) => {
        if (event.data.type === 'workspace-get-data-response' && event.data.requestId === requestId) {
          window.removeEventListener('message', handleResponse);
          if (event.data.found) {
            resolve(event.data.data);
          } else {
            resolve(null);
          }
        }
      };

      window.addEventListener('message', handleResponse);

      window.parent.postMessage({
        type: 'workspace-get-data',
        payload: { key },
        requestId
      }, '*');

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  };

  /**
   * Subscribe to data changes
   * @param {string} key - Data key to watch
   * @param {function} callback - Called when data changes
   * @returns {function} Unsubscribe function
   */
  workspace.subscribe = function(key, callback) {
    if (!callback || typeof callback !== 'function') {
      throw new Error('Callback must be a function');
    }

    // Store callback
    if (!subscriptions.has(key)) {
      subscriptions.set(key, []);
    }
    subscriptions.get(key).push(callback);

    // Listen for data change events from parent
    const handleDataChange = (event) => {
      if (event.data.type === 'workspace-data-changed' && event.data.key === key) {
        try {
          callback(event.data.dataState);
        } catch (error) {
          console.error('Subscription callback error:', error);
        }
      }
    };

    window.addEventListener('message', handleDataChange);

    // Register subscription with parent
    window.parent.postMessage({
      type: 'workspace-subscribe',
      payload: { key }
    }, '*');

    // Return unsubscribe function
    return function() {
      const subs = subscriptions.get(key);
      if (subs) {
        const index = subs.indexOf(callback);
        if (index > -1) {
          subs.splice(index, 1);
        }
        if (subs.length === 0) {
          subscriptions.delete(key);
        }
      }
      window.removeEventListener('message', handleDataChange);

      // Notify parent of unsubscribe
      window.parent.postMessage({
        type: 'workspace-unsubscribe',
        payload: { key }
      }, '*');
    };
  };

  // ========== AGENT EXECUTION ==========

  /**
   * Execute any AI agent with a query
   * @param {string} agentName - Name or ID of agent to execute
   * @param {string} query - Query to send to agent
   * @param {object} options - Optional configuration
   * @param {string} options.sessionId - Use specific session
   * @param {boolean} options.stream - Enable streaming (default: false)
   * @param {function} options.onChunk - Callback for streaming chunks
   * @returns {Promise<string>} The AI response
   */
  workspace.executeAgent = function(agentName, query, options = {}) {
    if (options.stream && options.onChunk) {
      return workspace.executeAgentStream(agentName, query, options.onChunk, options);
    }

    return new Promise((resolve, reject) => {
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      let fullResponse = '';

      const handleResponse = (event) => {
        if (event.data.type === 'workspace-execute-agent-response' && event.data.requestId === requestId) {
          const payload = event.data.payload;

          // Handle chunk (accumulate)
          if (payload.type === 'chunk') {
            fullResponse += payload.content || '';
          }

          // Handle text_delta
          if (payload.type === 'text_delta') {
            fullResponse += payload.text || '';
          }

          // Handle complete
          if (payload.type === 'complete') {
            window.removeEventListener('message', handleResponse);
            resolve(payload.fullResponse || fullResponse);
          }

          // Handle error
          if (payload.type === 'error') {
            window.removeEventListener('message', handleResponse);
            reject(new Error(payload.error || 'Agent execution failed'));
          }
        }
      };

      window.addEventListener('message', handleResponse);

      window.parent.postMessage({
        type: 'workspace-execute-agent',
        payload: {
          agentName,
          query,
          sessionId: options.sessionId,
          requestId
        }
      }, '*');

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Request timeout'));
      }, 60000);
    });
  };

  /**
   * Execute agent with streaming response
   * @param {string} agentName - Name or ID of agent
   * @param {string} query - Query to send
   * @param {function} onChunk - Callback for each chunk
   * @param {object} options - Optional configuration
   * @returns {Promise<string>} Complete response
   */
  workspace.executeAgentStream = function(agentName, query, onChunk, options = {}) {
    return new Promise((resolve, reject) => {
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      let fullResponse = '';

      const handleResponse = (event) => {
        if (event.data.type === 'workspace-execute-agent-response' && event.data.requestId === requestId) {
          const payload = event.data.payload;

          // Handle chunk
          if (payload.type === 'chunk') {
            const content = payload.content || '';
            fullResponse += content;
            if (onChunk) onChunk(content, fullResponse);
          }

          // Handle text_delta
          if (payload.type === 'text_delta') {
            const text = payload.text || '';
            fullResponse += text;
            if (onChunk) onChunk(text, fullResponse);
          }

          // Handle complete
          if (payload.type === 'complete') {
            window.removeEventListener('message', handleResponse);
            resolve(fullResponse || payload.fullResponse);
          }

          // Handle error
          if (payload.type === 'error') {
            window.removeEventListener('message', handleResponse);
            reject(new Error(payload.error || 'Agent execution failed'));
          }
        }
      };

      window.addEventListener('message', handleResponse);

      window.parent.postMessage({
        type: 'workspace-execute-agent',
        payload: {
          agentName,
          query,
          sessionId: options.sessionId,
          requestId
        }
      }, '*');

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Request timeout'));
      }, 60000);
    });
  };

  // ========== NAVIGATION & CONTEXT ==========

  /**
   * Navigate to a workspace file
   * @param {string} path - File path (e.g., '/docs/readme.md')
   */
  workspace.navigate = function(path) {
    window.parent.postMessage({
      type: 'workspace-navigate',
      payload: { path }
    }, '*');
  };

  /**
   * Load a workspace file
   * @param {string} path - File path to load
   * @returns {Promise<string>} File content
   */
  workspace.loadFile = function(path) {
    return new Promise((resolve, reject) => {
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      const handleResponse = (event) => {
        if (event.data.type === 'workspace-load-file-response' && event.data.requestId === requestId) {
          window.removeEventListener('message', handleResponse);
          if (event.data.error) {
            reject(new Error(event.data.error));
          } else {
            resolve(event.data.content);
          }
        }
      };

      window.addEventListener('message', handleResponse);

      window.parent.postMessage({
        type: 'workspace-load-file',
        payload: { path },
        requestId
      }, '*');

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  };

  /**
   * Get workspace context (current file, user, session info)
   * @returns {Promise<object>} Context object
   */
  workspace.getContext = function() {
    return new Promise((resolve, reject) => {
      const requestId = 'req_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      const handleResponse = (event) => {
        if (event.data.type === 'workspace-get-context-response' && event.data.requestId === requestId) {
          window.removeEventListener('message', handleResponse);
          resolve(event.data.context);
        }
      };

      window.addEventListener('message', handleResponse);

      window.parent.postMessage({
        type: 'workspace-get-context',
        requestId
      }, '*');

      setTimeout(() => {
        window.removeEventListener('message', handleResponse);
        reject(new Error('Request timeout'));
      }, 30000);
    });
  };

  // ========== LEGACY COMPATIBILITY ==========

  /**
   * Send message to chat (legacy)
   * @param {string} message - Message to send
   */
  workspace.sendMessage = function(message) {
    window.parent.postMessage({
      type: 'workspace-message',
      payload: { message }
    }, '*');
  };

  /**
   * Ask AI assistant (legacy - uses default agent)
   * @param {string} query - Question to ask
   * @param {object} options - Optional configuration
   * @returns {Promise<string>} AI response
   */
  workspace.ask = function(query, options = {}) {
    return workspace.executeAgent(
      options.assistantId || 'current',
      query,
      { sessionId: options.sessionId }
    );
  };

  /**
   * Ask with streaming (legacy)
   * @param {string} query - Question to ask
   * @param {function} onChunk - Callback for chunks
   * @param {object} options - Optional configuration
   * @returns {Promise<string>} Complete response
   */
  workspace.askStream = function(query, onChunk, options = {}) {
    return workspace.executeAgentStream(
      options.assistantId || 'current',
      query,
      onChunk,
      { sessionId: options.sessionId }
    );
  };

  console.log('✅ Enhanced Workspace Reactive API initialized');
  console.log('📦 Available functions:', Object.keys(workspace));
})();
`;
