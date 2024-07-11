import React, { useState, useRef, useCallback } from 'react';
import { Mic, Loader } from 'lucide-react';
import { transcribeAudio } from '../../services/api/voiceService';

interface AudioRecorderProps {
  onTranscriptionComplete: (transcription: string) => void;
  language?: string;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onTranscriptionComplete,
  language = 'en',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    setIsRecording(false);

    await new Promise(resolve => setTimeout(resolve, 100));

    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
    try {
      setIsLoading(true);      
      const transcription = await transcribeAudio(audioBlob, language);
      onTranscriptionComplete(transcription);
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setIsLoading(false);
    }
  }, [language, onTranscriptionComplete]);

  const handleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return (
    <button
      onClick={handleRecording}
      className="p-1.5 rounded-full text-gray-500 bg-red-100 hover:bg-pink-200 transition duration-150 ease-in-out"
      aria-label="Record Audio"
    >
      {isLoading ? (
        <Loader size={18} className="animate-spin" />
      ) : isRecording ? (
        <Mic size={18} className="animate-pulse text-red-500" />
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
};