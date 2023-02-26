import axios, { AxiosResponse } from "axios";
const apiKeyForGoogle = "AIzaSyChUGpxx9shF3dckbeNdR7frcwcuZ4VrGg";


interface Input {
  text: string;
}

interface Voice {
  languageCode: string;
  name: string;
}

interface AudioConfig {
  audioEncoding: string;
}

interface RequestBody {
  input: Input;
  voice: Voice;
  audioConfig: AudioConfig;
}

const generateAudioFromText = (
  text: string,
  languageCode: string,
  voiceName: string
): Promise<ArrayBuffer> => {
  const requestBody: RequestBody = {
    input: { text },
    voice: { languageCode, name: voiceName },
    audioConfig: { audioEncoding: "MP3" },
  };

  const headers = {
    "Content-Type": "application/json; charset=utf-8",
  };

  const config = {
    headers,
  };

  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKeyForGoogle}`;

  return axios.post<ArrayBuffer>(url, requestBody, config).then(
    (response: AxiosResponse<ArrayBuffer>) => {
      return response.data;
    }
  );
};

export { generateAudioFromText };