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
} from "../atoms/dataStore";
import { Avatar, AvatarStyles } from "./Avatar";

interface ChatMessageProps {
  onClickStartChat?: () => void;
}

const ChatMessageWelcome: React.FC<ChatMessageProps> = ({
  onClickStartChat,
}) => {
  const chatBots = useRecoilValue(chatBotsState);
  const { id } = useParams<{ id: string }>();
  const [chatStarted, setChatStarted] = useState(false);

  if (!id) {
    return null;
  }

  const chatBot = getChatBot(chatBots, id);

  const handleStartChat = () => {
    setChatStarted(true);
    onClickStartChat && onClickStartChat();
  };

  return (
    <>
      <div className="col-start-4 col-end-10 mt-8 mb-8">
        <div
          className="flex flex-col items-center bg-white p-7 shadow rounded-xl space-y-7"
          style={{
            direction:
              chatBot &&
              chatBot.autoTranslate &&
              chatBot.autoTranslateTarget === "he"
                ? "rtl"
                : "ltr",
          }}
        >
          <Avatar imageUrl={chatBot?.avatar} avatarStyle={AvatarStyles.large} />
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
