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


export async function addThread(): Promise<string> {
  try {
    const newThread = await apiClient.post('assistant/thread');    
    return newThread.data;
  } catch (error) {
    console.error('Failed to add thread:', error);
    throw error;
  }
}

export async function getThreadMessages(threadId: string): Promise<any> {
  try {
    const response = await apiClient.get(`assistant/thread/${threadId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Failed to get thread messages:', error);
    throw error;
  }
}

export async function getSessionMessages(companyId: string, userId: string): Promise<any> {
  try {
    const response = await apiClient.get(`session/messages/${companyId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get session messages:', error);
    throw error;
  }
}

export async function deleteThread(threadId: string): Promise<void> {
  try {
    await apiClient.delete(`assistant/thread/${threadId}`);
  } catch (error) {
    console.error('Failed to delete thread:', error);
    throw error;
  }
}

export async function endSession(companyId: string, userId: string): Promise<void> {
  try {
    await apiClient.delete(`session/end/${companyId}/${userId}`);
  } catch (error) {
    console.error('Failed to end session:', error);
    throw error;
  }
}

interface HandleUserInputBody {
  userInput: string;
  companyId: string;
  userId: string;
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


export async function getAssistants(companyId : string): Promise<IAssistant[]> {
  try { 
    const response = await apiClient.get(`assistant/company/${companyId}`);
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

export async function updateAssistant(id: string, assistant: IAssistant): Promise<IAssistant> {
  try {
    const response = await apiClient.put(`assistant/${id}`, assistant);
    return response.data;
  } catch (error) {
    console.error('Failed to update assistant:', error);
    throw error;
  }
}