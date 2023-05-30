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

const ChatbotView: React.FC = observer(() => {
  
  const { key } = useParams<{ key: string }>();
  const rootStore = useRootStore();
  const sessionId = rootStore.selectedChatSession?._id || "";

  useEffect(() => {
    console.log("ChatbotView: ", key);

    initTE({ Tab });

    const chatBot = rootStore.getChatbot(key || "");
    if (chatBot) {
      rootStore.setActiveChatbot(chatBot);
    } else {
      // Handle situation where chatBot is null, e.g. set a default value or show an error
    }
  }, [key]);

  const { chatbot, loading, error, updateChatbot, setChatbotState } =
    useChatbot(key || "", sessionId || "");

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
      name: "new-state-" + uuidv4(),
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

  const deleteChatbotState = async (stateId: string) => {
    const updatedChatbot = {
      ...chatbot,
      states: chatbot.states.filter((state: any) => state._id !== stateId),
    };
    await updateChatbot(updatedChatbot);
  };

  const setActiveChatbotState = async (stateId: string) => {
    setChatbotState(stateId);
  };

  const addChatbotProcessor = async (stateId: string) => {
    const newProcessor = {
      _id: uuidv4(),
      processor_name: "new-processor-" + uuidv4(),
      processor_data: {},
      type: "processorNode",
    };

    const updatedChatbot = {
      ...chatbot,
      states: chatbot.states.map((state: any) => {
        if (state._id === stateId) {
          return {
            ...state,
            processors: [...state.processors, newProcessor],
          };
        }
        return state;
      }),
    };

    await updateChatbot(updatedChatbot);
  };

  const deleteProcessor = async (processorId: string) => {
    const updatedChatbot = {
      ...chatbot,
      states: chatbot.states.map((state: any) => {
        return {
          ...state,
          processors: state.processors.filter(
            (processor: any) => processor._id !== processorId
          ),
        };
      }),
    };
    await updateChatbot(updatedChatbot);
  };

  const insertProcessorAfter = async (processorId: string) => {
    const newProcessor = {
      _id: uuidv4(),
      processor_name: "new-processor-" + uuidv4(),
      processor_data: {},
    };

    const updatedChatbot = {
      ...chatbot,
      states: chatbot.states.map((state: any) => {
        const processorIndex = state.processors.findIndex(
          (processor: any) => processor._id === processorId
        );

        if (processorIndex === -1) {
          return state;
        }

        const updatedProcessors = [
          ...state.processors.slice(0, processorIndex + 1),
          newProcessor,
          ...state.processors.slice(processorIndex + 1),
        ];

        return {
          ...state,
          processors: updatedProcessors,
        };
      }),
    };

    await updateChatbot(updatedChatbot);
  };

  return (
    <>
      <div className="flex">
        <div className="w-2/3 bg-sky-100 border-r-2">
          <div className="w-full h-[42rem]">
            <ReactFlowProvider>
              <ActionsView
                chatbot={chatbot}
                session={rootStore.selectedChatSession}
                onNodeSelected={handleNodeSelected}
              />
            </ReactFlowProvider>
          </div>
        </div>
        <div className="w-1/3 p-5 border-t-2">
          <Tabs
            tabs={[
              {
                id: "tabs-home",
                label: "Node Editor",
                content: (
                  <>
                    {selectedNode ? (
                      <>
                        {selectedNode.type === "chatbotNode" && (
                          <EditChatbot
                            chatbot={selectedNode.node}
                            onUpdate={updateChatbot}
                            onCreateNewState={createNewState}
                          />
                        )}
                        {selectedNode.type === "stateNode" && (
                          <EditChatbotState
                            state={selectedNode.node}
                            chatbotKey={chatbot.key}
                            onAddProcessor={addChatbotProcessor}
                            onUpdateState={updateChatbotState}
                            onDeleteState={deleteChatbotState}
                            onSetActiveState={setActiveChatbotState}
                          />
                        )}
                        {selectedNode.type === "processorNode" && (
                          <EditChatbotProcessor
                            node={selectedNode.node}
                            onUpdateProcessor={updateChatbotProcessor}
                            onDeleteProcessor={deleteProcessor}
                            onInsertProcessorAfter={insertProcessorAfter}
                          />
                        )}
                      </>
                    ) : (
                      <div className="text-center text-gray-500 mt-5">
                        Please select a node to view or edit its details.
                      </div>
                    )}
                  </>
                ),
              },
              {
                id: "tabs-profile",
                label: "Session Store",
                content: <SessionStoreView />,
              },
              {
                id: "tabs-log",
                label: "Log",
                content: "Tab 4 Content",
              },
              {
                id: "tabs-messages",
                label: "Settings",
                content: <EditorSettingsView /> ,
              }

            ]}
          />
        </div>
      </div>
    </>
  );
});

export { ChatbotView };
