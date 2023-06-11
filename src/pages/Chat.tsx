import React, { useEffect, useRef, useState } from "react";
import { Avatar, AvatarStyles } from "../components/Avatar";
import { useRecoilState, useRecoilValue } from "recoil";
import {
  Message,
  messagesState,
  userProfileState,
  chatBotsState,
  SenderType,
} from "../atoms/dataStore-old";
import { getSessionMessages, getGPTCompletion } from "../services/ChatService";
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
import { useParams } from "react-router-dom";
import { useRootStore } from "../store/common/RootStoreContext";
import { observer } from "mobx-react-lite";
import { autorun, toJS } from "mobx";

// move to the api service
const transformApiResponseToMessage = (message: any): Message => {
  return {
    content: message.content.map((contentItem: any) => ({
      ...contentItem,
      options: contentItem.options
        ? contentItem.options.map((option: any) => ({
            ...option,
          }))
        : undefined,
    })),
    role: message.role,
  };
};

const transformUserMessage = (
  message: string,
  translatedMessage: string,
  userProfile: any
): Message => {
  return {
    // _id: "", // You can leave this empty or generate a temporary unique ID if needed
    // chat_session_id: "", // You can leave this empty or assign the sessionId if needed
    content: [{ text: message, type: "text" }],
    // created_at: new Date().toISOString(), // Set the current timestamp
    role: SenderType.user,
    // sender: userProfile.name,
    textTranslated: translatedMessage,
  };
};

const Chat = observer(() => {
  const [chatData, setChatData] = useRecoilState(messagesState);
  const [chatBots, setChatBots] = useRecoilState(chatBotsState);
  const userProfile = useRecoilValue(userProfileState);
  const chatContainerRef = useRef(null);
  // const [chatBot, setChatBot] = useState<ChatBot>(defaultChatBot);

  const [isUserInputEnabled, setIsUserInputEnabled] = useState(false);
  const [chatState, setChatState] = useState(ChatState.GETTING_DATA);
  const [audioCircleActive, setAudioCircleActive] = useState(false);

  const [sessionMessages, setSessionMessages] = useState<Message[]>([]);
  // const { sessionId = "" } = useParams<{ sessionId?: string }>();

  const rootStore = useRootStore();
  const { activeChatbot, selectedChatSession } = useRootStore();

  // useEffect(() => {
  //   rootStore.loadChatbots();
  //   rootStore.loadChatSessions("");
  // }, [rootStore]);

  // useEffect(() => {
  //   autorun(() => {
  //     if (!rootStore.chatSessionsLoaded || !rootStore.chatbotsLoaded) return;
  //     rootStore.setActiveChatSession(sessionId);
  //   });
  // }, [rootStore.chatSessionsLoaded, rootStore.chatbotsLoaded, sessionId]);

  useEffect(() => {
    autorun(() => {
      if (
        !rootStore.chatSessionsLoaded ||
        !rootStore.chatbotsLoaded ||
        !selectedChatSession
      )
        return;

      // rootStore.setActiveChatbot(rootStore.selectedChatSession?.chatbot_key || "");

      console.log(
        "we have chat sessions and chatbots loaded",
        selectedChatSession._id
      );

      // Change the function call to pass the sessionId
      getSessionMessages(selectedChatSession._id)
        .then((chatHistoryResponse) => {
          console.log("loaded history: ", chatHistoryResponse);
          // if (chatHistoryResponse && chatHistoryResponse.messages) {
          //   const chatHistory = chatHistoryResponse.messages;

          console.log(
            "set session messages",
            chatHistoryResponse.map(transformApiResponseToMessage)
          );

          setSessionMessages(
            chatHistoryResponse.map(transformApiResponseToMessage)
          );
          // } else {
          //   console.log("No messages found in chat history response");
          // }
        })
        .catch((err) => {
          console.log("error loading chat history: ", err);
        });
    });
  }, [
    selectedChatSession,
    rootStore.selectedChatSession,
    rootStore.chatbotsLoaded,
  ]);

  // useEffect(() => {
  //   if (userProfile.activeChatBot === ChatBotNotLoaded || !chatBots) return;
  //   setChatBot(getChatBot(chatBots, userProfile.activeChatBot));
  // }, [chatBots, userProfile]);

  useEffect(() => {
    if (!activeChatbot) return;
    document.title = activeChatbot?.name;
  }, [activeChatbot]);

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

    // const translatedMessage =
    //   chatBot && chatBot.autoTranslate
    //     ? await translateText(message, "en")
    //     : "";

    const translatedMessage = "";

    if (message !== "") {
      const userMessage = transformUserMessage(
        message,
        translatedMessage,
        userProfile
      );
      setSessionMessages((prevChatData) => [...prevChatData, userMessage]);
    }

    const response = await getGPTCompletion(
      "",
      selectedChatSession?._id || "",
      userProfile.name,
      translatedMessage || message,
      chatData || [],
      0.7
    );

    // const translatedResponse = chatBot.autoTranslate
    //   ? await translateText(response, chatBot.autoTranslateTarget)
    //   : "";

    setSessionMessages(response.map(transformApiResponseToMessage));
    setChatState(ChatState.PLAYING);
    setAudioCircleActive(true);
    setAudioCircleActive(false);
    setChatState(ChatState.LISTENING);
    setIsUserInputEnabled(true);
  };

  return (
    <>
      <ContentContainer>
        <ContainerBGImage bgImage={activeChatbot?.backgroundImage || ""}>
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
                      enabled={sessionMessages.length === 0}
                      onClickStartChat={() => onSendMessage("hi")}
                    />

                    {sessionMessages.map((message: Message, index: number) => {
                      return (
                        <ChatMessage
                          key={index}
                          message={message}
                          onUserSelection={(selection) => {
                            onSendMessage(selection);
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ContainerBGImage>
      </ContentContainer>
      <ChatFooterContainer>
        {/* <ChatFooterVoice
          onSendMessage={onSendMessage}
          autoTranslateTarget={chatBot?.autoTranslateTarget || "en"}
          chatState={chatState}
        /> */}
        <ChatFooterText
          onSendMessage={onSendMessage}
          autoTranslateTarget={"en"}
          // autoTranslateTarget={chatBot?.autoTranslateTarget || "en"}
          chatState={chatState}
        />
      </ChatFooterContainer>
    </>
  );
});

export { Chat };
