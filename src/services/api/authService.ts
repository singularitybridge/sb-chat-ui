/// file_path= src/services/api/authService.ts
import axios from 'axios';
import apiClient from '../AxiosService';

export const loginWithGoogle = async (token: string) => {
    try {
        const response = await apiClient.post('auth/google/login', {
            token: token
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
          betaKey: betaKey
      });    
      return response.data;
  } catch (error) {
      console.error('Failed to verify beta key', error);
      throw error;
  }
};