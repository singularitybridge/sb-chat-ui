import axios from "axios"

interface TherapistAPIResponse {
  key: string;
  name: string;
  description: string;
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

const mapTherapist = (therapist: TherapistAPIResponse) => {
  return {
    key: therapist.key,
    name: therapist.name,
    description: therapist.description,
    avatar: therapist.avatar[0].url,
    bgImage: therapist.bgImage[0].url,
    prompt: therapist.prompt,
    logo: therapist.logo[0].url,
  };
};

const fetchContextData = async (key: string) => {

  try {
    const response = await axios({
      method: "GET",
      url: "https://api.baserow.io/api/database/rows/table/142027/?user_field_names=true&&filter__field_925007__equal=" + key,
      headers: {
        Authorization: "Token xYNbZuE6CN4KarOStEiUnMqQTU920uw6",
      },
    });
    return response.data.results;
  } catch (error) {
    console.error(error);
    return [];
  }
};

const fetchTherapists = async () => {
  try {
    const response = await axios({
      method: "GET",
      url: "https://api.baserow.io/api/database/rows/table/141893/?user_field_names=true",
      headers: {
        Authorization: "Token xYNbZuE6CN4KarOStEiUnMqQTU920uw6",
      },
    });
    return response.data.results.map(mapTherapist);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export { fetchTherapists, fetchContextData };
