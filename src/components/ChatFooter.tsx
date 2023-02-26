import { ChevronRightIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import useSpeechToText from "react-hook-speech-to-text";
import { ChatBot } from "../atoms/dataStore";

interface ChatFooterProps {
  onSendMessage: (value: string) => void;
  chatBot: ChatBot;
}

interface LanguageVoiceMap {
  speeachRecognitionProperties: {
    lang: string;
  };
  googleCloudRecognitionConfig: {
    lang: string;
  };
}

const languageVoiceMap: { [key: string]: LanguageVoiceMap } = {
  he: {
    speeachRecognitionProperties: {
      lang: "he-IL",
    },
    googleCloudRecognitionConfig: {
      lang: "iw-IL",
    },
  },
  en: {
    speeachRecognitionProperties: {
      lang: "en-US",
    },
    googleCloudRecognitionConfig: {
      lang: "en-US",
    },
  },
  ru: {
    speeachRecognitionProperties: {
      lang: "ru-RU",
    },
    googleCloudRecognitionConfig: {
      lang: "ru-RU",
    },
  },
};

function getVoiceMap(language: string): LanguageVoiceMap {
  return languageVoiceMap[language];
}

const ChatFooter: React.FC<ChatFooterProps> = ({ onSendMessage, chatBot }) => {
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
      lang: getVoiceMap(chatBot?.autoTranslateTarget)
        ?.speeachRecognitionProperties.lang,
      interimResults: true,
    },
    googleApiKey: "AIzaSyCmCIWBPBwiYiwHa0KoiL892ucEhRy8hZ8",
    googleCloudRecognitionConfig: {
      languageCode: getVoiceMap(chatBot?.autoTranslateTarget)
        ?.googleCloudRecognitionConfig.lang,
    },
  });

  useEffect(() => {
    if (interimResult) {
      setUserInput(interimResult);
      return;
    }
  
    if (results.length > 0) {
      const lastResult = results
        .map((result) => (typeof result === 'string' ? result : result.transcript))
        .join(' ');
  
      setUserInput(lastResult);
    }
  }, [results, interimResult]);

  const [userInput, setUserInput] = React.useState("");
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    onSendMessage(userInput);
    setUserInput("");
    stopSpeechToText();
  };

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  return (
    <footer className="p-3 text-center text-base font-light">
      <div className="flex flex-row items-center bg-white w-full">
        <div className="mr-3">
          <button
            className="flex items-center justify-center"
            onClick={isRecording ? stopSpeechToText : startSpeechToText}
          >
            <span>
              <MicrophoneIcon
                className={
                  isRecording
                    ? "h-8 w-8  text-red-500"
                    : "h-8 w-8 text-gray-500 "
                }
              />
            </span>
          </button>
        </div>
        <div className="flex-grow mr-4">
          <div className="relative w-full">
            <input
              value={userInput}
              onChange={(e) => {
                setUserInput(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              type="text"
              className="flex w-full border rounded-md focus:outline-none focus:border-indigo-300 p-2"
            />
          </div>
        </div>
        <div>
          <button
            className="flex items-center justify-center"
            onClick={handleSendMessage}
          >
            <span>
              <ChevronRightIcon className="h-8 w-8 text-blue-800 " />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export { ChatFooter };
