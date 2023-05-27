import { IChatSession } from "../store/models/ChatSession";


export async function fetchChatSessions(): Promise<IChatSession[]> {
  const response = await fetch("http://127.0.0.1:5000/chat_sessions");
  const chatSessions = await response.json();
  return chatSessions;
}

export async function fetchChatSessionById(id: string): Promise<IChatSession> {
  const response = await fetch(`http://127.0.0.1:5000/chat_sessions/${id}`);
  const chatSession = await response.json();
  return chatSession;
}
