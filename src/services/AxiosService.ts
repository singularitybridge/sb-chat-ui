/// file_path= src/services/api/authService.ts
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { getToken } from './api/authService';
import { useEmbedAuth } from '../contexts/EmbedAuthContext'; // Import useEmbedAuth
const apiUrl = import.meta.env.VITE_API_URL;

// A way to access the EmbedAuthContext outside of a React component.
// This is a bit of a workaround. A more robust solution might involve
// a dedicated service or a different way to manage the API key globally for Axios.
import { clearSingleFlightCache } from '../utils/singleFlight'; // Import the cache clearing utility

let embedApiKey: string | null = null;
export const setGlobalEmbedApiKey = (key: string | null) => {
  const oldKey = embedApiKey;
  embedApiKey = key;
  // If the key has changed, and the new key is not null,
  // clear the cached session creation promise.
  // This ensures that the next call to getActiveSession will not use a stale promise
  // that might have been created before the API key was set or with an old key.
  if (key && key !== oldKey) {
    clearSingleFlightCache('POST /session');
  }
};
// We'll also need to update EmbedChatPage to call this.

/**
 * Create an axios instance augmented with axios-cache-interceptor to
 * dedupe concurrent GETs and leverage browser cache (304) responses.
 */
const apiClient = setupCache(
  axios.create({
    baseURL: apiUrl || 'https://api.singularitybridge.net/'
  }),
  {
    ttl: 60_000,        // 1-min soft cache for GET requests
    interpretHeader: false
  }
);
apiClient.interceptors.request.use(
  async (config) => {
    // Prioritize embedApiKey if present
    if (embedApiKey) {
      // If an embed API key is provided, use it as a Bearer token.
      // This assumes the "API key" for embedded use is a token expected in the Authorization header.
      config.headers.Authorization = `Bearer ${embedApiKey}`;
      // Ensure X-API-Key header is not present if we are using Authorization header
      delete config.headers['X-API-Key'];
    } else {
      // Standard token authentication
      const token = getToken(); // This is the user's login token from localStorage
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        // If no embedApiKey and no user token, remove any potentially stale auth headers
        delete config.headers.Authorization;
        delete config.headers['X-API-Key'];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
