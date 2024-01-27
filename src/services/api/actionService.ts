import axios from 'axios';
import { IAction } from '../../store/models/Action';


const BASE_URL = 'http://localhost:3000/action';

export const getActions = async (): Promise<IAction[]> => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const addAction = async (action: IAction): Promise<IAction> => {
  const response = await axios.post(BASE_URL, action);
  return response.data;
};

export const deleteAction = async (actionId: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${actionId}`);
};

export const updateAction = async (actionId: string, action: IAction): Promise<IAction> => {
  const response = await axios.put(`${BASE_URL}/${actionId}`, action);
  return response.data;
};

export const getActionById = async (actionId: string): Promise<IAction> => {
  const response = await axios.get(`${BASE_URL}/${actionId}`);
  return response.data;
};