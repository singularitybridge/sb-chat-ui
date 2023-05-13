// custom-hooks/useChatbot.tsx

import { useEffect, useState } from "react";
import { Chatbot } from "../services/ChatbotService";

export const useChatbot = (key: string) => {
  const [chatbot, setChatbot] = useState<Chatbot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);

  const updateChatbot = async (updatedChatbot: Chatbot) => {
    try {
      const { _id, ...rest } = updatedChatbot;
      const response = await fetch(
        `http://127.0.0.1:5000/chatbots/${updatedChatbot.key}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(rest),
        }
      );
      const updatedData = await response.json();
      console.log("Chatbot updated", updatedData);
      setChatbot(updatedData);
    } catch (err) {
      console.error("Error updating chatbot:", err);
    }
  };

  const setChatbotState = async (stateId: string) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/chatbots/${key}/set_state`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ state: stateId }),
        }
      );
  
      const responseData = await response.json();
  
      if (!response.ok) {
        throw new Error(responseData.error);
      }
  
      console.log("Chatbot state updated", responseData);
  
      if (chatbot) {
        setChatbot({
          ...chatbot,
          current_state: stateId,
        });
      }
      
    } catch (err) {
      console.error("Error updating chatbot state:", err);
    }
  };
  


  

  useEffect(() => {
    const fetchChatbot = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:5000/chatbots/${key}`);
        const data = await response.json();
        setChatbot(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching chatbot:", err);
        setError(true);
        setLoading(false);
      }
    };

    fetchChatbot();
  }, [key]);

  return { chatbot, setChatbot, loading, error, updateChatbot, setChatbotState };

};
