import { ChatSessionSnapshotIn, IChatSession } from "../../store/models/ChatSession";
const API_URL = 'http://127.0.0.1:5000';

interface ICreateChatSessionData {
  user_id: string;
  chatbot_key: string;
}

export async function getChatSessions(): Promise<IChatSession[]> {
  const response = await fetch(`${API_URL}/chat_sessions`);
  const chatSessions = await response.json();
  return chatSessions;
}

export async function createChatSession(data: ICreateChatSessionData): Promise<ChatSessionSnapshotIn> {
  const response = await fetch(`${API_URL}/chat_sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.ok) {
    return {
      _id: result.chat_session_id,
      chatbot_key: data.chatbot_key,
      user_id: data.user_id,
      created_at: new Date(),
      updated_at: new Date(),
      active: true,
      current_state: 'NEW', // Or whatever the initial state should be
    };
  } else {
    throw new Error('Failed to create chat session');
  }
}


export async function getChatSessionById(id: string): Promise<IChatSession> {
  const response = await fetch(`http://127.0.0.1:5000/chat_sessions/${id}`);
  const chatSession = await response.json();
  return chatSession;
}
