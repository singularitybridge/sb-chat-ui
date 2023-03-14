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
  getMessageText,
  ChatBotNotLoaded,
  ChatBot,
  defaultChatBot,
} from "../atoms/dataStore";
import { getGPTCompletion } from "../services/ChatService";
import { translateText } from "../services/TranslationService";
import { generateAudioFromText } from "../services/TTSService";
import { ChatMessage } from "../components/ChatMessage";
import { ContentContainer } from "../components/ContentContainer";
import { ContainerBGImage } from "../components/ContainerBGImage";
import { ChatFooterContainer } from "../components/chat/ChatFooterContainer";
import { ChatFooterText } from "../components/chat/ChatFooterText";
import { ChatFooterVoice } from "../components/chat/ChatFooterVoice";
import { ChatMessageWelcome } from "../components/ChatMessageWelcome";
import { playAudio } from "../services/AudioService";
import { ChatState } from "../components/chat/common";
import { AudioCircle } from "../components/chat/AudioCircle";

const Chat = () => {
  const [context, setContext] = useRecoilState(contextData);
  const [chatData, setChatData] = useRecoilState(messagesState);
  const [chatBots, setChatBots] = useRecoilState(chatBotsState);
  const userProfile = useRecoilValue(userProfileState);
  const chatContainerRef = useRef(null);
  const [chatBot, setChatBot] = useState<ChatBot>(defaultChatBot);

  const [isChatBotActive, setIsChatBotActive] = useState(false);
  const [isUserInputEnabled, setIsUserInputEnabled] = useState(false);
  const [chatState, setChatState] = useState(ChatState.GETTING_DATA);  
  const [audioCircleActive, setAudioCircleActive] = useState(false);

  useEffect(() => {
    if (userProfile.activeChatBot === ChatBotNotLoaded || !chatBots) return;
    setChatBot(getChatBot(chatBots, userProfile.activeChatBot));
  }, [chatBots, userProfile]);

  useEffect(() => {
    if (!chatBot || chatBot.key === ChatBotNotLoaded) return;
    document.title = chatBot.name;
  }, [chatBot]);

  useEffect(() => {
    if (chatContainerRef.current) {
      (chatContainerRef.current as HTMLElement).scrollTo({
        top: (chatContainerRef.current as HTMLElement).scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatData]);

  const onSendMessage = async (message: string) => {
    setIsUserInputEnabled(false);
    setChatState(ChatState.GETTING_DATA);

    const translatedMessage =
      chatBot && chatBot.autoTranslate
        ? await translateText(message, "en")
        : "";

    if (message !== "") {
      setChatData((prevChatData) => [
        ...prevChatData,
        {
          text: message,
          textTranslated: translatedMessage,
          sender: userProfile.name,
          senderType: SenderType.user,
        },
      ]);
    }

    const response = await getGPTCompletion(
      chatBot.prompt,
      chatBot.name,
      userProfile.name,
      translatedMessage || message,
      chatData || [],
      context,
      chatBot.temperature
    );

    const translatedResponse = chatBot.autoTranslate
      ? await translateText(response, chatBot.autoTranslateTarget)
      : "";

    const ttsResponse = await generateAudioFromText(
      translatedResponse || response,
      chatBot.ttsLanguage,
      chatBot.ttsActor
    );

    setChatData((prevChatData) => [
      ...prevChatData,
      {
        text: response,
        textTranslated: translatedResponse,
        sender: chatBot.name,
        senderType: SenderType.bot,
        audio: ttsResponse,
      },
    ]);

    setChatState(ChatState.PLAYING);

    
    
    setAudioCircleActive(true);
    await playAudio(ttsResponse);
    setAudioCircleActive(false);
    setChatState(ChatState.LISTENING);
    setIsUserInputEnabled(true);
  };

  return (
    <>
      <ContentContainer>
        <ContainerBGImage bgImage={chatBot?.bgImage || ""}>
          <div className="flex flex-col flex-auto h-full p-0">
            <div className="flex flex-col flex-auto flex-shrink-0 h-full pt-3">
              <div
                className="flex flex-col h-full overflow-x-auto mb-4"
                ref={chatContainerRef}
              >
                <div className="flex flex-col h-full">
                  <div className="grid grid-cols-12 gap-y-2">
                    <AudioCircle                      
                      active={audioCircleActive}
                      scaleFrom={10}
                      scaleTo={12}                      
                    />

                    <ChatMessageWelcome
                      onClickStartChat={() => onSendMessage("")}
                    />

                    {chatData.map((message: Message, index: number) => {
                      return <ChatMessage key={index} message={message} />;
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContainerBGImage>
      </ContentContainer>
      <ChatFooterContainer>
        <ChatFooterVoice
          onSendMessage={onSendMessage}
          autoTranslateTarget={chatBot?.autoTranslateTarget || "en"}
          chatState={chatState}
        />
      </ChatFooterContainer>
    </>
  );
};

export { Chat };
