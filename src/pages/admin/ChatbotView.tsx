import React from "react";
import { useParams } from "react-router-dom";
import { Chatbot } from "../../services/ChatbotService";
import { useChatbot } from "../../custom-hooks/useChatbot";
import { ChatbotCard } from "../../components/admin/chatbots/ChatbotCard";
import { DataItem } from "../../components/admin/DataItem";
import { ActionsView } from "../../components/admin/ActionsView/ActionsView";
import { ReactFlowProvider } from "reactflow";

const ChatbotView: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const { chatbot, loading, error } = useChatbot(key || "");

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !chatbot) {
    return <div>Chatbot not found</div>;
  }

  return (
    <>
      <div className="flex">
        <div className="w-1/2 mr-4">
          <div className="">
            <div className="w-full h-[42rem] ">
              <ReactFlowProvider>
                <ActionsView chatbot={chatbot} />
              </ReactFlowProvider>
            </div>
            <h2 className="text-xl font-bold mb-4 mt-6">Test Chatbot</h2>
          </div>
        </div>
        <div className="w-1/2">
          <h2 className="text-xl font-bold mb-4">Edit Node</h2>
        </div>
      </div>
    </>
  );
};

export { ChatbotView };
