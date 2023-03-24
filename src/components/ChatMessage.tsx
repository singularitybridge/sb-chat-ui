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
}

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

const getMessageMetaData = (message: Message) => {
  const messageText = getMessageText(message);
  const regex = /{{\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*"([^"]+)"\s*}}/;
  const match = regex.exec(messageText);

  if (match) {
    const obj = {
      title: match[1],
      price: match[2],
      pic: match[3],
    };
    console.log("pic found: ", obj.pic);
    return obj;
  } else {
    return null;
  }
};

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
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
            <div>{sanitizeMessageText(getMessageText(message))}</div>

            {getMessageMetaData(message)?.pic && (
              <div className="mt-6">
                <div className="flex flex-col justify-between space-y-3">
                  <img
                    src={getMessageMetaData(message)?.pic || ""}
                    alt="message"
                    className="w-44"
                  />
                  <div className="text-base font-medium">
                    {getMessageMetaData(message)?.title}
                    </div>
                  <div className="text-base text-lime-700">
                    {getMessageMetaData(message)?.price}
                    </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export { ChatMessage, ChatMessageStyles };
