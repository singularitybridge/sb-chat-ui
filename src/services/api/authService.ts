/// file_path= src/services/api/authService.ts
import axios from 'axios';
import apiClient from '../AxiosService';
import { singleFlight } from '../../utils/singleFlight';

export const getToken = () => {
  return localStorage.getItem('userToken');
};

export const loginWithGoogle = async (token: string) => {
  try {
    const response = await apiClient.post('auth/google/login', {
      token: token,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to verify token', error);
    throw error;
  }
};

export const verifyToken = () =>
  singleFlight('POST /auth/verify-token', async () => {
    try {
      const response = await apiClient.post('auth/verify-token');
      return response.data;
    } catch (error) {
      console.error('Failed to verify token', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        // Token is invalid or expired
        localStorage.removeItem('userToken');
      }
      throw error;
    }
  });
