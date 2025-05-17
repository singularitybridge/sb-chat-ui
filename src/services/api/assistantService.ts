import apiClient from '../AxiosService';
import { IAssistant } from '../../store/models/Assistant';
import { getToken } from './authService'; // Import getToken for manual auth header

// Get apiUrl from environment variables, ensuring consistency with AxiosService
const apiUrl = import.meta.env.VITE_API_URL || 'https://api.singularitybridge.net/';

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

// Interface for the actual API response structure
interface ApiUserInputResponse {
  content: string;
}

// The function's public contract returns a string
export async function handleUserInput(body: HandleUserInputBody): Promise<string> {
  try {
    // Expect the new API response structure
    const response = await apiClient.post<ApiUserInputResponse>('assistant/user-input', body);
    // Extract and return the content string
    return response.data.content;
  } catch (error) {
    console.error('Failed to handle user input:', error);
    throw error;
  }
}

// --- Streaming ---
export interface StreamPayload {
  type: 'token' | 'markdown' | 'action' | 'error' | 'done';
  value?: any; // Can be string for token/markdown, or object for action/error
  actionDetails?: any; // For action type
  errorDetails?: any; // For error type
}

async function* createSSELineSplitter(readableStream: ReadableStream<Uint8Array>): AsyncGenerator<string> {
  const reader = readableStream.getReader();
  let buffer = '';
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) {
        if (buffer.length > 0) {
          yield buffer; // Yield any remaining data
        }
        break;
      }
      buffer += decoder.decode(value, { stream: true });
      
      let eolIndex;
      // SSE events are separated by double newlines
      while ((eolIndex = buffer.indexOf('\n\n')) >= 0) {
        const line = buffer.substring(0, eolIndex);
        buffer = buffer.substring(eolIndex + 2);
        if (line.trim().length > 0) { // Ensure we don't yield empty lines between events
          yield line;
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export async function handleUserInputStream(
  body: HandleUserInputBody,
  onChunk: (payload: StreamPayload) => void,
  abortSignal?: AbortSignal,
): Promise<void> {
  let doneTimer: NodeJS.Timeout | undefined;
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    };

    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Construct the full URL, ensuring no double slashes if apiUrl ends with / and endpoint starts with /
    const endpoint = 'assistant/user-input';
    const fullUrl = `${apiUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;


    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
      signal: abortSignal,
    });

    if (!response.ok || !response.body) {
      const errorBody = await response.text();
      console.error('Streaming request failed:', response.status, errorBody);
      onChunk({ type: 'error', errorDetails: { status: response.status, body: errorBody } });
      throw new Error(`Streaming request failed: ${response.status} ${errorBody}`);
    }

    const stream = response.body;
    for await (const line of createSSELineSplitter(stream)) {
      if (line.startsWith('data:')) {
        const jsonString = line.substring(5).trim();
        try {
          let payload: StreamPayload;
          const parsed = JSON.parse(jsonString);

          if (parsed.type === undefined && parsed.t !== undefined) {
            // Back-compat shim for current backend
            payload = { type: 'token', value: parsed.t };
          } else {
            payload = parsed as StreamPayload;
          }
          
          onChunk(payload);

          if (payload.type === 'token') {
            clearTimeout(doneTimer);
            doneTimer = setTimeout(() => onChunk({ type: 'done' }), 500); // restart on every token
          }

          if (payload.type === 'done') {
            clearTimeout(doneTimer); // Clear timer if 'done' is received
            return; // Stream finished successfully
          }
        } catch (e) {
          console.error('Failed to parse SSE data chunk:', jsonString, e);
          onChunk({ type: 'error', errorDetails: { message: 'Failed to parse stream data', data: jsonString } });
        }
      } else if (line.startsWith('event:')) {
        // Optional: handle custom event types if your server sends them
        // console.log('SSE Event:', line);
      } else if (line.startsWith('id:')) {
        // Optional: handle event IDs
      } else if (line.startsWith(':')) {
        // This is a comment, ignore
      } else if (line.trim() === '') {
        // Empty line, often used as a separator, already handled by splitter logic
      } else {
        // console.warn('Received non-standard SSE line:', line);
      }
    }
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.log('Streaming fetch aborted by user.');
      onChunk({ type: 'error', errorDetails: { message: 'Request aborted' } });
      return; // Don't re-throw abort errors as they are expected
    }
    console.error('Failed to handle user input stream:', error);
    onChunk({ type: 'error', errorDetails: { message: error.message || 'Unknown streaming error' } });
    throw error; // Re-throw other errors
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

export const createDefaultAssistant = async () => {
  try {
    const response = await apiClient.post('/assistant/default');
    return response.data;
  } catch (error) {
    console.error('Error creating default assistant:', error);
    throw error;
  }
};

interface MessageData {
  _id: string;
  data: {
    id: string;
    actionId: string;
    serviceName: string;
    actionTitle: string;
    actionDescription: string;
    icon: string;
    originalActionId: string;
    language: string;
    input?: any;
    output?: any;
    status: 'started' | 'completed' | 'failed';
  };
  sessionId: string;
  messageType: string;
  sender: string;
  timestamp: string;
}

export async function getMessageById(messageId: string): Promise<MessageData> {
  try {
    const response = await apiClient.get<MessageData>(`/assistant/thread/message/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch message details:', error);
    throw error;
  }
}
