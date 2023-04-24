import React from "react";
import { useParams } from "react-router-dom";
import { Chatbot } from "../../services/ChatbotService";
import { useChatbot } from "../../custom-hooks/useChatbot";
import { ChatbotCard } from "../../components/admin/chatbots/ChatbotCard";
import { DataItem } from "../../components/admin/DataItem";
import { ActionsView } from "../../components/admin/ActionsView";

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
            <div className="w-full h-96 ">
              <ActionsView chatbot={chatbot} />
            </div>

            <h2 className="text-xl font-bold mb-4">Chatbot Details</h2>
            <DataItem title="Name" value={chatbot.name} />
            <DataItem title="Description" value={chatbot.description} />
            <DataItem title="Model" value={chatbot.model} />
            <DataItem title="Temperature" value={chatbot.temperature} />
            <DataItem title="Max Tokens" value={chatbot.maxTokens} />
            <div>
              <h3 className="font-semibold">Prompt:</h3>
              <textarea
                readOnly
                className="w-full h-32 border p-2"
                value={chatbot.prompt}
              ></textarea>
            </div>
          </div>
        </div>
        <div className="w-1/2">
          <ChatbotCard chatbot={chatbot} />

          <h2 className="text-xl font-bold mb-4">Chatbot States</h2>
          <ul>
            {chatbot.states.map((state, index) => (
              <li key={index} className="mb-4">
                <DataItem title="Name" value={state.name} />
                <DataItem title="Prompt" value={state.prompt} />
                <DataItem title="Model" value={chatbot.model} />
                <h3 className="font-semibold">Processors:</h3>
                <ul>
                  {state.processors.map((processor, idx) => (
                    <li key={idx}>
                      <DataItem title="Name" value={processor.processor_name} />
                      <h4 className="font-semibold">Data:</h4>
                      <pre>
                        {JSON.stringify(processor.processor_data, null, 2)}
                      </pre>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};


export { ChatbotView };
