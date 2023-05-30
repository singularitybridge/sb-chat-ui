import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRecoilState, useRecoilValue } from "recoil";
import { observer } from "mobx-react-lite";
import {
  Message,
  SenderType,
} from "../atoms/dataStore-old";
import { playAudio } from "../services/AudioService";
import { Avatar, AvatarStyles } from "./Avatar";

import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  UserIcon,
  ChatBubbleLeftEllipsisIcon,
  CloudArrowDownIcon,
  MinusIcon,
  BoltIcon,
  CursorArrowRippleIcon,
} from "@heroicons/react/24/outline";
import { useRootStore } from "../store/common/RootStoreContext";

interface ChatMessageProps {
  message: Message;
  autoTranslate?: boolean;
  onUserSelection?: (selection: string) => void;
}

interface MessageTextProps {
  text: string;
}

const MessageText: React.FC<MessageTextProps> = ({ text }) => {
  return <div className="">{text}</div>;
};

// Create the MessageInfo component
const MessageInfo: React.FC<MessageTextProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center">
      <div className=" bg-sky-500 rounded-full p-2 h-10 w-10 mb-2">
        <CursorArrowRippleIcon className="text-sm mb-1" />
      </div>
      <div className="">{text}</div>
    </div>
  );
};

// Create the MessageCallout component
const MessageCallout: React.FC<MessageTextProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center">
      <div className=" bg-fuchsia-600 rounded-full p-2 h-10 w-10 mb-2">
        <BoltIcon className=" text-sm mb-1" />
      </div>
      <div className="">{text}</div>
    </div>
  );
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
    <div className="w-full mt-4 mb-2">
      <div className="flex flex-wrap -mx-2">
        {options.map((option, index) => (
          <div key={option.text} className="w-1/2 px-2 mb-3">
            <div
              className="bg-white hover:bg-slate-100 rounded-xl flex flex-col items-center justify-center h-full p-2"
              onClick={() => handleClick(option.text || option)}
            >
              {option.image && (
                <img
                  src={option.image}
                  alt={option.text || option}
                  className=" rounded-md"
                />
              )}

              <div className="flex flex-col items-center">
                <button
                  key={index}
                  className={`text-slate-600 ${
                    option.image ? "self-start p-3" : " my-1"
                  }`}
                >
                  {option.text || option}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const renderContent = (
  content: any[],
  onUserSelection?: (selection: string) => void
) => {
  

  console.log(content);

  return content?.map((item, index) => {
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
      case "video":
        return (
          <video
            key={index}
            src={item.video_url}
            controls
            className="w-full my-2"
          />
        );

      case "text-info":
        return <MessageInfo key={index} text={item.text} />;
      case "text-callout":
        return <MessageCallout key={index} text={item.text} />;

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

const ChatMessage: React.FC<ChatMessageProps> = observer( ({
  message,
  onUserSelection,
}) => {


  const { activeChatbot, userProfile } = useRootStore();
  const { sessionId } = useParams<{ sessionId: string }>();

  if (!sessionId) {
    return null;
  }


  const messageStyles =
    message.role === SenderType.user
      ? ChatMessageStyles.user
      : ChatMessageStyles.bot;
  const avatarImage =
    message.role === SenderType.user
      ? userProfile?.avatar
      : activeChatbot?.avatarImage;

  return (
    <>
      <div
        className={messageStyles.container}
        // onClick={() => playAudio(message.audio)}
      >
        <div className={messageStyles.flexRow}>
          <Avatar
            imageUrl={avatarImage || "/images/avatars/av1.png"}
            avatarStyle={AvatarStyles.avatar}
          />
          <div
            className={messageStyles.message}
            // style={{
            //   direction:
            //     chatBot &&
            //     chatBot.autoTranslate &&
            //     chatBot.autoTranslateTarget === "he"
            //       ? "rtl"
            //       : "ltr",
            // }}
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
});

export { ChatMessage, ChatMessageStyles };
