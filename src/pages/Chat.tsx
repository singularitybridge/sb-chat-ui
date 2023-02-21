import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarStyles } from "../components/Avatar";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  Message,
  messagesState,
  userProfileState,
  contextData,
  chatBotsState,
  getChatBot,
  SenderType,
} from "../atoms/dataStore";
import { ChatFooter } from "../components/ChatFooter";
import { useParams } from "react-router-dom";
import { getGPTCompletion } from "../services/ChatService";
import { translateText } from "../services/TranslationService";

interface ChatMessageProps {
  message: string;
  userType: SenderType;
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

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  userType,
  autoTranslate = false,
}) => {
  const [translatedMessage, setTranslatedMessage] = useState(message);

  useEffect(() => {
    if (autoTranslate) {
      translateText(message, "he").then((result) => {
        setTranslatedMessage(result);
      });
    } else {
      setTranslatedMessage(message);
    }
  }, [message, autoTranslate]);

  const userProfile = useRecoilValue(userProfileState);
  const chatBots = useRecoilValue(chatBotsState);

  const { id } = useParams<{ id: string }>();
  const chatBot = getChatBot(chatBots, id || "xjdas87y");

  const messageStyles =
    userType === SenderType.user ? ChatMessageStyles.user : ChatMessageStyles.bot;
  const avatarImage =
    userType === SenderType.user ? userProfile.avatar : chatBot?.avatar;

  return (
    <>
      <div className={messageStyles.container}>
        <div className={messageStyles.flexRow}>
          <Avatar
            imageUrl={avatarImage || "images/avatars/av1.png"}
            avatarStyle={AvatarStyles.avatar}
          />
          <div
            className={messageStyles.message}
            style={{ direction: autoTranslate ? "rtl" : "ltr" }}
          >
            <div>{translatedMessage}</div>
          </div>
        </div>
      </div>
    </>
  );
};

interface ContentContainerProps {
  children: React.ReactNode;
}

const ContentContainer: React.FC<ContentContainerProps> = ({ children }) => {
  return (
    <main className="flex-1 overflow-y-scroll antialiased ">{children}</main>
  );
};

const Chat = () => {
  const [context, setContext] = useRecoilState(contextData);
  const [chatData, setChatData] = useRecoilState(messagesState);
  const [chatBots, setChatBots] = useRecoilState(chatBotsState);
  const userProfile = useRecoilValue(userProfileState);
  const chatContainerRef = useRef(null);
  const chatBot = getChatBot(
    chatBots,
    userProfile.activeChat || "xjdas87y"
  );

  useEffect(() => {
    if (chatContainerRef.current) {
      (chatContainerRef.current as HTMLElement).scrollTo({
        top: (chatContainerRef.current as HTMLElement).scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatData]);

  const onSendMessage = async (message: string) => {

    const translatedMessage = await translateText(message, "en");

    setChatData((prevChatData) => [
      ...prevChatData,
      { text: translatedMessage, sender: userProfile?.name, senderType: SenderType.user },
    ]);

    const response = await getGPTCompletion(
      chatBot?.prompt,
      chatBot?.name,
      userProfile.name,
      // message,
      translatedMessage,
      chatData || [],
      context
    );
    setChatData((prevChatData) => [
      ...prevChatData,
      { text: response || "", sender: chatBot.name, senderType: SenderType.bot },
    ]);
  };

  return (
    <>
      <ContentContainer>
        <div
          className="flex flex-row h-full w-full overflow-x-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(200, 200, 200, 0.6), rgba(200, 200, 200, 0.6)), url(${chatBot?.bgImage})`,
            backgroundSize: "cover",
          }}
        >
          <div className="flex flex-col flex-auto h-full p-0">
            <div className="flex flex-col flex-auto flex-shrink-0 h-full pt-3  ">
              <div
                className="flex flex-col h-full overflow-x-auto mb-4"
                ref={chatContainerRef}
              >
                <div className="flex flex-col h-full">
                  <div className="grid grid-cols-12 gap-y-2">
                    {chatData.map((message: Message, index: number) => {
                      return (
                        <ChatMessage
                          key={index}
                          message={message.text}
                          userType={message.senderType || SenderType.user }
                          autoTranslate={true}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ContentContainer>
      <ChatFooter onSendMessage={onSendMessage} />
    </>
  );
};

export { Chat };
