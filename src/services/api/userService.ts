import axios from 'axios';
import { IUser } from '../../store/models/User';
import apiClient from '../AxiosService';

const baseUrl = 'https://api.singularitybridge.net/user';

export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const response = await apiClient.get(`user`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<IUser> => {
  try {
    const response = await apiClient.get(`user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user with id ${userId}`, error);
    throw error;
  }
};

export const addUser = async (userData: IUser): Promise<IUser> => {
  try {
    const response = await apiClient.post(`user`, userData);
    debugger
    return response.data;
  } catch (error) {
    console.error('Failed to create user', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await apiClient.delete(`user/${userId}`);
  } catch (error) {
    console.error(`Failed to delete user with id ${userId}`, error);
    throw error;
  }
};
