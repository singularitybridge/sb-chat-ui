import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Avatar, AvatarStyles } from "./Avatar";
import { observer } from "mobx-react-lite";
import { useRootStore } from "../store/common/RootStoreContext";

interface ChatMessageProps {
  enabled: boolean;
  onClickStartChat?: () => void;
}

const ChatMessageWelcome: React.FC<ChatMessageProps> = observer(({
  onClickStartChat,
  enabled,
}) => {

  const { activeChatbot, userProfile } = useRootStore();

  useEffect(() => {
    console.log('activeChatbot', activeChatbot?.key);
  }, [activeChatbot]);



  // useEffect(() => {
  //   fetch(`http://127.0.0.1:5000/chat_sessions/${sessionId}`)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       if (data.chatbot) {
  //         setChatBot(data.chatbot);
  //       }
  //     });
  // }, [sessionId]);
  

  

  const handleStartChat = () => {    
    onClickStartChat && onClickStartChat();
  };

  return (
    <>
      <div className="col-start-2 col-end-12 mt-8 mb-8">
        <div
          className="flex flex-col items-center bg-white p-5 shadow rounded-xl space-y-4"
          // style={{
          //   direction:
          //     chatBot &&
          //     chatBot.autoTranslate &&
          //     chatBot.autoTranslateTarget === "he"
          //       ? "rtl"
          //       : "ltr",
          // }}
        >
          <Avatar imageUrl={activeChatbot?.avatarImage || ''} avatarStyle={AvatarStyles.large} />
          <div>{activeChatbot?.description}</div>
          {!enabled ? null : (
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
});

export { ChatMessageWelcome };
