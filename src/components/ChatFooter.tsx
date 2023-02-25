import { ChevronRightIcon, MicrophoneIcon } from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import useSpeechToText from 'react-hook-speech-to-text';

interface ChatFooterProps {
  onSendMessage: (value: string) => void;
}

const ChatFooter: React.FC<ChatFooterProps> = ({ onSendMessage }) => {

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
      lang: 'he-IL',
      interimResults: true
    },
    googleApiKey: 'AIzaSyCmCIWBPBwiYiwHa0KoiL892ucEhRy8hZ8',
    googleCloudRecognitionConfig: {
      languageCode: 'iw-IL'
    }
  });


  useEffect(() => {

          

    if (results.length > 0) {
      console.log('results', results);
      setUserInput(results[results.length - 1].transcript);
    }

    if (interimResult) {
      console.log('interimResult', interimResult);
      setUserInput(interimResult);
    }



  }, [results , interimResult]);



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
              <MicrophoneIcon className={ isRecording ? "h-8 w-8  text-red-500" : "h-8 w-8 text-gray-500 "} />
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
