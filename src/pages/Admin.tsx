import React, { useState } from "react";
import { ContentContainer } from "../components/ContentContainer";
import { useEffect } from "react";
import { fetchChatSessions } from "../services/ChatSessionService";
import { Chatbot, fetchChatbots } from "../services/ChatbotService";
import Menu from "../components/admin/Menu";
import { ChatbotCard } from "../components/admin/chatbots/ChatbotCard";
import {
  ChatSession,
  ChatSessionCard,
} from "../components/admin/chatSessions/ChatSessionCard";
import { BreadCrumbs } from "../components/BreadCCrumbs";
import { Outlet, useParams } from "react-router-dom";

const Admin: React.FC = () => {
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
      <Menu />
      <ContentContainer className="px-4 py-4">
        <BreadCrumbs />
        <Outlet />
      </ContentContainer>
    </>
  );
};

export { Admin };
