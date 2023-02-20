import { atom, useRecoilValue } from "recoil";

export interface Message {
  id?: string;
  text: string;
  sender?: string;
  timestamp?: number;
  senderType?: "user" | "bot";
}

export interface UserProfile {
  name: string;
  avatar: string;
  activeChat: string;
}

export interface Therapist {
  key: string;
  name: string;
  description: string;
  avatar: string;
  bgImage: string;
  prompt: string;
  logo: string;
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

export const defaultTherapist: Therapist = {
  key: "xjdas87y",
  name: "Dr. John",
  description:
    "Emotional support, stress, anxiety, depression, and relationship issues",
  avatar: "/images/avatars/av2.png",
  bgImage: "/chat-bg.png",
  prompt:
    "The following is a conversation between {{userName}} and an AI therapist named {{agentName}}. The therapist is calm, patient and emphatic. his goal is to help {{userName}} feel better and act in positive ways.\n {{prevChatAsText}}\n {{userName}}: {{message}}\n {{agentName}}: ",
  logo: "/parent-coach-logo.png",
};

export const therapistsState = atom<Therapist[]>({
  key: "therapists",
  default: [defaultTherapist],
});

export const getTherapist = (therapists : Therapist[], id : string) => {  
  return therapists?.find((therapist) => therapist.key === id) || therapists[0];
};

export const userProfileState = atom<UserProfile>({
  key: "userProfile",
  default: {
    name: "Avi",
    avatar: "/images/avatars/av3.png",
    activeChat: "xjdas87y",
  },
});

export const contextData = atom<ContextData[]>({
  key: "contextData",
  default: []
});