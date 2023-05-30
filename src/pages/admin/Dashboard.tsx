import React, { useState } from "react";
import { ContentContainer } from "../../components/ContentContainer";
import { useEffect } from "react";
import { fetchChatSessions } from "../../services/api/chatSessionService";
import { Chatbot, fetchChatbots } from "../../services/ChatbotService";
import Menu from "../../components/admin/Menu";
import { ChatbotCard } from "../../components/admin/chatbots/ChatbotCard";
import {
  ChatSessionCard,
} from "../../components/admin/chatSessions/ChatSessionCard";
import { BreadCrumbs } from "../../components/BreadCCrumbs";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../store/common/RootStoreContext";

const Dashboard = observer(() => {

  // const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const { chatbots } = useRootStore();
  

  // useEffect(() => {  

  //   async function fetchSessionsData() {
  //     const sessions = await fetchChatSessions();
  //     // setChatSessions(sessions);
  //   }

  //   fetchSessionsData();
  // }, []);

  return (
    <>
      <div className="text-2xl font-normal leading-tight mb-4">Chatbots {chatbots.length}</div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mb-3">
        {chatbots.map((chatbot) => (
          <ChatbotCard key={chatbot.key} chatbot={chatbot} />
        ))}
      </div>

      
    </>
  );
});

export { Dashboard };
