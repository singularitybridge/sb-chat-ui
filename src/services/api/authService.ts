/// file_path= src/services/api/authService.ts
import axios from 'axios';
import apiClient from '../AxiosService';

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

export const verifyBetaKey = async (betaKey: string) => {
  try {
    const response = await apiClient.post(`auth/beta-key`, {
      betaKey: betaKey,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to verify beta key', error);
    throw error;
  }
};

export const verifyToken = async () => {
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
};

