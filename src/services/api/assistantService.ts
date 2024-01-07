import axios from 'axios';
import { IAssistant } from '../../store/models/Assistant';

export async function addThread(): Promise<string> {
  try {
    const newThread = await axios.post('http://localhost:3000/assistant/thread');    
    return newThread.data;
  } catch (error) {
    console.error('Failed to add thread:', error);
    throw error;
  }
}

export async function getThreadMessages(threadId: string): Promise<any> {
  try {
    const response = await axios.get(`http://localhost:3000/assistant/thread/${threadId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Failed to get thread messages:', error);
    throw error;
  }
}

export async function getSessionMessages(assistantId: string, userId: string): Promise<any> {
  try {
    const response = await axios.get(`http://localhost:3000/session/messages/${assistantId}/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get session messages:', error);
    throw error;
  }
}

export async function deleteThread(threadId: string): Promise<void> {
  try {
    await axios.delete(`http://localhost:3000/assistant/thread/${threadId}`);
  } catch (error) {
    console.error('Failed to delete thread:', error);
    throw error;
  }
}

export async function endSession(assistantId: string, userId: string): Promise<void> {
  try {
    await axios.delete(`http://localhost:3000/session/end/${assistantId}/${userId}`);
  } catch (error) {
    console.error('Failed to end session:', error);
    throw error;
  }
}

interface HandleUserInputBody {
  userInput: string;
  assistantId: string;
  userId: string;
}

export async function handleUserInput(body: HandleUserInputBody): Promise<string> {
  try {
    const response = await axios.post('http://localhost:3000/assistant/user-input', body);
    return response.data;
  } catch (error) {
    console.error('Failed to handle user input:', error);
    throw error;
  }
}


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