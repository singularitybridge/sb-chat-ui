import axios from 'axios';
import apiClient from '../AxiosService';
import { IAction } from '../../store/models/Action';


const BASE_URL = 'https://api.singularitybridge.net/actions';

export const getActions = async (): Promise<IAction[]> => {
  const response = await apiClient.get(`BASE_URL`);
  return response.data;
};

export const addAction = async (action: IAction): Promise<IAction> => {
  const response = await apiClient.post(`actions`, action);
  return response.data;
};

export const deleteAction = async (actionId: string): Promise<void> => {
  await apiClient.delete(`actions/${actionId}`);
};

export const updateAction = async (actionId: string, action: IAction): Promise<IAction> => {
  const response = await apiClient.put(`actions/${actionId}`, action);
  return response.data;
};

export const getActionById = async (actionId: string): Promise<IAction> => {
  const response = await apiClient.get(`actions/${actionId}`);
  return response.data;
};