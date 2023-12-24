import axios from 'axios';

interface ChatBotAPIResponse {
  key: string;
  name: string;
  description: string;
  autoTranslate: boolean;
  autoTranslateTarget: string;
  ttsLanguage: string;
  ttsActor: string;
  temperature: number;
  avatar: {
    url: string;
    thumbnails: {
      tiny: {
        url: string;
        width: number | null;
        height: number;
      };
      small: {
        url: string;
        width: number;
        height: number;
      };
      card_cover: {
        url: string;
        width: number;
        height: number;
      };
    };
    visible_name: string;
    name: string;
    size: number;
    mime_type: string;
    is_image: boolean;
    image_width: number;
    image_height: number;
    uploaded_at: string;
  }[];
  bgImage: {
    url: string;
    thumbnails: {
      tiny: {
        url: string;
        width: number | null;
        height: number;
      };
      small: {
        url: string;
        width: number;
        height: number;
      };
      card_cover: {
        url: string;
        width: number;
        height: number;
      };
    };
    visible_name: string;
    name: string;
    size: number;
    mime_type: string;
    is_image: boolean;
    image_width: number;
    image_height: number;
    uploaded_at: string;
  }[];
  prompt: string;
  logo: {
    url: string;
    thumbnails: {
      tiny: {
        url: string;
        width: number | null;
        height: number;
      };
      small: {
        url: string;
        width: number;
        height: number;
      };
      card_cover: {
        url: string;
        width: number;
        height: number;
      };
    };
    visible_name: string;
    name: string;
    size: number;
    mime_type: string;
    is_image: boolean;
    image_width: number;
    image_height: number;
    uploaded_at: string;
  }[];
}

const mapChatBot = (chatBot: ChatBotAPIResponse) => {
  return {
    key: chatBot.key,
    name: chatBot.name,
    description: chatBot.description,
    avatar: chatBot?.avatar[0]?.url,
    bgImage: chatBot?.bgImage[0]?.url,
    prompt: chatBot.prompt,
    logo: chatBot?.logo[0]?.url,
    autoTranslate: chatBot.autoTranslate,
    autoTranslateTarget: chatBot.autoTranslateTarget,
    ttsLanguage: chatBot.ttsLanguage,
    ttsActor: chatBot.ttsActor,
    temperature: Number(chatBot.temperature),
  };
};

const fetchContextData = async (key: string) => {
  try {
    const response = await axios({
      method: 'GET',
      url:
        'https://api.baserow.io/api/database/rows/table/142027/?user_field_names=true&&filter__field_925007__equal=' +
        key,
      headers: {
        Authorization: 'Token xYNbZuE6CN4KarOStEiUnMqQTU920uw6',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchChatBots = async () => {
  try {
    const response = await axios({
      method: 'GET',
      url: 'https://api.baserow.io/api/database/rows/table/141893/?user_field_names=true',
      headers: {
        Authorization: 'Token xYNbZuE6CN4KarOStEiUnMqQTU920uw6',
      },
    });
    return response.data.results.map(mapChatBot);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export { fetchChatBots, fetchContextData };
