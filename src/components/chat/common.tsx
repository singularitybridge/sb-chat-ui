export enum ChatState {
  PLAYING = 'PLAYING',
  LISTENING = 'LISTENING',
  GETTING_DATA = 'GETTING_DATA',
}

export interface ChatFooterProps {
  onSendMessage: (value: string) => void;
  autoTranslateTarget: string;
  chatState: ChatState;
}

export interface LanguageVoiceMap {
  speeachRecognitionProperties: {
    lang: string;
  };
  googleCloudRecognitionConfig: {
    lang: string;
  };
}

export const languageVoiceMap: { [key: string]: LanguageVoiceMap } = {
  it: {
    speeachRecognitionProperties: {
      lang: 'it-IT',
    },
    googleCloudRecognitionConfig: {
      lang: 'it-IT',
    },
  },
  he: {
    speeachRecognitionProperties: {
      lang: 'he-IL',
    },
    googleCloudRecognitionConfig: {
      lang: 'iw-IL',
    },
  },
  en: {
    speeachRecognitionProperties: {
      lang: 'en-US',
    },
    googleCloudRecognitionConfig: {
      lang: 'en-US',
    },
  },
  ru: {
    speeachRecognitionProperties: {
      lang: 'ru-RU',
    },
    googleCloudRecognitionConfig: {
      lang: 'ru-RU',
    },
  },
  ar: {
    speeachRecognitionProperties: {
      lang: 'ar-DZ',
    },
    googleCloudRecognitionConfig: {
      lang: 'ar-DZ',
    },
  },
};

export const getVoiceMap = (language: string): LanguageVoiceMap => {
  return languageVoiceMap[language];
};
