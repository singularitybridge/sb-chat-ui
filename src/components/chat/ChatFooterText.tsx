import { ChevronRightIcon, MicrophoneIcon } from '@heroicons/react/24/outline';
import React, { useEffect } from 'react';
import useSpeechToText from 'react-hook-speech-to-text';
import { ChatFooterProps, getVoiceMap } from './common';

const ChatFooterText: React.FC<ChatFooterProps> = ({
  onSendMessage,
  autoTranslateTarget,
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
    googleApiKey: 'AIzaSyCmCIWBPBwiYiwHa0KoiL892ucEhRy8hZ8',
    googleCloudRecognitionConfig: {
      languageCode:
        getVoiceMap(autoTranslateTarget).googleCloudRecognitionConfig?.lang,
    },
  });

  useEffect(() => {
    if (interimResult) {
      setUserInput(interimResult);
      return;
    }

    if (results.length > 0) {
      const lastResult = results
        .map((result) =>
          typeof result === 'string' ? result : result.transcript,
        )
        .join(' ');

      setUserInput(lastResult);
    }
  }, [results, interimResult]);

  const [userInput, setUserInput] = React.useState('');
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    onSendMessage(userInput);
    setUserInput('');
    results.length = 0;
    stopSpeechToText();
  };

  if (error) return <p>Web Speech API is not available in this browser 🤷‍</p>;

  return (
    <div className="flex flex-row items-center bg-white p-3 w-full">
      <div className="flex-grow mr-4">
        <div className="relative w-full">
          <input
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
            type="text"
            className="flex w-full border rounded-md h-12 focus:outline-none focus:border-indigo-300 p-2"
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
  );
};

export { ChatFooterText };
