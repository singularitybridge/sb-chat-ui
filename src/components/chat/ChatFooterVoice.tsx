import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  UserIcon,
  ChatBubbleLeftEllipsisIcon,
  CloudArrowDownIcon,
  MinusIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useRef, useState } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { ChatFooterProps, ChatState, getVoiceMap } from "./common";
import { motion } from "framer-motion";
import { useTimer } from "../../services/useTimer";
import { AudioCircle } from "./AudioCircle";

const ChatFooterVoice: React.FC<ChatFooterProps> = ({
  onSendMessage,
  autoTranslateTarget,
  chatState,
}) => {
  const {
    error,
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    crossBrowser: true,
    continuous: true,
    timeout: 7000,
    useLegacyResults: false,
    useOnlyGoogleCloud: false,
    speechRecognitionProperties: {
      lang: getVoiceMap(autoTranslateTarget).speeachRecognitionProperties.lang,
      interimResults: true,
    },
    googleApiKey: "AIzaSyCmCIWBPBwiYiwHa0KoiL892ucEhRy8hZ8",
    googleCloudRecognitionConfig: {
      languageCode:
        getVoiceMap(autoTranslateTarget).googleCloudRecognitionConfig?.lang,
    },
  });

  const [userInput, setUserInput] = React.useState("");
  const { timerRunning, startTimer, resetTimer } = useTimer(() => {
    console.log("send message timer");
    handleSendMessage();
  });

  const [isEnabled, setIsEnabled] = useState(false);
  const primaryActionButtonStyle = "text-gray-100";

  const getActionIcon = () => {
    switch (chatState) {
      case ChatState.LISTENING:
        return <MicrophoneIcon className={primaryActionButtonStyle} />;
      case ChatState.PLAYING:
        return (
          <ChatBubbleLeftEllipsisIcon className={primaryActionButtonStyle} />
        );
      case ChatState.GETTING_DATA:
        return (
          <ChatBubbleLeftEllipsisIcon className={primaryActionButtonStyle} />
        );
      default:
        return (
          <ChatBubbleLeftEllipsisIcon className={primaryActionButtonStyle} />
        );
    }
  };

  useEffect(() => {
    if (chatState === ChatState.LISTENING) {
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
    }
  }, [chatState]);

  useEffect(() => {
    console.log("results", results);
    console.log("interimResult", interimResult);

    if (results.length > 0 || interimResult) {
      
      const combinedResults = results
          .map((item) => (typeof item === "string" ? item : item.transcript))
          .join(" ");

      const result = interimResult
        ? `${combinedResults} ${interimResult}`
        : combinedResults;

      setUserInput(result);
      resetTimer();
      startTimer();
    }
  }, [results, interimResult]);

  useEffect(() => {
    if (isEnabled && !isRecording) {
      startSpeechToText();
    }
  }, [isEnabled]);

  const handleSendMessage = () => {
    if (userInput === "") return;

    onSendMessage(userInput);
    setUserInput("");
    results.length = 0;
    stopSpeechToText();
  };

  const handleStartSpeechToText = () => {
    if (!isEnabled) return;

    results.length = 0;
    startSpeechToText();
  };

  const handleClearInput = () => {
    setUserInput("");
    resetTimer();
    results.length = 0;
  };

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  const actionButtonStyle = "h-5 w-5 text-gray-500";

  const breathingAnimation = {
    scale: [1, 1.01, 1],
    transition: {
      duration: 1.7,
      repeat: Infinity,
    },
  };

  const getPrimaryActionButtonStyle = () => {
    switch (chatState) {
      case ChatState.LISTENING:
        if (isRecording) {
          return "bg-rose-500 rounded-full p-4";
        } else {
          return "bg-rose-300 rounded-full p-4";
        }
      case ChatState.PLAYING:
        return "bg-sky-500 rounded-full p-4";
      case ChatState.GETTING_DATA:
        return "bg-sky-300 rounded-full p-4";
    }
  };

  const handlePrimaryActionButtonClick = () => {
    resetTimer();

    if (chatState === ChatState.LISTENING) {
      if (isRecording) {
        stopSpeechToText();
      } else {
        handleStartSpeechToText();
      }
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="relative w-full p-4 text-lg text-slate-500 h-20 flex items-center justify-center">
          {userInput || ""}
        </div>

        <div className="flex flex-row justify-center pt-4 pb-4 space-x-8 bg-slate-100">
          <button
            className="flex items-center justify-center"
            onClick={handleClearInput}
          >
            <span>
              {chatState === ChatState.LISTENING && (
                <XMarkIcon className={actionButtonStyle} />
              )}
            </span>
          </button>

          <motion.div
            animate={
              isRecording || chatState === ChatState.PLAYING
                ? breathingAnimation
                : {}
            }
          >
            <button
              className={getPrimaryActionButtonStyle()}
              onClick={handlePrimaryActionButtonClick}
            >
              <span className="">
                <AudioCircle
                  active={chatState === ChatState.PLAYING}
                  scaleFrom={42}
                  scaleTo={47}
                >
                  {getActionIcon()}
                </AudioCircle>
              </span>
              {/* <span>{getActionIcon()}</span> */}
            </button>
          </motion.div>

          <button
            className="flex items-center justify-center"
            onClick={() => {
              resetTimer();
              handleSendMessage();
            }}
          >
            <span>
              {chatState === ChatState.LISTENING && (
                <PaperAirplaneIcon className={actionButtonStyle} />
              )}
            </span>
          </button>
        </div>
      </div>

      <div className="relative w-full"></div>
    </>
  );
};

export { ChatFooterVoice };
