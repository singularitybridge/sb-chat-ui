// src/api/loginService.ts
import axios from 'axios';
import apiClient from '../AxiosService';

const API_URL = 'https://api.singularitybridge.net/auth/';

export const login = async (token: string) => {
    try {
        debugger;
        const response = await apiClient.post(`auth/google/login`, {
            token: token
        });
        return response.data;
    } catch (error) {
        console.error('Failed to verify token', error);
        throw error;
    }
};

export const verifyBetaKey = async (betaKey: string) => {
console.log('verifying beta key');

  try {
      const response = await apiClient.post(`auth/beta-key`, {
          betaKey: betaKey
      });
      console.log('response', response.data);
      
      return response.data;
  } catch (error) {
      console.error('Failed to verify beta key', error);
      throw error;
  }
};