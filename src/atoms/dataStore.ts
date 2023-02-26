import { atom, useRecoilValue } from "recoil";

// enum for message sender type
export enum SenderType {
  user = "user",
  bot = "bot",
}

export const ChatBotNotLoaded = "ChatBotNotLoaded";

export interface Message {
  id?: string;
  text: string;
  textTranslated: string;
  sender?: string;
  timestamp?: number;
  senderType?: SenderType.user | SenderType.bot;
  audio?: ArrayBuffer;
}

export const getMessageText = (message: Message) => {
  if (message.senderType === SenderType.user) {
    return message.text;
  }
  return message.textTranslated || message.text;
};

export const getMessageTextGPT = (message: Message) => {
  if (message.senderType === SenderType.user) {
    return message.textTranslated || message.text;
  }
  return message.text;
};

export interface UserProfile {
  name: string;
  avatar: string;
  activeChatBot: string;
}

export interface ChatBot {
  key: string;
  name: string;
  description: string;
  avatar: string;
  bgImage: string;
  prompt: string;
  logo: string;
  autoTranslate: boolean;
  autoTranslateTarget: string;
  temperature: number;
}

export interface ContextData {
  title: string;
  intro: string;
  description: string;
  image: string;
  video: string;
}

export const messagesState = atom<Message[]>({
  key: "messages",
  default: [],
});

export const defaultChatBot: ChatBot = {
  key: ChatBotNotLoaded,
  name: "Dr. John",
  description:
    "Emotional support, stress, anxiety, depression, and relationship issues",
  avatar: "/images/avatars/av2.png",
  bgImage: "/chat-bg.png",
  prompt:
    "The following is a conversation between {{userName}} and an AI therapist named {{agentName}}. The therapist is calm, patient and emphatic. his goal is to help {{userName}} feel better and act in positive ways.\n {{prevChatAsText}}\n {{userName}}: {{message}}\n {{agentName}}: ",
  logo: "/parent-coach-logo.png",
  autoTranslate: false,
  autoTranslateTarget: "en",
  temperature: 0.7,
};

export const chatBotsState = atom<ChatBot[]>({
  key: "chatBots",
  default: [],
});

export const getChatBot = (chatBots: ChatBot[], id: string) => {
  return chatBots?.find((chatBot) => chatBot.key === id) || chatBots[0];
};

export const userProfileState = atom<UserProfile>({
  key: "userProfile",
  default: {
    name: "Avi",
    avatar: "/images/avatars/av3.png",
    activeChatBot: ChatBotNotLoaded,
  },
});

export const contextData = atom<ContextData[]>({
  key: "contextData",
  default: [],
});
