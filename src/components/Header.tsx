import { Bars2Icon, TrashIcon } from "@heroicons/react/24/solid";
import {
  ChatBot,
  ChatBotNotLoaded,
  chatBotsState,
  defaultChatBot,
  getChatBot,
  userProfileState,
} from "../atoms/dataStore";
import { Avatar, AvatarStyles } from "./Avatar";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { translateText } from "../services/TranslationService";
import { clearSession } from "../services/ChatService";
import { useParams, useLocation } from "react-router-dom";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [chatBotName, setChatBotName] = useState<string>("");
  const [chatBotDescription, setChatBotDescription] = useState<string>("");
  const [chatBotAvatar, setChatBotAvatar] = useState<string>("");
  const [chatBot, setChatBot] = useState<ChatBot | null>(null);

  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  const { sessionId } = useParams<{ sessionId: string }>();

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/chat_sessions/${sessionId}`)
      .then((response) => response.json())
      .then((data) => {
        if (data.chatbot) {
          setChatBot(data.chatbot);
        }
      });
  }, [sessionId]);

  const handleClearChat = async () => {
    if (sessionId) {
      await clearSession(sessionId);
      window.location.reload();
    } else {
      console.error("sessionId is undefined");
    }
  };

  useEffect(() => {
    if (!chatBot) {
      return;
    }

    setChatBotAvatar(chatBot.avatarImage);

    if (chatBot.autoTranslate) {
      translateText(chatBot.name, chatBot.autoTranslateTarget).then(
        (translatedText) => {
          setChatBotName(translatedText);
        }
      );

      translateText(chatBot.description, chatBot.autoTranslateTarget).then(
        (translatedText) => {
          setChatBotDescription(translatedText);
        }
      );
    } else {
      setChatBotName(chatBot.name);
      setChatBotDescription(chatBot.description);
    }
  }, [chatBot]);

  return (
    <>
      {!isAdminRoute && (
        <header className="p-4 flex justify-between items-center">
          <div
            className="p-1 rounded-2xl bg-gray-200 hover:bg-gray-200 w-9 h-9 cursor-pointer flex items-center justify-center"
            onClick={onMenuClick}
          >
            <Bars2Icon className="h-5 w-5 text-slate-700" />
          </div>
          <div className="headerImageAndText flex flex-row items-center w-full text-left pl-5">
            <Avatar imageUrl={chatBotAvatar} avatarStyle={AvatarStyles.logo} />
            <div className="ml-3">
              <div className="text-2xl font-normal">{chatBotName}</div>
              <div className="text-xs font-light">{chatBotDescription}</div>
            </div>
          </div>

          <div className="mr-3 cursor-pointer">
            <TrashIcon
              className="h-6 w-6  text-yellow-700"
              onClick={handleClearChat}
            />
          </div>
        </header>
      )}
    </>
  );
};

export { Header };
