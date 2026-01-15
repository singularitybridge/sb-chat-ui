import {
  MicrophoneIcon,
  PaperAirplaneIcon,
  XMarkIcon,
  ChatBubbleLeftEllipsisIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { ChatFooterProps, ChatState, getVoiceMap } from './common';
import { motion } from 'framer-motion';
import { useTimer } from '../../services/useTimer';
import { AudioCircle } from './AudioCircle';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';

const ChatFooterVoice: React.FC<ChatFooterProps> = ({
  onSendMessage,
  autoTranslateTarget,
  chatState,
}) => {
  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  const [userInput, setUserInput] = React.useState('');
  const { startTimer, resetTimer } = useTimer(() => {
    SpeechRecognition.stopListening();
    handleSendMessage();
  });

  const [isEnabled, setIsEnabled] = useState(false);
  const primaryActionButtonStyle = 'text-secondary';

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

  const voiceLanguage =
    getVoiceMap(autoTranslateTarget).googleCloudRecognitionConfig?.lang;

  useEffect(() => {
    if (chatState === ChatState.LISTENING) {
      setIsEnabled(true);
    } else {
      setIsEnabled(false);
    }
  }, [chatState]);

  useEffect(() => {
    if (transcript) {
      setUserInput(transcript);
      resetTimer();
      startTimer();
    }
  }, [transcript]);

  useEffect(() => {
    if (isEnabled && !listening) {
      SpeechRecognition.startListening({
        continuous: true,
        language: voiceLanguage,
      });
    }
  }, [isEnabled]);

  const handleSendMessage = () => {
    if (transcript === '') return;
    onSendMessage(transcript);
    setUserInput('');
    resetTranscript();
  };

  const handleStartSpeechToText = () => {
    if (!isEnabled) return;

    resetTranscript();
    SpeechRecognition.startListening({
      continuous: true,
      language: voiceLanguage,
    });
  };

  const handleClearInput = () => {
    setUserInput('');
    resetTimer();
    resetTranscript();
  };

  // if (error) return <p>Web Speech API is not available in this browser &#x1F937;&#x200D;&#x2642;&#xFE0F;</p>;
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn&#39;t support speech recognition.</span>;
  }

  const actionButtonStyle = 'h-5 w-5 text-muted-foreground';

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
        if (listening) {
          return 'bg-rose-500 rounded-full p-4';
        } else {
          return 'bg-rose-300 rounded-full p-4';
        }
      case ChatState.PLAYING:
        return 'bg-sky-500 rounded-full p-4';
      case ChatState.GETTING_DATA:
        return 'bg-sky-300 rounded-full p-4';
    }
  };

  const handlePrimaryActionButtonClick = () => {
    resetTimer();

    if (chatState === ChatState.LISTENING) {
      if (listening) {
        SpeechRecognition.stopListening();
      } else {
        handleStartSpeechToText();
      }
    }
  };

  return (
    <>
      <div className="flex flex-col">
        <div className="relative w-full p-4 text-lg text-slate-500 h-20 flex items-center justify-center">
          {userInput || ''}
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
              listening || chatState === ChatState.PLAYING
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
              SpeechRecognition.stopListening();
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
