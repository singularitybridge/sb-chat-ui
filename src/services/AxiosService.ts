import axios from 'axios';
import { getToken } from './api/authService';
const apiUrl = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: apiUrl || 'https://api.singularitybridge.net/',
});


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
