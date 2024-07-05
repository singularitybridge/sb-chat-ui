import apiClient from '../AxiosService';

interface TranscriptionResponse {
  text: string;
}

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

