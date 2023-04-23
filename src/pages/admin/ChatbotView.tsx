import React from 'react';
import { useParams } from 'react-router-dom';
import { Chatbot } from '../../services/ChatbotService';
import { useChatbot } from '../../custom-hooks/useChatbot';
import { ChatbotCard } from '../../components/admin/chatbots/ChatbotCard';

const ChatbotView: React.FC = () => {
  const { key } = useParams<{ key: string }>();
  const { chatbot, loading, error } = useChatbot(key || '');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !chatbot) {
    return <div>Chatbot not found</div>;
  }

  return (
    <div className="flex">
      <div className="w-1/2">
        <ChatbotCard chatbot={chatbot} />

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Chatbot Details</h2>
          <div>
            <h3 className="font-semibold">Name:</h3>
            <p>{chatbot.name}</p>
          </div>
          <div>
            <h3 className="font-semibold">Description:</h3>
            <p>{chatbot.description}</p>
          </div>
          <div>
            <h3 className="font-semibold">Model:</h3>
            <p>{chatbot.model}</p>
          </div>
          <div>
            <h3 className="font-semibold">Temperature:</h3>
            <p>{chatbot.temperature}</p>
          </div>
          <div>
            <h3 className="font-semibold">Max Tokens:</h3>
            <p>{chatbot.maxTokens}</p>
          </div>
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
        <h2 className="text-xl font-bold mb-4">Chatbot States</h2>
        <ul>
          {chatbot.states.map((state, index) => (
            <li key={index} className="mb-4">
              <h3 className="font-semibold">Name:</h3>
              <p>{state.name}</p>
              <h3 className="font-semibold">Prompt:</h3>
              <p>{state.prompt}</p>
              <h3 className="font-semibold">Model:</h3>
              <p>{chatbot.model}</p>
              <h3 className="font-semibold">Processors:</h3>
              <ul>
                {state.processors.map((processor, idx) => (
                  <li key={idx}>
                    <h4 className="font-semibold">Name:</h4>
                    <p>{processor.processor_name}</p>
                    <h4 className="font-semibold">Data:</h4>
                    <pre>{JSON.stringify(processor.processor_data, null, 2)}</pre>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export { ChatbotView };
