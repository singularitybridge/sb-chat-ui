import axios from 'axios';
import apiClient from '../AxiosService';
import { IAction } from '../../store/models/Action';



export const getActions = async (): Promise<IAction[]> => {
  const response = await apiClient.get(`action`);
  return response.data;
};

export const addAction = async (action: IAction): Promise<IAction> => {
  const response = await apiClient.post(`action`, action);
  return response.data;
};

export const deleteAction = async (actionId: string): Promise<void> => {
  await apiClient.delete(`action/${actionId}`);
};

export const updateAction = async (actionId: string, action: IAction): Promise<IAction> => {
  const response = await apiClient.put(`action/${actionId}`, action);
  return response.data;
};

export const getActionById = async (actionId: string): Promise<IAction> => {
  const response = await apiClient.get(`action/${actionId}`);
  return response.data;
};