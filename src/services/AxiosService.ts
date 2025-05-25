/// file_path= src/services/api/authService.ts
import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import { getToken } from './api/authService';
const apiUrl = import.meta.env.VITE_API_URL;

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
    const token = getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
