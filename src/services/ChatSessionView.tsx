// src/pages/ChatSessionView.tsx

import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface ChatSessionData {
  chatbot: any;
  messages: any[];
}

const ChatSessionView: React.FC = () => {
  const [chatSessionData, setChatSessionData] = useState<ChatSessionData | null>(null);
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/chat_sessions/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setChatSessionData(data);
      });
  }, [id]);

  return (
    <div className="p-4">
      {chatSessionData ? (
        <>
          <h1 className="text-3xl mb-4">Chat Session: {id}</h1>
          <h2 className="text-xl mb-4">Chatbot Information</h2>
          <div>
            <p>Name: {chatSessionData.chatbot.name}</p>
            <p>Description: {chatSessionData.chatbot.description}</p>
            <p>Avatar Image URL: {chatSessionData.chatbot.avatarImage}</p>
          </div>
          <h2 className="text-xl mb-4 mt-8">Messages</h2>
          <ul>
            {chatSessionData.messages.map((message, index) => (
              <li key={index}>
                <p>
                  <strong>{message.role}: </strong>
                  {message.content}
                </p>
                <p>{message.created_at}</p>
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p>Loading chat session data...</p>
      )}
    </div>
  );
};

export { ChatSessionView };
