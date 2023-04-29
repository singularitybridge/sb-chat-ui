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
import { v4 as uuidv4 } from "uuid";

const ChatbotView: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const { chatbot, loading, error, updateChatbot } = useChatbot(key || "");
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

  const handleNodeSelected = (data: any, type: string) => {
    setSelectedNode({ node: data, type });
  };

  const updateChatbotState = async (updatedData: any) => {
    const updatedChatbot = {
      ...chatbot,
      states: chatbot.states.map((state: any) => {
        if (state._id === updatedData._id) {
          return {
            ...updatedData,
            processors: state.processors,
          };
        }
        return state;
      }),
    };
    await updateChatbot(updatedChatbot);
  };

  const updateChatbotProcessor = async (updatedProcessor: any) => {
    const updatedChatbot = {
      ...chatbot,
      states: chatbot.states.map((state: any) => {
        return {
          ...state,
          processors: state.processors.map((processor: any) => {
            if (processor._id === updatedProcessor._id) {
              return updatedProcessor;
            }
            return processor;
          }),
        };
      }),
    };
    await updateChatbot(updatedChatbot);
  };

  const createNewState = async () => {
    const newState = {
      _id: uuidv4(),
      model: "gpt-4",
      name: "new chatbot",
      processors: [],
      prompt: "you're an ai .. ",
      temperature: 0.8,
    };

    const updatedChatbot = {
      ...chatbot,
      states: [...chatbot.states, newState],
    };

    await updateChatbot(updatedChatbot);
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
            <EditChatbot
              chatbot={selectedNode.node}
              onUpdate={updateChatbot}
              onCreateNewState={createNewState}
            />
          )}
          {selectedNode && selectedNode.type === "stateNode" && (
            <EditChatbotState
              state={selectedNode.node}
              chatbotKey={chatbot.key}
              onUpdateState={updateChatbotState}
            />
          )}
          {selectedNode && selectedNode.type === "processorNode" && (
            <EditChatbotProcessor
              node={selectedNode.node}
              onUpdateProcessor={updateChatbotProcessor}
            />
          )}
        </div>
      </div>
    </>
  );
};

export { ChatbotView };
