// src/api/loginService.ts
import axios from 'axios';

const API_URL = 'http://localhost:3000/auth/';

export const login = async (token: string) => {
    try {
      
        const response = await axios.post(`${API_URL}/google/login`, {
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
      const response = await axios.post(`${API_URL}/beta-key`, {
          betaKey: betaKey
      });
      return response.data;
  } catch (error) {
      console.error('Failed to verify beta key', error);
      throw error;
  }
};