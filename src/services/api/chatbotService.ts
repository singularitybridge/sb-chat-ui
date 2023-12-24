import { IChatbot } from '../../store/models/Chatbot';

export async function getChatbots(): Promise<IChatbot[]> {
  const response = await fetch('http://127.0.0.1:5000/chatbots');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const chatbots: IChatbot[] = await response.json();
  return chatbots;
}
