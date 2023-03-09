export interface ChatFooterProps {
  onSendMessage: (value: string) => void;
  autoTranslateTarget: string;
  isEnabled : boolean;
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
      lang: "it-IT",
    },
    googleCloudRecognitionConfig: {
      lang: "it-IT",
    },
  },
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

export const getVoiceMap = (language: string): LanguageVoiceMap => {
  return languageVoiceMap[language];
};
