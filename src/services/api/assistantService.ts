import axios from 'axios';
import { IAssistant } from '../../store/models/Assistant';

export async function getAssistants(): Promise<IAssistant[]> {
  try {
    const response = await axios.get('http://localhost:3000/assistant');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch assistants:', error);
    throw error;
  }
}

export async function deleteAssistant(id: string): Promise<void> {
  try {
    await axios.delete(`http://localhost:3000/assistant/${id}`);
  } catch (error) {
    console.error('Failed to delete assistant:', error);
    throw error;
  }
}

export async function addAssistant(assistant: IAssistant): Promise<IAssistant> {
  try {
    const response = await axios.post('http://localhost:3000/assistant', assistant);
    return response.data;
  } catch (error) {
    console.error('Failed to add assistant:', error);
    throw error;
  }
}

export async function updateAssistant(id: string, assistant: IAssistant): Promise<IAssistant> {
  try {
    const response = await axios.put(`http://localhost:3000/assistant/${id}`, assistant);
    return response.data;
  } catch (error) {
    console.error('Failed to update assistant:', error);
    throw error;
  }
}