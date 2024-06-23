import axios from 'axios';
import { IUser } from '../../store/models/User';

const baseUrl = 'http://localhost:3000/user';

export const getAllUsers = async (): Promise<IUser[]> => {
  try {
    const response = await axios.get(baseUrl);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users', error);
    throw error;
  }
};

export const getUserById = async (userId: string): Promise<IUser> => {
  try {
    const response = await axios.get(`${baseUrl}/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user with id ${userId}`, error);
    throw error;
  }
};

export const addUser = async (userData: IUser): Promise<IUser> => {
  try {
    const response = await axios.post(baseUrl, userData);
    return response.data;
  } catch (error) {
    console.error('Failed to create user', error);
    throw error;
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await axios.delete(`${baseUrl}/${userId}`);
  } catch (error) {
    console.error(`Failed to delete user with id ${userId}`, error);
    throw error;
  }
};
