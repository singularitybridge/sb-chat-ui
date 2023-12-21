import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Chatbot } from "../../services/ChatbotService";
import { useChatbot } from "../../custom-hooks/useChatbot";
import { ChatbotCard } from "../../components/admin/chatbots/ChatbotCard";
import { DataItem } from "../../components/admin/DataItem";
import { ActionsView } from "../../components/admin/ActionsView/ActionsView";
import { ReactFlowProvider } from "reactflow";
import { EditChatbot } from "./ChatBotEditingViews/EditChatbot";
import { EditChatbotState } from "./ChatBotEditingViews/EditChatbotState";
import { EditChatbotProcessor } from "./ChatBotEditingViews/EditChatbotProcessor";
import { v4 as uuidv4 } from "uuid";
import { SessionStoreView } from "./SessionStoreView";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../../store/common/RootStoreContext";
import { Tab, initTE } from "tw-elements";
import { Tabs } from "../../components/Tabs";
import { EditorSettingsView } from "./EditorSettingsView";
import { Chat } from "../Chat";
import { Header } from "../../components/Header";
import { LoggerView } from "./LoggerView";
import { Table } from "../../components/Table";

const AgentsView: React.FC = observer(() => {
  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const sessionIdOLD = rootStore.selectedChatSession?._id || "";

  const headers = ["#", "Name", "Description", "Actions"];
  const data = [
    { "#": "1", Name: "Mark", Description: "Otto", Actions: "@mdo" },
    { "#": "2", Name: "Jacob", Description: "Thornton", Actions: "@fat" },
    { "#": "3", Name: "Larry", Description: "Wild", Actions: "@twitter" },
    // ... more rows
  ];

  useEffect(() => {
    const loadData = async () => {
      if (rootStore.activeChatbot?.key) {
        await rootStore.loadChatSessions(rootStore.activeChatbot.key);
        rootStore.setActiveChatSession(rootStore.chatSessions[0]._id);
      }

      if (rootStore.chatbotsLoaded && key) {
        rootStore.setActiveChatbot(key);
      }
    };

    loadData();
    initTE({ Tab });
  }, [rootStore.activeChatbot?.key, rootStore.chatbotsLoaded, key]);

  return (
    <>
    <div className="flex w-full">
      <Table headers={headers} data={data} />
    </div>

    </>
  );
});

export { AgentsView };
