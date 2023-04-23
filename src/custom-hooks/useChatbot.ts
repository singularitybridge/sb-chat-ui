// useChatbot.ts
import { useState, useEffect } from 'react';
import { Chatbot } from '../services/ChatbotService';

interface UseChatbotResult {
  chatbot: Chatbot | null;
  loading: boolean;
  error: any;
}

export const useChatbot = (key: string): UseChatbotResult => {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchChatbot = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://127.0.0.1:5000/chatbots/${key}`);
        const chatbotData = await response.json();
        setChatbot(chatbotData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchChatbot();
  }, [key]);

  return { chatbot, loading, error };
};
