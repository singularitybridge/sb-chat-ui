import axios from 'axios';
import 'dotenv'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to include the Bearer token
apiClient.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('userToken'); 
    
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default apiClient;
