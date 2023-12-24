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
