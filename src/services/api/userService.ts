import { IUser } from '../../types/entities';
import apiClient from '../AxiosService';
import { singleFlight } from '../../utils/singleFlight';

export const getAllUsers = (): Promise<IUser[]> =>
  singleFlight('GET /user', () =>
    apiClient.get('user').then((res) => res.data)
  );

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
    const response = await apiClient.post('user', userData);
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
