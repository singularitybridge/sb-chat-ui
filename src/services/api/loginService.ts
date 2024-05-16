// src/api/loginService.ts
import axios from 'axios';
import { ISystemUser } from '../../store/models/SystemUser';

const API_URL = 'http://localhost:3000/auth/google';

export const login = async (token: string) => {
    try {
      
        const response = await axios.post(`${API_URL}/login`, {
            token: token
        });
        return response.data;
    } catch (error) {
        console.error('Failed to verify token', error);
        throw error;
    }
};

export const getSystemUsers = async (): Promise<ISystemUser[]> => {
    try {
      const response = await axios.get(API_URL);
      debugger;
      return response.data;
    } catch (error) {
      console.error('Failed to fetch system users', error);
      throw error;
    }
  };