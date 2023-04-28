import React, { useState } from "react";
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

const ChatbotView: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const { chatbot, loading, error } = useChatbot(key || "");
  const [selectedNode, setSelectedNode] = useState<{
    node: any;
    type: string;
  } | null>(null);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !chatbot) {
    return <div>Chatbot not found</div>;
  }

  console.log(chatbot);

  const handleNodeSelected = (data: any, type: string) => {
    setSelectedNode({ node: data, type });
  };

  return (
    <>
      <div className="flex">
        <div className="w-1/2 mr-4">
          <div className="">
            <div className="w-full h-[42rem] ">
              <ReactFlowProvider>
                <ActionsView
                  chatbot={chatbot}
                  onNodeSelected={handleNodeSelected}
                />
              </ReactFlowProvider>
            </div>
            <h2 className="text-xl font-bold mb-4 mt-6">Test Chatbot</h2>
          </div>
        </div>
        <div className="w-1/2">
          <h2 className="text-xl font-bold mb-4">Edit Node</h2>
          {selectedNode && selectedNode.type === "chatbotNode" && (
            <EditChatbot chatbot={selectedNode.node} />
          )}
          {selectedNode && selectedNode.type === "stateNode" && (
            <EditChatbotState node={selectedNode.node} />
          )}
          {selectedNode && selectedNode.type === "processorNode" && (
            <EditChatbotProcessor node={selectedNode.node} />
          )}
        </div>
      </div>
    </>
  );
};

export { ChatbotView };
