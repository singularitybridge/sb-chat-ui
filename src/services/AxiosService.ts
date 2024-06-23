import axios from 'axios';
const apiUrl = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: apiUrl,
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
