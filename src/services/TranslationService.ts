import axios from 'axios';

export const decodeText = (encodedText: string) =>  {
  return decodeURIComponent(encodedText.replace(/\&#39;/g, "'"));
}; 


interface TranslateResponse {
  data: {
    translations: [
      {
        translatedText: string;
      }
    ];
  };
}

export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const response = await axios.get<TranslateResponse>(
    `https://translation.googleapis.com/language/translate/v2`,
    {
      params: {
        q: text,
        target: targetLanguage,
        key: 'AIzaSyCmCIWBPBwiYiwHa0KoiL892ucEhRy8hZ8',
        // key: process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY,
      },
    }
  );

  return decodeText(response.data.data.translations[0].translatedText);
};
