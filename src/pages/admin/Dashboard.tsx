import React, { useState } from "react";
import { ContentContainer } from "../../components/ContentContainer";
import { useEffect } from "react";
import { fetchChatSessions } from "../../services/ChatSessionService";
import { Chatbot, fetchChatbots } from "../../services/ChatbotService";
import Menu from "../../components/admin/Menu";
import { ChatbotCard } from "../../components/admin/chatbots/ChatbotCard";
import {
  ChatSession,
  ChatSessionCard,
} from "../../components/admin/chatSessions/ChatSessionCard";
import { BreadCrumbs } from "../../components/BreadCCrumbs";

const Dashboard: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);

  useEffect(() => {
    async function fetchSessionsData() {
      const sessions = await fetchChatSessions();
      setChatSessions(sessions);
    }

    async function fetchChatbotsData() {
      const bots = await fetchChatbots();
      setChatbots(bots);
    }

    fetchSessionsData();
    fetchChatbotsData();
  }, []);

  return (
    <>
      <div className="text-2xl font-normal leading-tight mb-4">Chatbots</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-3">
        {chatbots.map((chatbot) => (
          <ChatbotCard key={chatbot.key} chatbot={chatbot} />
        ))}
      </div>

      <div className="text-2xl font-normal leading-tight mb-4">
        Chat Sessions
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-3">
        {chatSessions.map((session) => (
          <ChatSessionCard key={session._id} session={session} />
        ))}
      </div>
    </>
  );
};

export { Dashboard };
