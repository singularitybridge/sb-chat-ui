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
  sanitizeMessageText,
} from "../atoms/dataStore";
import { playAudio } from "../services/AudioService";
import { Avatar, AvatarStyles } from "./Avatar";

interface ChatMessageProps {
  message: Message;
  autoTranslate?: boolean;
  onUserSelection?: (selection: string) => void;
}

interface MessageTextProps {
  text: string;
}

const MessageText: React.FC<MessageTextProps> = ({ text }) => {
  return <div className="mb-5">{text}</div>;
};

interface MessageOptionsProps {
  options: [any];
  onOptionClick?: (option: any) => void;
}

const MessageOptions: React.FC<MessageOptionsProps> = ({
  options,
  onOptionClick,
}) => {
  const handleClick = (selection: string) => {
    if (onOptionClick) {
      onOptionClick(selection);
    }
  };

  return (
    <div className="w-full">
      {options.map((option, index) => (
        <div key={option.text} className=" bg-white hover:bg-slate-100 p-5 mt-3 rounded-2xl flex space-x-2" onClick={() => handleClick(option.text || option)}>

          {option.image && (
            <img src={option.image} alt={option.text || option} className=" w-16" />
          )}

          <button
            key={index}            
            className=" text-slate-700 font-bold "
          >
            {option.text || option}
          </button>
        </div>
      ))}
    </div>
  );
};

const renderContent = (
  content: any[],
  onUserSelection?: (selection: string) => void
) => {
  console.log("render content", content);

  return content.map((item, index) => {
    switch (item.type) {
      case "text":
        return <MessageText key={index} text={item.text} />;
      case "options":
        return (
          <MessageOptions
            key={index}
            options={item.options}
            onOptionClick={onUserSelection} // Pass onUserSelection as the onOptionClick callback
          />
        );
      default:
        return null;
    }
  });
};

const ChatMessageStyles = {
  user: {
    container: "col-start-1 col-end-10 p-3 rounded-lg",
    flexRow: "flex flex-row items-center",
    message: "relative ml-3 text-sm bg-white py-4 px-4 shadow rounded-lg",
  },
  bot: {
    container: "col-start-4 col-end-13 p-3 rounded-lg",
    flexRow: "flex items-center justify-start flex-row-reverse",
    message: "relative mr-3 text-sm bg-indigo-100 py-4 px-4 shadow rounded-lg",
  },
};

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onUserSelection,
}) => {
  const [userProfile, setUserProfile] = useRecoilState(userProfileState);
  const chatBots = useRecoilValue(chatBotsState);
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return null;
  }

  const chatBot = getChatBot(chatBots, id);

  const messageStyles =
    message.senderType === SenderType.user
      ? ChatMessageStyles.user
      : ChatMessageStyles.bot;
  const avatarImage =
    message.senderType === SenderType.user
      ? userProfile.avatar
      : chatBot?.avatar;

  return (
    <>
      <div
        className={messageStyles.container}
        // onClick={() => playAudio(message.audio)}
      >
        <div className={messageStyles.flexRow}>
          <Avatar
            imageUrl={avatarImage || "images/avatars/av1.png"}
            avatarStyle={AvatarStyles.avatar}
          />
          <div
            className={messageStyles.message}
            style={{
              direction:
                chatBot &&
                chatBot.autoTranslate &&
                chatBot.autoTranslateTarget === "he"
                  ? "rtl"
                  : "ltr",
            }}
          >
            {/* <div>{sanitizeMessageText(getMessageText(message))}</div> */}
            {/* <div>{message.content}</div> */}
            {/* <div>{renderContent(message.content)}</div> */}
            <div>{renderContent(message.content, onUserSelection)}</div>{" "}
            {/* Pass onUserSelection to renderContent */}
          </div>
        </div>
      </div>
    </>
  );
};

export { ChatMessage, ChatMessageStyles };
