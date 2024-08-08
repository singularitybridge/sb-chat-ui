import apiClient from '../AxiosService';
import { IAssistant } from '../../store/models/Assistant';

interface CompletionRequest {
  systemPrompt: string;
  userInput: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

interface CompletionResponse {
  content: string;
}

export async function getCompletion(request: CompletionRequest): Promise<string> {
  try {
    const response = await apiClient.post<CompletionResponse>('assistant/completion', request);
    return response.data.content;
  } catch (error) {
    console.error('Failed to get completion:', error);
    throw error;
  }
}






export async function getSessionMessages(sessionId: string): Promise<any> {
  try {
    const response = await apiClient.get(`session/${sessionId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Failed to get session messages:', error);
    throw error;
  }
}



interface HandleUserInputBody {
  userInput: string;  
  sessionId: string;
}

export async function handleUserInput(body: HandleUserInputBody): Promise<string> {
  try {
    const response = await apiClient.post('assistant/user-input', body);
    return response.data;
  } catch (error) {
    console.error('Failed to handle user input:', error);
    throw error;
  }
}


export async function getAssistants(): Promise<IAssistant[]> {
  try { 
    const response = await apiClient.get('assistant');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch assistants:', error);
    throw error;
  }
}

export async function deleteAssistant(id: string): Promise<void> {
  try {
    await apiClient.delete(`assistant/${id}`);
  } catch (error) {
    console.error('Failed to delete assistant:', error);
    throw error;
  }
}

export async function addAssistant(assistant: IAssistant): Promise<IAssistant> {
  try {    
    const response = await apiClient.post('assistant', assistant);
    return response.data;
  } catch (error) {
    console.error('Failed to add assistant:', error);
    throw error;
  }
}

export async function updateAssistant(id: string, assistant: IAssistant & { voice?: string }): Promise<IAssistant> {
  try {
    const response = await apiClient.put(`assistant/${id}`, assistant);
    return response.data;
  } catch (error) {
    console.error('Failed to update assistant:', error);
    throw error;
  }
}
