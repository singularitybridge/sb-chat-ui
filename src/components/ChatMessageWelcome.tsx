import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  Message,
  userProfileState,
  chatBotsState,
  getChatBot,
  SenderType,
  getMessageText,
  ChatBot,
} from "../atoms/dataStore";
import { Avatar, AvatarStyles } from "./Avatar";

interface ChatMessageProps {
  onClickStartChat?: () => void;
}

const ChatMessageWelcome: React.FC<ChatMessageProps> = ({
  onClickStartChat,
}) => {
  // const chatBots = useRecoilValue(chatBotsState);
  const { sessionId } = useParams<{ sessionId: string }>();
  const [chatStarted, setChatStarted] = useState(false);
  const [chatBot, setChatBot] = useState<ChatBot | null>(null);

  if (!sessionId) {
    return null;
  }

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/chat_sessions/${sessionId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.chatbot) {
          setChatBot(data.chatbot);
        }
      });
  }, [sessionId]);
  

  

  const handleStartChat = () => {
    setChatStarted(true);
    onClickStartChat && onClickStartChat();
  };

  return (
    <>
      <div className="col-start-2 col-end-12 mt-8 mb-8">
        <div
          className="flex flex-col items-center bg-white p-5 shadow rounded-xl space-y-4"
          style={{
            direction:
              chatBot &&
              chatBot.autoTranslate &&
              chatBot.autoTranslateTarget === "he"
                ? "rtl"
                : "ltr",
          }}
        >
          <Avatar imageUrl={chatBot?.avatarImage || ''} avatarStyle={AvatarStyles.large} />
          <div>{chatBot?.description}</div>
          {chatStarted ? null : (
              <button
                className="bg-stone-300 p-4 rounded-xl w-full"
                onClick={handleStartChat}
              >
                Start Chat
              </button>
          )}
        </div>
      </div>
    </>
  );
};

export { ChatMessageWelcome };
