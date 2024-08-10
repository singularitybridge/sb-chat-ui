/// file_path: src/services/api/voiceService.ts

import apiClient from '../AxiosService';

interface TranscriptionResponse {
  text: string;
}

export type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export async function transcribeAudio(audioBlob: Blob, language: string = 'en'): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('language', language);

    const response = await apiClient.post<TranscriptionResponse>('stt/transcribe/oai', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.text;
  } catch (error) {
    console.error('Failed to transcribe audio:', error);
    throw error;
  }
}

export async function textToSpeech(text: string, voice: TTSVoice = 'shimmer'): Promise<string> {
  try {
    const response = await apiClient.post<string>(
      '/tts/generate/oai',
      { text, voice }
    );

    return response.data; // The response is directly the URL string
  } catch (error) {
    console.error('Failed to generate speech:', error);
    throw error;
  }
}