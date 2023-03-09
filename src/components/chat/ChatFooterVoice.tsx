import {
  ChevronRightIcon,
  MicrophoneIcon,
  ArrowRightIcon,
  ArrowSmallRightIcon,
  PaperAirplaneIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { ChatFooterProps, getVoiceMap } from "./common";

const ChatFooterVoice: React.FC<ChatFooterProps> = ({
  onSendMessage,
  autoTranslateTarget,
  isEnabled,
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

  useEffect(() => {
    if (interimResult) {
      setUserInput(interimResult);
      return;
    }

    if (results.length > 0) {
      const lastResult = results
        .map((result) =>
          typeof result === "string" ? result : result.transcript
        )
        .join(" ");

      setUserInput(lastResult);
    }
  }, [results, interimResult]);

  const handleSendMessage = () => {
    onSendMessage(userInput);
    setUserInput("");
    results.length = 0;
    stopSpeechToText();
  };

  const handleStartSpeechToText = () => {
    results.length = 0;
    startSpeechToText();
  };

  const handleClearInput = () => {
    setUserInput("");
    results.length = 0;
  };

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  const actionButtonStyle = "h-5 w-5 text-gray-500";

  return (
    <>
      <div className="flex flex-col">
        <div className="relative w-full p-4 text-xl text-slate-500">
          {userInput || "Say something..."}
        </div>

        <div className="flex flex-row justify-center pt-4 pb-4 space-x-8 bg-slate-100">
          <button
            className="flex items-center justify-center"
            onClick={handleClearInput}
          >
            <span>
              <XMarkIcon className={actionButtonStyle} />
            </span>
          </button>
          <button
            className={
              isRecording
                ? "bg-red-500 rounded-full p-7"
                : "bg-red-300 rounded-full p-7"
            }
            onClick={isRecording ? stopSpeechToText : handleStartSpeechToText}
          >
            <span>
              <MicrophoneIcon
                className={
                  isRecording
                    ? "h-8 w-8 text-gray-100"
                    : "h-8 w-8 text-gray-200 "
                }
              />
            </span>
          </button>

          <button
            className="flex items-center justify-center"
            onClick={handleSendMessage}
          >
            <span>
              <PaperAirplaneIcon className={actionButtonStyle} />
            </span>
          </button>
        </div>
      </div>

      <div className="relative w-full"></div>
    </>
  );
};

export { ChatFooterVoice };
