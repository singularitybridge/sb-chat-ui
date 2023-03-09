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
} from "../atoms/dataStore";
import { decodeText } from "../services/TranslationService";
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

  useEffect(() => {
    if (!message.audio) return;     
    playAudio(message.audio);
  }, [message.audio]);

  const playAudioBase64 = (base64Data: string) => {
    const audioData = atob(base64Data);
    const arrayBuffer = new ArrayBuffer(audioData.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < audioData.length; i++) {
      view[i] = audioData.charCodeAt(i);
    }
    const blob = new Blob([arrayBuffer], { type: "audio/mp3" });
    const audio = new Audio(URL.createObjectURL(blob));

    audio.play().catch((e) => {
      console.log("error playing audio", e);
      setUserProfile({ ...userProfile, isAudioPlaying: false });
    });

    audio.addEventListener("ended", () => {
      setUserProfile({ ...userProfile, isAudioPlaying: false });
    });
  };

  const playAudio = async (audioFile?: ArrayBuffer) => {

    if (audioFile && !userProfile.isAudioPlaying) {
      setUserProfile({ ...userProfile, isAudioPlaying: true });
      playAudioBase64(audioFile.toString());
    }
  };

  return (
    <>
      <div
        className={messageStyles.container}
        onClick={() => playAudio(message.audio)}
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
            <div>{decodeText(getMessageText(message))}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export { ChatMessage, ChatMessageStyles };
