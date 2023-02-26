import { Bars2Icon } from "@heroicons/react/24/solid";
import {
  ChatBot,
  ChatBotNotLoaded,
  chatBotsState,
  defaultChatBot,
  getChatBot,
  userProfileState,
} from "../atoms/dataStore";
import { Avatar, AvatarStyles } from "./Avatar";
import { useParams } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { useEffect, useState } from "react";
import { translateText } from "../services/TranslationService";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {

  const userProfile = useRecoilValue(userProfileState);
  const chatBots = useRecoilValue(chatBotsState);
  
  const [chatBotName, setChatBotName] = useState<string>("");
  const [chatBotDescription, setChatBotDescription] = useState<string>("");
  const [chatBotAvatar, setChatBotAvatar] = useState<string>("");

  useEffect(() => {

    if (chatBots.length === 0 || !userProfile.activeChatBot) {
      return;
    }

    const chatBot = getChatBot(chatBots, userProfile.activeChatBot);
    
    if (chatBot && chatBot.key === ChatBotNotLoaded) {
      return;
    }  

    if (chatBot.key === ChatBotNotLoaded) {
      return;
    }

    setChatBotAvatar(chatBot.avatar);


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



  }, [chatBots]);

  return (
    <header className="p-4 flex justify-between items-center">
      <div
        className="p-1 rounded-2xl bg-gray-200 hover:bg-gray-200 w-9 h-9 cursor-pointer flex items-center justify-center"
        onClick={onMenuClick}
      >
        <Bars2Icon className="h-5 w-5 text-slate-700" />
      </div>
      <div className="headerImageAndText flex flex-row items-center w-full text-left pl-5">
        <Avatar
          imageUrl={chatBotAvatar}
          avatarStyle={AvatarStyles.logo}
        />
        <div className="ml-3">
          <div className="text-2xl font-normal">{chatBotName}</div>
          <div className="text-xs font-light">{chatBotDescription}</div>
        </div>
      </div>

      <div></div>
    </header>
  );
};

export { Header };
